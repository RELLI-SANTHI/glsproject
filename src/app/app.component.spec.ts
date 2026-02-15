/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';
import { MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalService } from '@azure/msal-angular';
import { MSALGuardConfigFactory, MSALInstanceFactory, MSALInterceptorConfigFactory } from './app.config';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { UserProfileService } from './common/utilities/services/profile/user-profile.service';
import { LoggedUserService } from './common/utilities/services/user/logged-user.service';

class MockTranslateService {
  defaultLang = 'it';
  currentLang = 'it';

  setDefaultLang(lang: string) {
    this.defaultLang = lang;
  }

  instant(key: string) {
    return key;
  }
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let translateService: TranslateService;
  let modalService: jasmine.SpyObj<NgbModal>;
  let modalRef: jasmine.SpyObj<NgbModalRef>;

  beforeEach(async () => {
    modalRef = jasmine.createSpyObj('NgbModalRef', ['result'], {
      result: Promise.resolve('closed')
    });
    modalService = jasmine.createSpyObj('NgbModal', ['open']);
    const msalServiceMock = jasmine.createSpyObj('MsalService', ['handleRedirectObservable', 'logoutRedirect', 'instance']);
    msalServiceMock.handleRedirectObservable.and.returnValue(of(null));
    msalServiceMock.instance = { getAllAccounts: () => [1] };

    const userProfileServiceMock = {
      impersonatedUser$: of(null),
      profile$: of(null),
      getLoggedUser: () => of({}),
      openErrorModal: jasmine.createSpy('openErrorModal'),
      update: jasmine.createSpy('update')
    };
    const loggedUserServiceMock = {
      accessToken$: of('token')
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent, TranslateModule.forRoot(), HttpClientModule],
      providers: [
        { provide: TranslateService, useClass: MockTranslateService },
        {
          provide: Router,
          useValue: {
            events: of(new NavigationEnd(0, '/home', '/home'))
          }
        },
        { provide: MsalService, useValue: msalServiceMock },
        { provide: NgbModal, useValue: modalService },
        { provide: UserProfileService, useValue: userProfileServiceMock },
        { provide: LoggedUserService, useValue: loggedUserServiceMock },
        { provide: MSAL_INSTANCE, useFactory: MSALInstanceFactory },
        { provide: MSAL_GUARD_CONFIG, useFactory: MSALGuardConfigFactory },
        { provide: MSAL_INTERCEPTOR_CONFIG, useFactory: MSALInterceptorConfigFactory }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    modalService.open.and.returnValue(modalRef);
    translateService = TestBed.inject(TranslateService);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set default language to it in ngOnInit', () => {
    component.ngOnInit();
    expect(translateService.defaultLang).toBe('it');
    expect(translateService.currentLang).toBe('it');
  });

  it('should correctly build language options', () => {
    component.ngOnInit();
    component.buildLanguageOptions();
    expect(component.languageOptions.length).toBe(2);
    expect(component.languageOptions).toEqual([
      { value: 'en', label: 'en' },
      { value: 'it', label: 'it' }
    ]);
  });

  it('should update pageSelected on NavigationEnd', () => {
    component.ngOnInit();
    expect(component.pageSelected()).toBe('home');
  });

  it('toggleSidebar should change showNavBar state', () => {
    const initialState = component.showNavBar();
    component.toggleSidebar();
    expect(component.showNavBar()).toBe(!initialState);
  });

  it('setShowNavBar should toggle isShowNavBar and update genericService.sidebarOpened', () => {
    const spy = spyOn(component['genericService'].sidebarOpened, 'set');
    const initialState = component.isShowNavBar;
    component.setShowNavBar();
    expect(component.isShowNavBar).toBe(!initialState);
    expect(spy).toHaveBeenCalledWith(!component.isShowNavBar);
  });

  it('logout should call logoutRedirect on MsalService', () => {
    const msal = TestBed.inject(MsalService) as jasmine.SpyObj<MsalService>;
    component.logout();
    expect(msal.logoutRedirect).toHaveBeenCalled();
  });
});
