/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StructureListComponent } from './structure-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GetStructuresResponse } from '../../../../api/glsNetworkApi/models/get-structures-response';
import {
  AreaModel,
  GetStructuresRequestPayload,
  ProvinceModel,
  RegionModel,
  StructureResponse,
  TemplateModel
} from '../../../../api/glsNetworkApi/models';
import { HttpErrorResponse } from '@angular/common/http';
import { Utility } from '../../../../common/utilities/utility';
import { VIEW_MODE } from '../../../../common/app.constants';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';

describe('StructureListComponent', () => {
  let component: StructureListComponent;
  let fixture: ComponentFixture<StructureListComponent>;
  let router: jasmine.SpyObj<Router>;

  const activatedRoute = {
    snapshot: {
      paramMap: { get: () => 'mock-param' }
    },
    queryParams: of({})
  };

  let apiExportService: jasmine.SpyObj<any>;
  let fb: FormBuilder;

  beforeEach(async () => {
    fb = new FormBuilder();
    apiExportService = jasmine.createSpyObj('apiExportService', ['postApiExportV1Export$Json$Response']); // Mock the service
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [StructureListComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: 'apiExportService', useValue: apiExportService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StructureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    UtilityRouting.initialize(router);
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.currentPage()).toBe(1);
    expect(component.pageSize()).toBe(10);
    expect(component.structuresList()).toEqual([]);
    expect(component.totalItems()).toBeDefined();
  });

  xit('should initialize the component and set up necessary data and forms', async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

    // Arrange: Mock API responses
    const mockExportFieldsData = [
      { id: 1, fieldName: 'Field1', fieldType: 'string', section: 'Section1', subSection: 'SubSection1' },
      { id: 2, fieldName: 'Field2', fieldType: 'number', section: 'Section2', subSection: 'SubSection2' }
    ];

    const expectedExportFieldsData = [
      { fieldName: 'BuildingAcronym', fieldType: 'string', id: -1, section: 'anagrafica', subSection: 'general' },
      { fieldName: 'BuildingType', fieldType: 'string', id: -1, section: 'anagrafica', subSection: 'general' },
      ...mockExportFieldsData
    ];

    spyOn((component as any).templateService, 'getApiTemplateV1Fields$Json').and.returnValue(of(mockExportFieldsData));

    // Act
    await component.ngOnInit();
    await fixture.whenStable();

    // Assert
    expect((component as any).templateService.getApiTemplateV1Fields$Json).toHaveBeenCalled();
    expect(component.exportFieldsData).toEqual(expectedExportFieldsData);
  });

  it('should update structureActiveRequest orderBy and reload structure list on sort', () => {
    // Arrange: Mock the event and the retrieveStructures method
    const mockEvent = {
      column: { prop: 'Warning' },
      newValue: 'asc'
    };

    const mockResponse: GetStructuresResponse = {
      structures: [{ fields: [], status: 'COMPLETED', icon: '', id: 1 } as StructureResponse],
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
      totalItems: 1
    };

    spyOn(component, 'retrieveStructures').and.returnValue(of(mockResponse));
    spyOn(component, 'reloadStructureList');

    // Act: Call the onSort method
    component.onSort(mockEvent);

    // Assert: Verify that structureActiveRequest.orderBy is updated correctly
    expect(component.structureActiveRequest.orderBy).toEqual({
      field: 'Warning', // Mapped from 'status'
      direction: 'asc'
    });

    // Assert: Verify that retrieveStructures is called with the updated request
    expect(component.retrieveStructures).toHaveBeenCalledWith(component.structureActiveRequest);

    // Assert: Verify that reloadStructureList is called with the response
    expect(component.reloadStructureList).toHaveBeenCalledWith(mockResponse);
  });

  it('should handle errors when sorting', () => {
    // Arrange: Mock the event and the retrieveStructures method to throw an error
    const mockEvent = {
      column: { prop: 'status' },
      newValue: 'asc'
    };

    const mockError = { error: { error: 'An error occurred' } } as HttpErrorResponse;

    spyOn(component, 'retrieveStructures').and.returnValue(throwError(mockError));
    spyOn(Utility, 'logErrorForDevEnvironment');

    // Act: Call the onSort method
    component.onSort(mockEvent);

    // Assert: Verify that the error is logged and the error modal is displayed
    expect(Utility.logErrorForDevEnvironment).toHaveBeenCalledWith(mockError);
  });

  it('should populate filterStepper based on valid filters and skip buildingAcronym', () => {
    // Arrange: Mock filters with valid and invalid data
    const mockFilters: Record<string, string[]> = {
      Region: ['Region 1', 'Region 2'], // Valid filter
      Area: ['Area 1', 'Area 2'], // Valid filter
      buildingAcronym: ['Acronym 1', 'Acronym 2'], // Should be skipped
      Province: ['Province 1', 'Province 2'], // Valid filter
      InvalidFilter: [] // Invalid filter (empty array)
    };

    // Act: Call the loadFilterSteps method
    component.loadFilterSteps(mockFilters);

    // Assert: Verify that filterFields is set correctly
    expect(component.filterFields).toEqual(mockFilters);
  });

  it('should prepare draft structures for display in a carousel format', () => {
    // Arrange: Mock the structure list and view mode
    const mockStructureList: StructureResponse[] = [
      { id: 1, fields: [], status: 'DRAFT', icon: '' } as StructureResponse,
      { id: 2, fields: [], status: 'DRAFT', icon: '' } as StructureResponse,
      { id: 3, fields: [], status: 'DRAFT', icon: '' } as StructureResponse,
      { id: 4, fields: [], status: 'DRAFT', icon: '' } as StructureResponse
    ];

    // Set the view mode to DESKTOP
    component.typeViewMode = VIEW_MODE.DESKTOP;

    // Act: Call the loadDraftCard method
    component.loadDraftCard(mockStructureList);

    // Assert: Verify that the draft structures are grouped correctly for the carousel
    expect(component.draftStructures).toEqual([
      [
        { id: 1, fields: [], status: 'DRAFT', icon: '' },
        { id: 2, fields: [], status: 'DRAFT', icon: '' },
        { id: 3, fields: [], status: 'DRAFT', icon: '' }
      ],
      [{ id: 4, fields: [], status: 'DRAFT', icon: '' }]
    ]);

    // Assert: Verify the total draft item count
    expect(component.totalDraftItem).toBe(4);
  });

  it('should handle different view modes when preparing draft structures', () => {
    // Arrange: Mock the structure list
    const mockStructureList: StructureResponse[] = [
      { id: 1, fields: [], status: 'DRAFT', icon: '' } as StructureResponse,
      { id: 2, fields: [], status: 'DRAFT', icon: '' } as StructureResponse,
      { id: 3, fields: [], status: 'DRAFT', icon: '' } as StructureResponse
    ];

    // Set the view mode to TABLET
    component.typeViewMode = VIEW_MODE.TABLET;

    // Act: Call the loadDraftCard method
    component.loadDraftCard(mockStructureList);

    // Assert: Verify that the draft structures are grouped correctly for the carousel
    expect(component.draftStructures).toEqual([
      [
        { id: 1, fields: [], status: 'DRAFT', icon: '' },
        { id: 2, fields: [], status: 'DRAFT', icon: '' }
      ],
      [{ id: 3, fields: [], status: 'DRAFT', icon: '' }]
    ]);

    // Assert: Verify the total draft item count
    expect(component.totalDraftItem).toBe(3);
    // // Set the view mode to MOBILE
    component.typeViewMode = VIEW_MODE.MOBILE;
    // Act: Call the loadDraftCard method
    component.loadDraftCard(mockStructureList);
    // Assert: Verify that the draft structures are grouped correctly for the carousel
    expect(component.draftStructures).toEqual([
      [{ id: 1, fields: [], status: 'DRAFT', icon: '' }],
      [{ id: 2, fields: [], status: 'DRAFT', icon: '' }],
      [{ id: 3, fields: [], status: 'DRAFT', icon: '' }]
    ]);
    // Assert: Verify the total draft item count
    expect(component.totalDraftItem).toBe(3);
  });

  it('should handle an empty structure list', () => {
    // Arrange: Mock an empty structure list
    const mockStructureList: StructureResponse[] = [];

    // Act: Call the loadDraftCard method
    component.loadDraftCard(mockStructureList);

    // Assert: Verify that the draft structures are empty
    expect(component.draftStructures).toEqual([]);
    expect(component.totalDraftItem).toBe(0);
  });

  it('should reload structure list', () => {
    const mockResponse: GetStructuresResponse = {
      structures: [{ fields: [], status: 'COMPLETED', icon: '', id: 0 } as StructureResponse],
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
      totalItems: 1
    };
    component.reloadStructureList(mockResponse);
    expect(component.structuresList().length).toBe(1);
    expect(component.totalItems()).toBe(1);
  });

  it('should reset filters', () => {
    spyOn(component, 'retrieveStructures').and.returnValue(
      of({ structures: [], currentPage: 1, totalPages: 1, pageSize: 10, totalItems: 0 })
    );
    component.resetFilters();
    expect(component.structureActiveRequest.status).toEqual(['COMPLETED', 'ACTIVE', 'DISABLED']);
    expect(component.retrieveStructures).toHaveBeenCalled();
  });

  it('should handle errors when resetting filters', () => {
    // Arrange
    const mockError = { error: { error: 'An error occurred' } } as HttpErrorResponse;

    // Spy on methods
    spyOn(component, 'retrieveStructures').and.returnValue(throwError(mockError));
    spyOn(Utility, 'logErrorForDevEnvironment');

    // Act
    component.resetFilters();

    // Assert
    expect(component.retrieveStructures).toHaveBeenCalled();
    expect(Utility.logErrorForDevEnvironment).toHaveBeenCalledWith(mockError);
  });

  it('should apply filters and update structureActiveRequest with status WARNING', () => {
    // Arrange
    component.filterStepper[0].fields = [{ name: 'status', value: 'COMPLETED' }];
    spyOn(component, 'retrieveStructures').and.returnValue(
      of({ structures: [], currentPage: 1, totalPages: 1, pageSize: 10, totalItems: 0 })
    );
    spyOn(component, 'reloadStructureList');

    // Act
    component.applyFilter();

    // Assert
    expect(component.structureActiveRequest.status).toEqual(['COMPLETED']);
    expect(component.retrieveStructures).toHaveBeenCalledWith(component.structureActiveRequest);
    expect(component.reloadStructureList).toHaveBeenCalled();
    expect(component.isOpenedFilter()).toBeFalse();
  });

  it('should apply filters and update structureActiveRequest with status COMPLETED', () => {
    // Arrange
    component.filterStepper[0].fields = [{ name: 'status', value: 'COMPLETED' }];
    spyOn(component, 'retrieveStructures').and.returnValue(
      of({ structures: [], currentPage: 1, totalPages: 1, pageSize: 10, totalItems: 0 })
    );
    spyOn(component, 'reloadStructureList');

    // Act
    component.applyFilter();

    // Assert
    expect(component.structureActiveRequest.status).toEqual(['COMPLETED']);
    expect(component.retrieveStructures).toHaveBeenCalledWith(component.structureActiveRequest);
    expect(component.reloadStructureList).toHaveBeenCalled();
    expect(component.isOpenedFilter()).toBeFalse();
  });

  it('should apply filters and update structureActiveRequest with BuildingType', () => {
    // Arrange
    component.filterStepper[0].fields = [{ name: 'BuildingType', value: 'Template1' }];
    component.buildingTypes = [{ id: 1, templateName: 'Template1' } as TemplateModel];
    spyOn(component, 'retrieveStructures').and.returnValue(
      of({ structures: [], currentPage: 1, totalPages: 1, pageSize: 10, totalItems: 0 })
    );
    spyOn(component, 'reloadStructureList');

    // Act
    component.applyFilter();

    // Assert
    expect(component.structureActiveRequest.buildingType).toBe(1);
    expect(component.retrieveStructures).toHaveBeenCalledWith(component.structureActiveRequest);
    expect(component.reloadStructureList).toHaveBeenCalled();
    expect(component.isOpenedFilter()).toBeFalse();
  });

  it('should apply filters and update structureActiveRequest with Province', () => {
    // Arrange
    component.filterStepper[0].fields = [{ name: 'Province', value: 'Province1' }];
    // component.provinces = [{ id: 1, name: 'Province1' } as ProvinceModel];
    spyOn(component, 'retrieveStructures').and.returnValue(
      of({ structures: [], currentPage: 1, totalPages: 1, pageSize: 10, totalItems: 0 })
    );
    spyOn(component, 'reloadStructureList');

    // Act
    component.applyFilter();

    // Assert
    expect(component.retrieveStructures).toHaveBeenCalledWith(component.structureActiveRequest);
    expect(component.reloadStructureList).toHaveBeenCalled();
    expect(component.isOpenedFilter()).toBeFalse();
  });

  it('should apply filters and update structureActiveRequest with Region', () => {
    // Arrange
    component.filterStepper[0].fields = [{ name: 'Region', value: 'Region1' }];
    component.regions = [{ id: 1, description: 'Region1' } as RegionModel];
    spyOn(component, 'retrieveStructures').and.returnValue(
      of({ structures: [], currentPage: 1, totalPages: 1, pageSize: 10, totalItems: 0 })
    );
    spyOn(component as any, 'reloadStructureList');

    // Act
    component.applyFilter();

    // Assert
    expect(component.retrieveStructures).toHaveBeenCalledWith(component.structureActiveRequest);
    expect(component.reloadStructureList).toHaveBeenCalled();
    expect(component.isOpenedFilter()).toBeFalse();
  });

  it('should apply filters and update structureActiveRequest with Area', () => {
    // Arrange
    component.filterStepper[0].fields = [{ name: 'Area', value: 'Area1' }];
    component.areas = [{ id: 1, name: 'Area1' } as AreaModel];
    spyOn(component, 'retrieveStructures').and.returnValue(
      of({ structures: [], currentPage: 1, totalPages: 1, pageSize: 10, totalItems: 0 })
    );
    spyOn(component, 'reloadStructureList');

    // Act
    component.applyFilter();

    // Assert
    expect(component.retrieveStructures).toHaveBeenCalledWith(component.structureActiveRequest);
    expect(component.reloadStructureList).toHaveBeenCalled();
    expect(component.isOpenedFilter()).toBeFalse();
  });

  it('should apply filters and update structureActiveRequest with Name', () => {
    // Arrange
    component.filterStepper[0].fields = [{ name: 'Name', value: 'TestName' }];
    spyOn(component, 'retrieveStructures').and.returnValue(
      of({ structures: [], currentPage: 1, totalPages: 1, pageSize: 10, totalItems: 0 })
    );
    spyOn(component, 'reloadStructureList');

    // Act
    component.applyFilter();

    // Assert
    expect(component.retrieveStructures).toHaveBeenCalledWith(component.structureActiveRequest);
    expect(component.reloadStructureList).toHaveBeenCalled();
    expect(component.isOpenedFilter()).toBeFalse();
  });
  it('should handle errors when applying filters', () => {
    // Arrange
    const mockError = { error: { error: 'An error occurred' } } as HttpErrorResponse;

    // Mock the filterStepper fields
    component.filterStepper[0].fields = [
      { name: 'status', value: 'COMPLETED' },
      { name: 'Region', value: 'Region1' }
    ];

    // Mock the regions
    component.regions = [{ id: 1, description: 'Region1' } as RegionModel];

    // Spy on methods
    spyOn(component, 'retrieveStructures').and.returnValue(throwError(mockError));
    spyOn(Utility, 'logErrorForDevEnvironment');

    // Act
    component.applyFilter();

    // Assert
    expect(component.retrieveStructures).toHaveBeenCalledWith(component.structureActiveRequest);
    expect(Utility.logErrorForDevEnvironment).toHaveBeenCalledWith(mockError);
    expect(component.isOpenedFilter()).toBeFalse();
  });

  it('should return the list of applied filters including BuildingAcronym if present', () => {
    // Arrange
    component.filterStepper = [
      {
        id: 1,
        step: 'initial',
        fields: [
          { name: 'status', value: 'COMPLETED' },
          { name: 'Region', value: undefined },
          { name: 'Area', value: 'Area1' }
        ]
      }
    ];
    component.structureActiveRequest = {
      buildingAcronym: 'TEST_ACRONYM'
    } as never;

    // Act
    const result = component.showFiltersApplied();

    // Assert
    expect(result).toEqual([
      { name: 'status', value: 'COMPLETED' },
      { name: 'Area', value: 'Area1' },
      { name: 'BuildingAcronym', value: 'TEST_ACRONYM' }
    ]);
  });

  it('should return the list of applied filters excluding BuildingAcronym if not present', () => {
    // Arrange
    component.filterStepper = [
      {
        id: 1,
        step: 'initial',
        fields: [
          { name: 'status', value: 'DRAFT' },
          { name: 'Region', value: 'Region1' },
          { name: 'Area', value: undefined }
        ]
      }
    ];
    component.structureActiveRequest = {
      buildingAcronym: ''
    } as GetStructuresRequestPayload;

    // Act
    const result = component.showFiltersApplied();

    // Assert
    expect(result).toEqual([
      { name: 'status', value: 'DRAFT' },
      { name: 'Region', value: 'Region1' }
    ]);
  });

  it('should handle page change', () => {
    // Mock the retrieveStructures method to return an observable
    spyOn(component, 'retrieveStructures').and.returnValue(
      of({ structures: [], currentPage: 2, totalPages: 1, pageSize: 10, totalItems: 0 })
    );

    // Call the onPageChange method with a new page number
    component.pageChange(2);

    // Verify that the currentPage is updated
    expect(component.currentPage()).toBe(2);

    // Verify that retrieveStructures is called with the updated request
    expect(component.retrieveStructures).toHaveBeenCalledWith(component.structureActiveRequest);
  });
  it('should handle errors when changing the page', () => {
    // Arrange
    const mockError = { error: { error: 'An error occurred' } } as HttpErrorResponse;
    spyOn(component, 'retrieveStructures').and.returnValue(throwError(mockError));
    spyOn(Utility, 'logErrorForDevEnvironment');

    // Act
    component.pageChange(2);

    // Assert
    expect(component.retrieveStructures).toHaveBeenCalledWith(component.structureActiveRequest);
    expect(Utility.logErrorForDevEnvironment).toHaveBeenCalledWith(mockError);
  });

  it('should open and close export modal', () => {
    component.openExportModal();
    expect(component.openExportDataModal).toBeTrue();
    component.closeExportDataModal();
    expect(component.openExportDataModal).toBeFalse();
  });

  it('should filter by acronym', () => {
    spyOn(component, 'retrieveStructures').and.returnValue(
      of({ structures: [], currentPage: 1, totalPages: 1, pageSize: 10, totalItems: 0 })
    );
    component.filterByText();
    expect(component.retrieveStructures).toHaveBeenCalled();
  });

  it('should reset the filter based on the field name and value', () => {
    // Arrange: Spy on dependent methods
    spyOn(component, 'applyFilter');
    spyOn(component.structureFilterFg, 'setValue');

    // Test case 1: Reset 'status' with value 'Warning'
    let field = { name: 'Warning', value: 'ACTIVE' };
    component.resetFilter(field);
    expect(component.structureActiveRequest.warning).toBeNull();
    expect(field.value).toBeUndefined();
    expect(component.applyFilter).toHaveBeenCalled();

    // Test case 2: Reset 'status' with value other than 'Warning'
    field = { name: 'status', value: 'COMPLETED' };
    component.resetFilter(field);
    expect(component.structureActiveRequest.status).toBeUndefined();
    expect(field.value).toBeUndefined();

    // Test case 3: Reset 'BuildingAcronym'
    field = { name: 'BuildingAcronym', value: 'TEST' };
    component.resetFilter(field);
    expect(component.structureActiveRequest.buildingAcronym).toBeUndefined();
    expect(component.structureFilterFg.setValue).not.toHaveBeenCalled();
    // Test case 4: Reset 'BuildingType'
    field = { name: 'BuildingType', value: 'Type1' };
    component.resetFilter(field);
    expect(component.structureActiveRequest.buildingType).toBeUndefined();
    expect(field.value).toBeUndefined();

    // Test case 5: Reset 'Province'
    field = { name: 'Province', value: 'Province1' };
    component.resetFilter(field);
    expect(component.structureActiveRequest.province).toBeUndefined();
    expect(field.value).toBe('Province1');

    // Test case 6: Reset 'Region'
    field = { name: 'Region', value: 'Region1' };
    component.resetFilter(field);
    expect(component.structureActiveRequest.region).toBeUndefined();
    expect(field.value).toBeUndefined();

    // Test case 7: Reset 'Area'
    field = { name: 'Area', value: 'Area1' };
    component.resetFilter(field);
    expect(component.structureActiveRequest.area).toBeUndefined();
    expect(field.value).toBeUndefined();

    // Test case 8: Reset 'Name'
    field = { name: 'Name', value: 'TestName' };
    component.resetFilter(field);
    expect(component.structureFilterFg.setValue).not.toHaveBeenCalled();
    expect(field.value).toBeUndefined();

    // Test case 9: Reset 'BuildingName'
    field = { name: 'BuildingName', value: 'Building123' };
    component.resetFilter(field);
    expect(component.structureActiveRequest.buildingName).toBeUndefined();
    expect(component.structureFilterFg.setValue).not.toHaveBeenCalled();
  });

  it('should reset the current filter step to "start"', () => {
    // Arrange: Set the current filter step to a non-default value
    component.currenFilterStep = 'Region';

    // Act: Call the back method
    component.back();

    // Assert: Verify that the current filter step is reset to "start"
    expect(component.currenFilterStep).toBe('start');
  });

  it('should navigate to the structure-edit page and call getPageType', () => {
    // Arrange: Spy on the genericService and router methods
    const getPageTypeSpy = spyOn(component['genericService'], 'getPageType');

    // Act: Call the createStructure method
    component.createStructure();

    // Assert: Verify that getPageType is called with an empty string
    expect(getPageTypeSpy).toHaveBeenCalledWith('');

    // Assert: Verify that the router navigates to the structure-edit page
    expect(router.navigate).toHaveBeenCalledWith(['anagrafica/structure-new']);
  });

  it('should update the current filter step and set the value of the selected field', () => {
    // Arrange: Mock the filterStepper and currenFilterStep
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [
          { name: 'BuildingType', value: undefined },
          { name: 'Province', value: undefined },
          { name: 'Region', value: undefined },
          { name: 'Area', value: undefined },
          { name: 'status', value: undefined }
        ]
      }
    ];
    component.currenFilterStep = 'Region';

    // Act: Call selectStep with a new step
    component.selectStep('Area');

    // Assert: Verify that the value of the selected field is updated
    expect(component.filterStepper[0].fields[2].value).toBe('Area'); // 'Region' field's value is updated to 'Area'

    // Assert: Verify that the current filter step is reset to 'start'
    expect(component.currenFilterStep).toBe('start');
  });

  it('should update the current filter step when the current step is "start"', () => {
    // Arrange: Set the current filter step to 'start'
    component.currenFilterStep = 'start';

    // Act: Call selectStep with a new step
    component.selectStep('BuildingType');

    // Assert: Verify that the current filter step is updated to the new step
    expect(component.currenFilterStep).toBe('BuildingType');
  });

  it('should return the correct translation code for a given field', () => {
    // Act & Assert: Verify the translation code for a valid field
    expect(component.getColumnTranslationCode('BuildingAcronym')).toBe('structureList.columnList.BuildingAcronym');

    // Act & Assert: Verify the translation code for an undefined field
    expect(component.getColumnTranslationCode(undefined)).toBe('structureList.columnList.all');

    // Act & Assert: Verify the translation code for a null field
    expect(component.getColumnTranslationCode(null)).toBe('structureList.columnList.all');
  });
  it('should return columns that are not blocked', () => {
    // Arrange: Initialize the columns array with blocked and non-blocked columns
    component.columns.set([
      { field: 'BuildingType', label: 'Building Type', block: true, columnVisible: true, sortable: true },
      { field: 'Name', label: 'Name', block: false, columnVisible: true, sortable: true },
      { field: 'Region', label: 'Region', block: false, columnVisible: true, sortable: true },
      { field: 'Area', label: 'Area', block: true, columnVisible: true, sortable: true }
    ]);

    // Act: Call the getColumsNotBlocked method
    const result = component.getColumsNotBlocked();

    // Assert: Verify that only non-blocked columns are returned
    expect(result).toEqual([
      { field: 'Name', label: 'Name', block: false, columnVisible: true, sortable: true },
      { field: 'Region', label: 'Region', block: false, columnVisible: true, sortable: true }
    ]);
  });

  it('should set columnModalIsOpen to true when openColumnEditor is called', () => {
    // Arrange
    component.columnModalIsOpen = false; // Ensure the initial state is false

    // Act
    component.openColumnEditor();

    // Assert
    expect(component.columnModalIsOpen).toBeTrue(); // Verify that columnModalIsOpen is set to true
  });

  it('should return the correct translation code for COMPLETED status', () => {
    const result = component.getStatusTranslationCode('COMPLETED');
    expect(result).toBe('structureList.status.completed');
  });

  it('should return the correct translation code for WARNING status', () => {
    const result = component.getStatusTranslationCode('WARNING');
    expect(result).toBe('structureList.status.warning');
  });

  it('should return the correct translation code for DISABLED status', () => {
    const result = component.getStatusTranslationCode('DISABLED');
    expect(result).toBe('structureList.status.disabled');
  });

  // my cases
  it('should retrieve the list of provinces from the API', (done: any) => {
    // Arrange: Mock the API response
    const mockProvinces: ProvinceModel[] = [
      { id: 1, name: 'Province1' },
      { id: 2, name: 'Province2' }
    ];
    spyOn((component as any).filterService, 'getApiReferencedataV1Provinces$Json').and.returnValue(of(mockProvinces));

    // Act: Call the retrieveProvince method
    component.retrieveProvince().subscribe((provinces) => {
      // Assert: Verify the response
      expect(provinces).toEqual(mockProvinces);
      done();
    });

    // Verify that the API method was called
    expect((component as any).filterService.getApiReferencedataV1Provinces$Json).toHaveBeenCalled();
  });

  it('should update column visibility based on form group values and close the column modal', () => {
    // Arrange: Mock the initial columns and form group values
    component.columns.set([
      { field: 'BuildingType', label: 'Building Type', block: false, columnVisible: true, sortable: true },
      { field: 'Name', label: 'Name', block: false, columnVisible: true, sortable: true },
      { field: 'Region', label: 'Region', block: false, columnVisible: true, sortable: true },
      { field: 'Area', label: 'Area', block: false, columnVisible: true, sortable: true }
    ]);

    component.columnsFG = fb.group({
      BuildingType: [false],
      Name: [true],
      Region: [false],
      Area: [true]
    });

    // Act: Call the filterColumns method
    component.filterColumns();

    // Assert: Verify that column visibility is updated correctly
    const updatedColumns = component.columns();
    expect(updatedColumns).toEqual([
      { field: 'BuildingType', label: 'Building Type', block: false, columnVisible: false, sortable: true },
      { field: 'Name', label: 'Name', block: false, columnVisible: true, sortable: true },
      { field: 'Region', label: 'Region', block: false, columnVisible: false, sortable: true },
      { field: 'Area', label: 'Area', block: false, columnVisible: true, sortable: true }
    ]);

    // Assert: Verify that the column modal is closed
    expect(component.columnModalIsOpen).toBeFalse();
  });
  it('should filter by BuildingAcronym and update structureActiveRequest', () => {
    // Arrange
    component.structureFilterFg.setValue({ filterType: 'BuildingAcronym', filterValue: 'ABC123' });
    spyOn(component, 'retrieveStructures').and.returnValue(
      of({ structures: [], currentPage: 1, totalPages: 1, pageSize: 10, totalItems: 0 })
    );
    spyOn(component, 'reloadStructureList');

    // Act
    component.filterByText();

    // Assert
    expect(component.structureActiveRequest.buildingAcronym).toBe('ABC123');
    expect(component.retrieveStructures).toHaveBeenCalledWith(component.structureActiveRequest);
    expect(component.reloadStructureList).toHaveBeenCalled();
  });

  it('should filter by Name and update structureActiveRequest', () => {
    // Arrange
    component.structureFilterFg.setValue({ filterType: 'Name', filterValue: 'TestName' });
    spyOn(component, 'retrieveStructures').and.returnValue(
      of({ structures: [], currentPage: 1, totalPages: 1, pageSize: 10, totalItems: 0 })
    );
    spyOn(component, 'reloadStructureList');

    // Act
    component.filterByText();

    // Assert
    // expect(component.structureActiveRequest.name).toBe('TestName');
    expect(component.retrieveStructures).toHaveBeenCalledWith(component.structureActiveRequest);
    expect(component.reloadStructureList).toHaveBeenCalled();
  });

  it('should filter by BuildingName and update structureActiveRequest', () => {
    // Arrange
    component.structureFilterFg.setValue({ filterType: 'BuildingName', filterValue: 'Building123' });
    spyOn(component, 'retrieveStructures').and.returnValue(
      of({ structures: [], currentPage: 1, totalPages: 1, pageSize: 10, totalItems: 0 })
    );
    spyOn(component, 'reloadStructureList');

    // Act
    component.filterByText();

    // Assert
    expect(component.structureActiveRequest.buildingName).toBe('Building123');
    expect(component.retrieveStructures).toHaveBeenCalledWith(component.structureActiveRequest);
    expect(component.reloadStructureList).toHaveBeenCalled();
  });

  it('should handle errors when filtering by text', () => {
    // Arrange
    component.structureFilterFg.setValue({ filterType: 'Name', filterValue: 'TestName' });
    const mockError = { error: { error: 'An error occurred' } } as HttpErrorResponse;
    spyOn(component, 'retrieveStructures').and.returnValue(throwError(mockError));
    spyOn(Utility, 'logErrorForDevEnvironment');

    // Act
    component.filterByText();

    // Assert
    expect(Utility.logErrorForDevEnvironment).toHaveBeenCalledWith(mockError);
  });
  xit('should export data with selected fields and download as CSV', () => {
    // Arrange
    component.exportDataFG = fb.group({
      all: [false],
      BuildingType: [true],
      Name: [true],
      Region: [false]
    });

    const mockResponse = {
      headers: {
        get: (header: string) => (header === 'content-type' ? 'text/csv' : null),
        keys: () => ['content-type']
      },
      body: 'mock-csv-content'
    };

    // spyOn(component['apiExportService'], 'postApiExportV1Export$Json$Response').and.returnValue(of(mockResponse));
    // spyOn(Utility, 'openFile');
    // spyOn(component, 'resetExportFormData');
    //
    //
    apiExportService.postApiExportV1Export$Json$Response.and.returnValue(of(mockResponse)); // Use the spy
    spyOn(Utility, 'openFile');
    spyOn(component, 'resetExportFormData');

    // Act
    component.exportData();

    // Assert
    expect(component['apiExportService'].postApiExportV1Export$Json$Response).toHaveBeenCalled();
    expect(Utility.openFile).toHaveBeenCalledWith(
      'mock-csv-content',
      'text/csv',
      jasmine.stringMatching(/^Structures_\d{8}_\d{6}\.csv$/) // Matches the filename format
    );
    expect(component.resetExportFormData).toHaveBeenCalled();
    expect(component.openExportDataModal).toBeFalse();
  });

  it('should handle errors during export', () => {
    // Arrange
    component.exportDataFG = fb.group({
      all: [false],
      BuildingType: [true],
      Name: [true],
      Region: [false]
    });

    const mockError = { error: { error: 'An error occurred' } } as HttpErrorResponse;

    spyOn(component['apiExportService'], 'postApiExportV1Export$Json$Response').and.returnValue(throwError(mockError));
    spyOn(Utility, 'logErrorForDevEnvironment');

    // Act
    component.exportData();

    // Assert
    expect(component['apiExportService'].postApiExportV1Export$Json$Response).toHaveBeenCalled();
    expect(Utility.logErrorForDevEnvironment).toHaveBeenCalledWith(mockError);
  });
  it('should set the "all" checkbox value based on the state of other checkboxes', () => {
    // Arrange: Mock the exportDataFG form group with controls
    component.exportDataFG = fb.group({
      all: [false],
      Field1: [true],
      Field2: [true],
      Field3: [false]
    });

    // Act: Call the onGetExportHeader method
    component.onGetExportHeader();

    // Assert: Verify that the "all" checkbox is not checked when not all fields are selected
    expect(component.exportDataFG.get('all')?.value).toBeFalse();

    // Arrange: Update all fields to be checked
    component.exportDataFG.get('Field3')?.setValue(true);

    // Act: Call the onGetExportHeader method again
    component.onGetExportHeader();

    // Assert: Verify that the "all" checkbox is checked when all fields are selected
    expect(component.exportDataFG.get('all')?.value).toBeTrue();
  });

  it('should handle errors when retrieving data for export', () => {
    // Arrange
    const mockError = { error: { error: 'An error occurred' } } as HttpErrorResponse;

    // Spy on methods
    spyOn(component, 'getTemplateFields').and.returnValue(throwError(mockError));
    spyOn(Utility, 'logErrorForDevEnvironment');

    // Act
    component['retrieveDataForExport']();

    // Assert
    expect(component.getTemplateFields).toHaveBeenCalled();
    expect(Utility.logErrorForDevEnvironment).toHaveBeenCalledWith(mockError);
  });

  it('should set numColFrozen to 0 when typeViewMode is TABLET', () => {
    // Arrange
    component.typeViewMode = VIEW_MODE.TABLET;

    // Act
    component['setColFrozen']();

    // Assert
    expect(component['numColFrozen']()).toBe(0);
  });

  it('should set numColFrozen to 0 when typeViewMode is MOBILE', () => {
    // Arrange
    component.typeViewMode = VIEW_MODE.MOBILE;

    // Act
    component['setColFrozen']();

    // Assert
    expect(component['numColFrozen']()).toBe(0);
  });

  it('should set numColFrozen to 4 when typeViewMode is DESKTOP and no warnings are present', () => {
    // Arrange
    component.typeViewMode = VIEW_MODE.DESKTOP;
    spyOn(component, 'structuresList').and.returnValue([
      {
        id: 1,
        icon: 'example-icon',
        status: 'ACTIVE',
        fields: [{ fieldName: 'Warning', value: false }]
      }
    ]);
    // Act
    component['setColFrozen']();

    // Assert
    expect(component['numColFrozen']()).toBe(4);
  });

  it('should set numColFrozen to 4 when typeViewMode is DESKTOP and warnings are present', () => {
    // Arrange
    component.typeViewMode = VIEW_MODE.DESKTOP;
    spyOn(component, 'structuresList').and.returnValue([
      {
        id: 1,
        icon: 'example-icon',
        status: 'ACTIVE',
        fields: [{ fieldName: 'Warning', value: true }]
      }
    ]);
    // Act
    component['setColFrozen']();

    // Assert
    expect(component['numColFrozen']()).toBe(4);
  });

  it('should update showWarning to true if any structure has a Warning field with value true', () => {
    // Arrange: Mock the structuresList signal with a structure containing a Warning field set to true
    component.structuresList.set([
      {
        id: 1,
        icon: 'example-icon',
        status: 'ACTIVE',
        fields: [{ fieldName: 'Warning', value: true }]
      }
    ]);

    // Act: Call the updateShowWarning method
    (component as any).updateShowWarning();

    // Assert: Verify that showWarning is set to true
    expect(component.showWarning()).toBeTrue();
  });

  it('should update showWarning to false if no structure has a Warning field with value true', () => {
    // Arrange: Mock the structuresList signal with structures that do not have a Warning field set to true
    component.structuresList.set([
      {
        id: 1,
        icon: 'example-icon',
        status: 'ACTIVE',
        fields: [{ fieldName: 'Warning', value: false }]
      }
    ]);

    // Act: Call the updateShowWarning method
    (component as any).updateShowWarning();

    // Assert: Verify that showWarning is set to false
    expect(component.showWarning()).toBeFalse();
  });

  it('should retrieve filter data and load filter steps', () => {
    // Arrange
    const mockRegions: RegionModel[] = [{ id: 1, description: 'Region1', code: 'R1' }];
    const mockAreas = [{ id: 1, name: 'Area1' }];
    const mockTemplates: TemplateModel[] = [
      {
        id: 1,
        templateName: 'Template1',
        buildingAcronymMaxLength: 10,
        buildingAcronymMinLength: 3,
        icon: 'icon-placeholder'
      }
    ];

    spyOn(component, 'retrieveRegions').and.returnValue(of(mockRegions));
    spyOn(component, 'retrieveAreas').and.returnValue(of(mockAreas));
    spyOn(component, 'retrieveTemplates').and.returnValue(of(mockTemplates));
    spyOn(component, 'loadFilterSteps');

    // Act
    (component as any).retrieveFilter();

    // Assert
    expect(component.retrieveRegions).toHaveBeenCalled();
    expect(component.retrieveAreas).toHaveBeenCalled();
    expect(component.retrieveTemplates).toHaveBeenCalled();
    expect(component.regions).toEqual(mockRegions);
    expect(component.areas).toEqual(mockAreas);
    expect(component.buildingTypes).toEqual(mockTemplates);
    expect(component.loadFilterSteps).toHaveBeenCalledWith({
      Region: ['Region1'],
      Area: ['Area1'],
      BuildingType: ['Template1'],
      Name: component.ragioneSocialeList.map((name) => name.value),
      status: component.statusField,
      Warning: ['generic.yes', 'generic.no']
    });
    expect(component.showButtonFilter).toBeTrue();
  });

  it('should configure the exportDataFG form group with the provided fields', () => {
    // Arrange: Mock the fields to be added to the form group
    const mockFields = [
      { fieldName: 'Field1', fieldType: 'string', id: 1, section: 'section1', subSection: 'subSection1' },
      { fieldName: 'Field2', fieldType: 'number', id: 2, section: 'section2', subSection: 'subSection2' }
    ];

    // Act: Call the configureExportFieldsFG method
    component.configureExportFieldsFG(mockFields);

    // Assert: Verify that the form group contains the expected controls
    expect(component.exportDataFG.contains('Field1')).toBeTrue();
    expect(component.exportDataFG.contains('Field2')).toBeTrue();

    // Assert: Verify that the controls are initialized correctly
    expect(component.exportDataFG.get('Field1')?.value).toBe('');
    expect(component.exportDataFG.get('Field2')?.value).toBe('');
  });

  it('should close the filter and reset fields when isAppliedFilter is false', () => {
    // Arrange
    component.isAppliedFilter = false;
    component.isOpenedFilter.set(true);
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [
          { name: 'BuildingType', value: 'Type1' },
          { name: 'Province', value: 'Province1' }
        ]
      }
    ];
    component.currenFilterStep = 'Region';

    // Act
    component.filterClose();

    // Assert
    expect(component.isOpenedFilter()).toBeFalse();
    expect(component.filterStepper[0].fields[0].value).toBeUndefined();
    expect(component.filterStepper[0].fields[1].value).toBeUndefined();
    expect(component.currenFilterStep).toBe('start');
  });

  it('should close the filter and not reset fields when isAppliedFilter is true', () => {
    // Arrange
    component.isAppliedFilter = true;
    component.isOpenedFilter.set(true);
    component.filterStepper = [
      {
        id: 0,
        step: 'start',
        fields: [
          { name: 'BuildingType', value: 'Type1' },
          { name: 'Province', value: 'Province1' }
        ]
      }
    ];
    component.currenFilterStep = 'Region';

    // Act
    component.filterClose();

    // Assert
    expect(component.isOpenedFilter()).toBeFalse();
    expect(component.filterStepper[0].fields[0].value).toBe('Type1');
    expect(component.filterStepper[0].fields[1].value).toBe('Province1');
    expect(component.currenFilterStep).toBe('Region');
  });
});
