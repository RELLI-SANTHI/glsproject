/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RelationshipDataComponent } from './relationship-data.component';
import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { GlsInputDropdownComponent } from '../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { GlsInputDataComponent } from '../../../../../common/form/gls-input-data/gls-input-date.component';
import { of, throwError } from 'rxjs';
import { GetAdministrativesResponse } from '../../../../../api/glsAdministrativeApi/models';
import { AdministrativeService } from '../../../../../api/glsAdministrativeApi/services';

@Component({
  template: `
    <app-relationship-data
      [relationshipDataForm]="form"
      [isWriting]="isWriting"
      [isDraft]="isDraft"
      [isEnabledDate]="isEnabledDate"
      [isFromSubject]="isFromSubject"></app-relationship-data>
  `,
  standalone: true,
  imports: [RelationshipDataComponent, ReactiveFormsModule, TranslateModule]
})
class TestHostComponent {
  form: FormGroup;
  isWriting = true;
  isDraft = true;
  isEnabledDate = false;
  isFromSubject = false;
  isFromAgent = false;

  constructor(private fb: FormBuilder) {
    this.form = this.setDetailRelationship();
  }

  // eslint-disable-next-line max-lines-per-function
  setDetailRelationship(): FormGroup {
    return this.fb.group({
      endOfRelationshipValidity: [new Date().toLocaleDateString('it-IT'), Validators.required],
      fixedRight: [0],
      provPercentage: [0],
      potentialCustomerCode: [''],
      salesforceLeadCode: [''],
      discount1: [0],
      discount2: [0],
      discount3: [0],
      typeDiscounts: [0],
      chargeForStampDutyExpenses: [false],
      bankChargesBilling: [false],
      chargeForStampingFeesReceipt: [false],
      expired: [false],
      blocked: [false],
      sendingAccountStatement: [false],
      reminder: [false],
      genericCustomer: [false],
      subjectId: [0],
      customerCode: [0, Validators.required],
      administrativeId: [0, Validators.required],
      type: [''],
      society: [''],
      financialDetail: this.fb.group({
        vatSubjection: [''],
        declarationOfIntentProtocol: [''],
        declarationOfIntentProtocolProgressive: [0],
        declarationOfIntentDate: [new Date()]
      }),
      invoiceDetail: this.fb.group({
        startOfAccountingActivity: [new Date().toLocaleDateString('it-IT')],
        endOfAccountingActivity: [new Date().toLocaleDateString('it-IT')],
        paymentId: [0],
        xmlInvoiceStamp: [false],
        invoiceInPDF: [false],
        invoiceEmail: [''],
        invoiceDelivery: ['']
      }),
      bankDetail: this.fb.group({
        currentAccountNumber: [''],
        cin: [''],
        iban: [''],
        bic: [''],
        bankCredit: [0],
        remittanceCurrentAccountNumber: [''],
        remittanceCin: [''],
        remittanceIban: [''],
        remittanceBic: ['']
      })
    });
  }
}

