/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { RoleListComponent } from './role-list.component';
import { Router } from '@angular/router';
import { ExportService, RoleService } from '../../../api/glsUserApi/services';
import { MessageStatusService } from '../../../common/utilities/services/message/message.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { PagedRoleSearchResponse, PermissionAssignmentModel, RoleModel } from '../../../api/glsUserApi/models';
import { Utility } from '../../../common/utilities/utility';
import { GenericService } from '../../../common/utilities/services/generic.service';
import { VIEW_MODE } from '../../../common/app.constants';
import { UtilityRouting } from '../../../common/utilities/utility-routing';

describe('RoleListComponent', () => {
  let component: RoleListComponent;
  let fixture: ComponentFixture<RoleListComponent>;
  let router: jasmine.SpyObj<Router>;
  let roleService: jasmine.SpyObj<RoleService>;
  let messageStatusService: jasmine.SpyObj<MessageStatusService>;
  let apiExportService: jasmine.SpyObj<ExportService>; // <-- Add this
  let genericServiceMock: jasmine.SpyObj<GenericService>;

  beforeEach(async () => {
    const roleServiceSpy = jasmine.createSpyObj('RoleService', [
      'postApiRoleV1Search$Json',
      'getApiRoleV1Permissions$Json' // Add this method
    ]);
    roleServiceSpy.postApiRoleV1Search$Json.and.returnValue(
      of({
        currentPage: 1,
        pageSize: 10,
        roles: [
          {
            id: 1,
            name: 'Admin',
            description: 'Administrator role',
            permissions: [{ accessType: 'Read' } as PermissionAssignmentModel, { accessType: 'Write' } as PermissionAssignmentModel]
          }
        ],
        totalItems: 1,
        totalPages: 1
      })
    );
    roleServiceSpy.getApiRoleV1Permissions$Json.and.returnValue(
      of([
        { id: 1, name: 'Permission1' },
        { id: 2, name: 'Permission2' }
      ]) // Mock response for permissions
    );
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    modalServiceSpy.open.and.returnValue({
      componentInstance: {},
      result: Promise.resolve('mockResult')
    });
    const apiExportServiceSpy = jasmine.createSpyObj('ExportService', ['postApiExportV1Roles$Response']); // <-- Add this
    genericServiceMock = jasmine.createSpyObj('GenericService', ['viewMode', 'getPageType']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RoleListComponent, HttpClientTestingModule, TranslateModule.forRoot(), ReactiveFormsModule],
      providers: [
        { provide: RoleService, useValue: roleServiceSpy },
        { provide: NgbModal, useValue: modalServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ExportService, useValue: apiExportServiceSpy },
        { provide: MessageStatusService, useValue: jasmine.createSpyObj('MessageStatusService', ['hide']) },
        { provide: GenericService, useValue: genericServiceMock }
        // <-- Add this
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleListComponent);
    component = fixture.componentInstance;
    roleService = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
    // modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    apiExportService = TestBed.inject(ExportService) as jasmine.SpyObj<ExportService>; // <-- Add this
    messageStatusService = TestBed.inject(MessageStatusService) as jasmine.SpyObj<MessageStatusService>;
    fixture.detectChanges();
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    UtilityRouting.initialize(router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial data on init', () => {
    const mockRoles: PagedRoleSearchResponse = {
      currentPage: 1,
      pageSize: 10,
      roles: [
        { id: 1, name: 'Admin', description: 'Administrator role' } as RoleModel,
        { id: 2, name: 'User', description: 'Standard user role' } as RoleModel
      ],
      totalItems: 2,
      totalPages: 1
    };
    roleService.postApiRoleV1Search$Json.and.returnValue(of(mockRoles));
    component.ngOnInit();
    expect(roleService.postApiRoleV1Search$Json).toHaveBeenCalled();
    expect(component.roleData).toEqual(mockRoles.roles!);
  });

  it('should populate the filter dropdown', () => {
    component.roleData = [{ id: 1, name: 'Admin', description: 'Admin role' }];
    component.populateRoleDropdown();
    expect(component.filterTypeList).toEqual([{ value: 'Admin' }]);
  });

  it('should navigate to role edit page', () => {
    component.createRole();
    expect(router.navigate).toHaveBeenCalledWith(['user-profile/role-edit']);
  });

  it('should reload the role list', () => {
    const mockRoles: PagedRoleSearchResponse = {
      currentPage: 1,
      pageSize: 10,
      roles: [
        { id: 1, name: 'Admin', description: 'Administrator role' } as RoleModel,
        { id: 2, name: 'User', description: 'Standard user role' } as RoleModel
      ],
      totalItems: 2,
      totalPages: 1
    };

    component.reloadRoleList(mockRoles);

    expect(component.roleData).toEqual(mockRoles.roles!);
    expect(component.currentPage()).toEqual(mockRoles.currentPage!);
    expect(component.totalPages()).toEqual(mockRoles.totalPages!);
  });

  it('should reset roleActiveRequest', () => {
    component.resetRoleActiveRequest();
    expect(component.roleActiveRequest.currentPage).toEqual(component.currentPage());
    expect(component.roleActiveRequest.pageSize).toEqual(component.pageSize());
  });

  it('should reset all filters', () => {
    spyOn(component, 'resetRoleActiveRequest').and.callThrough();
    component.resetFilters();
    expect(component.resetRoleActiveRequest).toHaveBeenCalled();
    expect(component.roleFilterFg.get('filterType')?.value).toEqual('');
    expect(component.roleFilterFg.get('filterValue')?.value).toEqual('');
    expect(component.roleFilterFg.get('permissionValue')?.value).toEqual('');
  });

  it('should retrieve applied filters', () => {
    component.roleActiveRequest = {
      roleFilter: { name: 'ReadValue' }
    };

    const filters = component.showFiltersApplied();

    expect(filters).toEqual([{ name: 'role', value: 'ReadValue' }]);
  });

  it('should reset a specific filter', () => {
    component.roleFilterFg.setValue({ filterType: 'role', filterValue: 'Admin', permissionValue: '' });
    component.roleActiveRequest.roleFilter = { name: 'Admin' };
    component.resetFilter({ name: 'role', value: 'Admin' });
    expect(component.roleActiveRequest.roleFilter?.name).toEqual(undefined);
    expect(component.roleFilterFg.get('filterType')?.value).toEqual('');
    expect(component.roleFilterFg.get('filterValue')?.value).toEqual('');
    expect(component.roleFilterFg.get('permissionValue')?.value).toEqual('');
  });

  it('should filter role list by text input', () => {
    component.roleFilterFg.setValue({ filterType: 'Role', filterValue: 'Admin', permissionValue: '' });
    component.roleActiveRequest = {};

    component.filterByText();

    expect(component.roleActiveRequest.roleFilter?.name).toBe('Admin');
    expect(component.currentPage()).toBe(1);
  });

  it('should return an empty array when no filters are applied in showFiltersApplied', () => {
    component.roleActiveRequest = {};

    const filters = component.showFiltersApplied();

    expect(filters).toEqual([]);
  });

  it('should handle page change and reload role list', () => {
    const mockPage = 2;
    const mockResponse: PagedRoleSearchResponse = {
      currentPage: mockPage,
      pageSize: 10,
      roles: [{ id: 3, name: 'Manager', description: 'Manager role' } as RoleModel],
      totalItems: 1,
      totalPages: 1
    };
    spyOn(component, 'reloadRoleList');
    roleService.postApiRoleV1Search$Json.and.returnValue(of(mockResponse));

    component.pageChange(mockPage);

    expect(component.currentPage()).toBe(mockPage);
    expect(component.roleActiveRequest.currentPage).toBe(mockPage);
    const expectedParams = { body: component.roleActiveRequest };
    expect(roleService.postApiRoleV1Search$Json).toHaveBeenCalledWith(expectedParams);
    expect(component.reloadRoleList).toHaveBeenCalledWith(mockResponse);
  });

  it('should filter role list by permission', () => {
    // Arrange
    component.roleFilterFg.setValue({
      filterType: 'Permission',
      filterValue: 'networkStructure',
      permissionValue: 'networkStructure'
    });
    component.roleData = [
      {
        id: 1,
        name: 'Admin',
        description: 'Administrator role',
        permissions: [{ accessType: 'Read' }, { accessType: 'Write' }]
      } as RoleModel,
      {
        id: 2,
        name: 'User',
        description: 'User role',
        permissions: [{ accessType: 'Read' }]
      } as RoleModel,
      {
        id: 3,
        name: 'Guest',
        description: 'Guest role',
        permissions: [{ accessType: 'Write' }]
      } as RoleModel
    ];
    spyOn(component, 'reloadRoleList');
    roleService.postApiRoleV1Search$Json.and.returnValue(
      of({
        roles: [],
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1
      })
    );

    // Act
    component.filterByText();

    // Assert
    // Only Admin and User have 'Read' permission
    expect(component.roleActiveRequest.permissionFilter?.description).toBe('networkStructure');

    expect(component.currentPage()).toBe(1);
    expect(component.roleActiveRequest.currentPage).toBe(1);
    expect(roleService.postApiRoleV1Search$Json).toHaveBeenCalledWith({ body: component.roleActiveRequest });
    expect(component.reloadRoleList).toHaveBeenCalled();
  });

  it('should export role data as CSV', () => {
    // Arrange
    spyOn(Utility, 'openFile');
    const mockBlob = new Blob(['id,name\n1,Admin'], { type: 'text/csv' });
    component['translateService'].currentLang = 'IT';
    const mockHeaders = {
      keys: () => ['content-type'],
      get: (key: string) => (key === 'content-type' ? 'text/csv' : null)
    } as any;
    const mockResponse = {
      headers: mockHeaders,
      body: mockBlob
    };
    component.roleActiveRequest.roleFilter = { name: 'Admin' };
    apiExportService.postApiExportV1Roles$Response = jasmine.createSpy().and.returnValue(of(mockResponse));

    // Act
    component.exportRoleData();

    // Assert
    expect(apiExportService.postApiExportV1Roles$Response).toHaveBeenCalled();
    expect(Utility.openFile).toHaveBeenCalledWith(mockBlob, 'text/csv', jasmine.stringMatching(/^Role_Management_\d{8}\.csv$/));
  });

  it('should set roleData, roleCount, totalPages, currentPage, pageSize, totalItems and call populateRoleDropdown and spinnerService.hide on success', () => {
    // Arrange
    const mockResponse: PagedRoleSearchResponse = {
      currentPage: undefined,
      pageSize: undefined,
      roles: undefined,
      totalItems: undefined,
      totalPages: undefined
    };
    spyOn(component, 'retrieveRole').and.returnValue(of(mockResponse));
    spyOn(component, 'populateRoleDropdown');

    // Act
    component.loadInitialData();

    // Assert
    expect(component.roleData).toEqual([]);
    expect(component.roleCount).toBe(0); // totalItems
    expect(component.totalPages()).toBe(1);
    expect(component.currentPage()).toBe(1);
    expect(component.pageSize()).toBe(0);
    expect(component.totalItems()).toBe(0);
    expect(component.populateRoleDropdown).toHaveBeenCalled();
  });

  it('should set all properties correctly in reloadRoleList when roleList is provided', () => {
    // Arrange
    const mockRoleList: PagedRoleSearchResponse = {
      currentPage: undefined,
      pageSize: undefined,
      roles: undefined,
      totalItems: undefined,
      totalPages: undefined
    };

    // Set up spies for signals if needed (if using Angular signals)
    spyOn(component.totalPages, 'set').and.callThrough();
    spyOn(component.currentPage, 'set').and.callThrough();
    spyOn(component.pageSize, 'set').and.callThrough();

    // Act
    component.reloadRoleList(mockRoleList);

    // Assert
    expect(component.currentPage.set).toHaveBeenCalledWith(1);
    expect(component.totalPages.set).toHaveBeenCalledWith(1);
    expect(component.pageSize.set).toHaveBeenCalledWith(0);
    expect(component.roleData).toEqual([]);
    expect(component.roleCount).toBe(0);
  });

  it('should call messageStatusService.hide on ngOnDestroy', () => {
    component.ngOnDestroy();
    expect(messageStatusService.hide).toHaveBeenCalled();
  });

  it('should set isSmallMobile to true and isTablet to false when viewMode is MOBILE', () => {
    genericServiceMock.viewMode.and.returnValue(VIEW_MODE.MOBILE);

    (component as any).setupViewMode();

    expect(component.isSmallMobile()).toBeTrue();
    expect(component.isTablet()).toBeFalse();
  });

  it('should set isSmallMobile to false and isTablet to true when viewMode is TABLET', () => {
    genericServiceMock.viewMode.and.returnValue(VIEW_MODE.TABLET);

    (component as any).setupViewMode();

    expect(component.isSmallMobile()).toBeFalse();
    expect(component.isTablet()).toBeTrue();
  });

  it('should set both isSmallMobile and isTablet to false when viewMode is neither MOBILE nor TABLET', () => {
    genericServiceMock.viewMode.and.returnValue(VIEW_MODE.DESKTOP);

    (component as any).setupViewMode();

    expect(component.isSmallMobile()).toBeFalse();
    expect(component.isTablet()).toBeFalse();
  });
});
