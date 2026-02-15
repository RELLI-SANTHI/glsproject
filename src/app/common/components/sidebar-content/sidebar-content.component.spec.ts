import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SidebarContentComponent } from './sidebar-content.component';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbService } from '../../utilities/services/breadcrumb/breadcrumb.service';
import { UserProfileService } from '../../utilities/services/profile/user-profile.service';
import { UtilityRouting } from '../../utilities/utility-routing';
import { UtilityProfile } from '../../utilities/utility-profile';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { of } from 'rxjs';

describe('SidebarContentComponent', () => {
  let component: SidebarContentComponent;
  let fixture: ComponentFixture<SidebarContentComponent>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;
  let userProfileServiceSpy: any;

  beforeEach(async () => {
    breadcrumbServiceSpy = jasmine.createSpyObj('BreadcrumbService', ['resetBreadcrumbs']);
    userProfileServiceSpy = {
      profile$: of({}),
      impersonatedUser$: of(null)
    };

    await TestBed.configureTestingModule({
      imports: [SidebarContentComponent, HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
        { provide: UserProfileService, useValue: userProfileServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarContentComponent);
    component = fixture.componentInstance;
    signalSetFn(component.onlyIcons[SIGNAL], false);
    signalSetFn(component.activePage[SIGNAL], undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit toggleSidebar when onToggleSidebar is called', () => {
    spyOn(component.toggleSidebar, 'emit');
    component.onToggleSidebar();
    expect(component.toggleSidebar.emit).toHaveBeenCalledWith(true);
  });

  it('should call UtilityProfile.checkAccessProfile in hasAccess and return its value', () => {
    spyOn(UtilityProfile, 'checkAccessProfile').and.returnValue(true);
    expect(component.hasAccess('profile', 'func', 'perm')).toBeTrue();
    expect(UtilityProfile.checkAccessProfile).toHaveBeenCalledWith(userProfileServiceSpy, 'profile', 'func', 'perm');
    (UtilityProfile.checkAccessProfile as jasmine.Spy).and.returnValue(false);
    expect(component.hasAccess('profile', 'func', 'perm')).toBeFalse();
  });

  it('should reset breadcrumbs, set activePage, and navigate in goToPage', () => {
    spyOn(UtilityRouting, 'navigateTo');
    const setSpy = spyOn(component.activePage, 'set');
    component.goToPage('section/page');
    expect(breadcrumbServiceSpy.resetBreadcrumbs).toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalledWith('page');
    expect(UtilityRouting.navigateTo).toHaveBeenCalledWith('/section/page');
  });

  it('should return true if page is active in pageActive', () => {
    component.activePageValue = 'dashboard';
    expect(component.pageActive('dashboard')).toBeTrue();
    expect(component.pageActive('other')).toBeFalse();
  });
});
