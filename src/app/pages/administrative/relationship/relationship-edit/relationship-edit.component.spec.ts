/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RelationshipEditComponent } from './relationship-edit.component';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { AdministrativeCommonService } from '../../services/administrative.service';
import { CustomerService } from '../../../../api/glsAdministrativeApi/services/customer.service';
import { AgentService } from '../../../../api/glsAdministrativeApi/services/agent.service';
import { SubjectService } from '../../../../api/glsAdministrativeApi/services';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RelationshipType } from '../enum/relationship-type';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { Utility } from '../../../../common/utilities/utility';

describe('RelationshipEditComponent', () => {
  let component: RelationshipEditComponent;
  let fixture: ComponentFixture<RelationshipEditComponent>;
  let mockActivatedRoute: any;
  let mockGenericService: jasmine.SpyObj<GenericService>;
  let mockAdministrativeService: jasmine.SpyObj<AdministrativeCommonService>;
  let mockCustomerService: jasmine.SpyObj<CustomerService>;
  let mockAgentService: jasmine.SpyObj<AgentService>;
  let mockSubjectService: jasmine.SpyObj<SubjectService>;
  let mockMessageStatusService: jasmine.SpyObj<MessageStatusService>;
  let mockUserProfileService: jasmine.SpyObj<UserProfileService>;
  let mockModalService: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => {
            if (key === 'idRelationship') {
              return null;
            }
            if (key === 'fromType') {
              return RelationshipType.Customer;
            }

            return null;
          }
        },
        queryParams: {}
      }
    };

    mockGenericService = jasmine.createSpyObj('GenericService', ['resizePage', 'manageError', 'openErrorModal'], {
      resizeMainPage: { set: jasmine.createSpy('set') },
      defaultValue: () => true
    });

    mockAdministrativeService = jasmine.createSpyObj('AdministrativeCommonService', [
      'setDetailRelationshipAgent',
      'setDetailRelationshipCustomer'
    ]);
    mockCustomerService = jasmine.createSpyObj('CustomerService', [
      'getApiCustomerV1Id$Json',
      'postApiCustomerV1Create$Json',
      'patchApiCustomerV1Id$Json',
      'postApiCustomerV1GenerateCode$Json',
      'postApiCustomerV1IdLock$Response',
      'postApiCustomerV1IdUnlock$Response'
    ]);
    mockAgentService = jasmine.createSpyObj('AgentService', [
      'getApiAgentV1Id$Json',
      'postApiAgentV1Create$Json',
      'patchApiAgentV1Id$Json',
      'postApiAgentV1GenerateCode$Json',
      'postApiAgentV1IdLock$Response',
      'postApiAgentV1IdUnlock$Response'
    ]);
    mockSubjectService = jasmine.createSpyObj('SubjectService', ['getApiSubjectV1Id$Json']);
    mockMessageStatusService = jasmine.createSpyObj('MessageStatusService', ['show', 'setSuccessMessage']);
    mockUserProfileService = jasmine.createSpyObj('UserProfileService', [], {
      profile$: of(null),
      impersonatedUser$: of(null)
    });
    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RelationshipEditComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: GenericService, useValue: mockGenericService },
        { provide: AdministrativeCommonService, useValue: mockAdministrativeService },
        { provide: CustomerService, useValue: mockCustomerService },
        { provide: AgentService, useValue: mockAgentService },
        { provide: SubjectService, useValue: mockSubjectService },
        { provide: MessageStatusService, useValue: mockMessageStatusService },
        { provide: UserProfileService, useValue: mockUserProfileService },
        { provide: NgbModal, useValue: mockModalService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationshipEditComponent);
    component = fixture.componentInstance;
    // Mock form with required controls for template
    component.relationshipForm = new FormGroup({
      categoryId: new FormControl(''),
      administrativeId: new FormControl(''),
      agentCode: new FormControl(''),
      customerCode: new FormControl(''),
      endOfRelationshipValidity: new FormControl(''),
      financialDetail: new FormGroup({}),
      invoiceDetail: new FormGroup({
        startOfAccountingActivity: new FormControl(''),
        endOfAccountingActivity: new FormControl('')
      }),
      bankDetail: new FormGroup({
        bankId: new FormControl(''),
        remittanceBankId: new FormControl(''),
        bankCredit: new FormControl('')
      }),
      typeRelationship: new FormControl(''),
      subjectId: new FormControl('')
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and call resizePage', () => {
    // Evita fixture.detectChanges() per questo test
    spyOn(component as any, 'loadRelationshipData');
    spyOn(component as any, 'lockUnlock');
    spyOn(component as any, 'retrieveLoggedUserPrfile');
    component.ngOnInit();
    expect(mockGenericService.resizePage).toHaveBeenCalled();
    expect((component as any).loadRelationshipData).toHaveBeenCalled();
    expect((component as any).lockUnlock).toHaveBeenCalled();
    expect((component as any).retrieveLoggedUserPrfile).toHaveBeenCalled();
  });

  it('should increment activeStep on nextStep', () => {
    component.activeStep = 0;
    component.nextStep();
    expect(component.activeStep).toBe(1);
  });

  it('should set activeStep on getStepperValue', () => {
    component.getStepperValue({ index: 2 });
    expect(component.activeStep).toBe(2);
  });

  it('should return correct label for save', () => {
    component.type = 'edit';
    expect(component.getLabelSave()).toContain('saveUpdates');
    component.type = 'create';
    expect(component.getLabelSave()).toContain('confirm');
  });

  it('should return true for isFromAgent when fromType is Agent', () => {
    component.fromType = RelationshipType.Agent;
    expect(component.isFromAgent()).toBeTrue();
  });

  it('should call saveRelationship for new customer', () => {
    spyOn(component as any, 'callApiRelationshipCustomer');
    spyOn(component as any, 'callApiRelationshipAgent');
    component['idRelationship'] = undefined;
    component.fromType = RelationshipType.Customer;
    component.chooseAgentRelationship = false;
    component.saveRelationship(false);
    expect((component as any).callApiRelationshipCustomer).toHaveBeenCalled();
    component.chooseAgentRelationship = true;
    component.saveRelationship(false);
    expect((component as any).callApiRelationshipAgent).toHaveBeenCalled();
  });

  it('should call checkEndRelationship for existing relationship', () => {
    spyOn(component as any, 'checkEndRelationship');
    component['idRelationship'] = 123;
    component.saveRelationship(false);
    expect((component as any).checkEndRelationship).toHaveBeenCalled();
  });

  it('should unsubscribe and unlock on ngOnDestroy', fakeAsync(() => {
    component['idRelationship'] = 1;
    component['intervalId'] = setInterval(() => {}, 1000);
    // Mock StrictHttpResponse<void>
    const mockStrictHttpResponse = {
      body: undefined,
      type: 4,
      clone: () => mockStrictHttpResponse,
      headers: undefined,
      status: 200,
      statusText: 'OK',
      url: '',
      ok: true
    } as any;
    spyOn(component, 'unlockRelationship').and.returnValue(of(mockStrictHttpResponse));
    component['administrativeIdSubscription'] = { unsubscribe: jasmine.createSpy('unsubscribe') } as any;
    component.ngOnDestroy();
    tick();
    expect(component.unlockRelationship).toHaveBeenCalledWith(1);
    expect(component['administrativeIdSubscription']?.unsubscribe).toHaveBeenCalled();
  }));

  it('should set isSubjectSelected on onSubjectSelected', () => {
    component.onSubjectSelected(true);
    expect(component.isSubjectSelected).toBeTrue();
  });

  it('should return correct subtitle', () => {
    component['idRelationship'] = 1;
    spyOn(component, 'isFromSubject').and.returnValues(false, true);
    expect(component.getSubtitleRelatioshipEdit()).toContain('subtitleEdit');
    expect(component.getSubtitleRelatioshipEdit()).toContain('subtitle');
  });

  it('should return false for disableSaveDraft if not from customer', () => {
    component.isFromCustomer.set(false);
    expect(component.disableSaveDraft()).toBeFalse();
  });

  it('should return true for disableSaveDraft if from customer and categoryId is falsy', () => {
    component.fromType = RelationshipType.Customer;
    component.isFromCustomer.set(true);
    component.relationshipForm.get('categoryId')?.setValue('');
    expect(component.disableSaveDraft()).toBeTrue();
  });

  it('should return false for disableSaveDraft if from customer and categoryId is truthy', () => {
    component.fromType = RelationshipType.Customer;
    component.isFromCustomer.set(true);
    component.relationshipForm.get('categoryId')?.setValue('cat');
    expect(component.disableSaveDraft()).toBeFalse();
  });

  it('should return correct value for isDisabledNextStep on first step with valid form', () => {
    component.activeStep = 0;
    component['idRelationship'] = undefined;
    component.fromType = RelationshipType.Customer;
    component.relationshipForm.get('customerCode')?.setErrors(null);
    component.relationshipForm.get('administrativeId')?.setErrors(null);
    spyOnProperty(component.relationshipForm.get('customerCode')!, 'invalid', 'get').and.returnValue(false);
    spyOnProperty(component.relationshipForm.get('administrativeId')!, 'invalid', 'get').and.returnValue(false);
    expect(component.isDisabledNextStep()).toBeFalse();
  });

  it('should return true for isDisabledNextStep on first step with invalid form', () => {
    component.activeStep = 0;
    component['idRelationship'] = undefined;
    component.fromType = RelationshipType.Customer;
    // Simula che il controllo typeRelationship sia richiesto ma non valorizzato
    component.relationshipForm.get('typeRelationship')?.setValue('');
    spyOnProperty(component.relationshipForm.get('administrativeId')!, 'invalid', 'get').and.returnValue(false);
    // Usa Object.defineProperty per la proprietà 'value'
    Object.defineProperty(component.relationshipForm.get('typeRelationship')!, 'value', {
      get: () => ''
    });
    expect(component.isDisabledNextStep()).toBeTrue();
  });

  it('should return false for isDisabledNextStep if idRelationship is set', () => {
    component.activeStep = 0;
    component['idRelationship'] = 1;
    expect(component.isDisabledNextStep()).toBeFalse();
  });

  it('should return correct value for isDisabledNextStep on step 1 with isWritingSubject true', () => {
    component.activeStep = 1;
    spyOn(component, 'isWritingSubject').and.returnValue(true);
    component.isSubjectSelected = false;
    expect(component.isDisabledNextStep()).toBeTrue();
    component.isSubjectSelected = true;
    expect(component.isDisabledNextStep()).toBeFalse();
  });

  it('should return correct value for isSectionInvalid', () => {
    component['idRelationship'] = 1;
    component.relationshipForm.get('categoryId')?.setErrors({ required: true });
    expect(component.isSectionInvalid('generalData')).toBeTrue();
    component.relationshipForm.get('categoryId')?.setErrors(null);
    expect(component.isSectionInvalid('generalData')).toBeFalse();
    expect(component.isSectionInvalid('commercialData')).toBeFalse();
    expect(component.isSectionInvalid('otherData')).toBeFalse();
    expect(component.isSectionInvalid('unknown')).toBeFalse();
  });

  it('should call setBankDetailApi and set correct values', () => {
    const event = { id: 123 };
    component.setBankDetailApi(event as any, false);
    expect(component.relationshipForm.get('bankDetail')?.get('bankId')?.value).toBe(123);
    component.setBankDetailApi(event as any, true);
    expect(component.relationshipForm.get('bankDetail')?.get('remittanceBankId')?.value).toBe(123);
  });

  it('should call goToExit and navigate', () => {
    spyOn<any>(component, 'goToExit').and.callThrough();
    spyOn<any>(UtilityRouting, 'navigateToRelationshipExit');
    component.fromType = RelationshipType.Customer;
    component.subjectId = 5;
    component.goToExit();
    expect(UtilityRouting.navigateToRelationshipExit).toHaveBeenCalledWith(RelationshipType.Customer, 5);
  });

  it('should return correct third stepper title', () => {
    component.fromType = RelationshipType.Customer;
    component.chooseAgentRelationship = false;
    expect(component.getThirdStepperTitle()).toBe('biographicalData');
    component.chooseAgentRelationship = true;
    expect(component.getThirdStepperTitle()).toBe('generalData');
    component.fromType = RelationshipType.Agent;
    expect(component.getThirdStepperTitle()).toBe('generalData');
    component.fromType = RelationshipType.Subject;
    expect(component.getThirdStepperTitle()).toBe('generalData');
  });

  it('should return correct value for isWritingSubject', () => {
    component['idRelationship'] = undefined;
    expect(component.isWritingSubject()).toBeTrue();
    component['idRelationship'] = 0;
    expect(component.isWritingSubject()).toBeTrue();
    component['idRelationship'] = 1;
    expect(component.isWritingSubject()).toBeFalse();
  });

  it('should call getFinancialDetail, getBillingDataForm, getBankingDataForm', () => {
    expect(component.getFinancialDetail()).toBeTruthy();
    expect(component.getBillingDataForm()).toBeTruthy();
    expect(component.getBankingDataForm()).toBeTruthy();
  });

  it('should call lockRelationship with correct service for Agent', () => {
    component.fromType = RelationshipType.Agent;
    component['idRelationship'] = 10;
    component.lockRelationship(10);
    expect(mockAgentService.postApiAgentV1IdLock$Response).toHaveBeenCalledWith({ id: 10 });
  });

  it('should call lockRelationship with correct service for Customer', () => {
    component.fromType = RelationshipType.Customer;
    component['idRelationship'] = 20;
    component.lockRelationship(20);
    expect(mockCustomerService.postApiCustomerV1IdLock$Response).toHaveBeenCalledWith({ id: 20 });
  });

  it('should call unlockRelationship with correct service for Agent', () => {
    component.fromType = RelationshipType.Agent;
    component['idRelationship'] = 11;
    component.unlockRelationship(11);
    expect(mockAgentService.postApiAgentV1IdUnlock$Response).toHaveBeenCalledWith({ id: 11 });
  });

  it('should call unlockRelationship with correct service for Customer', () => {
    component.fromType = RelationshipType.Customer;
    component['idRelationship'] = 21;
    component.unlockRelationship(21);
    expect(mockCustomerService.postApiCustomerV1IdUnlock$Response).toHaveBeenCalledWith({ id: 21 });
  });

  it('should call redirect and navigate to subject-list', () => {
    spyOn(UtilityRouting, 'navigateTo');
    component.redirect();
    expect(UtilityRouting.navigateTo).toHaveBeenCalledWith('administrative/subject-list');
  });

  it('should return false for isSectionInvalid if idRelationship is falsy', () => {
    component['idRelationship'] = undefined;
    expect(component.isSectionInvalid('generalData')).toBeFalse();
  });

  it('should return false for isSectionInvalid for unknown section', () => {
    component['idRelationship'] = 1;
    expect(component.isSectionInvalid('notExisting')).toBeFalse();
  });

  it('should return correct headerTitle for Agent', () => {
    component.fromType = RelationshipType.Agent;
    component.title = 'administrative.relationshipDetail.newAgent';
    component['secondLabel'] = 'XYZ';
    expect(component.headerTitle).toContain('administrative.relationshipDetail.newAgent');
    expect(component.headerTitle).toContain('XYZ');
  });

  it('should return correct headerTitle for Customer', () => {
    component.fromType = RelationshipType.Customer;
    component.title = 'administrative.relationshipDetail.newClient';
    component['secondLabel'] = '123';
    expect(component.headerTitle).toContain('administrative.relationshipDetail.newClient');
    expect(component.headerTitle).toContain('123');
  });

  it('should call onSubjectSelected and set isSubjectSelected', () => {
    component.onSubjectSelected(false);
    expect(component.isSubjectSelected).toBeFalse();
    component.onSubjectSelected(true);
    expect(component.isSubjectSelected).toBeTrue();
  });

  it('should call setBankDetailApi with undefined event', () => {
    component.setBankDetailApi(undefined, false);
    expect(component.relationshipForm.get('bankDetail')?.get('bankId')?.value).toBeNull();
    component.setBankDetailApi(undefined, true);
    expect(component.relationshipForm.get('bankDetail')?.get('remittanceBankId')?.value).toBeNull();
  });

  it('should return correct value for getLabelSave', () => {
    component.type = 'edit';
    expect(component.getLabelSave()).toBe('administrative.relationshipEdit.footerButtonsRelation.saveUpdates');
    component.type = 'create';
    expect(component.getLabelSave()).toBe('administrative.relationshipEdit.footerButtonsRelation.confirm');
  });

  it('should return correct value for getSubtitleRelatioshipEdit', () => {
    component['idRelationship'] = 1;
    spyOn(component, 'isFromSubject').and.returnValue(false);
    expect(component.getSubtitleRelatioshipEdit()).toBe('administrative.relationshipEdit.subtitleEdit');
    (component.isFromSubject as any).and.returnValue(true);
    expect(component.getSubtitleRelatioshipEdit()).toBe('administrative.relationshipEdit.subtitle');
  });

  it('should return correct value for getThirdStepperTitle', () => {
    component.fromType = RelationshipType.Customer;
    component.chooseAgentRelationship = false;
    expect(component.getThirdStepperTitle()).toBe('biographicalData');
    component.chooseAgentRelationship = true;
    expect(component.getThirdStepperTitle()).toBe('generalData');
    component.fromType = RelationshipType.Agent;
    expect(component.getThirdStepperTitle()).toBe('generalData');
    component.fromType = RelationshipType.Subject;
    expect(component.getThirdStepperTitle()).toBe('generalData');
  });

  it('should return correct value for isFromAgent', () => {
    component.fromType = RelationshipType.Agent;
    expect(component.isFromAgent()).toBeTrue();
    component.fromType = RelationshipType.Customer;
    expect(component.isFromAgent()).toBeFalse();
  });

  it('should return correct value for isWritingSubject', () => {
    component['idRelationship'] = undefined;
    expect(component.isWritingSubject()).toBeTrue();
    component['idRelationship'] = 0;
    expect(component.isWritingSubject()).toBeTrue();
    component['idRelationship'] = 1;
    expect(component.isWritingSubject()).toBeFalse();
  });

  it('should return correct value for getFinancialDetail, getBillingDataForm, getBankingDataForm', () => {
    expect(component.getFinancialDetail()).toBeTruthy();
    expect(component.getBillingDataForm()).toBeTruthy();
    expect(component.getBankingDataForm()).toBeTruthy();
  });

  it('should call parseDecimalValues for agent', () => {
    const body: any = { percentageProvision: '10.5', turnoverImp: '20.1', provisionalImp: '30.2' };
    component['parseDecimalValues'](true, body);
    expect(body.percentageProvision).toBe(10.5);
    expect(body.turnoverImp).toBe(20.1);
    expect(body.provisionalImp).toBe(30.2);
  });

  it('should call parseDecimalValues for customer', () => {
    const body: any = {
      fixedRight: '1.1',
      provPercentage: '2.2',
      discount1: '3.3',
      discount2: '4.4',
      discount3: '5.5',
      bankDetail: { bankCredit: '6.6' }
    };
    component['parseDecimalValues'](false, body);
    expect(body.fixedRight).toBe(1.1);
    expect(body.provPercentage).toBe(2.2);
    expect(body.discount1).toBe(3.3);
    expect(body.discount2).toBe(4.4);
    expect(body.discount3).toBe(5.5);
    expect(body.bankDetail.bankCredit).toBe(6.6);
  });

  it('should call parseDateValues for agent', () => {
    spyOn(Utility, 'convertFromGenericDataToIsoString').and.callFake((v: any) => (v ? '2024-01-01' : ''));
    const body: any = { startOfAccountingActivity: '01/01/2024', endOfAccountingActivity: '02/01/2024' };
    component['parseDateValues'](true, body);
    expect(body.startOfAccountingActivity).toBeTruthy();
    expect(body.endOfAccountingActivity).toBeTruthy();
  });

  it('should call parseDateValues for customer', () => {
    spyOn(Utility, 'convertFromGenericDataToIsoString').and.callFake((v: any) => (v ? '2024-01-01' : ''));
    const body: any = {
      invoiceDetail: {
        startOfAccountingActivity: '01/01/2024',
        endOfAccountingActivity: '02/01/2024'
      },
      financialDetail: {
        declarationOfIntentDate: '03/01/2024'
      }
    };
    component['parseDateValues'](false, body);
    expect(body.invoiceDetail.startOfAccountingActivity).toBeTruthy();
    expect(body.invoiceDetail.endOfAccountingActivity).toBeTruthy();
    expect(body.financialDetail.declarationOfIntentDate).toBeTruthy();
  });

  it('should call setDefaultForm for subject', () => {
    spyOn(component, 'isFromSubject').and.returnValue(true);
    spyOn(component['administrativeService'], 'setDetailRelationshipCustomer').and.returnValue(new FormGroup({}));
    component['setDefaultForm']();
    expect(component['administrativeService'].setDetailRelationshipCustomer).toHaveBeenCalled();
  });

  it('should call setDefaultForm for customer', () => {
    spyOn(component, 'isFromSubject').and.returnValue(false);
    spyOn(component, 'isFromCustomer').and.returnValue(true);
    component.fromType = RelationshipType.Customer;
    spyOn(component['administrativeService'], 'setDetailRelationshipCustomer').and.returnValue(new FormGroup({}));
    component['setDefaultForm']();
    expect(component['administrativeService'].setDetailRelationshipCustomer).toHaveBeenCalled();
  });

  it('should call setDefaultForm for agent', () => {
    spyOn(component, 'isFromSubject').and.returnValue(false);
    spyOn(component, 'isFromCustomer').and.returnValue(false);
    spyOn(component['administrativeService'], 'setDetailRelationshipAgent').and.returnValue(new FormGroup({}));
    component['setDefaultForm']();
    expect(component['administrativeService'].setDetailRelationshipAgent).toHaveBeenCalled();
  });

  it('should call buildFormsStepper for subject', () => {
    spyOn(component, 'isFromSubject').and.returnValue(true);
    spyOn(component, 'isWritingSubject').and.returnValue(false);
    spyOn(component as any, 'setSubjectValues');
    component['relationshipData'] = {} as any;
    component['personalData'] = {} as any;
    component['relationshipForm'] = new FormGroup({});
    component['buildFormsStepper']();
    expect(component['steps'].length).toBeGreaterThan(1);
    expect((component as any).setSubjectValues).toHaveBeenCalled();
  });

  it('should call buildFormsStepper for not subject and writing subject', () => {
    spyOn(component, 'isFromSubject').and.returnValue(false);
    spyOn(component, 'isWritingSubject').and.returnValue(true);
    component['relationshipData'] = {} as any;
    component['personalData'] = {} as any;
    component['createSubject'] = {} as any;
    component['relationshipForm'] = new FormGroup({});
    component['buildFormsStepper']();
    expect(component['steps'].length).toBeGreaterThan(2);
  });

  it('should call buildFormsStepper for not subject and not writing subject', () => {
    spyOn(component, 'isFromSubject').and.returnValue(false);
    spyOn(component, 'isWritingSubject').and.returnValue(false);
    component['relationshipData'] = {} as any;
    component['personalData'] = {} as any;
    component['relationshipForm'] = new FormGroup({});
    component['buildFormsStepper']();
    expect(component['steps'].length).toBe(2);
  });

  it('should call getLabelTitleModal for agent', () => {
    component.fromType = RelationshipType.Agent;
    spyOn(component, 'isFromAgent').and.returnValue(true);
    (component as any).secondLabel = 'A1';
    spyOn(Utility, 'translate').and.returnValue('AgentLabel');
    const result = component['getLabelTitleModal']();
    expect(result).toContain('A1');
    expect(result).toContain('AgentLabel');
  });

  it('should call getLabelTitleModal for customer', () => {
    component.fromType = RelationshipType.Customer;
    spyOn(component, 'isFromAgent').and.returnValue(false);
    (component as any).secondLabel = 'C1';
    spyOn(Utility, 'translate').and.returnValue('ClientLabel');
    const result = component['getLabelTitleModal']();
    expect(result).toContain('C1');
    expect(result).toContain('ClientLabel');
  });

  it('should call getLabelBodyModal for agent', () => {
    component.fromType = RelationshipType.Agent;
    spyOn(component, 'isFromAgent').and.returnValue(true);
    (component as any).secondLabel = 'A1';
    (component as any).surnameNameCompanyName = 'Smith';
    spyOn(Utility, 'translate').and.returnValue('AgentBody');
    const result = component['getLabelBodyModal']();
    expect(result).toContain('AgentBody');
  });

  it('should call getLabelBodyModal for customer', () => {
    component.fromType = RelationshipType.Customer;
    spyOn(component, 'isFromAgent').and.returnValue(false);
    (component as any).secondLabel = 'C1';
    (component as any).surnameNameCompanyName = 'Rossi';
    spyOn(Utility, 'translate').and.returnValue('ClientBody');
    const result = component['getLabelBodyModal']();
    expect(result).toContain('ClientBody');
  });

  it('should call returnToList and navigate for all fromType', () => {
    spyOn(UtilityRouting, 'navigateTo');
    component.fromType = RelationshipType.Agent;
    (component as any).returnToList();
    expect(UtilityRouting.navigateTo).toHaveBeenCalledWith('administrative/relationship-agents-list');
    component.fromType = RelationshipType.Customer;
    (component as any).returnToList();
    expect(UtilityRouting.navigateTo).toHaveBeenCalledWith('administrative/relationship-customers-list');
    component.fromType = RelationshipType.CustomerLac;
    (component as any).returnToList();
    expect(UtilityRouting.navigateTo).toHaveBeenCalledWith('administrative/relationship-customers-list-lac');
    component.fromType = RelationshipType.Subject;
    (component as any).returnToList();
    expect(UtilityRouting.navigateTo).toHaveBeenCalledWith('administrative/subject-list');
  });

  it('should call openDeactivationModal and handle confirm', fakeAsync(() => {
    const modalRefMock = {
      componentInstance: {},
      result: Promise.resolve(true)
    };
    mockModalService.open.and.returnValue(modalRefMock as any);
    spyOn(component, 'isFromAgent').and.returnValue(true);
    spyOn(component as any, 'callApiRelationshipAgent');
    (component as any).openDeactivationModal('2024-01-01', false);
    tick();
    expect(mockModalService.open).toHaveBeenCalled();
    expect(component['callApiRelationshipAgent']).toHaveBeenCalled();
  }));

  it('should call openDeactivationModal and handle cancel', fakeAsync(() => {
    const modalRefMock = {
      componentInstance: {},
      result: Promise.reject()
    };
    mockModalService.open.and.returnValue(modalRefMock as any);
    spyOn(component, 'isFromAgent').and.returnValue(false);
    spyOn(component as any, 'callApiRelationshipCustomer');
    (component as any).openDeactivationModal('2024-01-01', false);
    tick();
    // Nessuna chiamata a callApiRelationshipCustomer perché è stato cancellato
    expect(mockModalService.open).toHaveBeenCalled();
    expect(component['callApiRelationshipCustomer']).not.toHaveBeenCalled();
  }));

  it('should call checkEndRelationship and open modal if endOfRelationshipValidity is set', () => {
    spyOn(Utility, 'convertFromGenericDataToString').and.returnValue('2024-01-01');
    spyOn(component as any, 'openDeactivationModal');
    component.relationshipForm.get('endOfRelationshipValidity')?.setValue('someValue');
    (component as any).checkEndRelationship(false);
    expect(component['openDeactivationModal']).toHaveBeenCalledWith('2024-01-01', false);
  });

  it('should call checkEndRelationship and callApiRelationshipCustomer if no endOfRelationshipValidity', () => {
    spyOn(component, 'isFromAgent').and.returnValue(false);
    spyOn(component as any, 'callApiRelationshipCustomer');
    component.relationshipForm.get('endOfRelationshipValidity')?.setValue('');
    (component as any).checkEndRelationship(false);
    expect(component['callApiRelationshipCustomer']).toHaveBeenCalled();
  });

  it('should call checkEndRelationship and callApiRelationshipAgent if no endOfRelationshipValidity and isFromAgent', () => {
    spyOn(component, 'isFromAgent').and.returnValue(true);
    spyOn(component as any, 'callApiRelationshipAgent');
    component.relationshipForm.get('endOfRelationshipValidity')?.setValue('');
    (component as any).checkEndRelationship(false);
    expect(component['callApiRelationshipAgent']).toHaveBeenCalled();
  });

  it('should call setSubjectValues and set value in form', () => {
    spyOn(Utility, 'convertFromGenericDataToDatepicker').and.returnValue({ year: 2024, month: 1, day: 1 });
    component['subject'] = { dateAdded: '2023-01-01' } as any;
    const invoiceDetail = component.relationshipForm.get('invoiceDetail') as FormGroup;
    invoiceDetail.get('startOfAccountingActivity')?.setValue('');
    (component as any).setSubjectValues();
    expect(invoiceDetail.get('startOfAccountingActivity')?.value).toEqual({ year: 2024, month: 1, day: 1 });
  });

  afterEach(() => {
    // Ripristina tutti gli spy per evitare errori su spyOnProperty multipli
    if (jasmine && jasmine.getEnv) {
      jasmine.getEnv().allowRespy(true);
    }
  });

  it('should call retrieveLoggedUserPrfile and set corporateGroupId if not EVA_ADMIN', () => {
    const user = {
      profile: 'NOT_ADMIN',
      corporateGroup: { id: 99 }
    } as any;
    spyOnProperty(mockUserProfileService, 'profile$', 'get').and.returnValue(of(user));
    spyOnProperty(mockUserProfileService, 'impersonatedUser$', 'get').and.returnValue(of(null));
    component['corporateGroupId'].set(0);
    (component as any).retrieveLoggedUserPrfile();
    expect(component.corporateGroupId()).toBe(99);
  });

  it('should call retrieveLoggedUserPrfile and not set corporateGroupId if EVA_ADMIN', () => {
    const user = {
      profile: 'EVA_ADMIN',
      corporateGroup: { id: 99 }
    } as any;
    spyOnProperty(mockUserProfileService, 'profile$', 'get').and.returnValue(of(user));
    spyOnProperty(mockUserProfileService, 'impersonatedUser$', 'get').and.returnValue(of(null));
    component['corporateGroupId'].set(0);
    (component as any).retrieveLoggedUserPrfile();
    expect(component.corporateGroupId()).toBe(0);
  });
});
