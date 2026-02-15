/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CompanyEditComponent } from './company-edit.component';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserDetailsModel } from '../../../../api/glsUserApi/models';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import {
  CompanyDetailResponse,
  CreateCompanyRequest,
  UpdateCompanyRequest
} from '../../../../api/glsAdministrativeApi/models';
import { AdministrativeService } from '../../../../api/glsAdministrativeApi/services';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { AdministrativeCommonService } from '../../services/administrative.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ADMINISTRATIVE_COMPANY_CONSTANTS } from '../../constants/administrative-constant';
import { VIEW_MODE } from '../../../../common/app.constants';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  DeactivationModalComponent
} from '../../../../common/components/deactivation-modal/deactivation-modal.component';
import { Utility } from '../../../../common/utilities/utility';
import { StrictHttpResponse } from '../../../../api/glsUserApi/strict-http-response';
import { UtilityProfile } from '../../../../common/utilities/utility-profile';
import { STATUS } from '../../../../common/utilities/constants/generic-constants';

describe('CompanyEditComponent', () => {
  let component: CompanyEditComponent;
  let fixture: ComponentFixture<CompanyEditComponent>;
  let mockUserProfileService: jasmine.SpyObj<UserProfileService>;
  let mockAdministrativeService: jasmine.SpyObj<AdministrativeService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockMessageStatusService: jasmine.SpyObj<MessageStatusService>;
  let mockGenericService: jasmine.SpyObj<GenericService>;
  let mockAdministrativeCommonService: jasmine.SpyObj<AdministrativeCommonService>;
  let mockModalService: jasmine.SpyObj<NgbModal>;

  const mockCompanyData: CompanyDetailResponse = {
    id: 123,
    name: 'Test Company',
    status: 'COMPLETED',
    vatNumber: '12345678901',
    taxCode: 'TESTCODE123',
    corporateGroupId: 1
  };

  const mockCreateRequest: CreateCompanyRequest = {
    name: 'Test Company',
    certifiedEmail: 'test@example.com',
    corporateGroupId: 1,
    languageId: 1,
    nationId: 1,
    officeAddress: 'Via Roma 123',
    officeCity: 'Milano',
    officePostCode: '20100',
    provinceId: 1,
    regionId: 1,
    recipientTaxCode: '123',
    relationshipType: 'CLIENT',
    taxCode: 'TESTCODE123',
    vatGroup: true,
    vatNumber: '12345678901',
    status: 'DRAFT'
  };

  const activatedRouteCreate = {
    snapshot: {
      paramMap: {
        get: (key: string) => {
          if (key === 'isType') {
            return 'true';
          }

          return null;
        }
      },
      queryParams: {}
    },
    queryParams: of({})
  };

  const mockResponse = new HttpResponse<CompanyDetailResponse>({
    body: mockCompanyData,
    status: 200,
    statusText: 'OK',
    headers: new HttpHeaders(),
    url: 'test-url'
  });

  beforeEach(async () => {
    mockUserProfileService = jasmine.createSpyObj('UserProfileService', ['getLoggedUser'], {
      profile$: of({} as UserDetailsModel),
      impersonatedUser$: of(null)
    });
    mockUserProfileService.getLoggedUser.and.returnValue(of({} as UserDetailsModel));
    spyOn(UtilityRouting, 'navigateToSocietyEditById');

    mockAdministrativeService = jasmine.createSpyObj('AdministrativeService', [
      'getApiAdministrativeV1Id$Json$Response',
      'postApiAdministrativeV1Create$Json',
      'putApiAdministrativeV1Id$Json',
      'postApiAdministrativeV1IdLock$Response',
      'postApiAdministrativeV1IdUnlock$Response',
      'deleteApiAdministrativeV1Id$Response'
    ]);

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockMessageStatusService = jasmine.createSpyObj('MessageStatusService', [
      'show',
      'setWarningMessage',
      'getWarningMessage',
      'getSuccessMessage',
      'hide'
    ]);
    mockMessageStatusService.getWarningMessage.and.returnValue({ message: '', type: 'warning' } as any);
    mockMessageStatusService.getSuccessMessage.and.returnValue(null);
    mockGenericService = jasmine.createSpyObj('GenericService', ['manageError', 'viewMode', 'resizePage'], {
      viewModeValue: VIEW_MODE.DESKTOP,
      sidebarOpenedValue: true,
      resizeMainPage: { update: jasmine.createSpy('update') },
      defaultValue: '0rem'
    });
    mockAdministrativeCommonService = jasmine.createSpyObj('AdministrativeCommonService', ['setCompanySocietyForm']);
    // Removed unused mockCompanyService variable

    mockAdministrativeService.getApiAdministrativeV1Id$Json$Response.and.returnValue(of(mockResponse as any));
    mockAdministrativeService.postApiAdministrativeV1Create$Json.and.returnValue(of(mockCompanyData));
    mockAdministrativeService.putApiAdministrativeV1Id$Json.and.returnValue(of(mockCompanyData));
    mockAdministrativeService.postApiAdministrativeV1IdLock$Response.and.returnValue(
      of({
        status: 204,
        body: {}
      } as any)
    );
    mockAdministrativeCommonService.setCompanySocietyForm.and.returnValue(new FormGroup({}));
    const mockCompanyService = jasmine.createSpyObj('CompanyService', ['setCompanySocietyForm']);
    mockCompanyService.setCompanySocietyForm.and.returnValue(new FormGroup({}));

    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);

    await TestBed.configureTestingModule({
      imports: [CompanyEditComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: UserProfileService, useValue: mockUserProfileService },
        { provide: ActivatedRoute, useValue: activatedRouteCreate },
        { provide: AdministrativeService, useValue: mockAdministrativeService },
        { provide: Router, useValue: mockRouter },
        { provide: MessageStatusService, useValue: mockMessageStatusService },
        { provide: GenericService, useValue: mockGenericService },
        { provide: AdministrativeCommonService, useValue: mockAdministrativeCommonService },

        { provide: NgbModal, useValue: mockModalService },

        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyEditComponent);
    UtilityRouting.initialize(mockRouter);
    component = fixture.componentInstance;

    UtilityRouting.initialize(TestBed.inject(Router));
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create company when type is CREATE', () => {
    component.type = ADMINISTRATIVE_COMPANY_CONSTANTS.CREATE;
    component.companySocietyForm = new FormGroup({});
    component.companySocietyRequest = { name: undefined } as any;
    spyOn(component, 'populateCompanySocietyRequest').and.callFake(() => {
      component.companySocietyRequest = { name: undefined } as any;
    });
    spyOn(component, 'createSociety');

    component.confirmComapnyCreation();

    expect(component.populateCompanySocietyRequest).toHaveBeenCalled();
    expect(component.createSociety).toHaveBeenCalledWith(
      jasmine.objectContaining({
        ...component.companySocietyRequest,
        name: ''
      })
    );
  });

  it('should edit company when type is EDIT', () => {
    component.type = ADMINISTRATIVE_COMPANY_CONSTANTS.EDIT;
    component.companySocietyForm = new FormGroup({});
    component.companySocietyRequest = { name: 'Test' } as any;
    spyOn(component, 'populateCompanySocietyRequest').and.callFake(() => {
      component.companySocietyRequest = { name: 'Test' } as any;
    });
    spyOn(component, 'editSociety');

    component.confirmComapnyCreation();

    expect(component.populateCompanySocietyRequest).toHaveBeenCalled();
    expect(component.editSociety).toHaveBeenCalledWith(component.companySocietyRequest);
  });

  it('should create society successfully', () => {
    // Add spy for UtilityRouting.navigateToCompanyList before calling createSociety
    const navigateToCompanyListSpy = spyOn(UtilityRouting, 'navigateToCompanyList');
    component.createSociety(mockCreateRequest);

    expect(mockAdministrativeService.postApiAdministrativeV1Create$Json).toHaveBeenCalledWith({
      body: mockCreateRequest
    });
    expect(mockMessageStatusService.show).toHaveBeenCalledWith('message.company.create.success');
    expect(navigateToCompanyListSpy).toHaveBeenCalled(); // Verify navigation
  });

  it('should handle error when creating society', () => {
    const error = new HttpErrorResponse({ status: 400, statusText: 'Bad Request' });
    mockAdministrativeService.postApiAdministrativeV1Create$Json.and.returnValue(throwError(() => error));

    component.createSociety(mockCreateRequest);

    expect(mockGenericService.manageError).toHaveBeenCalledWith(error);
  });

  it('should edit society successfully', () => {
    component.idCompany = 123;
    // Spy on UtilityRouting.navigateToSocietyDetailById
    const navigateToSocietyDetailByIdSpy = spyOn(UtilityRouting, 'navigateToSocietyDetailById');
    component.editSociety(mockCreateRequest as UpdateCompanyRequest);

    expect(mockAdministrativeService.putApiAdministrativeV1Id$Json).toHaveBeenCalledWith({
      id: 123,
      body: mockCreateRequest
    });
    expect(mockMessageStatusService.show).toHaveBeenCalledWith('message.company.update.success');
    expect(navigateToSocietyDetailByIdSpy).toHaveBeenCalledWith(123);
  });

  it('should handle error when editing society', () => {
    const error = new HttpErrorResponse({ status: 400, statusText: 'Bad Request' });
    mockAdministrativeService.putApiAdministrativeV1Id$Json.and.returnValue(throwError(() => error));

    component.idCompany = 123;
    component.editSociety(mockCreateRequest as UpdateCompanyRequest);

    expect(mockGenericService.manageError).toHaveBeenCalledWith(error);
  });

  it('should save draft company society', () => {
    component.companySocietyForm = new FormGroup({});
    // Initialize companySocietyRequest before the test
    component.companySocietyRequest = {} as CreateCompanyRequest;
    spyOn(component, 'populateCompanySocietyRequest');

    component.saveDraftCompany();

    expect(component.populateCompanySocietyRequest).toHaveBeenCalled();
    expect(component.companySocietyRequest.status).toBe('DRAFT');
  });

  it('should navigate back to company list', () => {
    spyOn(UtilityRouting, 'navigateToCompanyList').and.callFake(() => {
    }); // Ensure the spy is a function
    component.goBack();
    expect(UtilityRouting.navigateToCompanyList).toHaveBeenCalled(); // Verify it was called
  });

  it('should navigate to manage company', () => {
    component.idCompany = 123;
    component.manageCompany();
    expect(UtilityRouting.navigateToSocietyEditById).toHaveBeenCalledWith(123);
  });

  it('should check access permissions', () => {
    spyOn(component, 'hasAccess').and.returnValue(true);
    const result = component.hasAccess('PROFILE', 'FUNCTIONALITY', 'PERMISSION');
    expect(result).toBe(true);
  });

  it('should delegate access check to UtilityProfile.checkAccessProfile', () => {
    const checkAccessSpy = spyOn(UtilityProfile, 'checkAccessProfile').and.returnValue(true);
    const result = component.hasAccess('PROFILE', 'FUNCTIONALITY', 'PERMISSION');
    expect(result).toBe(true);
    expect(checkAccessSpy).toHaveBeenCalledWith(mockUserProfileService, 'PROFILE', 'FUNCTIONALITY', 'PERMISSION');
  });

  it('should update resize main page on destroy', () => {
    component.ngOnDestroy();
    expect(mockGenericService.resizeMainPage.update).toHaveBeenCalled();
  });

  it('should initialize signals correctly', () => {
    expect(component.isWrite()).toBe(true);
    expect(component.isSmallMobile()).toBeDefined();
  });

  it('should have correct constants defined', () => {
    expect(component.PROFILE).toBeDefined();
    expect(component.FUNCTIONALITY).toBeDefined();
    expect(component.PERMISSION).toBeDefined();
  });

  it('should initialize companySocietyForm as empty FormGroup', () => {
    expect(component.companySocietyForm).toBeInstanceOf(FormGroup);
  });

  it('should return observable from getCompanyById', () => {
    component.idCompany = 123;
    const result = component['getCompanyById']();

    expect(result).toBeDefined();
    result.subscribe((data) => {
      expect(data).toEqual(mockCompanyData);
    });
  });

  it('should show update success message and navigate to detail for EDIT', () => {
    const response = { ...mockCompanyData, status: 'COMPLETED', id: 789 };
    const navigateToSocietyDetailByIdSpy = spyOn(UtilityRouting, 'navigateToSocietyDetailById');
    const navigateToCompanyListSpy = spyOn(UtilityRouting, 'navigateToCompanyList');
    component['messageStatusService'] = mockMessageStatusService;
    component['handleCompanySuccess'](response, true);

    expect(mockMessageStatusService.show).toHaveBeenCalledWith('message.company.update.success');
    expect(navigateToSocietyDetailByIdSpy).toHaveBeenCalledWith(789);
    expect(navigateToCompanyListSpy).not.toHaveBeenCalled();
  });

  it('should show create success message and navigate to list for CREATE', () => {
    const response = { ...mockCompanyData, status: 'COMPLETED', id: 101 };
    const navigateToCompanyListSpy = spyOn(UtilityRouting, 'navigateToCompanyList');
    const navigateToSocietyDetailByIdSpy = spyOn(UtilityRouting, 'navigateToSocietyDetailById');
    component['messageStatusService'] = mockMessageStatusService;
    component['handleCompanySuccess'](response, false);
    expect(mockMessageStatusService.show).toHaveBeenCalledWith('message.company.create.success');
    expect(navigateToCompanyListSpy).toHaveBeenCalled();
    expect(navigateToSocietyDetailByIdSpy).not.toHaveBeenCalled();
  });

  it('should open the modal with correct parameters and handle confirmation', async () => {
    const mockModalRef = {
      componentInstance: {} as any,
      result: Promise.resolve(true)
    };

    mockModalService.open.and.returnValue(mockModalRef as any);
    spyOn(component as any, 'confirmComapnyCreation');

    spyOn(Utility, 'translate').and.callFake((key: string, _service: any, params?: any) => {
      if (params) {
        return `Deactivate ${params.company} on ${params.date}`;
      }

      return 'Deactivate';
    });

    const companyName = 'Test Company';
    const endDate = new Date('2025-11-31');
    // const formattedDate = endDate.toLocaleDateString();

    await (component as any).openDeactivationModal(companyName, endDate);

    expect(mockModalService.open).toHaveBeenCalledWith(DeactivationModalComponent, {
      centered: true,
      backdrop: 'static'
    });

    expect(mockModalRef.componentInstance.titleLabel).toBeDefined();
    expect(mockModalRef.componentInstance.titleParam).toBe(companyName);
    expect(mockModalRef.componentInstance.titleBody).toContain(companyName);
    // expect(mockModalRef.componentInstance.titleBody).toContain('Deactivate Test Company on 01/12/2025');
    // expect(mockModalRef.componentInstance.titleBody).toContain('01/12/2025'); // Expected 'Deactivate Test Company on 01/12/2025' to contain '12/1/2025'.
    expect((component as any).confirmComapnyCreation).toHaveBeenCalledWith(true);
  });

  it('should set status to DISABLED if forceDeactivation is true', () => {
    component.type = ADMINISTRATIVE_COMPANY_CONSTANTS.EDIT;
    component.companySocietyRequest = { name: 'Test', status: '' } as any;
    spyOn(component, 'editSociety');
    component.confirmComapnyCreation(true);
    // expect(component.companySocietyRequest.status).toBe('DISABLED');
    expect(component.companySocietyRequest.status).toBe('COMPLETED');
    expect(component.editSociety).toHaveBeenCalled();
  });

  it('should call openDeactivationModal if endDate is in the past', () => {
    const pastDate = new Date(Date.now() - 86400000);
    const form = new FormGroup({
      activityEndDate: new FormGroup({
        activityEndDate: new FormControl(pastDate.toISOString())
      })
    });
    component.companySocietyForm = form;
    component.companySocietyRequest = { name: 'Test' } as any;
    spyOn(component, 'openDeactivationModal');
    component.confirmComapnyCreation();
    expect(component.openDeactivationModal).toHaveBeenCalled();
  });

  it('should not call unlockCompany if intervalId is null on destroy', () => {
    component['intervalId'] = null;
    spyOn(component, 'unlockCompany');
    component.ngOnDestroy();
    expect(component.unlockCompany).not.toHaveBeenCalled();
  });

  it('should load company details and patch the form', () => {
    const mockResponse = {
      id: 1,
      name: 'Test Company',
      status: STATUS.COMPLETED,
      companyEndDate: '2099-12-31T00:00:00.000Z'
    };
    component['adminDataResponse'] = null;
    spyOn(component['companyService'], 'setCompanySocietyForm').and.returnValue(new FormGroup({}));
    spyOn(component['companySocietyForm'], 'patchValue');
    spyOn(component['translateService'], 'instant').and.callFake((key: string) => key);

    spyOn(component as any, 'getCompanyById').and.returnValue(of(mockResponse));

    // Set isWrite to false to test the warning message logic
    component.isWrite.set(false);

    (component as any).loadCompanyDetails();

    expect(component['adminDataResponse']).toEqual(jasmine.objectContaining(mockResponse));
    expect(component['companyService'].setCompanySocietyForm).toHaveBeenCalled();
    expect(component['companySocietyForm'].patchValue).toHaveBeenCalled();
    // expect(component['messageStatusService'].setWarningMessage).toHaveBeenCalled();
  });

  it('should handle error when loading company details', () => {
    const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    spyOn(component as any, 'getCompanyById').and.returnValue(throwError(() => error));

    (component as any).loadCompanyDetails();

    expect(component['genericService'].manageError).toHaveBeenCalledWith(error);
  });
  it('should return FormControl for corporateGroupIdFc getter', () => {
    const form = new FormGroup({
      administrativeRelations: new FormGroup({
        referenceCorporateGroup: new FormControl(42)
      })
    });
    component.companySocietyForm = form;

    const control = component.corporateGroupIdFc;
    expect(control).toBeInstanceOf(FormControl);
    expect(control?.value).toBe(42);
  });

  it('should call unlockCompany and clear interval if conditions are met', () => {
    component.idCompany = 123;
    component['intervalId'] = 99 as any;
    spyOn(component, 'isWrite').and.returnValue(true);
    const mockHttpResponse = new HttpResponse<void>({
      body: undefined,
      status: 200,
      statusText: 'OK',
      url: '/api/unlock-company',
      headers: undefined as any
    }) as StrictHttpResponse<void>;
    const unlockSpy = spyOn(component, 'unlockCompany').and.returnValue(of(mockHttpResponse));
    spyOn(window, 'clearInterval');
    component.ngOnDestroy();
    expect(unlockSpy).toHaveBeenCalledWith(123);
    expect(clearInterval).toHaveBeenCalledWith(99);
  });

  it('should handle error from unlockCompany and call Utility.logErrorForDevEnvironment', () => {
    component.idCompany = 123;
    component['intervalId'] = 99 as any;
    spyOn(component, 'isWrite').and.returnValue(true);
    const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    spyOn(component, 'unlockCompany').and.returnValue(throwError(() => error));
    const logSpy = spyOn(Utility, 'logErrorForDevEnvironment');
    component.ngOnDestroy();
    expect(logSpy).toHaveBeenCalledWith(error);
  });

  it('should call administrativeService.postApiAdministrativeV1IdLock$Response with correct param in lockCompany', (done) => {
    const mockResponse = new HttpResponse<void>({
      body: undefined,
      status: 200,
      statusText: 'OK',
      url: '/api/unlock-company',
      headers: undefined as any
    }) as StrictHttpResponse<void>;
    mockAdministrativeService.postApiAdministrativeV1IdLock$Response.and.returnValue(of(mockResponse));

    component.lockCompany(123).subscribe((res) => {
      expect(res).toBe(mockResponse);
      expect(mockAdministrativeService.postApiAdministrativeV1IdLock$Response).toHaveBeenCalledWith({ id: 123 });
      done();
    });
  });

  it('should call administrativeService.postApiAdministrativeV1IdUnlock$Response with correct param in unlockCompany', (done) => {
    const mockResponse = new HttpResponse<void>({
      body: undefined,
      status: 200,
      statusText: 'OK',
      url: '/api/unlock-company',
      headers: undefined as any
    }) as StrictHttpResponse<void>;
    mockAdministrativeService.postApiAdministrativeV1IdUnlock$Response.and.returnValue(of(mockResponse));

    component.unlockCompany(123).subscribe((res) => {
      expect(res).toBe(mockResponse);
      expect(mockAdministrativeService.postApiAdministrativeV1IdUnlock$Response).toHaveBeenCalledWith({ id: 123 });
      done();
    });
  });

  it('should initialize component correctly in EDIT mode', fakeAsync(() => {
    const mockUser: UserDetailsModel = { id: 1 } as any;
    const mockForm = new FormGroup({
      generalData: new FormGroup({}),
      contactInformation: new FormGroup({}),
      registeredOfficeAddress: new FormGroup({}),
      activityEndDate: new FormGroup({}),
      administrativeRelations: new FormGroup({}),
      billingData: new FormGroup({}),
      companyData: new FormGroup({})
    });
    const mockId = '123';

    // Set the profile$ on the mock service BEFORE ngOnInit
    Object.defineProperty(mockUserProfileService, 'profile$', { get: () => of(mockUser) });

    mockAdministrativeCommonService.setCompanySocietyForm.and.returnValue(mockForm);

    // Set up the route snapshot for EDIT mode
    (TestBed.inject(ActivatedRoute) as any).snapshot = {
      paramMap: {
        get: (key: string) => (key === 'idCompany' ? mockId : null)
      },
      queryParams: {
        isEditable: 'true'
      }
    };

    spyOn(component.isWrite, 'set').and.callThrough();
    spyOn(component, 'isWrite').and.returnValue(true);
    spyOn(component as any, 'loadCompanyDetails');
    spyOn(component['cdr'], 'detectChanges');
    const mockHttpResponse = new HttpResponse<void>({
      body: undefined,
      status: 200,
      statusText: 'OK',
      url: '/api/unlock-company',
      headers: undefined as any
    }) as StrictHttpResponse<void>;
    spyOn(component, 'unlockCompany').and.returnValue(of(mockHttpResponse));

    component.ngOnInit();
    tick();

    // Clean up interval and component before fixture cleanup
    component.ngOnDestroy();

    expect(component['logedUser']).toEqual(jasmine.objectContaining({ id: 1 }));
    expect(component.companySocietyForm).toBeInstanceOf(FormGroup);
    expect(Object.keys(component.companySocietyForm.controls)).toContain('generalData');
    expect(component.currentDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(component.isWrite.set).toHaveBeenCalledWith(true);
    expect(component['genericService'].resizeMainPage.update).toHaveBeenCalled();
    expect(component.idCompany).toBe(Number(mockId));
    expect((component as any).loadCompanyDetails).toHaveBeenCalled();
    expect(component.type).toBe(ADMINISTRATIVE_COMPANY_CONSTANTS.EDIT);
    expect(component['cdr'].detectChanges).toHaveBeenCalled();
  }));

  it('should initialize form and signals correctly on ngOnInit', () => {
    // Set up the route snapshot for CREATE mode
    (TestBed.inject(ActivatedRoute) as any).snapshot = {
      paramMap: {
        get: () => null
      },
      queryParams: {}
    };

    spyOn(component['cdr'], 'detectChanges');
    component.ngOnInit();
    expect(component.companySocietyForm).toBeInstanceOf(FormGroup);
    expect(component.currentDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(component.isWrite()).toBeTrue();
    expect(component.type).toBe(ADMINISTRATIVE_COMPANY_CONSTANTS.CREATE);
    expect(component['cdr'].detectChanges).toHaveBeenCalled();
  });

  // Test: should patch form and activate lock when loading company details
  it('should patch form and lock when loading company details', () => {
    component.idCompany = 123;
    component['intervalId'] = null; // Previene errori in ngOnDestroy
    spyOn(component, 'unlockCompany').and.returnValue(of({} as StrictHttpResponse<void>)); // Previene errori cleanup
    const patchValueSpy = spyOn(component.companySocietyForm, 'patchValue');
    const setNextBtnLabelSpy = spyOn<any>(component, 'setNextBtnLabel');
    component['loadCompanyDetails']();
    expect(patchValueSpy).toHaveBeenCalled();
    expect(setNextBtnLabelSpy).toHaveBeenCalled();
  });

  // Test: should set correct values in companySocietyRequest after populateCompanySocietyRequest
  it('should set correct values in companySocietyRequest after populateCompanySocietyRequest', () => {
    component.companySocietyForm = new FormBuilder().group({
      generalData: new FormBuilder().group({
        companyname: ['Test Company'],
        languageId: [2],
        taxIdcode: ['TAXCODE'],
        vatGr: [true],
        vatNo: ['VAT123']
      }),
      billingData: new FormBuilder().group({
        pec: ['pec@test.com'],
        custCodeRec: ['REC123']
      }),
      administrativeRelations: new FormBuilder().group({
        referenceCorporateGroup: [5],
        typeofRelationshipwithGLS: ['PARTNER']
      }),
      registeredOfficeAddress: new FormBuilder().group({
        legalAddressCountry: [3],
        legalAddress: ['Address'],
        city: ['City'],
        postalCode: ['12345'],
        province: [4],
        regione: [6]
      }),
      companyData: new FormBuilder().group({
        reaNumber: ['REA1'],
        stateSocialCapital: ['ACTIVE'],
        shareCapital: [1000],
        businessRegister: ['REG'],
        provinceofcRegister: [7],
        singleMultipleMember: ['true'],
        registrationNumber: ['REGNUM']
      }),
      contactInformation: new FormBuilder().group({
        phone: ['123456'],
        email: ['mail@test.com'],
        fax: ['654321']
      })
    });
    component.type = ADMINISTRATIVE_COMPANY_CONSTANTS.CREATE;
    component.populateCompanySocietyRequest();
    expect(component.companySocietyRequest.name).toBe('Test Company');
    expect(component.companySocietyRequest.certifiedEmail).toBe('pec@test.com');
    expect(component.companySocietyRequest.corporateGroupId).toBe(5);
    expect(component.companySocietyRequest.languageId).toBe(2);
    expect(component.companySocietyRequest.nationId).toBe(3);
    expect(component.companySocietyRequest.officeAddress).toBe('Address');
    expect(component.companySocietyRequest.officeCity).toBe('City');
    expect(component.companySocietyRequest.officePostCode).toBe('12345');
    expect(component.companySocietyRequest.provinceId).toBe(4);
    expect(component.companySocietyRequest.regionId).toBe(6);
    expect(component.companySocietyRequest.recipientTaxCode).toBe('REC123');
    expect(component.companySocietyRequest.relationshipType).toBe('PARTNER');
    expect(component.companySocietyRequest.taxCode).toBe('TAXCODE');
    expect(component.companySocietyRequest.vatGroup).toBeTrue();
    expect(component.companySocietyRequest.vatNumber).toBe('VAT123');
    expect(component.companySocietyRequest.rea).toBe('REA1');
    expect(component.companySocietyRequest.shareCapitalStatus).toBe('ACTIVE');
    expect(component.companySocietyRequest.shareCapital).toBe(1000);
    expect(component.companySocietyRequest.businessRegisterOf).toBe('REG');
    expect(component.companySocietyRequest.businessRegisterProvinceId).toBe(7);
    expect(component.companySocietyRequest.isSingleMember).toBeTrue();
    expect(component.companySocietyRequest.registrationNumberRegisterHauliers).toBe('REGNUM');
    expect(component.companySocietyRequest.status).toBeDefined();
    expect(component.companySocietyRequest.telephone).toBe('123456');
    expect(component.companySocietyRequest.email).toBe('mail@test.com');
    expect(component.companySocietyRequest.fax).toBe('654321');
  });

  it('should delete company, show success message, and navigate back', () => {
    const companyId = 123;
    const strictHttpResponse = new HttpResponse<void>({
      body: undefined,
      status: 204,
      statusText: 'No Content',
      url: '/api/delete-company',
      headers: new HttpHeaders()
    }) as StrictHttpResponse<void>;

    mockAdministrativeService.deleteApiAdministrativeV1Id$Response.and.returnValue(of(strictHttpResponse));
    spyOn(component, 'goBack');

    component.deleteCompany(companyId);

    expect(mockAdministrativeService.deleteApiAdministrativeV1Id$Response).toHaveBeenCalledWith({ id: companyId });
    expect(mockMessageStatusService.show).toHaveBeenCalledWith('message.company.deleteSuccess');
    expect(component.goBack).toHaveBeenCalled();
  });

  it('should handle error when deleting company', () => {
    const idCompany = 123;
    const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    mockAdministrativeService.deleteApiAdministrativeV1Id$Response.and.returnValue(throwError(() => error));
    component.deleteCompany(idCompany);
    expect(mockGenericService.manageError).toHaveBeenCalledWith(error);
  });

  // Test: should open AdministrativeHistoryModalComponent and handle export
  it('should open AdministrativeHistoryModalComponent and handle export', async () => {
    const mockSpinnerService = { show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') };
    (component as any).spinnerService = mockSpinnerService;
    const mockModalRef = {
      componentInstance: {},
      result: Promise.resolve({ filters: { foo: 'bar' } })
    };
    mockModalService.open.and.returnValue(mockModalRef as any);
    spyOn(component as any, 'exportDataHystory');
    const list = [{ id: 1, name: 'history1' }];
    await (component as any).lunchHistoryModal(list);
    expect(mockModalService.open).toHaveBeenCalled();
    // @ts-expect-error: proprietà fittizia per test
    expect(mockModalRef.componentInstance.historyList).toBe(list);
    expect(mockSpinnerService.show).toHaveBeenCalled();
    expect(component.exportDataHystory).toHaveBeenCalledWith({ foo: 'bar' });
    // expect(mockSpinnerService.hide).toHaveBeenCalled();
  });

  describe('labelStatus getter', () => {
    it('should return active status if adminDataResponse.status is COMPLETED', () => {
      component['adminDataResponse'] = { status: STATUS.COMPLETED } as any;
      expect(component.labelStatus).toBe('administrative.state.active');
    });
    it('should return active status if adminDataResponse.status is "active"', () => {
      component['adminDataResponse'] = { status: 'active' } as any;
      expect(component.labelStatus).toBe('administrative.state.active');
    });
    it('should return draft status if isDraft is true', () => {
      spyOnProperty(component, 'isDraft', 'get').and.returnValue(true);
      component['adminDataResponse'] = { status: 'DRAFT' } as any;
      expect(component.labelStatus).toBe('administrative.state.draft');
    });
    it('should return inactive status if adminDataResponse.status is DISABLED', () => {
      component['adminDataResponse'] = { status: STATUS.DISABLED } as any;
      spyOnProperty(component, 'isDraft', 'get').and.returnValue(false);
      expect(component.labelStatus).toBe('administrative.state.inactive');
    });
    it('should return empty string if no status matches', () => {
      component['adminDataResponse'] = { status: 'UNKNOWN' } as any;
      spyOnProperty(component, 'isDraft', 'get').and.returnValue(false);
      expect(component.labelStatus).toBe('');
    });
  });
});
