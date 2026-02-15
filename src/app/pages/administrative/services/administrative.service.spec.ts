/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubjectResponse } from '../../../api/glsAdministrativeApi/models/subject-response';
import { AdministrativeCommonService } from './administrative.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AgentCreateModel } from '../../../api/glsAdministrativeApi/models/agent-create-model';
import { CompanyDetailResponse } from '../../../api/glsAdministrativeApi/models/company-detail-response';
import { TypeCustomer } from '../relationship/enum/type-customer';
import { UserDetailsModel } from '../../../api/glsUserApi/models';
import { CompanyValidator } from '../company/validators/company-validator';
import { CustomerResponse } from '../../../api/glsAdministrativeApi/models';

describe('AdministrativeCommonService', () => {
  let service: AdministrativeCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [AdministrativeCommonService, FormBuilder]
    });
    service = TestBed.inject(AdministrativeCommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setSubjectForm should create a form with default values', () => {
    const user: UserDetailsModel = { profile: 'EVA_ADMIN', corporateGroup: { id: 1 } };
    const form = service.setSubjectForm(user);
    expect(form).toBeTruthy();
    expect(form.get('companyName')?.value).toBeNull();
    expect(form.get('nationId')?.value).toBeNull();
  });

  it('setSubjectForm should populate form with SubjectResponse', () => {
    const subject: SubjectResponse = { id: 1, companyName: 'Test', nationId: 99 } as any;
    const user: UserDetailsModel = { profile: 'EVA_ADMIN', corporateGroup: { id: 1 } };
    const form = service.setSubjectForm(user, subject);
    expect(form.get('id')?.value).toBe(1);
    expect(form.get('companyName')?.value).toBe('Test');
    expect(form.get('nationId')?.value).toBe(99);
  });

  it('setCompanySocietyForm should create a form with default values', () => {
    const user: UserDetailsModel = { profile: 'EVA_ADMIN', corporateGroup: { id: 1, corporateName: 'Test Group' } };
    const form = service.setCompanySocietyForm(user);
    expect(form).toBeTruthy();
    expect(form.get('generalData.companyname')?.value).toBe(null);
  });

  it('setCompanySocietyForm should populate form with CompanyDetailResponse', () => {
    const company: CompanyDetailResponse = {
      name: 'Società',
      vatNumber: '123',
      languageId: 1,
      officeAddress: 'Via Roma',
      officePostCode: '00100',
      officeCity: 'Roma',
      provinceName: 'RM',
      regionName: 'Lazio',
      taxCode: 'TST123',
      vatGroup: false,
      corporateGroupId: 2,
      corporateGroupName: 'Gruppo'
    } as any;
    const user: UserDetailsModel = { profile: 'EVA_ADMIN', corporateGroup: { id: 2, corporateName: 'Test Group' } };
    const form = service.setCompanySocietyForm(user, company);
    expect(form.get('generalData.companyname')?.value).toBe('Società');
    expect(form.get('registeredOfficeAddress.legalAddress')?.value).toBe('Via Roma');
  });

  it('setDetailRelationshipCustomer should create a form with default values', () => {
    const form = service.setDetailRelationshipCustomer(TypeCustomer.Client);
    expect(form).toBeTruthy();
    expect(form.get('customerCode')?.value).toBe(null);
  });

  it('setDetailRelationshipCustomer should populate form with CustomerResponse', () => {
    const customer: CustomerResponse = {
      customerCode: 123,
      administrativeId: 456,
      type: TypeCustomer.Client,
      financialDetail: {
        vatSubjection: 'E',
        declarationOfIntentProtocol: '789',
        declarationOfIntentDate: '2023-10-01',
        declarationOfIntentProtocolProgressive: 1
      }
    } as any;
    const form = service.setDetailRelationshipCustomer(TypeCustomer.Client, customer);
    expect(form.get('customerCode')?.value).toBe(123);
    expect(form.get('administrativeId')?.value).toBe(456);
  });

  it('setDetailRelationshipAgent should create a form with default values', () => {
    const form = service.setDetailRelationshipAgent();
    expect(form).toBeTruthy();
    expect(form.get('agentCode')?.value).toBe(null);
  });

  it('setDetailRelationshipAgent should populate form with AgentCreateModel', () => {
    const agent: AgentCreateModel = { agentCode: 789, subjectId: 321 } as any;
    const form = service.setDetailRelationshipAgent(agent);
    expect(form.get('agentCode')?.value).toBe(789);
    expect(form.get('subjectId')?.value).toBe(321);
  });

  it('updateVatGroupValidators should add required when vatGroup === true', () => {
    const form = new FormBuilder().group({
      vatGr: [true],
      vatNo: ['']
    });
    // initially not required
    expect(form.get('vatNo')?.hasValidator(Validators.required)).toBeFalse();
    CompanyValidator.updateVatGroupValidators(form);
    expect(form.get('vatNo')?.hasValidator(Validators.required)).toBeTrue();
  });

  it('updateVatGroupValidators should remove required when vatGroup === false', () => {
    const form = new FormBuilder().group({
      vatGr: [false],
      vatNo: ['']
    });
    form.get('vatNo')?.addValidators(Validators.required);
    CompanyValidator.updateVatGroupValidators(form);
    expect(form.get('vatNo')?.hasValidator(Validators.required)).toBeFalse();
  });

  it('updateBillingDataValidators should add required to pec if custCodeRec is empty', () => {
    const form = new FormBuilder().group({
      custCodeRec: [''],
      pec: ['']
    });
    CompanyValidator.updateBillingDataValidators(form);
    expect(form.get('pec')?.hasValidator(Validators.required)).toBeTrue();
  });

  it('updateBillingDataValidators should add required to custCodeRec if pec is empty', () => {
    const form = new FormBuilder().group({
      custCodeRec: [''],
      pec: ['']
    });
    CompanyValidator.updateBillingDataValidators(form);
    expect(form.get('custCodeRec')?.hasValidator(Validators.required)).toBeTrue();
  });

  it('updateBillingDataValidators should remove required from pec if custCodeRec is populated', () => {
    const form = new FormBuilder().group({
      custCodeRec: ['123456'],
      pec: ['']
    });
    form.get('pec')?.addValidators(Validators.required);
    CompanyValidator.updateBillingDataValidators(form);
    expect(form.get('pec')?.hasValidator(Validators.required)).toBeFalse();
  });

  it('updateBillingDataValidators should remove required from custCodeRec if pec is populated', () => {
    const form = new FormBuilder().group({
      custCodeRec: [''],
      pec: ['test@pec.com']
    });
    form.get('custCodeRec')?.addValidators(Validators.required);
    CompanyValidator.updateBillingDataValidators(form);
    expect(form.get('custCodeRec')?.hasValidator(Validators.required)).toBeFalse();
  });
});
