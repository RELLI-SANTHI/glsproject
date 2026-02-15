/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RelationshipFiscalDataComponent } from './relationship-fiscal-data.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { VatExemptionService, VatRateService } from '../../../../../api/glsAdministrativeApi/services';
import { of, Subject, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { GetVatRateResponse, VatExemptionModel } from '../../../../../api/glsAdministrativeApi/models';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GenericService } from '../../../../../common/utilities/services/generic.service';
import { HttpErrorResponse } from '@angular/common/http';

describe('RelationshipFiscalDataComponent', () => {
  let component: RelationshipFiscalDataComponent;
  let fixture: ComponentFixture<RelationshipFiscalDataComponent>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let vatExemptionServiceSpy: jasmine.SpyObj<VatExemptionService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;
  let mockModalRef: jasmine.SpyObj<NgbModalRef>;
  let vatServiceSpy: jasmine.SpyObj<VatRateService>;
  let genericServiceSpy: jasmine.SpyObj<GenericService>;

  beforeEach(async () => {
    mockModalRef = jasmine.createSpyObj('NgbModalRef', ['result']);
    Object.defineProperty(mockModalRef, 'componentInstance', {
      value: {
        title: '',
        cancelText: '',
        confirmText: '',
        contentComponent: null,
        contentInputs: null
      },
      writable: true
    });
    mockModalRef.result = Promise.resolve({
      description: 'Test Exemption',
      code: 'TEST123',
      id: 123
    });

    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    modalServiceSpy.open.and.returnValue(mockModalRef);

    vatExemptionServiceSpy = jasmine.createSpyObj('VatExemptionService', ['postApiVatexemptionV1$Json']);
    vatServiceSpy = jasmine.createSpyObj('VatService', ['postApiVatrateV1$Json']);
    genericServiceSpy = jasmine.createSpyObj('GenericService', ['manageError']);
    // Create a more complete TranslateService mock
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant', 'get'], {
      onLangChange: new Subject(),
      onTranslationChange: new Subject(),
      onDefaultLangChange: new Subject(),
      currentLang: 'en',
      defaultLang: 'en'
    });
    translateServiceSpy.instant.and.returnValue('translated-text');
    translateServiceSpy.get.and.returnValue(of('translated-text'));

    // Set up a default return value for the spy BEFORE component creation
    vatServiceSpy.postApiVatrateV1$Json.and.returnValue(
      of({
        items: [],
        totalItems: 0,
        totalPages: 0
      })
    );

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RelationshipFiscalDataComponent, HttpClientTestingModule],
      providers: [
        FormBuilder,
        { provide: NgbModal, useValue: modalServiceSpy },
        { provide: VatExemptionService, useValue: vatExemptionServiceSpy },
        { provide: VatRateService, useValue: vatServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RelationshipFiscalDataComponent);
    fixture.componentRef.setInput('isDraft', true);
    component = fixture.componentInstance;

    const mockForm = new FormBuilder().group({
      vatSubjection: [false],
      declarationOfIntentProtocol: [''],
      declarationOfIntentProtocolProgressive: [''],
      declarationOfIntentDate: [''],
      vatRateValue: [''],
      description: [''],
      vatExemptionId: [''],
      vatExemptionCode: ['']
    });

    // Create a proper input signal
    const formSignal = signal(mockForm);
    Object.defineProperty(component, 'filscalDataForm', {
      value: formSignal,
      writable: false
    });
    const translateService = TestBed.inject(TranslateService);
    (translateService as any).currentLang = 'en';
    (translateService as any).defaultLang = 'en';

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call openVatExemptionModal when selectIvaCode is called', () => {
    spyOn(component as any, 'openVatExemptionModal');

    component.selectIvaCode();

    expect((component as any).openVatExemptionModal).toHaveBeenCalled();
  });

  it('should open modal and handle VAT exemption selection', async () => {
    const mockResponse = {
      items: [{ description: 'Test Exemption', code: 1 } as VatExemptionModel],
      totalItems: 1,
      totalPages: 1
    };

    vatExemptionServiceSpy.postApiVatexemptionV1$Json.and.returnValue(of(mockResponse));
    (component as any).loadFiscalData();

    component.selectIvaCode();

    expect(vatExemptionServiceSpy.postApiVatexemptionV1$Json).toHaveBeenCalledWith({
      body: {}
    });
    expect(modalServiceSpy.open).toHaveBeenCalled();

    // Wait for the modal result
    await mockModalRef.result;

    const form = component.filscalDataForm();
    expect(form.get('vatExemptionId')?.value).toBe(123);
    expect(form.get('description')?.value).toBe('Test Exemption');
    expect(component.showForm).toBeTruthy();
  });

  it('should handle empty VAT exemption response', () => {
    const mockResponse = { items: [], totalItems: 0, totalPages: 0 };

    vatExemptionServiceSpy.postApiVatexemptionV1$Json.and.returnValue(of(mockResponse));

    component.selectIvaCode();

    expect(component.exemptionValue).toEqual([]);
  });

  it('should handle null VAT exemption response items', () => {
    const mockResponse = { items: null, totalItems: 0, totalPages: 0 };

    vatExemptionServiceSpy.postApiVatexemptionV1$Json.and.returnValue(of(mockResponse));

    component.selectIvaCode();

    expect(component.exemptionValue).toEqual([]);
  });

  it('should set correct modal properties', () => {
    const mockResponse = {
      items: [{ description: 'Test', code: 1 } as VatExemptionModel],
      totalItems: 1,
      totalPages: 1
    };

    vatExemptionServiceSpy.postApiVatexemptionV1$Json.and.returnValue(of(mockResponse));

    component.selectIvaCode();

    expect(translateServiceSpy.instant).toHaveBeenCalledWith('administrative.generalData.modalValues.titleVatExemption');
    expect(translateServiceSpy.instant).toHaveBeenCalledWith('administrative.generalData.modalValues.btnCancel');
    expect(translateServiceSpy.instant).toHaveBeenCalledWith('administrative.generalData.modalValues.btnConfirm');
    expect(mockModalRef.componentInstance.title).toBe('translated-text');
    expect(mockModalRef.componentInstance.cancelText).toBe('translated-text');
    expect(mockModalRef.componentInstance.confirmText).toBe('translated-text');
  });

  describe('loadVatRate', () => {
    it('should populate vatRateOptions on successful API response', async () => {
      const mockVatRateResponse: GetVatRateResponse = {
        items: [
          {
            id: 1,
            rate1: 10,
            rate2: 1,
            rate3: 2,
            rate4: 3,
            rate5: 4,
            rate6: 5,
            rate7: 6,
            rate8: 7,
            rate9: 8,
            rate10: 9,
            corporateGroupId: 1
          }
        ],
        totalItems: 2,
        totalPages: 1
      };
      vatServiceSpy.postApiVatrateV1$Json.and.returnValue(of(mockVatRateResponse));
      vatExemptionServiceSpy.postApiVatexemptionV1$Json.and.returnValue(
        of({
          items: [],
          totalItems: 0,
          totalPages: 0
        })
      );

      // Use done callback to handle async nature of forkJoin
      return new Promise<void>((resolve) => {
        (component as any).loadFiscalData();
        // Give time for observables to complete and update component
        setTimeout(() => {
          expect(component['vatRateOptions']).toEqual([
            { id: '10', value: '10' },
            { id: '1', value: '1' },
            { id: '2', value: '2' },
            { id: '3', value: '3' },
            { id: '4', value: '4' },
            { id: '5', value: '5' },
            { id: '6', value: '6' },
            { id: '7', value: '7' },
            { id: '8', value: '8' },
            { id: '9', value: '9' }
          ]);
          resolve();
        }, 100);
      });
    });
    it('should set vatRateOptions to empty array if response.items is undefined', () => {
      const mockResponse = {
        totalItems: 0,
        totalPages: 0
      } as GetVatRateResponse;
      vatServiceSpy.postApiVatrateV1$Json.and.returnValue(of(mockResponse));
      (component as any).loadFiscalData();
      expect(component['vatRateOptions']).toEqual([]);
    });
    it('should call manageError on API error', () => {
      const mockError = {
        status: 500,
        statusText: 'Internal Server Error',
        url: 'http://mock-api-url',
        error: { message: 'API failed' }
      } as HttpErrorResponse;

      vatServiceSpy.postApiVatrateV1$Json.and.returnValue(throwError(() => mockError));
      (component as any).genericService = genericServiceSpy;

      (component as any).loadFiscalData();

      expect(genericServiceSpy.manageError).toHaveBeenCalledWith(mockError);
    });
  });

  it('should react to vatSubjection value changes and reset fields as expected in ngOnInit', () => {
    // Arrange: create a form with all required controls
    const form = new FormBuilder().group({
      vatSubjection: [''],
      vatExemptionId: ['init'],
      vatExemptionCode: ['init'],
      exemptionReference: ['init'],
      invoiceVatRate: ['init'],
      declarationOfIntentProtocol: ['init'],
      declarationOfIntentProtocolProgressive: ['init'],
      declarationOfIntentDate: ['init'],
      vatRateValue: ['init']
    });
    // Patch the signal to return our form
    Object.defineProperty(component, 'filscalDataForm', {
      value: () => form,
      writable: false
    });
    spyOn(component as any, 'loadFiscalData');

    // Act: call ngOnInit and trigger value changes
    component.ngOnInit();

    // Simulate changing vatSubjection to 'E'
    form.get('vatSubjection')!.setValue('E');
    expect(form.get('vatExemptionId')!.value).toBeNull();
    expect(form.get('exemptionReference')!.value).toBeNull();
    expect(form.get('invoiceVatRate')!.value).toBeNull();
    expect(form.get('declarationOfIntentProtocol')!.value).toBeNull();
    expect(form.get('declarationOfIntentProtocolProgressive')!.value).toBeNull();
    expect(form.get('declarationOfIntentDate')!.value).toBeNull();

    // Simulate changing vatSubjection to 'I'
    form.get('vatSubjection')!.setValue('I');
    expect(form.get('vatRateValue')!.value).toBeNull();
    expect(form.get('invoiceVatRate')!.value).toBeNull();

  });

  it('should return selectedRow from getIvaBtnLabel', () => {
    component.ngOnInit?.();
    (component as any).selectedRow = { id: 1 };
    expect(component.getIvaBtnLabel()).toBe('administrative.relationshipEdit.relationshipBillingData.changePaymentCode');
  });

  it('should return default label if selectedRow is not set', () => {
    (component as any).selectedRow = undefined;
    expect(component.getIvaBtnLabel()).toBe('administrative.relationshipEdit.relationshipBillingData.choosePaymentCode');
  });

  it('should set invoiceVatRate to vatRateValue if vatRateValue and invoiceVatRateToggle are truthy, else set to null', () => {
    const form = new FormBuilder().group({
      vatRateValue: ['22'],
      invoiceVatRateToggle: [true],
      invoiceVatRate: ['']
    });
    Object.defineProperty(component, 'filscalDataForm', {
      value: () => form,
      writable: false
    });

    // Case 1: Both vatRateValue and invoiceVatRateToggle are truthy
    form.get('vatRateValue')!.setValue('22');
    form.get('invoiceVatRateToggle')!.setValue(true);
    component.onVatRateChange();
    expect(form.get('invoiceVatRate')!.value).toBe('22');

    // Case 2: vatRateValue is falsy
    form.get('vatRateValue')!.setValue('');
    form.get('invoiceVatRateToggle')!.setValue(true);
    component.onVatRateChange();
    expect(form.get('invoiceVatRate')!.value).toBeNull();

    // Case 3: invoiceVatRateToggle is falsy
    form.get('vatRateValue')!.setValue('10');
    form.get('invoiceVatRateToggle')!.setValue(false);
    component.onVatRateChange();
    expect(form.get('invoiceVatRate')!.value).toBeNull();
  });

  it('should set invoiceVatRate to vatRateValue if invoiceVatRateToggle is true, else set to null', () => {
    const form = new FormBuilder().group({
      vatRateValue: ['15'],
      invoiceVatRateToggle: [true],
      invoiceVatRate: ['']
    });
    Object.defineProperty(component, 'filscalDataForm', {
      value: () => form,
      writable: false
    });

    // Case 1: invoiceVatRateToggle is true
    form.get('vatRateValue')!.setValue('15');
    form.get('invoiceVatRateToggle')!.setValue(true);
    component.invoiceRateToggle();
    expect(form.get('invoiceVatRate')!.value).toBe('15');

    // Case 2: invoiceVatRateToggle is false
    form.get('vatRateValue')!.setValue('20');
    form.get('invoiceVatRateToggle')!.setValue(false);
    component.invoiceRateToggle();
    expect(form.get('invoiceVatRate')!.value).toBeNull();
  });
});
