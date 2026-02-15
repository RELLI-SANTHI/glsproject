/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlsTopMenuComponent } from './gls-top-menu.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Breadcrumb, BreadcrumbService } from '../../utilities/services/breadcrumb/breadcrumb.service';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { MsalService } from '@azure/msal-angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('GlsTopMenuComponent', () => {
  let component: GlsTopMenuComponent;
  let fixture: ComponentFixture<GlsTopMenuComponent>;
  let breadcrumbService: jasmine.SpyObj<BreadcrumbService>;

  beforeEach(async () => {
    const breadcrumbServiceSpy = jasmine.createSpyObj('BreadcrumbService', ['getBreadcrumbs']);
    breadcrumbServiceSpy.getBreadcrumbs.and.returnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [GlsTopMenuComponent, TranslateModule.forRoot(), CommonModule, HttpClientTestingModule],
      providers: [
        TranslateService,
        { provide: NgbModal, useValue: jasmine.createSpyObj('NgbModal', ['open']) },
        { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
        {
          provide: MsalService,
          useValue: jasmine.createSpyObj('MsalService', ['loginRedirect', 'logout', 'instance', 'acquireTokenSilent'])
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GlsTopMenuComponent);
    component = fixture.componentInstance;
    breadcrumbService = TestBed.inject(BreadcrumbService) as jasmine.SpyObj<BreadcrumbService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize breadcrumbs on ngOnInit', () => {
    const breadcrumbs: Breadcrumb[] = [
      { label: 'breadcrumb.home', url: '/home' },
      { label: 'breadcrumb.dashboard', url: '/dashboard' }
    ];
    breadcrumbService.getBreadcrumbs.and.returnValue(of(breadcrumbs));

    component.ngOnInit();

    expect(component.breadcrumb).toEqual(breadcrumbs);
  });

  xit('should toggle sidebar icon and emit event on toggleNavIcon', () => {
    spyOn(component.toggleSidebar, 'emit');
    const sidebar = document.createElement('div');
    sidebar.id = 'sidebar';
    document.body.appendChild(sidebar);

    component.toggleNavIcon();

    expect(sidebar.classList.contains('collapsed')).toBeTrue();
    expect(component.isIconEnabled).toBeTrue();
    expect(component.toggleSidebar.emit).toHaveBeenCalled();

    component.toggleNavIcon();

    expect(sidebar.classList.contains('collapsed')).toBeFalse();
    expect(component.isIconEnabled).toBeFalse();
    expect(component.toggleSidebar.emit).toHaveBeenCalledTimes(2);

    document.body.removeChild(sidebar);
  });
});
