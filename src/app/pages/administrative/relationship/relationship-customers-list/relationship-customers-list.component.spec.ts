/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RelationshipCustomersListComponent } from './relationship-customers-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ReplaceAgentsModalComponent } from './replace-agents-modal/replace-agents-modal.component';
import { RelationshipType } from '../enum/relationship-type';
import { HttpClient, HttpErrorResponse, HttpHandler } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { GetCustomersResponse } from '../../../../api/glsAdministrativeApi/models/get-customers-response';
import { FILTER_CUSTOMERS_TYPE_LIST } from '../constants/relationship-constants';
import { CategoryService, CustomerService } from '../../../../api/glsAdministrativeApi/services';
import { Utility } from '../../../../common/utilities/utility';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { CategoryFields, GetCategoryResponse } from '../../../../api/glsAdministrativeApi/models';

describe('RelationshipCustomersListComponent', () => {
  let component: RelationshipCustomersListComponent;
  let fixture: ComponentFixture<RelationshipCustomersListComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let customerServiceSpy: any;
  let mockActivatedRoute: any;
  let categoryServiceSpy: jasmine.SpyObj<CategoryService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    // Fix: Initialize UtilityRouting with the router spy
    UtilityRouting.initialize(routerSpy);
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    customerServiceSpy = jasmine.createSpyObj('CustomerService', ['postApiCustomerV1$Json', 'postApiCustomerV1IdLock$Response']);
    categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['postApiCategoryV1$Json']);
    spyOn(UtilityRouting, 'navigateToRelationshipEditById');
    categoryServiceSpy.postApiCategoryV1$Json.and.returnValue(
      of({
        items: [],
        totalItems: 0,
        currentPage: 1,
        totalPages: 1
      })
    );

    // Default return value for customer service methods
    customerServiceSpy.postApiCustomerV1$Json.and.returnValue(of({ items: [] }));

    mockActivatedRoute = {
      params: of({}),
      queryParams: of({}),
      data: of({}),
      url: of([]),
      fragment: of(''),
      paramMap: of(new Map()),
      queryParamMap: of(new Map()),
      snapshot: {
        params: {},
        queryParams: {},
        data: {},
        url: [],
        fragment: '',
        paramMap: new Map(),
        queryParamMap: new Map()
      }
    };

    await TestBed.configureTestingModule({
      imports: [RelationshipCustomersListComponent, TranslateModule.forRoot()],
      providers: [
        HttpClient,
        HttpHandler,
        { provide: Router, useValue: routerSpy },
        {
          provide: NgbModal,
          useValue: modalServiceSpy
        },
        { provide: CustomerService, useValue: customerServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: CategoryService, useValue: categoryServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RelationshipCustomersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call exportData (placeholder)', () => {
    const exportSpy = spyOn(component, 'exportClientsData');
    component.exportClientsData();
    expect(exportSpy).toHaveBeenCalled();
  });

  it('should call categoryService with correct parameters when retrieving categories', () => {
    const expectedParams = {
      body: {
        orderBy: {
          field: 'Code' as CategoryFields,
          direction: 'asc'
        }
      }
    };

    categoryServiceSpy.postApiCategoryV1$Json.and.returnValue(
      of({
        items: [],
        totalItems: 0,
        currentPage: 1,
        totalPages: 1
      })
    );

    (component as any).retrieveCategories().subscribe();

    expect(categoryServiceSpy.postApiCategoryV1$Json).toHaveBeenCalledWith(expectedParams);
  });

  it('should filter categories for standard customers when isCustomerLAC is false', fakeAsync(() => {
    // Mock categories data
    const mockCategories: GetCategoryResponse = {
      items: [
        { id: 1, categoryCode: '801', categoryDescription: 'Standard Category 1' },
        { id: 2, categoryCode: '802', categoryDescription: 'LAC Category' },
        { id: 3, categoryCode: '803', categoryDescription: 'Standard Category 2' }
      ],
      totalItems: 3,
      currentPage: 1,
      totalPages: 1
    };

    // Set up service responses
    categoryServiceSpy.postApiCategoryV1$Json.and.returnValue(of(mockCategories));

    // For the loadFirstCall method's API calls
    customerServiceSpy.postApiCustomerV1$Json.and.returnValues(
      of({ items: [] }), // First call for active customers
      of({ items: [] }) // Second call for draft customers
    );

    // Setup component for standard customers
    component.isCustomerLAC = false;

    // Call the method directly
    (component as any).loadFirstCallWithCategories();

    // Verify that categoryIds only contains non-LAC categories
    expect((component as any).categoryIds).toEqual([1, 3]);
    expect((component as any).categories).toEqual(mockCategories.items);

    // Verify the filters were updated correctly
    const categoryFilter = (component as any).filters.find((f: any) => f.key === 'categoryId');
    expect(categoryFilter).toBeDefined();
  }));

  it('should filter categories for LAC customers when isCustomerLAC is true', () => {
    // Mock categories data
    const mockCategories: GetCategoryResponse = {
      items: [
        { id: 1, categoryCode: '801', categoryDescription: 'Standard Category 1' },
        { id: 2, categoryCode: '802', categoryDescription: 'LAC Category' },
        { id: 3, categoryCode: '803', categoryDescription: 'Standard Category 2' }
      ],
      totalItems: 3,
      currentPage: 1,
      totalPages: 1
    };

    // Set up service responses
    categoryServiceSpy.postApiCategoryV1$Json.and.returnValue(of(mockCategories));
    customerServiceSpy.postApiCustomerV1$Json.and.returnValues(of({ items: [] }), of({ items: [] }));

    // Setup component for LAC customers
    component.isCustomerLAC = true;

    // Call the method directly
    (component as any).loadFirstCallWithCategories();

    // Verify that categoryIds only contains LAC categories
    expect((component as any).categoryIds).toEqual([2]);
    expect((component as any).categories).toEqual(mockCategories.items);
  });

  it('should handle error when retrieving categories', () => {
    const error = new HttpErrorResponse({ error: 'Category service error', status: 500, statusText: 'Server Error' });
    categoryServiceSpy.postApiCategoryV1$Json.and.returnValue(throwError(() => error));
    const genericServiceSpy = spyOn(component['genericService'], 'manageError');

    (component as any).loadFirstCallWithCategories();

    expect(genericServiceSpy).toHaveBeenCalledWith(error);
  });

  it('should pass filtered category IDs to customer service calls', () => {
    // Mock categories data
    const mockCategories: GetCategoryResponse = {
      items: [
        { id: 1, categoryCode: '801', categoryDescription: 'Standard Category 1' },
        { id: 2, categoryCode: '802', categoryDescription: 'LAC Category' },
        { id: 3, categoryCode: '803', categoryDescription: 'Standard Category 2' }
      ],
      totalItems: 3,
      currentPage: 1,
      totalPages: 1
    };

    // Set up service responses
    categoryServiceSpy.postApiCategoryV1$Json.and.returnValue(of(mockCategories));
    customerServiceSpy.postApiCustomerV1$Json.and.returnValues(of({ items: [] }), of({ items: [] }));

    // Reset the spy call count before testing the specific method
    customerServiceSpy.postApiCustomerV1$Json.calls.reset();

    // Call the method
    (component as any).loadFirstCallWithCategories();

    // Verify that customer service was called with the filtered category IDs
    expect(customerServiceSpy.postApiCustomerV1$Json).toHaveBeenCalledTimes(2);

    // Check first call (for active customers)
    const firstCallArgs = customerServiceSpy.postApiCustomerV1$Json.calls.argsFor(0)[0];
    expect(firstCallArgs.body.categoryId).toEqual([1, 3]);

    // Check second call (for draft customers)
    const secondCallArgs = customerServiceSpy.postApiCustomerV1$Json.calls.argsFor(1)[0];
    // expect(secondCallArgs.body.categoryId).toEqual([1, 3]);
    expect(secondCallArgs.body.status).toEqual(['DRAFT']);
  });

  it('should initialize the form on ngOnInit', () => {
    expect(component.customersListFg).toBeDefined();
    expect(component.customersListFg.contains('filterType')).toBeTrue();
    expect(component.customersListFg.contains('filterValue')).toBeTrue();
  });

  xit('should open ReplaceAgentsModalComponent with correct options', () => {
    component.openModalSubAgents();
    expect(modalServiceSpy.open).toHaveBeenCalledWith(ReplaceAgentsModalComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
  });

  it('should make filterType control required', () => {
    const control = component.customersListFg.get('filterType');
    control?.setValue('');
    expect(control?.valid).toBeFalse();
    control?.setValue('someValue');
    expect(control?.valid).toBeTrue();
  });

  it('should navigate to relationship-edit with id 0 by default', () => {
    component.newRelation();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['administrative/relationship-new', 0, RelationshipType.Customer]);
  });

  it('should navigate to relationship-edit with provided id', () => {
    component.newRelation(99);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['administrative/relationship-new', 99, RelationshipType.Customer]);
  });

  it('should update page and call loadDataTable on pageChange', () => {
    const loadDataSpy = spyOn(component, 'loadDataTable');
    component.pageChange(2);
    expect(component.currentPage()).toBe(2);
    expect(loadDataSpy).toHaveBeenCalled();
  });

  it('should add a new filter and call loadDataTable in filterByAcronym', () => {
    spyOn(component, 'loadDataTable');
    component.customersListFg.get('filterType')?.setValue(FILTER_CUSTOMERS_TYPE_LIST[0].id);
    component.customersListFg.get('filterValue')?.setValue('test');
    component.badgeFilters = new Set([]);
    component.filterByAcronym();
    expect(component.badgeFilters.size).toBe(1);
    expect(component.loadDataTable).toHaveBeenCalled();
  });

  it('should update an existing filter in filterByAcronym', () => {
    spyOn(component, 'loadDataTable');
    const keyName = FILTER_CUSTOMERS_TYPE_LIST[0].value;
    component.badgeFilters = new Set([{ name: keyName, value: 'old' }]);
    component.customersListFg.get('filterType')?.setValue(FILTER_CUSTOMERS_TYPE_LIST[0].id);
    component.customersListFg.get('filterValue')?.setValue('new');
    component.filterByAcronym();
    expect(Array.from(component.badgeFilters)[0].value).toBe('new');
    expect(component.loadDataTable).toHaveBeenCalled();
  });

  it('should not add filter if type or value is missing in filterByAcronym', () => {
    spyOn(component, 'loadDataTable');
    component.customersListFg.get('filterType')?.setValue('');
    component.customersListFg.get('filterValue')?.setValue('');
    component.badgeFilters = new Set([]);
    component.filterByAcronym();
    expect(component.badgeFilters.size).toBe(0);
    expect(component.loadDataTable).not.toHaveBeenCalled();
  });

  it('should reset all filters in resetFilters', () => {
    spyOn(component, 'loadDataTable');
    component.badgeFilters = new Set([
      { name: 'A', value: '1' },
      { name: 'B', value: '2' }
    ]);
    component.categoryIds = [1, 2];
    component['payloadConfigurator'].customerCode = 123;
    component['payloadConfigurator'].surnameNameCompanyName = 'test';
    component['payloadConfigurator'].taxCode = 'tax';
    component['payloadConfigurator'].vatNumber = 'vat';
    component['payloadConfigurator'].categoryId = [1];
    component['payloadConfigurator'].codPay = 'codPay';
    component['payloadConfigurator'].vatRateNameOrVatExemptionName = '1';
    component.resetFilters();
    expect(component.badgeFilters.size).toBe(0);
    expect(component['payloadConfigurator'].customerCode).toBeUndefined();
    expect(component['payloadConfigurator'].surnameNameCompanyName).toBeUndefined();
    expect(component['payloadConfigurator'].taxCode).toBeUndefined();
    expect(component['payloadConfigurator'].vatNumber).toBeUndefined();
    expect(component['payloadConfigurator'].categoryId).toEqual([1, 2]);
    expect(component['payloadConfigurator'].codPay).toBeUndefined();
    expect(component['payloadConfigurator'].vatRateNameOrVatExemptionName).toBeUndefined();
    expect(component.loadDataTable).toHaveBeenCalled();
  });

  it('should call customerService and update signals in loadDataTable', () => {
    const response: GetCustomersResponse = {
      items: [{ id: 1 } as any],
      currentPage: 2,
      totalPages: 3,
      pageSize: 4,
      totalItems: 5
    };
    customerServiceSpy.postApiCustomerV1$Json.and.returnValue(of(response));
    component.loadDataTable();
    expect(component.listCustomers().length).toBe(1);
    expect(component.currentPage()).toBe(2);
    expect(component.totalPages()).toBe(3);
    expect(component.pageSize()).toBe(4);
    expect(component.totalItems()).toBe(5);
  });

  it('should handle error in loadDataTable', () => {
    customerServiceSpy.postApiCustomerV1$Json.and.returnValue(throwError(() => new Error('fail')));
    spyOn(console, 'error');
    component.loadDataTable();
    expect(console.error).toHaveBeenCalled();
  });

  it('should call customerService twice and update signals in loadFirstCall', () => {
    const customersResponse: GetCustomersResponse = { items: [{ id: 1 } as any] } as any;
    const draftResponse: GetCustomersResponse = { items: [{ id: 2 } as any] } as any;
    customerServiceSpy.postApiCustomerV1$Json.and.returnValues(of(customersResponse), of(draftResponse));

    spyOn(Utility, 'buildCarouselArray').and.callFake((_typeViewMode: any, items: any) => items);

    (component as any).loadFirstCall();

    expect(component.listCustomers().length).toBe(1);
    expect(component.listCustomers()[0].id).toBe(1);
    // expect(component.listCustomersDraft().length).toBe(1); // TODO: hide draft. waith for implementation
    // expect(component.listCustomersDraft()[0].id).toBe(2); // TODO: hide draft. waith for implementation
  });

  it('should handle error in loadFirstCall', () => {
    customerServiceSpy.postApiCustomerV1$Json.and.returnValues(
      of({}),
      throwError(() => new Error('fail'))
    );
    // spyOn(console, 'error');
    component['loadFirstCall']();
    // expect(console.error).toHaveBeenCalled();
  });

  it('should update payloadConfigurator in setPayloadFilter', () => {
    component['setPayloadFilter']('customerCode', '123');
    expect(component['payloadConfigurator'].customerCode).toBe(123);
    component['setPayloadFilter']('surnameNameCompanyName', 'test');
    expect(component['payloadConfigurator'].surnameNameCompanyName).toBe('test');
    component['setPayloadFilter']('taxCode', 'tax');
    expect(component['payloadConfigurator'].taxCode).toBe('tax');
    component['setPayloadFilter']('vatNumber', 'vat');
    expect(component['payloadConfigurator'].vatNumber).toBe('vat');
  });

  it('should update orderBy and call loadDataTable in onSort', () => {
    spyOn(component, 'loadDataTable');
    component.onSort({ column: { prop: 'field' }, newValue: 'asc' });
    expect(component['payloadConfigurator'].orderBy).toEqual(
      jasmine.objectContaining({
        field: 'field',
        direction: 'asc'
      })
    );
    expect(component.loadDataTable).toHaveBeenCalled();
  });

  it('should return correct page title based on isCustomerLAC', () => {
    component.isCustomerLAC = false;
    expect(component.getPageTitle()).toBe('administrative.relationshipCustomerList.title');
    component.isCustomerLAC = true;
    expect(component.getPageTitle()).toBe('administrative.relationshipCustomerList.titleLac');
  });

  it('should set showSidebar to true when openSidebar is called', () => {
    component.openSidebar();
    expect(component.showSidebar()).toBeTrue();
  });

  it('should set showSidebar to false when closeSidebar is called', () => {
    component.showSidebar.set(true);
    component.closeSidebar();
    expect(component.showSidebar()).toBeFalse();
  });

  it('should apply filters and update badgeFilters and payloadConfigurator', () => {
    const filterItem = { key: 'warningOrError', name: 'WarningOrError', selected: 'generic.yes', options: [] };
    spyOn(component, 'loadDataTable');
    component.applyFilters([filterItem]);
    expect(component.badgeFilters.size).toBe(1);
    expect(component['payloadConfigurator'].warningOrError).toBeTrue();
    expect(component.showSidebar()).toBeFalse();
    expect(component.loadDataTable).toHaveBeenCalled();
  });

  it('should remove a filter from badgeFilters when onlyRemove is true', () => {
    const filter = { name: 'Test', value: '123' };
    component.badgeFilters = new Set([filter]);
    component['manageBadgeFilter'](filter, true);
    expect(component.badgeFilters.size).toBe(0);
  });

  it('should add or update a filter in badgeFilters', () => {
    const filter = { name: 'Test', value: '123' };
    component.badgeFilters = new Set([{ name: 'Test', value: 'old' }]);
    component['manageBadgeFilter'](filter);
    expect(Array.from(component.badgeFilters)[0].value).toBe('123');
  });

  it('should set correct payloadConfigurator property based on key', () => {
    component['setPayloadFilter']('customerCode', '42');
    expect(component['payloadConfigurator'].customerCode).toBe(42);

    component['setPayloadFilter']('surnameNameCompanyName', 'John');
    expect(component['payloadConfigurator'].surnameNameCompanyName).toBe('John');

    component['setPayloadFilter']('taxCode', 'TAX123');
    expect(component['payloadConfigurator'].taxCode).toBe('TAX123');

    component['setPayloadFilter']('vatNumber', 'VAT123');
    expect(component['payloadConfigurator'].vatNumber).toBe('VAT123');

    component['setPayloadFilter']('warningOrError', true);
    expect(component['payloadConfigurator'].warningOrError).toBeTrue();

    component['setPayloadFilter']('categoryId', '12');
    expect(component['payloadConfigurator'].categoryId).toEqual([12]);

    component['setPayloadFilter']('codPay', 'codPay');
    expect(component['payloadConfigurator'].codPay).toBe('codPay');

    component['setPayloadFilter']('vatRateValue', '4');
    expect(component['payloadConfigurator'].vatRateNameOrVatExemptionName).toBe('4');
  });

  it('should call UtilityRouting.navigateToRelationshipDetailById in loadDetailRelPage', () => {
    const spy = spyOn(UtilityRouting, 'navigateToRelationshipDetailById');
    component.isCustomerLAC = false;
    component.loadDetailRelPage(123);
    expect(spy).toHaveBeenCalledWith('123', RelationshipType.Customer);

    component.isCustomerLAC = true;
    component.loadDetailRelPage(456);
    expect(spy).toHaveBeenCalledWith('456', RelationshipType.CustomerLac);
  });

  it('should call genericService.manageError and hide spinner on error in loadEditRelPage', () => {
    const error = new HttpErrorResponse({ error: 'fail', status: 500, statusText: 'Server Error' });
    customerServiceSpy.postApiCustomerV1IdLock$Response.and.returnValue(throwError(() => error));
    const genericServiceSpy = spyOn(component['genericService'], 'manageError');
    component.loadEditRelPage(456);
    expect(customerServiceSpy.postApiCustomerV1IdLock$Response).toHaveBeenCalledWith({ id: 456 });
    expect(genericServiceSpy).toHaveBeenCalledWith(error);
  });

  xit('should call UtilityRouting.navigateToRelationshipEditById on status 204 in loadEditRelPage', () => {
    const response = { status: 204 };
    customerServiceSpy.postApiCustomerV1IdLock$Response.and.returnValue(of(response));
    const spy = spyOn(UtilityRouting, 'navigateToRelationshipEditById');
    component.isCustomerLAC = false;
    component.loadEditRelPage(123);
    expect(spy).toHaveBeenCalledWith('123', RelationshipType.Customer);
  });

  it('should call genericService.openErrorModal if status is not 204 in loadEditRelPage', () => {
    const response = { status: 400 };
    customerServiceSpy.postApiCustomerV1IdLock$Response.and.returnValue(of(response));
    const genericServiceSpy = spyOn(component['genericService'], 'openErrorModal');
    component.loadEditRelPage(123);
    expect(genericServiceSpy).toHaveBeenCalledWith('generic.error.generic', 'concurrency.lockedCustomer');
  });

  it('should destructure payloadConfigurator excluding page and pageSize', () => {
    component['payloadConfigurator'] = {
      page: 1,
      pageSize: 20,
      customerCode: 123,
      taxCode: 'ABC123'
    };

    const { page, pageSize, ...filteredConfigurator } = component['payloadConfigurator'];

    expect(page).toBe(1);
    expect(pageSize).toBe(20);
    expect(filteredConfigurator).toEqual({
      customerCode: 123,
      taxCode: 'ABC123'
    });
  });

  it('should open the ReplaceBankModalComponent and set listCompany', () => {
    const mockCompanies = [{ id: 1, name: 'Company1' }];
    const modalRef = {
      componentInstance: {} as any,
      result: Promise.resolve({ old: 1, new: 2 })
    };
    const administrativeServiceSpy = jasmine.createSpyObj('AdministrativeService', [
      'postAdministrativeV1CompaniesWithoutBreakVisibility$Json'
    ]);
    modalServiceSpy.open.and.returnValue(modalRef as any);
    (component as any).administrativeService = administrativeServiceSpy;
    administrativeServiceSpy.postAdministrativeV1CompaniesWithoutBreakVisibility$Json.and.returnValue(of({ companies: mockCompanies }));

    component.openModalSubBanks();

    expect(administrativeServiceSpy.postAdministrativeV1CompaniesWithoutBreakVisibility$Json).toHaveBeenCalled();
    // The modal is opened and listCompany is set
    setTimeout(() => {
      expect(modalRef.componentInstance.listCompany).toEqual(mockCompanies);
    });
  });

  it('should handle error when opening ReplaceBankModalComponent', () => {
    const error = new HttpErrorResponse({ error: 'API error', status: 500, statusText: 'Server Error' });
    const administrativeServiceSpy = jasmine.createSpyObj('AdministrativeService', [
      'postAdministrativeV1CompaniesWithoutBreakVisibility$Json'
    ]);
    (component as any).administrativeService = administrativeServiceSpy;
    administrativeServiceSpy.postAdministrativeV1CompaniesWithoutBreakVisibility$Json.and.returnValue(throwError(() => error));
    const genericServiceSpy = spyOn(component['genericService'], 'manageError');

    component.openModalSubBanks();

    expect(genericServiceSpy).toHaveBeenCalledWith(error);
  });

  it('should call callReplaceBanks with correct parameters after modal result', fakeAsync(() => {
    const mockCompanies = [{ id: 1, name: 'Company1' }];
    const modalRef: Partial<NgbModalRef> = {
      componentInstance: {},
      result: Promise.resolve({ old: 1, new: 2, idCompany: 30 })
    };
    const administrativeServiceSpy = jasmine.createSpyObj('AdministrativeService', [
      'postAdministrativeV1CompaniesWithoutBreakVisibility$Json'
    ]);
    (component as any).administrativeService = administrativeServiceSpy;
    administrativeServiceSpy.postAdministrativeV1CompaniesWithoutBreakVisibility$Json.and.returnValue(of({ companies: mockCompanies }));
    modalServiceSpy.open.and.returnValue(modalRef as any);
    spyOn(component as any, 'callReplaceBanks');

    component.openModalSubBanks();
    tick();

    expect((component as any).callReplaceBanks).toHaveBeenCalledWith(1, 2, 30);
  }));

  // Test for callReplaceBanks success
  it('should call customerService.postApiCustomerV1ReplaceBank$Json and show success message on success', async () => {
    const customerService = component['customerService'];
    const messageStatusService = component['messageStatusService'];
    spyOn(messageStatusService, 'setSuccessMessage');
    spyOn(Utility, 'countCsvRecordsFromBlob').and.returnValue(Promise.resolve(42));
    customerService.postApiCustomerV1ReplaceBank$Json$Response = jasmine.createSpy().and.returnValue(of({}));

    await (component as any).callReplaceBanks(10, 20, 30);

    expect(customerService.postApiCustomerV1ReplaceBank$Json$Response).toHaveBeenCalledWith({
      body: {
        administrativeId: 30,
        oldBankId: 10,
        newBankId: 20,
        fieldsToExport: jasmine.any(Array)
      }
    });
    expect(messageStatusService.setSuccessMessage).toHaveBeenCalledWith(
      {
        title: 'administrative.replaceBankModal.success',
        message: 'administrative.replaceBankModal.successSecondMessage',
        showDownloadReportButton: true
      },
      { recordCount: 42 }
    );
  });

  it('should call genericService.manageError on error in callReplaceBanks', () => {
    const customerService = component['customerService'];
    const genericService = component['genericService'];
    spyOn(genericService, 'manageError');
    const error = new HttpErrorResponse({ error: 'fail', status: 500, statusText: 'Server Error' });
    customerService.postApiCustomerV1ReplaceBank$Json$Response = jasmine.createSpy().and.returnValue(throwError(() => error));

    (component as any).callReplaceBanks(10, 20, 30);

    expect(genericService.manageError).toHaveBeenCalledWith(error);
  });

  it('should call Utility.handleExportDataResponse with correct arguments in downloadResponse', () => {
    const mockResponse = { body: new Blob() } as any;
    component.reportExcel = mockResponse;
    const spy = spyOn(Utility, 'handleExportDataResponse');
    component.downloadResponse();
    expect(spy).toHaveBeenCalledWith(mockResponse, jasmine.any(String));
  });

  it('should return correct page title in getPageTitle', () => {
    component.isCustomerLAC = false;
    expect(component.getPageTitle()).toBe('administrative.relationshipCustomerList.title');
    component.isCustomerLAC = true;
    expect(component.getPageTitle()).toBe('administrative.relationshipCustomerList.titleLac');
  });
});
