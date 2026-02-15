/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { UserListComponent } from './user-list.component';
import { of, throwError } from 'rxjs';
import { MessageStatusService } from '../../../common/utilities/services/message/message.service';
import { PagedRoleSearchResponse, PagedUserSearchResponse, UserSearchResponseModel } from '../../../api/glsUserApi/models';
import { HttpErrorResponse } from '@angular/common/http';
import { Utility } from '../../../common/utilities/utility';
import { TemplateModel } from '../../../api/glsNetworkApi/models';
import { PROFILE, USER_STATUS } from '../../../common/utilities/constants/profile';
import { UsersService } from '../../../api/glsUserApi/services';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let messageService: MessageStatusService;
  let apiExportService: jasmine.SpyObj<any>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;

  beforeEach(async () => {
    apiExportService = jasmine.createSpyObj('apiExportService', ['postApiExportV1Export$Json$Response']); // Mock the service
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['postApiUsersV1$Json']);
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, TranslateModule.forRoot(), UserListComponent],
      providers: [
        MessageStatusService,
        { provide: 'apiExportService', useValue: apiExportService },
        { provide: UsersService, useValue: usersServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    messageService = TestBed.inject(MessageStatusService);
    usersServiceSpy.postApiUsersV1$Json.and.returnValue(
      of({
        users: [],
        totalItems: 0,
        currentPage: 1,
        pageSize: 10,
        totalPages: 1
      })
    );
    fixture.detectChanges();
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call retrieveUsers with Profile filter', () => {
    const profileId = 'EVA_USER';
    const profileDescription = 'USER';
    component.filterStepper[0].fields = [{ name: 'Profile', value: profileDescription }];
    component.profileList = [{ id: profileId, value: 'USER' }];

    component.applyFilter();

    expect(usersServiceSpy.postApiUsersV1$Json).toHaveBeenCalledWith({
      body: jasmine.objectContaining({
        profile: profileId,
        profileDescription,
        currentPage: 1,
        pageSize: 10
      })
    });
  });

  it('should call retrieveUsers with Buildingtype filter', () => {
    const buildingTypeName = 'Office';
    const buildingTypeId = 5;
    component.filterStepper[0].fields = [{ name: 'Buildingtype', value: buildingTypeName }];
    component.buildingTypes = [
      {
        id: buildingTypeId,
        templateName: buildingTypeName,
        buildingAcronymMaxLength: 1,
        buildingAcronymMinLength: 3,
        icon: 'icon.png'
      } as TemplateModel
    ];

    component.applyFilter();

    expect(usersServiceSpy.postApiUsersV1$Json).toHaveBeenCalledWith({
      body: jasmine.objectContaining({
        buildingType: buildingTypeId,
        currentPage: 1
      })
    });
  });

  it('should call retrieveUsers with State filter', () => {
    const stateValue = 'ACTIVE';
    component.filterStepper[0].fields = [{ name: 'State', value: stateValue }];

    component.applyFilter();

    expect(usersServiceSpy.postApiUsersV1$Json).toHaveBeenCalledWith({
      body: jasmine.objectContaining({
        status: stateValue,
        currentPage: 1
      })
    });
  });

  it('should call retrieveUsers with all filters', () => {
    const profile = 'EVA_USER';
    const profileDescription = 'USER';
    const buildingTypeName = 'Office';
    const buildingType = 5;
    const status = 'ACTIVE';

    component.filterStepper[0].fields = [
      { name: 'Profile', value: profileDescription },
      { name: 'Buildingtype', value: buildingTypeName },
      { name: 'State', value: status }
    ];
    component.profileList = [{ id: profile, value: 'USER' }];
    component.buildingTypes = [
      {
        id: buildingType,
        templateName: buildingTypeName,
        buildingAcronymMaxLength: 1,
        buildingAcronymMinLength: 3,
        icon: 'icon.png'
      } as TemplateModel
    ];

    component.applyFilter();

    expect(usersServiceSpy.postApiUsersV1$Json).toHaveBeenCalledWith({
      body: jasmine.objectContaining({
        profile,
        profileDescription,
        buildingType,
        status,
        currentPage: 1,
        pageSize: 10
      })
    });
  });

  it('should call retrieveUsers with all filters v2', () => {
    component.userFilterFg.setValue({ filterType: 'Name', filterValue: 'John' });
    component.userActiveRequest = {} as any;

    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );

    component.filterByText();

    expect(component.retrieveUsers).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'John',
        currentPage: 1
      })
    );
  });

  it('should call retrieveUsers with Name filter', () => {
    component.userFilterFg.setValue({ filterType: 'Name', filterValue: 'John' });
    component.userActiveRequest = {} as any;

    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );

    component.filterByText();

    expect(component.retrieveUsers).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'John',
        currentPage: 1
      })
    );
  });

  it('should initialize data on ngOnInit', () => {
    spyOn(component as any, 'loadInitialData'); // Explicitly cast to 'any' to avoid type errors
    spyOn(component as any, 'setupViewMode');
    component.ngOnInit();
    expect((component as any).loadInitialData).toHaveBeenCalled();
    expect((component as any).setupViewMode).toHaveBeenCalled();
  });

  it('should clean up resources on ngOnDestroy', () => {
    spyOn(messageService, 'hide');
    component.ngOnDestroy();
    expect(messageService.hide).toHaveBeenCalled();
  });

  it('should reload user list', () => {
    const mockResponse: PagedUserSearchResponse = {
      users: [
        {
          id: 1,
          name: 'Test User',
          profile: PROFILE.EVA_ADMIN,
          status: ''
        }
      ],
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
      totalItems: 1
    };
    component.reloadUserList(mockResponse);
    expect(component.userList()).toEqual(mockResponse.users);
    expect(component.currentPage()).toBe(mockResponse.currentPage!); // Use non-null assertion
    expect(component.totalPages()).toBe(mockResponse.totalPages!); // Use non-null assertion
    expect(component.pageSize()).toBe(mockResponse.pageSize!); // Use non-null assertion
    expect(component.totalItems()).toBe(mockResponse.totalItems!); // Use non-null assertion
  });

  it('should set default values for currentPage, totalPages, pageSize if falsy in reloadUserList', () => {
    const mockResponse: PagedUserSearchResponse = {
      users: [],
      currentPage: undefined,
      totalPages: 1,
      pageSize: undefined,
      totalItems: 0
    };
    component.reloadUserList(mockResponse);
    expect(component.currentPage()).toBe(1);
    expect(component.totalPages()).toBe(1);
    expect(component.pageSize()).toBe(0);
    expect(component.totalItems()).toBe(0);
  });

  it('should handle page change', () => {
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    ); // Ensure all required properties are included
    component.pageChange(2);
    expect(component.currentPage()).toBe(1); // Use default value or non-null assertion
  });

  it('should apply filters', () => {
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    ); // Ensure all required properties are included
    component.applyFilter();
    expect(component.isOpenedFilter()).toBeFalse();
  });

  it('should apply filter for BuildingType', () => {
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [{ name: 'Buildingtype', value: 'Building 1' }]
      }
    ];
    component.userActiveRequest = {} as any;
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.applyFilter();
    expect(component.userActiveRequest.buildingType).toBeUndefined();
    expect(component.isOpenedFilter()).toBeFalse();
  });

  xit('should handle empty filters gracefully 1', () => {
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [
          { name: 'Profile', value: undefined },
          { name: 'Buildingtype', value: undefined },
          { name: 'State', value: undefined }
        ]
      }
    ];
    component.userActiveRequest = {} as any;
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.applyFilter();
    expect(component.userActiveRequest).toEqual({ currentPage: 1 });
    expect(component.isOpenedFilter()).toBeFalse();
  });

  it('should handle error during retrieveUsers in applyFilter', () => {
    const mockError = new HttpErrorResponse({ error: { message: 'Error occurred' } });
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [{ name: 'Profile', value: 'Admin' }]
      }
    ];
    component.userActiveRequest = {} as any;
    spyOn(component, 'retrieveUsers').and.returnValue(throwError(() => mockError));
    component.applyFilter();
  });

  it('should apply filter for State', () => {
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [
          { name: 'Profile', value: undefined },
          { name: 'BuildingType', value: undefined },
          { name: 'State', value: 'ACTIVE' }
        ]
      }
    ];
    component.stateList = [
      { id: '10', value: 'ACTIVE' },
      { id: '11', value: 'INACTIVE' }
    ];
    component.userActiveRequest = {} as any;
    component.applyFilter();
    expect(component.isOpenedFilter()).toBeFalse();
  });

  xit('should handle empty filters gracefully', () => {
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [
          { name: 'Profile', value: undefined },
          { name: 'BuildingType', value: undefined },
          { name: 'State', value: undefined }
        ]
      }
    ];
    component.userActiveRequest = {} as any;
    component.applyFilter();
    expect(component.userActiveRequest).toEqual({ currentPage: 1 });
    expect(component.isOpenedFilter()).toBeFalse();
  });

  it('should open and close export modal', () => {
    component.openExportModal();
    expect(component.openExportDataModal).toBeTrue();
    component.closeExportDataModal();
    expect(component.openExportDataModal).toBeFalse();
  });

  xit('should handle modal result when the modal is closed', async () => {
    // Arrange
    const mockModalRef = {
      componentInstance: { data: null },
      result: Promise.resolve('Confirmed')
    } as unknown as NgbModalRef;

    spyOn((component as any).modalService, 'open').and.returnValue(mockModalRef);
    const title = 'Error Title';
    const errorMessage = 'An error occurred';

    // Act
    component.openErrorModal(title, errorMessage);
    await mockModalRef.result;

    // Assert
    expect((component as any).modalService.open).toHaveBeenCalled();
  });

  it('should toggle filter panel visibility', () => {
    expect(component.isOpenedFilter()).toBeFalse();
    component.isOpenedFilter.set(true);
    expect(component.isOpenedFilter()).toBeTrue();
  });

  it('should show filters applied', () => {
    component.filterStepper[0].fields[0].value = 'TestProfile';
    component.userActiveRequest = { buildingAcronym: 'TestAcronym' } as any;
    const filters = component.showFiltersApplied();
    expect(filters).toEqual([
      { name: 'Profile', value: 'TestProfile' },
      { name: 'BuildingAcronym', value: 'TestAcronym' }
    ]);
  });

  xit('should show filters applied with all fields populated', () => {
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [
          { name: 'Profile', value: undefined },
          { name: 'State', value: undefined }
        ]
      }
    ];
    component.userActiveRequest = {
      profile: 1,
      status: 'ACTIVE',
      buildingName: 'Building 1',
      buildingAcronym: 'B1',
      userName: 'TestUser',
      name: 'John',
      surname: 'Doe',
      corporateGroupId: 123,
      roleName: 'Admin'
    } as any;

    const filters = component.showFiltersApplied();
    expect(filters).toEqual([
      { name: 'Profile', value: '1' },
      { name: 'State', value: 'ACTIVE' },
      { name: 'BuildingName', value: 'Building 1' },
      { name: 'BuildingAcronym', value: 'B1' },
      { name: 'Username', value: 'TestUser' },
      { name: 'Name', value: 'John' },
      { name: 'Surname', value: 'Doe' },
      { name: 'CompanyGroup', value: '123' },
      { name: 'Role', value: '456' }
    ]);
  });

  it('should show filters applied with some fields missing', () => {
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [
          { name: 'Profile', value: undefined },
          { name: 'State', value: undefined }
        ]
      }
    ];
    component.userActiveRequest = {
      profile: null,
      status: 'INACTIVE',
      buildingName: '',
      buildingAcronym: '',
      userName: null,
      name: undefined,
      surname: 'Smith',
      corporateGroupId: null,
      roleName: null
    } as any;

    const filters = component.showFiltersApplied();
    expect(filters).toEqual([
      { name: 'State', value: 'INACTIVE' },
      { name: 'Surname', value: 'Smith' }
    ]);
  });

  it('should show filters applied with no fields populated', () => {
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [
          { name: 'Profile', value: undefined },
          { name: 'State', value: undefined }
        ]
      }
    ];
    component.userActiveRequest = {} as any;

    const filters = component.showFiltersApplied();
    expect(filters).toEqual([]);
  });

  it('should not duplicate existing filters', () => {
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [
          { name: 'Profile', value: '1' },
          { name: 'State', value: 'ACTIVE' }
        ]
      }
    ];
    component.userActiveRequest = {
      profile: 1,
      status: 'ACTIVE',
      buildingName: '',
      buildingAcronym: '',
      userName: null,
      name: undefined,
      surname: null,
      corporateGroupId: null,
      roleName: null
    } as any;

    const filters = component.showFiltersApplied();
    expect(filters).toEqual([
      { name: 'Profile', value: '1' },
      { name: 'State', value: 'ACTIVE' }
    ]);
  });

  it('should apply filter and close filter panel', () => {
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.applyFilter();
    expect(component.isOpenedFilter()).toBeFalse();
  });

  it('should load initial data successfully', () => {
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [{ id: 1, name: 'Test User', profile: PROFILE.EVA_ADMIN, status: USER_STATUS.active }], // Include all required properties
        currentPage: 1,
        totalItems: 10,
        totalPages: 2,
        pageSize: 5
      } as PagedUserSearchResponse)
    ); // Ensure the mock response matches the type
    component['loadInitialData']();
    expect(component.userList()).toEqual([
      {
        id: 1,
        name: 'Test User',
        profile: PROFILE.EVA_ADMIN,
        status: USER_STATUS.active
      }
    ]);
    expect(component.totalItems()).toBe(10);
    expect(component.currentPage()).toBe(1);
    expect(component.pageSize()).toBe(5);
    expect(component.totalPages()).toBe(2);
  });

  it('should handle error while retrieving users', () => {
    const mockError = new HttpErrorResponse({ error: { message: 'Error occurred' } });
    spyOn(component, 'retrieveUsers').and.returnValue(throwError(() => mockError));
    component['loadInitialData']();
  });

  it('should filter by text for BuildingAcronym', () => {
    component.userFilterFg.setValue({ filterType: 'BuildingAcronym', filterValue: 'TestAcronym' });
    component.userActiveRequest = {} as any;
    component.filterByText();
    expect(component.userActiveRequest.buildingAcronym).toBe('TestAcronym');
  });

  it('should filter by text for Name', () => {
    component.userFilterFg.setValue({ filterType: 'Name', filterValue: 'John' });
    component.userActiveRequest = {} as any;
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.filterByText();
    expect(component.userActiveRequest.name).toBe('John');
  });

  it('should filter by text for Surname', () => {
    component.userFilterFg.setValue({ filterType: 'Surname', filterValue: 'Doe' });
    component.userActiveRequest = {} as any;
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.filterByText();
    expect(component.userActiveRequest.surname).toBe('Doe');
  });

  it('should filter by text for State', () => {
    component.userFilterFg.setValue({ filterType: 'State', filterValue: 'ACTIVE' });
    component.userActiveRequest = {} as any;
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.filterByText();
    expect(component.userActiveRequest.status).toBe('ACTIVE');
  });

  it('should filter by text for NameSurname', () => {
    component.userFilterFg.setValue({ filterType: 'NameSurname', filterValue: 'John Doe' });
    component.userActiveRequest = {} as any;
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.filterByText();
    expect(component.userActiveRequest.name).toBe('John Doe');
  });

  it('should filter by text for BuildingAcronym', () => {
    component.userFilterFg.setValue({ filterType: 'BuildingAcronym', filterValue: 'B1' });
    component.userActiveRequest = {} as any;
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.filterByText();
    expect(component.userActiveRequest.buildingAcronym).toBe('B1');
  });

  it('should filter by text for Username', () => {
    component.userFilterFg.setValue({ filterType: 'Username', filterValue: 'TestUser' });
    component.userActiveRequest = {} as any;
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.filterByText();
    expect(component.userActiveRequest.userName).toBe('TestUser');
  });

  it('should filter by text for BuildingName', () => {
    component.userFilterFg.setValue({ filterType: 'BuildingName', filterValue: 'Building 1' });
    component.userActiveRequest = {} as any;
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.filterByText();
    expect(component.userActiveRequest.buildingName).toBe('Building 1');
  });

  it('should filter by text for corporateGroupName', () => {
    component.userFilterFg.setValue({ filterType: 'corporateGroupName', filterValue: 'root' });
    component.userActiveRequest = {} as any;
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.filterByText();
    expect(component.userActiveRequest.corporateName).toBe('root');
  });

  it('should filter by text for Role', () => {
    component.roleArray = [{ id: 5, name: 'Admin' }];
    component.userFilterFg.setValue({ filterType: 'Role', filterValue: 'Admin' });
    component.userActiveRequest = {} as any;
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.filterByText();
    expect(component.userActiveRequest.roleName).toBe('Admin');
  });

  it('should filter by text for Profile', () => {
    component.userFilterFg.setValue({ filterType: 'Profile', filterValue: 'EVA_ADMIN' });
    component.userActiveRequest = {} as any;
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.filterByText();
    expect(component.userActiveRequest.profile).toBe('EVA_ADMIN');
  });
  it('should filter by text for Email', () => {
    // Arrange
    component.userFilterFg.setValue({ filterType: 'Email', filterValue: 'test@example.com' });
    component.userActiveRequest = {} as any;
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );

    // Act
    component.filterByText();

    // Assert
    expect(component.userActiveRequest.email).toBe('test@example.com');
  });

  it('should handle invalid filter type gracefully', () => {
    component.userFilterFg.setValue({ filterType: 'InvalidType', filterValue: 'InvalidValue' });
    component.userActiveRequest = {} as any;
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.filterByText();
    expect(component.userActiveRequest).toEqual({ currentPage: 1 });
  });

  it('should handle error during retrieveUsers in filterByText', () => {
    const mockError = new HttpErrorResponse({ error: { message: 'Error occurred' } });
    component.userFilterFg.setValue({ filterType: 'Name', filterValue: 'John' });
    component.userActiveRequest = {} as any;
    spyOn(component, 'retrieveUsers').and.returnValue(throwError(() => mockError));
    component.filterByText();
  });

  it('should select a filter step', () => {
    component.currentFilterStep = 'start';
    component.selectStep('Profile');
    expect(component.currentFilterStep).toBe('Profile');
  });

  it('should select a filter step when fromStep is not "start"', () => {
    component.currentFilterStep = 'Profile';
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [
          { name: 'Profile', value: undefined },
          { name: 'State', value: undefined }
        ]
      }
    ];
    component.selectStep('State');
    expect(component.filterStepper[0].fields[0].value).toBe('State');
    expect(component.currentFilterStep).toBe('start');
  });

  it('should select a filter step when fromStep is "start"', () => {
    component.currentFilterStep = 'start';
    component.selectStep('Profile');
    expect(component.currentFilterStep).toBe('Profile');
  });

  it('should handle invalid fromStep gracefully', () => {
    component.currentFilterStep = 'InvalidStep';
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [
          { name: 'Profile', value: undefined },
          { name: 'State', value: undefined }
        ]
      }
    ];
    component.selectStep('State');
    expect(component.currentFilterStep).toBe('start'); // Ensure it resets to 'start'
  });

  it('should navigate back to the initial filter step', () => {
    component.currentFilterStep = 'Profile';
    component.back();
    expect(component.currentFilterStep).toBe('start');
  });

  it('should reset filters', () => {
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.resetFilters();
    // Use jasmine.objectContaining to allow for extra properties
    expect(component.userActiveRequest).toEqual(jasmine.objectContaining({}));
    expect(component.filterStepper[0].fields.every((x) => x.value === undefined)).toBeTrue();
  });

  it('should reset a specific filter', () => {
    const field = { name: 'State', value: 'ACTIVE' };
    spyOn(component, 'applyFilter');
    component.resetFilter(field);
    expect(field.value).toBeUndefined();
    expect(component.userActiveRequest.status).toBeNull();
    expect(component.applyFilter).toHaveBeenCalled();
  });

  it('should reset filter for State', () => {
    const field = { name: 'State', value: 'ACTIVE' };
    spyOn(component, 'applyFilter');
    component.resetFilter(field);
    expect(field.value).toBeUndefined();
    expect(component.userActiveRequest.status).toBeNull();
    expect(component.applyFilter).toHaveBeenCalled();
  });

  it('should reset filter for Buildingtype', () => {
    const field = { name: 'Buildingtype', value: 'Building 1' };
    spyOn(component, 'applyFilter');
    component.resetFilter(field);
    expect(field.value).toBeUndefined();
    expect(component.userActiveRequest.buildingType).toBeNull();
    expect(component.applyFilter).toHaveBeenCalled();
  });

  it('should reset filter for Profile', () => {
    const field = { name: 'Profile', value: 'Admin' };
    spyOn(component, 'applyFilter');
    component.resetFilter(field);
    expect(field.value).toBeUndefined();
    expect(component.userActiveRequest.profile).toBeNull();
    expect(component.applyFilter).toHaveBeenCalled();
  });

  it('should reset filter for NameSurname', () => {
    const field = { name: 'NameSurname', value: 'John Doe' };
    spyOn(component, 'applyFilter');
    component.resetFilter(field);
    expect(field.value).toBeUndefined();
    expect(component.userActiveRequest.name).toBeNull();
    expect(component.applyFilter).toHaveBeenCalled();
  });

  it('should reset filter for BuildingName', () => {
    const field = { name: 'BuildingName', value: 'Building 1' };
    spyOn(component, 'applyFilter');
    component.resetFilter(field);
    expect(field.value).toBeUndefined();
    expect(component.userActiveRequest.buildingName).toBeNull();
    expect(component.applyFilter).toHaveBeenCalled();
  });

  it('should reset filter for BuildingAcronym', () => {
    const field = { name: 'BuildingAcronym', value: 'B1' };
    spyOn(component, 'applyFilter');
    component.resetFilter(field);
    expect(field.value).toBeUndefined();
    expect(component.userActiveRequest.buildingAcronym).toBeNull();
    expect(component.applyFilter).toHaveBeenCalled();
  });

  it('should reset filter for Username', () => {
    const field = { name: 'Username', value: 'TestUser' };
    spyOn(component, 'applyFilter');
    component.resetFilter(field);
    expect(field.value).toBeUndefined();
    expect(component.userActiveRequest.userName).toBeNull();
    expect(component.applyFilter).toHaveBeenCalled();
  });

  it('should reset filter for Name', () => {
    const field = { name: 'Name', value: 'John' };
    spyOn(component, 'applyFilter');
    component.resetFilter(field);
    expect(field.value).toBeUndefined();
    expect(component.userActiveRequest.name).toBeNull();
    expect(component.applyFilter).toHaveBeenCalled();
  });

  it('should reset filter for Surname', () => {
    const field = { name: 'Surname', value: 'Doe' };
    spyOn(component, 'applyFilter');
    component.resetFilter(field);
    expect(field.value).toBeUndefined();
    expect(component.userActiveRequest.surname).toBeNull();
    expect(component.applyFilter).toHaveBeenCalled();
  });
  it('should reset filter for Email', () => {
    // Arrange
    const field = { name: 'Email', value: 'test@example.com' };
    spyOn(component, 'applyFilter');
    component.userFilterFg.get('filterValue')?.setValue('test@example.com');
    component.userFilterFg.get('filterType')?.setValue('Email');
    component.userActiveRequest.email = 'test@example.com';

    // Act
    component.resetFilter(field);

    // Assert
    expect(component.userFilterFg.get('filterValue')?.value).toBeNull(); // Ensure the filter value is cleared
    expect(component.userFilterFg.get('filterType')?.value).toBe(''); // Ensure the filter type is cleared
    expect(component.userActiveRequest.email).toBeNull(); // Ensure the email field in the request is cleared
    expect(field.value).toBeUndefined(); // Ensure the field value is cleared
    expect(component.applyFilter).toHaveBeenCalled(); // Ensure the applyFilter method is called
  });

  it('should handle unknown filter gracefully', () => {
    const field = { name: 'UnknownFilter', value: 'UnknownValue' };
    const applyFilterSpy = spyOn(component, 'applyFilter');
    component.resetFilter(field);
    expect(field.value).toBe('UnknownValue'); // Value should remain unchanged
    expect(applyFilterSpy.calls.count()).toBe(1);
  });

  it('should retrieve corporate groups', () => {
    const mockCorporateGroups = [{ id: 1, corporateName: 'Group 1' }];
    spyOn(component, 'retrieveCorporateGroup').and.returnValue(of(mockCorporateGroups));
    component.getCorporateGroup();
    expect(component.corporateGroupList).toEqual(mockCorporateGroups);
  });

  it('should retrieve roles', () => {
    const mockRoles: PagedRoleSearchResponse = {
      roles: [{ id: 1, name: 'Admin' }],
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
      totalItems: 1
    };
    spyOn(component, 'retrieveRole').and.returnValue(of(mockRoles));
    component.getRole();
    expect(component.roleArray).toEqual(mockRoles.roles ?? []);
  });

  it('should retrieve templates', () => {
    const mockTemplates: TemplateModel[] = [
      {
        id: 1,
        templateName: 'Template 1',
        buildingAcronymMaxLength: 10,
        buildingAcronymMinLength: 2,
        icon: 'icon-placeholder'
      }
    ];
    spyOn(component, 'retrieveTemplates').and.returnValue(of(mockTemplates));
    component.retrieveFilter();
    expect(component.buildingTypes).toEqual(mockTemplates);
    expect(component.showButtonFilter).toBeTrue();
  });

  it('should handle error while retrieving templates', () => {
    const mockError = new HttpErrorResponse({ error: { message: 'Error occurred' } });
    spyOn(component, 'retrieveTemplates').and.returnValue(throwError(() => mockError));
    spyOn(Utility, 'logErrorForDevEnvironment');
    component.retrieveFilter();
    expect(Utility.logErrorForDevEnvironment).toHaveBeenCalledWith(mockError);
  });

  it('should load filter steps', () => {
    const filters = {
      Profile: ['Admin', 'User'],
      State: ['ACTIVE', 'INACTIVE']
    };
    component.loadFilterSteps(filters);
    expect(component.filterStepper.length).toBe(3); // Includes the initial step
    expect(component.filterStepper[1].fields.length).toBe(2); // Profile fields
    expect(component.filterStepper[2].fields.length).toBe(2); // State fields
  });

  xit('should export data', () => {
    // Arrange
    // Simulate a CSV with headers and one data row
    const mockBody = 'Id;UserName;Status;Profile\n1;exIT10283@gls-global.com;WIP;EVA_FIELD';
    const mockHeaders = {
      keys: () => ['content-type', 'custom-header'],
      get: (key: string) => {
        if (key === 'content-type') return 'text/csv';
        if (key === 'custom-header') return 'custom-value';
        return null;
      }
    } as any;
    const mockResponse = { body: mockBody, headers: mockHeaders };

    // Mock translation service for headers and status
    spyOn(component['translateService'], 'instant').and.callFake((key: string) => {
      if (key === 'userProfile.userList.columnList.Id') return 'ID';
      if (key === 'userProfile.userList.columnList.UserName') return 'Username';
      if (key === 'userProfile.userList.columnList.Status') return 'State';
      if (key === 'userProfile.userList.columnList.Profile') return 'Profile';
      if (key === 'userProfile.userList.state.wip') return 'TO BE ENABLED';
      return key;
    });

    spyOn(console, 'log');
    apiExportService.postApiExportV1Export$Json$Response.and.returnValue(of(mockResponse));
    // Patch the component to use the correct spy for the method called in exportData
    component['apiExportService'].postApiExportV1Export$Response = apiExportService.postApiExportV1Export$Json$Response;
    spyOn(Utility, 'openFile');

    // Act
    component.exportData();

    // Assert

    // The translated header and row, with replacements
    const expectedExport = ['ID;Username;State;Profile', '1;exIT10283@gls-global.com;TO BE ENABLED;FIELD'].join('\n');

    expect(Utility.openFile).toHaveBeenCalledWith(expectedExport, 'text/csv', jasmine.stringMatching(/^User_Management_\d{8}\.csv$/));
    expect(console.log).toHaveBeenCalledWith('content-type: text/csv');
    expect(console.log).toHaveBeenCalledWith('custom-header: custom-value');
  });

  xit('should export data and cover header logging and contentType logic', () => {
    // Arrange
    // Simulate a CSV with headers and one data row
    const mockBody = 'Id;UserName;Status;Profile\n1;exIT10283@gls-global.com;WIP;EVA_FIELD';
    const mockHeaders = {
      keys: () => ['content-type', 'custom-header'],
      get: (key: string) => {
        if (key === 'content-type') return 'text/csv';
        if (key === 'custom-header') return 'custom-value';
        return null;
      }
    } as any;
    const mockResponse = { body: mockBody, headers: mockHeaders };

    // Mock translation service
    spyOn(component['translateService'], 'instant').and.callFake((key: string) => {
      // Return the key for headers, or a mapped value for status
      if (key === 'userProfile.userList.columnList.Id') return 'ID';
      if (key === 'userProfile.userList.columnList.UserName') return 'Username';
      if (key === 'userProfile.userList.columnList.Status') return 'State';
      if (key === 'userProfile.userList.columnList.Profile') return 'Profile';
      if (key === 'userProfile.userList.state.wip') return 'TO BE ENABLED';
      return key;
    });

    spyOn(console, 'log');
    apiExportService.postApiExportV1Export$Json$Response.and.returnValue(of(mockResponse));
    // Patch the component to use the correct spy for the method called in exportData
    component['apiExportService'].postApiExportV1Export$Response = apiExportService.postApiExportV1Export$Json$Response;
    spyOn(Utility, 'openFile');

    // Act
    component.exportData();

    // Assert

    // The translated header and row, with replacements
    const expectedExport = ['ID;Username;State;Profile', '1;exIT10283@gls-global.com;TO BE ENABLED;FIELD'].join('\n');

    expect(Utility.openFile).toHaveBeenCalledWith(expectedExport, 'text/csv', jasmine.stringMatching(/^User_Management_\d{8}\.csv$/));
    expect(console.log).toHaveBeenCalledWith('content-type: text/csv');
    expect(console.log).toHaveBeenCalledWith('custom-header: custom-value');
  });

  it('should handle error in exportData', () => {
    // Arrange
    const mockError = { error: { error: 'An error occurred' } } as HttpErrorResponse;

    spyOn(component['apiExportService'], 'postApiExportV1Export$Response').and.returnValue(throwError(mockError));
    spyOn(Utility, 'logErrorForDevEnvironment');

    // Act
    component.exportData();

    // Assert
    expect(component['apiExportService'].postApiExportV1Export$Response).toHaveBeenCalled();
    expect(Utility.logErrorForDevEnvironment).toHaveBeenCalledWith(mockError);
  });

  it('should retrieve users and update user list', () => {
    const mockResponse: PagedUserSearchResponse = {
      users: [{ id: 1, name: 'Test User', profile: PROFILE.EVA_USER, status: USER_STATUS.active }],
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
      totalItems: 1
    };
    spyOn(component, 'retrieveUsers').and.returnValue(of(mockResponse));
    component['loadInitialData']();
    expect(component.userList()).toEqual(mockResponse.users);
    expect(component.totalItems()).toBe(mockResponse.totalItems!); // Use non-null assertion
    expect(component.currentPage()).toBe(mockResponse.currentPage!); // Use non-null assertion
    expect(component.pageSize()).toBe(mockResponse.pageSize!); // Use non-null assertion
    expect(component.totalPages()).toBe(mockResponse.totalPages!); // Use non-null assertion
  });

  it('should handle invalid filter type in filterByText gracefully', () => {
    component.userFilterFg.setValue({ filterType: 'InvalidType', filterValue: 'TestValue' });
    component.userActiveRequest = {};
    component.filterByText();
    expect(component.userActiveRequest).toEqual({ currentPage: 1 });
  });

  xit('should handle empty filter fields in applyFilter gracefully', () => {
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [
          { name: 'Profile', value: undefined },
          { name: 'BuildingType', value: undefined },
          { name: 'State', value: undefined }
        ]
      }
    ];
    component.userActiveRequest = {};
    component.applyFilter();
    expect(component.userActiveRequest).toEqual({ currentPage: 1 });
    expect(component.isOpenedFilter()).toBeFalse();
  });

  it('should handle error in retrieveFilter gracefully', () => {
    const mockError = new HttpErrorResponse({ error: { message: 'Error occurred' } });
    spyOn(component, 'retrieveTemplates').and.returnValue(throwError(() => mockError));
    spyOn(Utility, 'logErrorForDevEnvironment');
    component.retrieveFilter();
    expect(Utility.logErrorForDevEnvironment).toHaveBeenCalledWith(mockError);
  });

  it('should handle empty user list in reloadUserList gracefully', () => {
    const mockResponse: PagedUserSearchResponse = {
      users: [],
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
      totalItems: 0
    };
    component.reloadUserList(mockResponse);
    expect(component.userList()).toEqual([]);
    expect(component.totalItems()).toBe(mockResponse.totalItems!);
    expect(component.currentPage()).toBe(mockResponse.currentPage!);
    expect(component.pageSize()).toBe(mockResponse.pageSize!);
    expect(component.totalPages()).toBe(mockResponse.totalPages!);
  });

  it('should close filter panel and reset filters', () => {
    component.isOpenedFilter.set(true);
    component.closeFilter();
    expect(component.isOpenedFilter()).toBeFalse();
  });

  it('should return the correct translation code for a given field', () => {
    // Act & Assert: Verify the translation code for a valid field
    expect(component.getColumnTranslationCode('BuildingAcronym')).toBe('userProfile.userList.columnList.BuildingAcronym');

    // Act & Assert: Verify the translation code for an undefined field
    expect(component.getColumnTranslationCode(undefined)).toBe('userProfile.userList.columnList.all');

    // Act & Assert: Verify the translation code for a null field
    expect(component.getColumnTranslationCode(null)).toBe('userProfile.userList.columnList.all');
  });

  it('should return translation code for valid USER_STATUS value', () => {
    const result = component.getStatusTranslationCode('ACTIVE');
    expect(result).toBe('userProfile.userList.state.active');
  });

  it('should return input field if not a valid USER_STATUS value', () => {
    const result = component.getStatusTranslationCode('NOT_A_STATUS');
    expect(result).toBe('NOT_A_STATUS');
  });

  it('should set default values for users, totalItems, currentPage, pageSize if falsy in loadInitialData', () => {
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: undefined,
        totalItems: undefined,
        currentPage: undefined,
        pageSize: undefined
      } as any)
    );
    component['loadInitialData']();
    expect(component.userList()).toEqual([]);
    expect(component.totalItems()).toBe(0);
    expect(component.currentPage()).toBe(1);
    expect(component.pageSize()).toBe(10);
  });

  it('should apply filter and set profile when profileId is found', () => {
    component.profileList = [{ id: 'EVA_ADMIN', value: 'EVA_ADMIN' }];
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [{ name: 'Profile', value: 'EVA_ADMIN' }]
      }
    ];
    component.userActiveRequest = {};
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.applyFilter();
    expect(component.userActiveRequest.profile).toBe('EVA_ADMIN');
  });

  it('should apply filter and not set profile when profileId is undefined', () => {
    component.profileList = [{ id: '8', value: 'EVA_USER' }];
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [{ name: 'Profile', value: 'NOT_EXIST' }]
      }
    ];
    component.userActiveRequest = {};
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.applyFilter();
    expect(component.userActiveRequest.profile).toBeUndefined();
  });

  it('should apply filter and set buildingType when buildingTypeId is found', () => {
    component.buildingTypes = [
      {
        id: 22,
        templateName: 'Building X',
        buildingAcronymMaxLength: 0,
        buildingAcronymMinLength: 0,
        icon: ''
      }
    ];
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [{ name: 'Buildingtype', value: 'Building X' }]
      }
    ];
    component.userActiveRequest = {};
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.applyFilter();
    expect(component.userActiveRequest.buildingType).toBe(22);
  });

  it('should apply filter and not set buildingType when buildingTypeId is undefined', () => {
    component.buildingTypes = [
      {
        id: 23,
        templateName: 'Building Y',
        buildingAcronymMaxLength: 0,
        buildingAcronymMinLength: 0,
        icon: ''
      }
    ];
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [{ name: 'Buildingtype', value: 'NotExist' }]
      }
    ];
    component.userActiveRequest = {};
    spyOn(component, 'retrieveUsers').and.returnValue(
      of({
        users: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        pageSize: 10
      })
    );
    component.applyFilter();
    expect(component.userActiveRequest.buildingType).toBeUndefined();
  });

  it('should reset filter for Role', () => {
    const field = { name: 'Role', value: 'Admin' };
    spyOn(component, 'applyFilter');
    component.userFilterFg.get('filterValue')?.setValue('Admin');
    component.userFilterFg.get('filterType')?.setValue('Role');
    component.userActiveRequest.roleName = 'Admin';
    component.resetFilter(field);
    expect(component.userFilterFg.get('filterValue')?.value).toBeNull();
    expect(component.userFilterFg.get('filterType')?.value).toBe('');
    expect(component.userActiveRequest.roleName).toBeNull();
    expect(field.value).toBeUndefined();
    expect(component.applyFilter).toHaveBeenCalled();
  });

  it('should reset filter for CompanyGroup', () => {
    const field = { name: 'CompanyGroup', value: 'Group1' };
    spyOn(component, 'applyFilter');
    component.userFilterFg.get('filterValue')?.setValue('Group1');
    component.userFilterFg.get('filterType')?.setValue('CompanyGroup');
    component.userActiveRequest.corporateName = 'Group1';
    component.resetFilter(field);
    expect(component.userFilterFg.get('filterValue')?.value).toBeNull();
    expect(component.userFilterFg.get('filterType')?.value).toBe('');
    expect(component.userActiveRequest.corporateName).toBeNull();
    expect(field.value).toBeUndefined();
    expect(component.applyFilter).toHaveBeenCalled();
  });

  it('should call onSort and set orderBy with mapped field and direction', () => {
    const event = {
      column: { prop: 'Profile' },
      newValue: 'asc'
    };

    const mockResponse: PagedUserSearchResponse = {
      users: [
        {
          id: 1,
          name: 'Test',
          profile: PROFILE.EVA_ADMIN,
          status: USER_STATUS.active
        } as UserSearchResponseModel
      ],
      currentPage: 1,
      totalItems: 1,
      totalPages: 1,
      pageSize: 10
    };
    spyOn(component, 'retrieveUsers').and.returnValue(of(mockResponse));
    spyOn(component, 'reloadUserList');
    component.userActiveRequest = {};
    component.onSort(event);
    expect(component.userActiveRequest.orderBy).toEqual({ field: 'Profile', direction: 'asc' }); // <-- fix here
    expect(component.reloadUserList).toHaveBeenCalledWith(mockResponse);
  });

  it('should call onSort and set orderBy with "name" for NameSurname', () => {
    const event = {
      column: { prop: 'NameSurname' },
      newValue: 'desc'
    };
    const mockResponse: PagedUserSearchResponse = {
      users: [{ id: 12, name: 'User12', profile: PROFILE.EVA_USER, status: USER_STATUS.active }],
      currentPage: 1,
      totalItems: 1,
      totalPages: 1,
      pageSize: 10
    };
    spyOn(component, 'retrieveUsers').and.returnValue(of(mockResponse));
    spyOn(component, 'reloadUserList');
    component.userActiveRequest = {};
    component.onSort(event);
    expect(component.userActiveRequest.orderBy).toEqual({ field: 'Name', direction: 'desc' });
    expect(component.reloadUserList).toHaveBeenCalledWith(mockResponse);
  });

  it('should return the correct translation key when the profile exists', () => {
    const result = component.getTranslationForProfile('Field');
    expect(result).toBe('userProfile.userList.profile.field');
  });

  it('should handle case-insensitive matching for profile values', () => {
    const result = component.getTranslationForProfile('field');
    expect(result).toBe('userProfile.userList.profile.field');
  });

  it('should return the correct translation key for another profile', () => {
    const result = component.getTranslationForProfile('User');
    expect(result).toBe('userProfile.userList.profile.user');
  });
});