// eslint-disable-next-line max-lines-per-function
describe('RelationshipDataComponent (inside host)', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let administrativeService: AdministrativeService;
  let relationshipComponent: RelationshipDataComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestHostComponent,
        ReactiveFormsModule,
        GlsInputComponent,
        GlsInputDropdownComponent,
        GlsInputDataComponent,
        TranslateModule.forRoot(),
        HttpClientTestingModule
      ],
      providers: [
        FormBuilder,
        {
          provide: TranslatePipe,
          useValue: jasmine.createSpyObj('TranslatePipe', ['transform'])
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    administrativeService = TestBed.inject(AdministrativeService);

    // Get access to the child component
    const debugElement = fixture.debugElement.query((sel) => sel.componentInstance instanceof RelationshipDataComponent);
    relationshipComponent = debugElement?.componentInstance;

    fixture.detectChanges();
  });

  // ...existing tests...

  it('should pass isFromAgent input as false', () => {
    expect(hostComponent.isFromAgent).toBeFalse();
  });

  it('should disable endOfRelationshipValidity field when isEnabledDate is false', () => {
    const control = hostComponent.form.get('endOfRelationshipValidity');
    expect(control?.disabled).toBeTrue();
  });

  it('should enable endOfRelationshipValidity field when isEnabledDate is true', () => {
    hostComponent.isEnabledDate = true;
    fixture.detectChanges();

    // Recreate the component to trigger ngOnInit again
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.isEnabledDate = true;
    fixture.detectChanges();

    const control = hostComponent.form.get('endOfRelationshipValidity');
    expect(control?.enabled).toBeTrue();
  });

  it('should call getSociety on init', () => {
    spyOn(relationshipComponent as any, 'getSociety');
    relationshipComponent.ngOnInit();
    expect(relationshipComponent['getSociety']).toHaveBeenCalled();
  });

  it('should fetch companies data when getSociety is called', () => {
    const mockResponse: GetAdministrativesResponse = {
      totalItems: 2,
      totalPages: 1,
      companies: [
        { id: 1, name: 'Company 1', corporateGroupId: 1, vatNumber: 'IT12345678900' },
        { id: 2, name: 'Company 2', corporateGroupId: 1, vatNumber: 'IT12345678901' }
      ]
    };

    spyOn(administrativeService, 'postAdministrativeV1CompaniesWithoutBreakVisibility$Json').and.returnValue(of(mockResponse));

    relationshipComponent['getSociety']();

    expect(administrativeService.postAdministrativeV1CompaniesWithoutBreakVisibility$Json).toHaveBeenCalled();
    expect(relationshipComponent.companies().length).toBe(2);
    expect(relationshipComponent.companies()[0].id).toBe(1);
    expect(relationshipComponent.companies()[0].name).toBe('Company 1');
  });

  it('should auto-select company when only one exists', () => {
    const mockResponse: GetAdministrativesResponse = {
      totalItems: 1,
      totalPages: 1,
      companies: [{ id: 1, name: 'Single Company', corporateGroupId: 1, vatNumber: 'IT12345678901' }]
    };

    spyOn(administrativeService, 'postAdministrativeV1CompaniesWithoutBreakVisibility$Json').and.returnValue(of(mockResponse));

    relationshipComponent['getSociety']();

    expect(hostComponent.form.get('administrativeId')?.value).toBe(1);
  });

  it('should handle error when fetching companies', () => {
    spyOn(administrativeService, 'postAdministrativeV1CompaniesWithoutBreakVisibility$Json').and.returnValue(
      throwError(() => new Error('API Error'))
    );
    spyOn(console, 'error');

    relationshipComponent['getSociety']();

    expect(console.error).toHaveBeenCalled();
  });

  it('should return correct society name based on selected administrativeId', () => {
    relationshipComponent.companies.set([
      { id: 1, name: 'Company 1', corporateGroupId: 1, vatNumber: 'IT12345678900' },
      { id: 2, name: 'Company 2', corporateGroupId: 1, vatNumber: 'IT12345678901' }
    ]);

    hostComponent.form.get('administrativeId')?.setValue(2);

    expect(relationshipComponent.getSocietyName()).toBe('Company 2');
  });

  it('should return undefined when no society is selected', () => {
    relationshipComponent.companies.set([
      { id: 1, name: 'Company A', corporateGroupId: 1, vatNumber: 'IT12345678900' },
      { id: 2, name: 'Company B', corporateGroupId: 1, vatNumber: 'IT12345678901' }
    ]);

    hostComponent.form.get('administrativeId')?.setValue(null);

    expect(relationshipComponent.getSocietyName()).toBeUndefined();
  });

  it('should update form control value on onValueChange', () => {
    relationshipComponent.onValueChange('42', 'fixedRight');
    expect(hostComponent.form.get('fixedRight')?.value).toBe(42);
  });

  it('should convert string value to number in onValueChange', () => {
    relationshipComponent.onValueChange('42.5', 'provPercentage');
    expect(hostComponent.form.get('provPercentage')?.value).toBe(42.5);
  });

  it('should validate required fields in the form', () => {
    const customerCodeControl = hostComponent.form.get('customerCode');
    customerCodeControl?.setValue(null);
    expect(customerCodeControl?.valid).toBeFalse();

    customerCodeControl?.setValue(123);
    expect(customerCodeControl?.valid).toBeTrue();
  });

  it('should have properly structured nested form groups', () => {
    expect(hostComponent.form.get('financialDetail') instanceof FormGroup).toBeTrue();
    expect(hostComponent.form.get('invoiceDetail') instanceof FormGroup).toBeTrue();
    expect(hostComponent.form.get('bankDetail') instanceof FormGroup).toBeTrue();
  });

  it('should include corporateGroupId in request body when set', () => {
    relationshipComponent.corporateGroupId.set(123);
    spyOn(administrativeService, 'postAdministrativeV1CompaniesWithoutBreakVisibility$Json').and.returnValue(
      of({ companies: [], totalItems: 0, totalPages: 0 })
    );
    relationshipComponent['getSociety']();

    expect(administrativeService.postAdministrativeV1CompaniesWithoutBreakVisibility$Json).toHaveBeenCalled();
  });
});
