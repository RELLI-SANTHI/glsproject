/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlsNavbarComponent } from './gls-navbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '../../utilities/services/breadcrumb/breadcrumb.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

describe('GlsNavbarComponent', () => {
  let component: GlsNavbarComponent;
  let fixture: ComponentFixture<GlsNavbarComponent>;
  let breadcrumbService: jasmine.SpyObj<BreadcrumbService>;

  let sidebarCollapse: HTMLButtonElement;
  let sidebarExpand: HTMLButtonElement;
  let sidebar: HTMLDivElement;
  let content: HTMLDivElement;

  beforeEach(async () => {
    // Mock BreadcrumbService
    breadcrumbService = jasmine.createSpyObj('BreadcrumbService', ['clearBreadcrumbs']);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, TranslateModule.forRoot(), CommonModule, NgbCollapseModule, GlsNavbarComponent],
      providers: [{ provide: BreadcrumbService, useValue: breadcrumbService }]
    }).compileComponents();

    // Create and append elements before component initialization
    sidebarCollapse = document.createElement('button');
    sidebarCollapse.id = 'sidebarCollapse';
    document.body.appendChild(sidebarCollapse);

    sidebarExpand = document.createElement('button');
    sidebarExpand.id = 'sidebarExpand';
    document.body.appendChild(sidebarExpand);

    sidebar = document.createElement('div');
    sidebar.id = 'sidebar';
    document.body.appendChild(sidebar);

    content = document.createElement('div');
    content.id = 'content';
    document.body.appendChild(content);

    // Spy before component initialization
    spyOn(sidebarCollapse, 'addEventListener').and.callThrough();
    spyOn(sidebarExpand, 'addEventListener').and.callThrough();
    spyOn(sidebar.classList, 'toggle').and.callThrough();
    spyOn(content.classList, 'toggle').and.callThrough();

    fixture = TestBed.createComponent(GlsNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Cleanup DOM elements
    document.body.removeChild(sidebarCollapse);
    document.body.removeChild(sidebarExpand);
    document.body.removeChild(sidebar);
    document.body.removeChild(content);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit toggleSidebar event when toggleSidebarValue is called', () => {
    spyOn(component.toggleSidebar, 'emit');
    component.toggleSidebarValue();
    expect(component.toggleSidebar.emit).toHaveBeenCalled();
  });

  xit('should add event listeners to sidebar buttons on ngOnInit', () => {
    expect(sidebarCollapse.addEventListener).toHaveBeenCalledWith('click', jasmine.any(Function));
    expect(sidebarExpand.addEventListener).toHaveBeenCalledWith('click', jasmine.any(Function));
  });

  xit('should toggle sidebar and content classes on sidebarCollapse and sidebarExpand click', () => {
    sidebarCollapse.click();
    expect(sidebar.classList.toggle).toHaveBeenCalledWith('collapsed');
    expect(content.classList.toggle).toHaveBeenCalledWith('expanded');

    sidebarExpand.click();
    expect(sidebar.classList.toggle).toHaveBeenCalledWith('collapsed');
    expect(content.classList.toggle).toHaveBeenCalledWith('expanded');
  });
});
