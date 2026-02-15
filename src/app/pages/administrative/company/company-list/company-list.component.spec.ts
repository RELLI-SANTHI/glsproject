/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CompanyListComponent } from './company-list.component';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { UserDetailsModel } from '../../../../api/glsUserApi/models';
import { of, throwError } from 'rxjs';
import { UtilityProfile } from '../../../../common/utilities/utility-profile';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { AdministrativeService } from '../../../../api/glsAdministrativeApi/services';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { GetAdministrativesResponse } from '../../../../api/glsAdministrativeApi/models';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { CompanyListTableComponent } from './company-list-table/company-list-table.component';
import { Utility } from '../../../../common/utilities/utility';
import { StrictHttpResponse } from '../../../../api/glsUserApi/strict-http-response';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { FormBuilder } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

describe('CompanyListComponent', () => {
  let component: CompanyListComponent;
  let fixture: ComponentFixture<CompanyListComponent>;
  let mockUserProfileService: jasmine.SpyObj<UserProfileService>;
  let mockMessageStatusService: jasmine.SpyObj<MessageStatusService>;
  let mockGenericService: jasmine.SpyObj<GenericService>;
  let mockAdministrativeService: jasmine.SpyObj<AdministrativeService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSpinnerService: any;
  let modalService: jasmine.SpyObj<NgbModal>;
  let modalRef: jasmine.SpyObj<NgbModalRef>;

  const paramMapData = { groupId: '1' };
  const activatedRouteStub = {
    snapshot: {
      get paramMap() {
        return convertToParamMap(paramMapData);
      }
    }
  };

  beforeEach(async () => {
    // mockCorporateGroupService = jasmine.createSpyObj('CorporateGroupService', [
    //   'putApiCorporategroupV1Id$Json',
    //   'getApiCorporategroupV1$Json'
    // ]);
    mockSpinnerService = jasmine.createSpyObj('SpinnerStatusService', ['show', 'hide']);
    mockUserProfileService = jasmine.createSpyObj('UserProfileService', ['getLoggedUser'], {
      profile$: of({} as UserDetailsModel),
      impersonatedUser$: of(null)
    });

    mockMessageStatusService = jasmine.createSpyObj('MessageStatusService', ['show', 'hide']);
    mockGenericService = jasmine.createSpyObj('GenericService', ['isLandscape', 'manageError', 'viewMode']);
    mockAdministrativeService = jasmine.createSpyObj('AdministrativeService', [
      'postApiAdministrativeV1$Json',
      'postApiAdministrativeV1Export$Json$Response',
      'postApiAdministrativeV1IdLock$Response',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockGenericService.isLandscape.and.returnValue(true);
    mockAdministrativeService.postApiAdministrativeV1$Json.and.returnValue(
      of({
        companies: [],
        totalItems: 0,
        currentPage: 1,
        pageSize: 10,
        totalPages: 1
      })
    );
    mockAdministrativeService.postApiAdministrativeV1IdLock$Response.and.returnValue(
      of(new HttpResponse({ body: null, status: 204 }) as StrictHttpResponse<any>)
    );

    modalService = jasmine.createSpyObj('NgbModal', ['open']);
    modalRef = jasmine.createSpyObj('NgbModalRef', ['result'], {
      result: Promise.resolve('closed')
    });

    // component.groupId = 123;
    // component.GroupNameEditFg = new (component as any).fb.group({
    //   groupName: ['Test Group']
    // });
    // component.groupTitle.set('');
    // component.groupEditFlag = true;

    await TestBed.configureTestingModule({
      imports: [
        CompanyListComponent,
        HttpClientTestingModule,
        CompanyListTableComponent,
        TranslateModule.forRoot() // This provides TranslateService and TranslateStore
      ],
      providers: [
        { provide: UserProfileService, useValue: mockUserProfileService },
        { provide: MessageStatusService, useValue: mockMessageStatusService },
        { provide: GenericService, useValue: mockGenericService },
        { provide: AdministrativeService, useValue: mockAdministrativeService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: NgbModal, useValue: modalService }
        // DO NOT provide TranslateService or TranslateStore here!
      ]
    }).compileComponents();

    spyOn(Utility, 'openFile').and.stub();

    fixture = TestBed.createComponent(CompanyListComponent);
    component = fixture.componentInstance;
    const fb = TestBed.inject(FormBuilder);
    (component as any).fb = fb;
    // (component as any).corporateGroupService = mockCorporateGroupService;
    (component as any).spinnerService = mockSpinnerService;
    modalService.open.and.returnValue(modalRef);
    fixture.detectChanges();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
    if (fixture) {
      fixture.destroy();
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should save corporate group name, update groupTitle, set groupEditFlag to false, and hide spinner on success', () => {
    // Arrange
    const mockResponse = { id: 123, corporateName: 'New Group Name' };
    component.groupId = 123;
    const fb = TestBed.inject(FormBuilder);
    component.GroupNameEditFg = fb.group({
      groupName: ['Test Group']
    });
    component.groupTitle.set('');
    component.groupEditFlag = true;

    // Spy directly on the service method attached to the component
    spyOn(component['corporateGroupService'], 'putApiCorporategroupV1Id$Json').and.returnValue(of(mockResponse));

    // Act
    component.saveCorporateGroupName();

    // Assert
    expect(mockSpinnerService.show).toHaveBeenCalled();
    expect(component['corporateGroupService'].putApiCorporategroupV1Id$Json).toHaveBeenCalledWith({
      id: 123,
      body: { corporateName: 'Test Group' }
    });
    expect(component.groupTitle()).toBe('New Group Name');
    expect(component.groupEditFlag).toBeFalse();
    expect(mockSpinnerService.hide).toHaveBeenCalled();
  });

  it('should enable edit mode and patch group name in editCompanyGroup', () => {
    // Arrange
    const fb = TestBed.inject(FormBuilder);
    component.GroupNameEditFg = fb.group({
      groupName: ['']
    });
    component.groupTitle.set('Patched Group Name');
    component.groupEditFlag = false;

    // Act
    component.editCompanyGroup();

    // Assert
    expect(component.GroupNameEditFg.get('groupName')?.value).toBe('Patched Group Name');
    expect(component.groupEditFlag).toBeTrue();
  });

  it('should disable edit mode in cancelGroupNameEdit', () => {
    // Arrange
    component.groupEditFlag = true;

    // Act
    component.cancelGroupNameEdit();

    // Assert
    expect(component.groupEditFlag).toBeFalse();
  });

  it('should call exportComponayData (placeholder)', () => {
    mockAdministrativeService.postApiAdministrativeV1Export$Json$Response.and.returnValue(
      of({
        headers: { keys: () => [], get: () => '' },
        body: new Blob()
      } as any)
    );
    expect(() => component.exportData()).not.toThrow();
  });

  it('should navigate to company-edit/0 when corporateGroup is called', () => {
    UtilityRouting.initialize(mockRouter); // Inizializza UtilityRouting
    spyOn(UtilityRouting, 'navigateToCompanyGroupCreate');
    component.corporateGroup();
    expect(UtilityRouting.navigateToCompanyGroupCreate).toHaveBeenCalled();
  });

  it('should call UtilityRouting.navigateToComapnySocietyCreate when society is called', () => {
    spyOn(UtilityRouting, 'navigateToComapnySocietyCreate');
    component.society();
    expect(UtilityRouting.navigateToComapnySocietyCreate).toHaveBeenCalled();
  });

  it('should return true when UtilityProfile.checkAccessProfile returns true', () => {
    spyOn(UtilityProfile, 'checkAccessProfile').and.returnValue(true);
    const result = component.hasAccess('profile', 'functionality', 'permission');
    expect(result).toBeTrue();
    expect(UtilityProfile.checkAccessProfile).toHaveBeenCalledWith(
      (component as any)['userProfileService'],
      'profile',
      'functionality',
      'permission'
    );
  });

  it('should return false when UtilityProfile.checkAccessProfile returns false', () => {
    spyOn(UtilityProfile, 'checkAccessProfile').and.returnValue(false);
    const result = component.hasAccess('profile', 'functionality', 'permission');
    expect(result).toBeFalse();
    expect(UtilityProfile.checkAccessProfile).toHaveBeenCalledWith(
      (component as any)['userProfileService'],
      'profile',
      'functionality',
      'permission'
    );
  });

  xit('should load initial company data on ngOnInit', () => {
    const mockResponse: GetAdministrativesResponse = {
      companies: [],
      totalItems: 5,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1
    };
    mockAdministrativeService.postApiAdministrativeV1$Json.and.returnValue(of(mockResponse));
    component.ngOnInit();
    expect(component.totalItems()).toBe(5);
    expect(component.currentPage()).toBe(1);
    expect(component.pageSize()).toBe(10);
    expect(component.totalPages()).toBe(1);
  });

  it('should handle error in loadInitialCompanyData', () => {
    const error = new HttpErrorResponse({ error: 'error' });
    mockAdministrativeService.postApiAdministrativeV1$Json.and.returnValue(throwError(() => error));
    component['loadInitialCompanyData']();
    expect(mockGenericService.manageError).toHaveBeenCalledWith(error);
  });

  it('should call retrieveAdministrativesCompany and return observable', (done) => {
    const mockResponse: GetAdministrativesResponse = {
      companies: [],
      totalItems: 0,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1
    };
    mockAdministrativeService.postApiAdministrativeV1$Json.and.returnValue(of(mockResponse));
    component.retrieveAdministrativesCompany({ status: ['COMPLETED'] }).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      done();
    });
  });

  it('should handle pageChange and reload user list', () => {
    const mockResponse: GetAdministrativesResponse = {
      companies: [{ id: 1 } as any],
      totalItems: 1,
      currentPage: 2,
      pageSize: 10,
      totalPages: 1
    };
    mockAdministrativeService.postApiAdministrativeV1$Json.and.returnValue(of(mockResponse));
    spyOn(component, 'retrieveAdministrativesCompany').and.callThrough();
    component.pageChange(2);
    expect(component.retrieveAdministrativesCompany).toHaveBeenCalledWith(
      jasmine.objectContaining({
        status: jasmine.any(Array),
        pageSize: 10,
        page: 2
      })
    );
    expect(component.currentPage()).toBe(2);
    expect(component.totalItems()).toBe(1);
  });

  it('should handle error in pageChange', () => {
    const error = new HttpErrorResponse({ error: 'error' });
    mockAdministrativeService.postApiAdministrativeV1$Json.and.returnValue(throwError(() => error));
    component.pageChange(2);
    expect(mockGenericService.manageError).toHaveBeenCalledWith(error);
  });

  it('should reload user list with company data', (done) => {
    const mockResponse: GetAdministrativesResponse = {
      companies: [{ id: 1 } as any],
      totalItems: 1,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1
    };
    mockAdministrativeService.postApiAdministrativeV1$Json.and.returnValue(of(mockResponse));
    component.retrieveAdministrativesCompany({ status: ['COMPLETED'] }).subscribe(() => {
      expect(component.administrativeCompanyList().length).toBe(0);
      expect(component.totalItems()).toBe(0);
      done();
    });
  });

  it('should handle onSort and reload user list', () => {
    const mockResponse: GetAdministrativesResponse = {
      companies: [{ id: 1 } as any],
      totalItems: 1,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1
    };
    mockAdministrativeService.postApiAdministrativeV1$Json.and.returnValue(of(mockResponse));
    spyOn(component, 'retrieveAdministrativesCompany').and.callThrough();
    component.onSort({ column: { prop: 'Status' }, newValue: 'desc' });
    expect(component.retrieveAdministrativesCompany).toHaveBeenCalledWith(
      jasmine.objectContaining({
        status: jasmine.any(Array),
        pageSize: 10,
        page: 1,
        orderBy: jasmine.objectContaining({ field: 'Status', direction: 'desc' })
      })
    );
  });

  it('should handle error in onSort', () => {
    const error = new HttpErrorResponse({ error: 'error' });
    mockAdministrativeService.postApiAdministrativeV1$Json.and.returnValue(throwError(() => error));
    component.onSort({ column: { prop: 'Status' }, newValue: 'desc' });
    expect(mockGenericService.manageError).toHaveBeenCalledWith(error);
  });

  it('should export company data and open file on success', () => {
    // Arrange
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(Date.UTC(2024, 5, 15))); // June 15, 2024 (month is 0-based)
    const mockBody = new Blob(['test'], { type: 'text/csv' });
    const mockHeaders = new HttpHeaders({ 'content-type': 'text/csv' });

    mockAdministrativeService.postApiAdministrativeV1Export$Json$Response.and.returnValue(
      of(new HttpResponse({ body: mockBody, headers: mockHeaders as any }) as StrictHttpResponse<Blob>)
    );

    // Act
    component.exportData();

    // Assert
    expect(mockAdministrativeService.postApiAdministrativeV1Export$Json$Response).toHaveBeenCalled();
    expect(Utility.openFile).toHaveBeenCalledWith(mockBody, 'text/csv', 'Company_Society_20240615.csv');
    jasmine.clock().uninstall();
  });

  it('should handle error during export', () => {
    // Arrange
    const error = new Error('Export failed');
    mockAdministrativeService.postApiAdministrativeV1Export$Json$Response.and.returnValue(throwError(() => error));
    const genericService = { manageError: jasmine.createSpy('manageError') };
    (component as any).genericService = genericService;

    // Act
    component.exportData();

    // Assert
    expect(mockAdministrativeService.postApiAdministrativeV1Export$Json$Response).toHaveBeenCalled();
    expect(genericService.manageError).toHaveBeenCalledWith(error);
  });

  it('should filter by name and reload table', () => {
    component.societyFilterFg = {
      value: { filterType: 'name', filterValue: 'TestName' }
    } as any;
    component.administrativeRequest = {};
    const mockResponse: GetAdministrativesResponse = {
      companies: [],
      totalItems: 0,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1
    };
    spyOn(component, 'retrieveAdministrativesCompany').and.returnValue(of(mockResponse));
    spyOn(component, 'reloadAdministrativeTableList');
    component.filterByText();
    expect(component.administrativeRequest.name).toBe('TestName');
    expect(component.administrativeRequest.page).toBe(1);
    expect(component.reloadAdministrativeTableList).toHaveBeenCalledWith(mockResponse);
  });

  it('should filter by vatNumber and reload table', () => {
    component.societyFilterFg = {
      value: { filterType: 'vatNumber', filterValue: 'VAT123' }
    } as any;
    component.administrativeRequest = {};
    const mockResponse: GetAdministrativesResponse = {
      companies: [],
      totalItems: 0,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1
    };
    spyOn(component, 'retrieveAdministrativesCompany').and.returnValue(of(mockResponse));
    spyOn(component, 'reloadAdministrativeTableList');
    component.filterByText();
    expect(component.administrativeRequest.vatNumber).toBe('VAT123');
    expect(component.administrativeRequest.page).toBe(1);
    expect(component.reloadAdministrativeTableList).toHaveBeenCalledWith(mockResponse);
  });

  it('should filter by taxCode and reload table', () => {
    component.societyFilterFg = {
      value: { filterType: 'taxCode', filterValue: 'TAXCODE' }
    } as any;
    component.administrativeRequest = {};
    const mockResponse: GetAdministrativesResponse = {
      companies: [],
      totalItems: 0,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1
    };
    spyOn(component, 'retrieveAdministrativesCompany').and.returnValue(of(mockResponse));
    spyOn(component, 'reloadAdministrativeTableList');
    component.filterByText();
    expect(component.administrativeRequest.taxCode).toBe('TAXCODE');
    expect(component.administrativeRequest.page).toBe(1);
    expect(component.reloadAdministrativeTableList).toHaveBeenCalledWith(mockResponse);
  });

  it('should handle unknown filterType and still reload table', () => {
    component.societyFilterFg = {
      value: { filterType: 'unknown', filterValue: 'SomeValue' }
    } as any;
    component.administrativeRequest = {};
    const mockResponse: GetAdministrativesResponse = {
      companies: [],
      totalItems: 0,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1
    };
    spyOn(component, 'retrieveAdministrativesCompany').and.returnValue(of(mockResponse));
    spyOn(component, 'reloadAdministrativeTableList');
    component.filterByText();
    expect(component.administrativeRequest.name).toBeUndefined();
    expect(component.administrativeRequest.vatNumber).toBeUndefined();
    expect(component.administrativeRequest.taxCode).toBeUndefined();
    expect(component.administrativeRequest.page).toBe(1);
    expect(component.reloadAdministrativeTableList).toHaveBeenCalledWith(mockResponse);
  });

  it('should handle error in filterByText', () => {
    component.societyFilterFg = {
      value: { filterType: 'name', filterValue: 'TestName' }
    } as any;
    component.administrativeRequest = {};
    const error = new HttpErrorResponse({ error: 'error' });
    spyOn(component, 'retrieveAdministrativesCompany').and.returnValue(throwError(() => error));
    component.filterByText();
    expect(mockGenericService.manageError).toHaveBeenCalledWith(error);
  });

  it('should return the draft card icon path for any carousel', () => {
    const mockCarousel = { items: [] } as any;
    const result = component.getDraftCardIcon(mockCarousel);
    expect(result).toBe('../../../../../assets/img/administrative/GLS_icon.svg');
  });

  it('should return the draft card icon path for a generic type', () => {
    interface Dummy {
      foo: string;
    }

    const mockCarousel = { items: [{ foo: 'bar' }] } as any;
    const result = component.getDraftCardIcon<Dummy>(mockCarousel);
    expect(result).toBe('../../../../../assets/img/administrative/GLS_icon.svg');
  });

  it('should navigate to company-edit with the given draftStructureId', () => {
    const draftStructureId = 123;
    UtilityRouting.initialize(mockRouter);
    spyOn(UtilityRouting, 'navigateToSocietyEditById');
    component.goToSocietyEdit(draftStructureId);
    expect(UtilityRouting.navigateToSocietyEditById).toHaveBeenCalledWith(draftStructureId);
  });

  it('should reset name filter and reload table', () => {
    const field = { name: 'name', value: 'something' } as any;
    const filterValueSpy = jasmine.createSpy('setValue');
    const filterTypeSpy = jasmine.createSpy('setValue');
    component.societyFilterFg = {
      get: (key: string) => ({
        setValue: key === 'filterValue' ? filterValueSpy : filterTypeSpy
      })
    } as any;
    component.administrativeRequest = { name: 'something' };
    spyOn(component, 'retrieveAdministrativesCompany').and.returnValue(of({} as GetAdministrativesResponse));
    spyOn(component, 'reloadAdministrativeTableList');

    component.resetFilter(field);

    expect(filterValueSpy).toHaveBeenCalledWith(null);
    expect(filterTypeSpy).toHaveBeenCalledWith('');
    expect(component.administrativeRequest.name).toBeNull();
    expect(field.value).toBeUndefined();
    expect(component.reloadAdministrativeTableList).toHaveBeenCalled();
  });

  it('should reset vatNumber filter and reload table', () => {
    const field = { name: 'vatNumber', value: 'something' } as any;
    const filterValueSpy = jasmine.createSpy('setValue');
    const filterTypeSpy = jasmine.createSpy('setValue');
    component.societyFilterFg = {
      get: (key: string) => ({
        setValue: key === 'filterValue' ? filterValueSpy : filterTypeSpy
      })
    } as any;
    component.administrativeRequest = { vatNumber: 'something' };
    spyOn(component, 'retrieveAdministrativesCompany').and.returnValue(of({} as GetAdministrativesResponse));
    spyOn(component, 'reloadAdministrativeTableList');

    component.resetFilter(field);

    expect(filterValueSpy).toHaveBeenCalledWith(null);
    expect(filterTypeSpy).toHaveBeenCalledWith('');
    expect(component.administrativeRequest.vatNumber).toBeNull();
    expect(field.value).toBeUndefined();
    expect(component.reloadAdministrativeTableList).toHaveBeenCalled();
  });

  it('should reset taxCode filter and reload table', () => {
    const field = { name: 'taxCode', value: 'something' } as any;
    const filterValueSpy = jasmine.createSpy('setValue');
    const filterTypeSpy = jasmine.createSpy('setValue');
    component.societyFilterFg = {
      get: (key: string) => ({
        setValue: key === 'filterValue' ? filterValueSpy : filterTypeSpy
      })
    } as any;
    component.administrativeRequest = { taxCode: 'something' };
    spyOn(component, 'retrieveAdministrativesCompany').and.returnValue(of({} as GetAdministrativesResponse));
    spyOn(component, 'reloadAdministrativeTableList');

    component.resetFilter(field);

    expect(filterValueSpy).toHaveBeenCalledWith(null);
    expect(filterTypeSpy).toHaveBeenCalledWith('');
    expect(component.administrativeRequest.taxCode).toBeNull();
    expect(field.value).toBeUndefined();
    expect(component.reloadAdministrativeTableList).toHaveBeenCalled();
  });

  it('should do nothing for unknown filter name but still reload table', () => {
    const field = { name: 'unknown', value: 'something' } as any;
    component.societyFilterFg = {
      get: () => undefined
    } as any;
    component.administrativeRequest = {};
    spyOn(component, 'retrieveAdministrativesCompany').and.returnValue(of({} as GetAdministrativesResponse));
    spyOn(component, 'reloadAdministrativeTableList');

    component.resetFilter(field);

    expect(component.reloadAdministrativeTableList).toHaveBeenCalled();
  });

  it('should handle error in resetFilter', () => {
    const field = { name: 'name', value: 'something' } as any;
    component.societyFilterFg = {
      get: () => ({
        setValue: jasmine.createSpy('setValue')
      })
    } as any;
    component.administrativeRequest = { name: 'something' };
    const error = new HttpErrorResponse({ error: 'error' });
    spyOn(component, 'retrieveAdministrativesCompany').and.returnValue(throwError(() => error));

    component.resetFilter(field);

    expect(mockGenericService.manageError).toHaveBeenCalledWith(error);
  });

  it('should reset all filters, set page to 1, and reload table', () => {
    spyOn(component, 'retrieveAdministrativesCompany').and.returnValue(
      of({
        companies: [],
        page: 5,
        pageSize: 10,
        totalItems: 100,
        totalPages: 1
      } as GetAdministrativesResponse)
    );
    spyOn(component, 'reloadAdministrativeTableList');

    component.resetFilters();

    expect(component.currentPage()).toEqual(1);
    expect(component.administrativeRequest.page).toBe(1); // currentPage() returns 5
    expect(component.administrativeRequest.pageSize).toBe(10);
    expect(component.reloadAdministrativeTableList).toHaveBeenCalled();
  });

  it('should handle error in resetFilters', () => {
    // const filterValueSpy = jasmine.createSpy('setValue');
    // const filterTypeSpy = jasmine.createSpy('setValue');
    // // const setPageSpy = jasmine.createSpy('set');
    // component.societyFilterFg = {
    //   get: (key: string) => ({
    //     setValue: key === 'filterValue' ? filterValueSpy : filterTypeSpy
    //   })
    // } as any;
    const error = new HttpErrorResponse({ error: 'error' });
    spyOn(component, 'retrieveAdministrativesCompany').and.returnValue(throwError(() => error));

    component.resetFilters();

    expect(mockGenericService.manageError).toHaveBeenCalledWith(error);
  });

  it('should return groupTitle if companyType is viewCorporateGroup, otherwise default title', () => {
    const companyTypeSpy = spyOn(component, 'companyType');
    // Case 1: companyType returns 'viewCorporateGroup'
    companyTypeSpy.and.returnValue('viewCorporateGroup');
    component.groupTitle.set('My Group Title');
    expect(component.getTitle()).toBe('My Group Title');
    // Case 2: companyType returns something else
    companyTypeSpy.and.returnValue('otherType');
    expect(component.getTitle()).toBe('administrative.companyList.title');
  });
  it('should load company data with group and update state', (done) => {
    // Arrange
    const mockGroupId = '123';
    const mockResponse: GetAdministrativesResponse = {
      companies: [{ id: 1, name: 'Test Company', corporateGroupId: 1, vatNumber: '' } as any],
      totalItems: 1,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1
    };
    mockAdministrativeService.postApiAdministrativeV1$Json.and.returnValue(of(mockResponse));
    component.administrativeRequest = { ...component.administrativeRequest, groupId: mockGroupId } as any;

    // Act
    (component as any).loadCompanyDataWithGroup(mockGroupId);

    // Assert
    setTimeout(() => {
      expect(mockAdministrativeService.postApiAdministrativeV1$Json).toHaveBeenCalledWith(
        jasmine.objectContaining({
          body: jasmine.objectContaining({ groupId: mockGroupId })
        })
      );
      expect(component.totalItems()).toBe(1);
      expect(component.administrativeCompanyList()).toEqual([
        {
          id: 1,
          name: 'Test Company',
          corporateGroupId: 1,
          vatNumber: ''
        }
      ]);
      done();
    });
  });

  it('should handle error in loadCompanyDataWithGroup', () => {
    const mockGroupId = '123';
    const error = new HttpErrorResponse({ error: 'error' });
    mockAdministrativeService.postApiAdministrativeV1$Json.and.returnValue(throwError(() => error));
    component.administrativeRequest = { groupId: mockGroupId } as any;

    (component as any).loadCompanyDataWithGroup(mockGroupId);

    expect(mockGenericService.manageError).toHaveBeenCalledWith(error);
  });

  it('should load draft card with correct slides and totalDraftItem', () => {
    component.typeViewMode = 0; // VIEW_MODE.DESKTOP
    const societies = [
      { id: 1, corporateGroupId: 1, vatNumber: 'A' },
      { id: 2, corporateGroupId: 2, vatNumber: 'B' },
      { id: 3, corporateGroupId: 3, vatNumber: 'C' },
      { id: 4, corporateGroupId: 4, vatNumber: 'D' }
    ] as any;
    component.loadDraftCard(societies);
    expect(component.draftSociety.length).toBeGreaterThan(0);
    expect(component.totalDraftItem).toBe(4);
  });

  it('should show filters applied', () => {
    component.administrativeRequest = {
      buildingAcronym: 'BA',
      name: 'N',
      vatNumber: 'VAT',
      taxCode: 'TC',
      corporateGroupName: 'CG'
    } as any;
    const filters = component.showFiltersApplied();
    expect(filters.some((f) => f.name === 'buildingAcronym')).toBeTrue();
    expect(filters.some((f) => f.name === 'Name')).toBeTrue();
    expect(filters.some((f) => f.name === 'VatNumber')).toBeTrue();
    expect(filters.some((f) => f.name === 'TaxCode')).toBeTrue();
    expect(filters.some((f) => f.name === 'CorporateGroup')).toBeFalse();
  });

  it('should set enabled value and companyType', () => {
    component.getEnabledValue({ buttonType: 'BTN', companyType: 'TYPE' });
    expect(component.tableEnabled).toBe('BTN');
    expect(component.companyType()).toBe('TYPE');
  });

  it('should call retrieveCorporateGroup and set corporateGroupList', (done) => {
    const mockGroups = [{ id: 1, corporateName: 'Group1' }];
    spyOn(component, 'retrieveCorporateGroup').and.returnValue(of(mockGroups as any));
    component.groupId = 1;
    spyOn(component, 'loadCompanyDataWithGroup');
    component.loadInitialCorporateGroupData();
    setTimeout(() => {
      expect(component.corporateGroupList()).toEqual(mockGroups as any);
      expect(component.groupTitle()).toBe('Group1');
      expect(component.loadCompanyDataWithGroup).toHaveBeenCalled();
      done();
    });
  });

  it('should handle error in loadInitialCorporateGroupData', () => {
    spyOn(component, 'retrieveCorporateGroup').and.returnValue(throwError(() => new HttpErrorResponse({ error: 'err' })));
    component.loadInitialCorporateGroupData();
    expect(mockGenericService.manageError).toHaveBeenCalled();
  });

  it('should call retrieveCorporateGroupIDList and return observable', (done) => {
    const mockResponse = { id: 1 };
    spyOn(component['corporateGroupService'], 'getApiCorporategroupV1Id$Json').and.returnValue(of(mockResponse as any));
    component.retrieveCorporateGroupIDList({ id: 1 }).subscribe((res) => {
      expect(res).toEqual(mockResponse as any);
      done();
    });
  });

  it('should call ngOnDestroy and hide message', () => {
    component.ngOnDestroy();
    expect(mockMessageStatusService.hide).toHaveBeenCalled();
  });

  it('should call exportSociety and return observable', (done) => {
    const mockHeaders = { get: () => 'text/csv' };
    const mockResponse = {
      headers: mockHeaders,
      body: new Blob(['test'], { type: 'text/csv' })
    } as any;
    spyOn(component as any, 'exportSociety').and.returnValue(of(mockResponse));
    (component as any).tableEnabled = (component as any).viewButtonConstants.SOCIETY;
    (component as any).exportData();
    expect((component as any).exportSociety).toHaveBeenCalled();
    done();
  });

  it('should call exportCorporate and return observable', (done) => {
    const mockHeaders = { get: () => 'text/csv' };
    const mockResponse = {
      headers: mockHeaders,
      body: new Blob(['test'], { type: 'text/csv' })
    } as any;
    spyOn(component as any, 'exportCorporate').and.returnValue(of(mockResponse));
    (component as any).tableEnabled = (component as any).viewButtonConstants.GROUP_SOCIETY;
    (component as any).exportData();
    expect((component as any).exportCorporate).toHaveBeenCalled();
    done();
  });

  it('dovrebbe impostare correttamente i segnali in base al viewMode', () => {
    mockGenericService.viewMode.and.returnValue(2);
    component['setupViewMode']();
    expect(component.isTablet()).toBeFalse();
    expect(component.isSmallMobile()).toBeTrue();

    mockGenericService.viewMode.and.returnValue(1);
    component['setupViewMode']();
    expect(component.isTablet()).toBeTrue();
    expect(component.isSmallMobile()).toBeFalse();

    mockGenericService.viewMode.and.returnValue(0);
    component['setupViewMode']();
    expect(component.isTablet()).toBeFalse();
    expect(component.isSmallMobile()).toBeFalse();
  });

  it('should call prepareRequestForDraft and return correct payload', () => {
    const payload = (component as any).prepareRequestForDraft();
    expect(payload.status).toEqual(['DRAFT']);
  });

  it('should open confirmation dialog with correct data', async () => {
      spyOn(component, 'deleteCompanyGroupApi');
      modalRef = jasmine.createSpyObj('NgbModalRef', [], { result: Promise.resolve('confirm'), componentInstance: { data: null } });
      modalService.open.and.returnValue(modalRef);
      await component.deleteCompanyGroup();
      expect(modalService.open).toHaveBeenCalled();
      expect(modalRef.componentInstance.data).toEqual({
        title: 'ConfirmActionTtile',
        content: 'corporateGroupDelete',
        showCancel: true,
        cancelText: 'modal.cancelText',
        confirmText: 'modal.confirmText'
      });
    });
    it('should call deleteApiCorporategroupV1Id and show success message, then navigate on success', () => {
      const mockGroupId = 123;
      component.groupId = mockGroupId;
      const mockCorporateGroupService = jasmine.createSpyObj('CorporateGroupService', ['deleteApiCorporategroupV1Id']);
      (component as any).corporateGroupService = mockCorporateGroupService;
      mockCorporateGroupService.deleteApiCorporategroupV1Id.and.returnValue(of({}));
      spyOn(UtilityRouting, 'navigateToCompanyList');

      component.deleteCompanyGroupApi();

      expect(mockCorporateGroupService.deleteApiCorporategroupV1Id).toHaveBeenCalledWith({ id: mockGroupId });
      expect(mockMessageStatusService.show).toHaveBeenCalledWith('message.companyList.deleteGroup.success');
      expect(UtilityRouting.navigateToCompanyList).toHaveBeenCalled();
    });

    it('should call manageError on error from deleteApiCorporategroupV1Id', () => {
      const mockGroupId = 123;
      component.groupId = mockGroupId;
      const mockCorporateGroupService = jasmine.createSpyObj('CorporateGroupService', ['deleteApiCorporategroupV1Id']);
      (component as any).corporateGroupService = mockCorporateGroupService;
      const error = new HttpErrorResponse({ error: 'Delete failed' });
      mockCorporateGroupService.deleteApiCorporategroupV1Id.and.returnValue(throwError(() => error));

      component.deleteCompanyGroupApi();

      expect(mockCorporateGroupService.deleteApiCorporategroupV1Id).toHaveBeenCalledWith({ id: mockGroupId });
      expect(mockGenericService.manageError).toHaveBeenCalledWith(error);
    });
});
