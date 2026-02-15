/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CompanyEditBodyComponent } from './company-edit-body.component';
import { AdministrativeService } from '../../../../../api/glsAdministrativeApi/services';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { CompanyDetailResponse } from '../../../../../api/glsAdministrativeApi/models';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

@Component({
  selector: 'gls-input',
  template: ''
})
class MockGlsInputComponent {}

describe('CompanyEditBodyComponent', () => {
  let component: CompanyEditBodyComponent;
  let fixture: ComponentFixture<CompanyEditBodyComponent>;
  let mockAdministrativeService: jasmine.SpyObj<AdministrativeService>;
  let mockRoute: Partial<ActivatedRoute>;

  const mockCompany: CompanyDetailResponse = {
    id: 1,
    name: 'Test Company',
    status: 'COMPLETED'
  } as CompanyDetailResponse;

  beforeEach(async () => {
    mockAdministrativeService = jasmine.createSpyObj('AdministrativeService', ['getApiAdministrativeV1Id$Json']);
    mockAdministrativeService.getApiAdministrativeV1Id$Json.and.returnValue(of(mockCompany));
    mockRoute = {};

    await TestBed.configureTestingModule({
      imports: [CompanyEditBodyComponent, TranslateModule.forRoot(), HttpClientTestingModule, ReactiveFormsModule],
      declarations: [MockGlsInputComponent],
      providers: [
        { provide: AdministrativeService, useValue: mockAdministrativeService },
        { provide: ActivatedRoute, useValue: mockRoute },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyEditBodyComponent);
    component = fixture.componentInstance;

    // Set required input signals
    fixture.componentRef.setInput('isWrite', true);
    fixture.componentRef.setInput('isDraft', true);
    const fb = TestBed.inject(FormBuilder);
    const form = fb.group({
      generalData: fb.group({
        companyname: [''],
        vatGr: [false],
        vatNo: [''],
        taxIdcode: [''],
        languageId: ['']
      }),
      registeredOfficeAddress: fb.group({
        legalAddressCountry: [''],
        legalAddress: [''],
        postalCode: [''],
        city: [''],
        province: [''],
        regione: ['']
      }),
      contactInformation: fb.group({
        email: [''],
        phone: [''],
        fax: ['']
      }),
      activityEndDate: fb.group({
        activityEndDate: ['']
      }),
      administrativeRelations: fb.group({}),
      billingData: fb.group({}),
      companyData: fb.group({})
    });
    fixture.componentRef.setInput('formParent', form);
    fixture.componentRef.setInput('companyData', mockCompany);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have isWrite input signal', () => {
    expect(component.isWrite()).toBeTrue();
  });

  it('should have formParent input signal', () => {
    expect(component.formParent()).toBeInstanceOf(FormGroup);
  });

  it('should have companyData input signal', () => {
    expect(component.companyData()).toEqual(jasmine.objectContaining({ id: 1 }));
  });

  it('should return generalData form group', () => {
    expect(component.getGeneralDataForm()).toBeInstanceOf(FormGroup);
  });

  it('should return registeredOfficeAddress form group', () => {
    expect(component.getOfficeAddressForm()).toBeInstanceOf(FormGroup);
  });

  it('should return contactInformation form group', () => {
    expect(component.getContactInformationForm()).toBeInstanceOf(FormGroup);
  });

  it('should return activityEndDate form group', () => {
    expect(component.getActivityEndDateForm()).toBeInstanceOf(FormGroup);
  });

  it('should return administrativeRelations form group', () => {
    expect(component.getAdminRelationForm()).toBeInstanceOf(FormGroup);
  });

  it('should return billingData form group', () => {
    expect(component.getBillingDataForm()).toBeInstanceOf(FormGroup);
  });

  it('should return companyData form group', () => {
    expect(component.getCompanyDataForm()).toBeInstanceOf(FormGroup);
  });

  it('should call AdministrativeService.getApiAdministrativeV1Id$Json and return company data', (done) => {
    component.getCompanyData(1).subscribe((data) => {
      expect(mockAdministrativeService.getApiAdministrativeV1Id$Json).toHaveBeenCalledWith({ id: 1 });
      expect(data).toEqual(mockCompany);
      done();
    });
  });
});
