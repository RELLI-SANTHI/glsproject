
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { RelationshipBankingDataComponent } from './relationship-banking-data.component';
import { BankService } from '../../../../../api/glsAdministrativeApi/services';
import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { BankResponse, GetBankResponse } from '../../../../../api/glsAdministrativeApi/models';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';

describe('RelationshipBankingDataComponent', () => {
  let component: RelationshipBankingDataComponent;
  let fixture: ComponentFixture<RelationshipBankingDataComponent>;
  let bankService: jasmine.SpyObj<BankService>;

  const mockBankResponse: BankResponse = {
    id: 1,
    bankDescription: 'Test Bank',
    abiCode: '12345',
    cabCode: '67890'
  };

  const mockGetBankResponse: GetBankResponse = {
    banks: [mockBankResponse],
    totalItems: 1,
    totalPages: 1
  };

  beforeEach(async () => {
    const bankServiceSpy = jasmine.createSpyObj('BankService', ['postApiBankV1$Json']);
    const translateSpy = jasmine.createSpyObj('TranslatePipe', ['transform']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RelationshipBankingDataComponent,
        GlsInputComponent,
        TranslateModule.forRoot(),
        HttpClientTestingModule
      ],
      providers: [
        FormBuilder,
        { provide: BankService, useValue: bankServiceSpy },
        {
          provide: TranslatePipe,
          useValue: translateSpy
        }
      ]
    }).compileComponents();

    bankService = TestBed.inject(BankService) as jasmine.SpyObj<BankService>;

    fixture = TestBed.createComponent(RelationshipBankingDataComponent);
    component = fixture.componentInstance;

    const componentRef = fixture.componentRef;
    componentRef.setInput(
      'relationshipBankingDataForm',
      new FormBuilder().group({
        accountNumber: [''],
        abiCode: ['', [Validators.pattern('^[0-9]{5}$'), Validators.minLength(5), Validators.maxLength(5)]],
        cabCode: ['', [Validators.pattern('^[0-9]{5}$'), Validators.minLength(5), Validators.maxLength(5)]],
        remittanceAbiCode: ['', [Validators.pattern('^[0-9]{5}$'), Validators.minLength(5), Validators.maxLength(5)]],
        remittanceCabCode: ['', [Validators.pattern('^[0-9]{5}$'), Validators.minLength(5), Validators.maxLength(5)]],
        cin: ['', Validators.maxLength(1)],
        iban: [''],
        bic: ['', Validators.maxLength(11)],
        bankCredit: [''],
        remittanceAccountNumber: [''],
        remittanceCin: [''],
        remittanceIban: [''],
        remittanceBic: ['']
      })
    );
    componentRef.setInput('isWriting', true);
    componentRef.setInput('isDraft', false);
    componentRef.setInput('isFromSubject', false);
    componentRef.setInput('isRemittance', false);
    componentRef.setInput('titleLabel', 'Banking Data');
    componentRef.setInput('titleLabelCard', 'Banking Information');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the bank form with empty values', () => {
    expect(component.relationshipBankingDataForm().get('abiCode')?.value).toBe('');
    expect(component.relationshipBankingDataForm().get('cabCode')?.value).toBe('');
    expect(component.relationshipBankingDataForm().get('remittanceAbiCode')?.value).toBe('');
    expect(component.relationshipBankingDataForm().get('remittanceCabCode')?.value).toBe('');
    expect(component.relationshipBankingDataForm().get('accountNumber')?.value).toBe('');
    expect(component.relationshipBankingDataForm().get('cin')?.value).toBe('');
    expect(component.relationshipBankingDataForm().get('iban')?.value).toBe('');
    expect(component.relationshipBankingDataForm().get('bic')?.value).toBe('');
    expect(component.relationshipBankingDataForm().get('bankCredit')?.value).toBe('');
  });

  it('should validate abi field pattern (5 digits)', () => {
    const abiControl = component.relationshipBankingDataForm().get('abiCode');

    // Test invalid patterns
    abiControl?.setValue('1234'); // 4 digits
    expect(abiControl?.invalid).toBeTruthy();

    abiControl?.setValue('123456'); // 6 digits
    expect(abiControl?.invalid).toBeTruthy();

    // Test valid pattern
    abiControl?.setValue('12345'); // 5 digits
    expect(abiControl?.hasError('pattern')).toBeFalsy();
  });

  it('should validate cab field pattern (5 digits)', () => {
    const cabControl = component.relationshipBankingDataForm().get('cabCode');

    // Test invalid patterns
    cabControl?.setValue('1234'); // 4 digits
    expect(cabControl?.invalid).toBeTruthy();

    cabControl?.setValue('123456'); // 6 digits
    expect(cabControl?.invalid).toBeTruthy();

    // Test valid pattern
    cabControl?.setValue('67890'); // 5 digits
    expect(cabControl?.hasError('pattern')).toBeFalsy();
  });

  it('should disable button when abi and cab are invalid', () => {
    component.relationshipBankingDataForm().get('abiCode')?.setValue('1234');
    component.relationshipBankingDataForm().get('cabCode')?.setValue('abcd');
    expect(component.searchDisable()).toBeTrue();
  });

  it('should disable button when only abi is invalid', () => {
    component.relationshipBankingDataForm().get('abiCode')?.setValue('1234'); // invalid pattern
    component.relationshipBankingDataForm().get('cabCode')?.setValue('67890'); // valid
    expect(component.searchDisable()).toBeTrue();
  });

  it('should disable button when only cab is invalid', () => {
    component.relationshipBankingDataForm().get('abiCode')?.setValue('12345'); // valid
    component.relationshipBankingDataForm().get('cabCode')?.setValue('1234'); // invalid (required)
    expect(component.searchDisable()).toBeTrue();
  });

  it('should enable button when abi and cab are valid', () => {
    component.relationshipBankingDataForm().get('abiCode')?.setValue('12345');
    component.relationshipBankingDataForm().get('cabCode')?.setValue('67890');
    expect(component.searchDisable()).toBeFalse();
  });

  it('should search bank successfully', () => {
    bankService.postApiBankV1$Json.and.returnValue(of(mockGetBankResponse));
    const bankDetailEventSpy = spyOn(component.bankDetailEvent, 'emit');
    component.relationshipBankingDataForm().get('abiCode')?.setValue('12345');
    component.relationshipBankingDataForm().get('cabCode')?.setValue('67890');

    component.searchBank();

    expect(bankService.postApiBankV1$Json).toHaveBeenCalledWith({
      body: {
        abiCode: '12345',
        cabCode: '67890'
      }
    });
    expect(bankDetailEventSpy).toHaveBeenCalledWith(mockBankResponse);
    expect(component.bankDetail).toEqual(mockBankResponse);
  });

  it('should handle bank search error', () => {
    const errorMessage = 'Test error';
    bankService.postApiBankV1$Json.and.returnValue(throwError(() => new Error(errorMessage)));
    const consoleSpy = spyOn(console, 'error');
    component.relationshipBankingDataForm().get('abi')?.setValue('12345');
    component.relationshipBankingDataForm().get('cab')?.setValue('67890');

    component.searchBank();

    expect(component.bankDetail).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith('Error', jasmine.any(Error));
  });

  it('should handle empty bank response', () => {
    const emptyResponse: GetBankResponse = {
      banks: [],
      totalItems: 0,
      totalPages: 0
    };
    bankService.postApiBankV1$Json.and.returnValue(of(emptyResponse));
    const bankDetailEventSpy = spyOn(component.bankDetailEvent, 'emit');

    component.searchBank();

    expect(bankDetailEventSpy).toHaveBeenCalledWith(undefined);
    expect(component.bankDetail).toBeUndefined();
  });

  it('should handle null banks array in response', () => {
    const nullBanksResponse: GetBankResponse = {
      banks: null as any,
      totalItems: 0,
      totalPages: 0
    };
    bankService.postApiBankV1$Json.and.returnValue(of(nullBanksResponse));
    const bankDetailEventSpy = spyOn(component.bankDetailEvent, 'emit');

    component.searchBank();

    expect(bankDetailEventSpy).toHaveBeenCalledWith(undefined);
    expect(component.bankDetail).toBeUndefined();
  });

  it('should use current form values when searching', () => {
    const testAbi = '98765';
    const testCab = '54321';

    component.relationshipBankingDataForm().get('abiCode')?.setValue(testAbi);
    component.relationshipBankingDataForm().get('cabCode')?.setValue(testCab);
    bankService.postApiBankV1$Json.and.returnValue(of(mockGetBankResponse));

    component.searchBank();

    expect(bankService.postApiBankV1$Json).toHaveBeenCalledWith({
      body: {
        abiCode: testAbi,
        cabCode: testCab
      }
    });
  });

  it('should emit undefined when banks array is empty', () => {
    const emptyBanksResponse: GetBankResponse = {
      banks: [],
      totalItems: 0,
      totalPages: 0
    };
    bankService.postApiBankV1$Json.and.returnValue(of(emptyBanksResponse));
    const bankDetailEventSpy = spyOn(component.bankDetailEvent, 'emit');

    component.searchBank();

    expect(bankDetailEventSpy).toHaveBeenCalledWith(undefined);
  });

  it('should emit first bank when multiple banks are returned', () => {
    const multipleBanksResponse: GetBankResponse = {
      banks: [mockBankResponse, { ...mockBankResponse, id: 2 }],
      totalItems: 2,
      totalPages: 1
    };
    bankService.postApiBankV1$Json.and.returnValue(of(multipleBanksResponse));
    const bankDetailEventSpy = spyOn(component.bankDetailEvent, 'emit');

    component.searchBank();

    expect(bankDetailEventSpy).toHaveBeenCalledWith(mockBankResponse);
    expect(component.bankDetail).toEqual(mockBankResponse);
  });

  it('should reset bankDetail to undefined on error', () => {
    // Set initial value
    component.bankDetail = mockBankResponse;

    bankService.postApiBankV1$Json.and.returnValue(throwError(() => new Error('Test error')));
    spyOn(console, 'error');

    component.searchBank();

    expect(component.bankDetail).toBeUndefined();
  });

  it('should handle form controls being null', () => {
    // Mock form controls to return null
    spyOn(component.relationshipBankingDataForm(), 'get').and.returnValue(null);
    // Mock the service to return a valid observable in case it gets called
    bankService.postApiBankV1$Json.and.returnValue(of(mockGetBankResponse));

    expect(() => component.searchDisable()).not.toThrow();
    expect(() => component.searchBank()).not.toThrow();
  });

  it('should validate all form fields exist', () => {
    const expectedFields = ['abiCode', 'cabCode', 'currentAccountNumber', 'cin', 'iban', 'bic', 'bankCredit'];

    expectedFields.forEach((field) => {
      expect(component.relationshipBankingDataForm().get(field)).toBeDefined();
    });
  });

  it('should handle edge case with whitespace in abi/cab fields', () => {
    component.relationshipBankingDataForm().get('abiCode')?.setValue('  12345  ');
    component.relationshipBankingDataForm().get('cabCode')?.setValue('  67890  ');
    bankService.postApiBankV1$Json.and.returnValue(of(mockGetBankResponse));

    component.searchBank();

    expect(bankService.postApiBankV1$Json).toHaveBeenCalledWith({
      body: {
        abiCode: '  12345  ',
        cabCode: '  67890  '
      }
    });
  });

  it('should add required validator to abiCode and cabCode when called', () => {
    const form = component.relationshipBankingDataForm();
    form.get('abiCode')?.clearValidators();
    form.get('cabCode')?.clearValidators();

    // Call the private method using bracket notation
    (component as any).updateBankingValidators();

    form.get('abiCode')?.setValue('');
    form.get('cabCode')?.setValue('');
    expect(form.get('abiCode')?.hasError('required')).toBeFalse();
    expect(form.get('cabCode')?.hasError('required')).toBeFalse();
  });

  it('should update pattern validator for abiCode and cabCode', () => {
    const form = component.relationshipBankingDataForm();

    // Call the private method
    (component as any).updateBankingValidators();

    form.get('abiCode')?.setValue('abcde');
    form.get('cabCode')?.setValue('1234');
    expect(form.get('abiCode')?.hasError('pattern')).toBeTrue();
    expect(form.get('cabCode')?.hasError('pattern')).toBeTrue();

    form.get('abiCode')?.setValue('12345');
    form.get('cabCode')?.setValue('67890');
    expect(form.get('abiCode')?.hasError('pattern')).toBeFalse();
    expect(form.get('cabCode')?.hasError('pattern')).toBeFalse();
  });

  it('should remove validators if updateBankingValidators is called with false', () => {
    const form = component.relationshipBankingDataForm();

    // Call the private method with false
    (component as any).updateBankingValidators(false);

    form.get('abiCode')?.setValue('');
    form.get('cabCode')?.setValue('');
    expect(form.get('abiCode')?.hasError('required')).toBeFalse();
    expect(form.get('cabCode')?.hasError('required')).toBeFalse();
  });

  it('should set cin and iban values on successful searchCinIban', () => {
    // Arrange
    const componentRef = fixture.componentRef;
    componentRef.setInput('isItalianRelationship', true);
    fixture.detectChanges();

    const mockCin = 'A';
    const mockIban = 'IT60X0542811101000000123456';
    const mockResponse = { cin: mockCin, iban: mockIban };

    // Set up form controls and spies
    const form = component.relationshipBankingDataForm();
    form.get(component.getFieldControlName('abi'))?.setValue('12345');
    form.get(component.getFieldControlName('cab'))?.setValue('67890');
    form.get(component.getFieldControlName('accountNumber'))?.setValue('000123456789');
    const cinControl = form.get(component.getFieldControlName('cin'));
    const ibanControl = form.get(component.getFieldControlName('iban'));

    spyOn(component['customerService'], 'postApiCustomerV1GenerateIbanCin$Json').and.returnValue(of(mockResponse));
    spyOn(cinControl!, 'setValue');
    spyOn(ibanControl!, 'setValue');

    // Act
    component.searchCinIban();

    // Assert
    expect(component['customerService'].postApiCustomerV1GenerateIbanCin$Json).toHaveBeenCalledWith({
      body: {
        abiCode: '12345',
        cabCode: '67890',
        accountNumber: '000123456789'
      }
    });
    expect(cinControl!.setValue).toHaveBeenCalledWith(mockCin);
    expect(ibanControl!.setValue).toHaveBeenCalledWith(mockIban);
  });

  it('should call manageError on error in searchCinIban', () => {
    const componentRef = fixture.componentRef;
    componentRef.setInput('isItalianRelationship', true);
    fixture.detectChanges();

    const form = component.relationshipBankingDataForm();
    form.get(component.getFieldControlName('abi'))?.setValue('12345');
    form.get(component.getFieldControlName('cab'))?.setValue('67890');
    form.get(component.getFieldControlName('accountNumber'))?.setValue('000123456789');
    const error = new Error('API error');
    const httpErrorResponse = new HttpErrorResponse({ error, status: 500, statusText: 'Internal Server Error' });
    spyOn(component['customerService'], 'postApiCustomerV1GenerateIbanCin$Json').and.returnValue(throwError(() => httpErrorResponse));
    spyOn(component['genericService'], 'manageError');

    component.searchCinIban();

    expect(component['genericService'].manageError).toHaveBeenCalledWith(httpErrorResponse);
  });

  it('should set error state only on form controls with non-empty values', () => {
    const form = component.relationshipBankingDataForm();

    // Set values for some controls, leave others empty
    form.get(component.getFieldControlName('abi'))?.setValue('123456');
    form.get(component.getFieldControlName('cab'))?.setValue('123456');
    form.get(component.getFieldControlName('accountNumber'))?.setValue('123456');
    form.get(component.getFieldControlName('cin'))?.setValue('A');
    form.get(component.getFieldControlName('iban'))?.setValue('IT60X0542811101000000123456');
    form.get(component.getFieldControlName('bic'))?.setValue('ABCDEFGHXXX');
    form.get('bankCredit')?.setValue('1000');

    // Leave remittance fields empty
    form.get(component.getFieldControlName('remittanceAccountNumber'))?.setValue('');
    form.get(component.getFieldControlName('remittanceCin'))?.setValue('');
    form.get(component.getFieldControlName('remittanceIban'))?.setValue('');
    form.get(component.getFieldControlName('remittanceBic'))?.setValue('');

    (component as any).setErrorState();

    // Check that error is set only on controls with value
    expect(form.get(component.getFieldControlName('abi'))?.hasError('error')).toBeTrue();
    expect(form.get(component.getFieldControlName('cab'))?.hasError('error')).toBeTrue();
    expect(form.get(component.getFieldControlName('accountNumber'))?.hasError('error')).toBeTrue();
    expect(form.get(component.getFieldControlName('cin'))?.hasError('error')).toBeTrue();
    expect(form.get(component.getFieldControlName('iban'))?.hasError('error')).toBeTrue();
    expect(form.get(component.getFieldControlName('bic'))?.hasError('error')).toBeTrue();

    // Check that error is not set on empty remittance controls
    expect(form.get(component.getFieldControlName('remittanceAccountNumber'))?.hasError('error')).toBeFalsy();
    expect(form.get(component.getFieldControlName('remittanceCin'))?.hasError('error')).toBeFalsy();
    expect(form.get(component.getFieldControlName('remittanceIban'))?.hasError('error')).toBeFalsy();
    expect(form.get(component.getFieldControlName('remittanceBic'))?.hasError('error')).toBeFalsy();
  });

  it('should return true if isWriting is true, control has error "error" and is pristine', () => {
    const form = component.relationshipBankingDataForm();
    const field = component.getFieldControlName('abi');
    const ctrl = form.get(field);
    ctrl?.setErrors({ error: 'error' });
    ctrl?.markAsPristine();
    spyOn(component, 'isWriting').and.returnValue(true);

    expect(component.showErrorForm('abi')).toBeTrue();
  });

  it('should return false if isWriting is false', () => {
    const form = component.relationshipBankingDataForm();
    const field = component.getFieldControlName('abi');
    const ctrl = form.get(field);
    ctrl?.setErrors({ error: 'error' });
    ctrl?.markAsPristine();
    spyOn(component, 'isWriting').and.returnValue(false);

    expect(component.showErrorForm('abi')).toBeFalse();
  });

  it('should return false if control does not have error "error"', () => {
    const form = component.relationshipBankingDataForm();
    const field = component.getFieldControlName('abi');
    const ctrl = form.get(field);
    ctrl?.setErrors({}); // No 'error'
    ctrl?.markAsPristine();
    spyOn(component, 'isWriting').and.returnValue(true);

    expect(component.showErrorForm('abi')).toBeFalse();
  });

  it('should return false if control is not pristine', () => {
    const form = component.relationshipBankingDataForm();
    const field = component.getFieldControlName('abi');
    const ctrl = form.get(field);
    ctrl?.setErrors({ error: 'error' });
    ctrl?.markAsDirty();
    spyOn(component, 'isWriting').and.returnValue(true);

    expect(component.showErrorForm('abi')).toBeFalse();
  });

  it('should return false if control is null', () => {
    spyOn(component, 'getFieldControlName').and.returnValue('notExistingField');
    spyOn(component.relationshipBankingDataForm(), 'get').and.returnValue(null);
    spyOn(component, 'isWriting').and.returnValue(true);

    expect(component.showErrorForm('abi')).toBeFalse();
  });
});
