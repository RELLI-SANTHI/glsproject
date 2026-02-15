/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingDataComponent } from './billing-data.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyDetailResponse } from '../../../../../../api/glsAdministrativeApi/models';

describe('BillingDataComponent', () => {
  let component: BillingDataComponent;
  let fixture: ComponentFixture<BillingDataComponent>;
  let formBuilder: FormBuilder;

  const mockCompanyData: CompanyDetailResponse = {
    id: 1,
    name: 'Test Company',
    vatNumber: 'IT12345678901',
    telephone: '0212345678',
    email: 'info@testcompany.com',
    certifiedEmail: 'testcompany@pec.it',
    corporateGroupId: 1,
    rea: 'MI-1234567'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingDataComponent, NgbNavModule, TranslateModule.forRoot(), ReactiveFormsModule],
      providers: [FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(BillingDataComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);

    const formGroup = formBuilder.group({
      custCodeRec: ['', [Validators.minLength(6)]],
      pec: ['', [Validators.maxLength(70)]]
    });

    fixture.componentRef.setInput('billingDataFg', formGroup);
    fixture.componentRef.setInput('isWriting', true);
    fixture.componentRef.setInput('companyData', mockCompanyData);
    fixture.componentRef.setInput('isDraft', true);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept billingDataFg input', () => {
    expect(component.billingDataFg()).toBeInstanceOf(FormGroup);
  });

  it('should accept isWriting input', () => {
    expect(component.isWriting()).toBeTrue();
  });

  it('should accept companyData input', () => {
    expect(component.companyData).toEqual(mockCompanyData);
  });

  it('should not require pec if custCodeRec is valid', () => {
    const form = component.billingDataFg();
    form.get('custCodeRec')?.setValue('123456');
    form.get('pec')?.setValue('');
    form.get('custCodeRec')?.markAsTouched();
    form.get('pec')?.markAsTouched();

    fixture.detectChanges();

    expect(form.get('pec')?.errors?.['required']).toBeFalsy();
  });

  it('should not require custCodeRec if pec is valid', () => {
    const form = component.billingDataFg();
    form.get('custCodeRec')?.setValue('');
    form.get('pec')?.setValue('test@example.com');
    form.get('custCodeRec')?.markAsTouched();
    form.get('pec')?.markAsTouched();

    fixture.detectChanges();

    expect(form.get('custCodeRec')?.errors?.['required']).toBeFalsy();
  });
});
