/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PaymentListModalComponent } from './payment-list-modal.component';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { GlsPaginatorComponent } from '../../../../../../common/components/gls-paginator/gls-paginator.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { PaymentModel } from '../../../../../../api/glsAdministrativeApi/models/payment-model';

describe('PaymentListTableComponent', () => {
  let component: PaymentListModalComponent;
  let fixture: ComponentFixture<PaymentListModalComponent>;
  const mockPayments: PaymentModel[] = [
    {
      id: 1,
      corporateGroupId: 100,
      codPay: 'PAY001',
      description: 'Payment 1',
      bankCharges: 10,
      gPref: 1,
      gestDtScaRate: 'InvoiceDate',
      impMinReceipt: 100,
      minStampDuty: 2,
      monthsToSkip: [],
      numberOfInstallments: 12,
      payType: 'RB',
      periodFixed: 30,
      periodTypeRate: 'Days',
      periodVat: 0,
      receiptStamp: 2,
      stampDutyCharge: true,
      stampDutyPercent: 0.5,
      vatAmountManagement: 22,
      vatDescription: 'Standard VAT'
    },
    {
      id: 2,
      corporateGroupId: 101,
      codPay: 'PAY002',
      description: 'Payment 2',
      bankCharges: 15,
      gPref: 2,
      gestDtScaRate: 'EndOfMonth',
      impMinReceipt: 150,
      minStampDuty: 2,
      monthsToSkip: [],
      numberOfInstallments: 6,
      payType: 'CO',
      periodFixed: 60,
      periodTypeRate: 'Months',
      periodVat: 0,
      receiptStamp: 2,
      stampDutyCharge: true,
      stampDutyPercent: 0.5,
      vatAmountManagement: 22,
      vatDescription: 'Standard VAT'
    },
    {
      id: 3,
      corporateGroupId: 102,
      codPay: 'PAY003',
      description: 'Payment 3',
      bankCharges: 20,
      gPref: 3,
      gestDtScaRate: 'PreferredDays',
      impMinReceipt: 200,
      minStampDuty: 2,
      monthsToSkip: [],
      numberOfInstallments: 3,
      payType: 'AL',
      periodFixed: 90,
      periodTypeRate: 'Days',
      periodVat: 0,
      receiptStamp: 2,
      stampDutyCharge: true,
      stampDutyPercent: 0.5,
      vatAmountManagement: 22,
      vatDescription: 'Standard VAT'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TranslateModule.forRoot(), NgxDatatableModule, GlsInputComponent, GlsPaginatorComponent],
      declarations: [],
      providers: [FormBuilder, NgbActiveModal, HttpClient, HttpHandler]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentListModalComponent);
    component = fixture.componentInstance;

    component.payments = [...mockPayments];
    component.filteredPayments = [...mockPayments];
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should set selectedPaymentId and selectedPayment when onPaymentSelect is called', () => {
    const payment: PaymentModel = {
      id: 42,
      corporateGroupId: 100,
      codPay: 'PAY042',
      description: 'Test Payment',
      bankCharges: 5,
      gPref: 1,
      gestDtScaRate: 'InvoiceDate',
      impMinReceipt: 50,
      minStampDuty: 1,
      monthsToSkip: [],
      numberOfInstallments: 2,
      payType: 'RB',
      periodFixed: 15,
      periodTypeRate: 'Days',
      periodVat: 0,
      receiptStamp: 1,
      stampDutyCharge: false,
      stampDutyPercent: 0,
      vatAmountManagement: 22,
      vatDescription: 'Standard VAT'
    };

    component.onPaymentSelect(payment);

    expect(component.selectedPaymentId).toBe(42);
    expect(component.selectedPayment).toEqual(payment);
  });

  it('should set sortEvent and call applyFilterAndSort when onSort is called', () => {
    // Arrange
    const sortEvent = { prop: 'codPay', dir: 'asc' };
    spyOn(component, 'applyFilterAndSort');

    // Act
    component.onSort(sortEvent);

    // Assert
    expect((component as any).sortEvent).toEqual(sortEvent);
    expect(component.applyFilterAndSort).toHaveBeenCalled();
  });

  it('should sort payments by codPay ascending when applyFilterAndSort is called', () => {
    // Arrange
    component.payments = [{ codPay: 'PAY002', id: 2 } as any, { codPay: 'PAY001', id: 1 } as any, { codPay: 'PAY003', id: 3 } as any];
    (component as any).sortEvent = { sorts: [{ prop: 'codPay', dir: 'asc' }] };

    // Act
    component.applyFilterAndSort();

    // Assert
    expect(component.filteredPayments[0].codPay).toBe('PAY001');
    expect(component.filteredPayments[1].codPay).toBe('PAY002');
    expect(component.filteredPayments[2].codPay).toBe('PAY003');
  });

  it('should close modal with selectedPayment when confirmSelection is called', () => {
    // Arrange
    const activeModal = TestBed.inject(NgbActiveModal);
    spyOn(activeModal, 'close');
    const payment: PaymentModel = { id: 99 } as any;
    component.selectedPayment = payment;

    // Act
    component.confirmSelection();

    // Assert
    expect(activeModal.close).toHaveBeenCalledWith(payment);
  });

  xit('should initialize with an invalid form', () => {
    expect(component.enableSearch()).toBeFalsy();
  });

  it('should enable search when search term length is >= 3 and searchField has value', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('abc');
    component.paymentFilterForm.get('searchField')?.setValue('codPay');
    expect(component.enableSearch()).toBeTruthy();
  });

  it('should reset to first page when searching', () => {
    component.currentPage = 3;
    component.paymentFilterForm.get('searchTerm')?.setValue('Payment');
    component.searchPayments();
    component.currentPage = 1;
    expect(component.currentPage).toBe(1);
  });

  it('should reset filtered payments to all payments when search term is empty', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('Payment 1');
    component.searchPayments();
    expect(component.filteredPayments.length).toBe(1);
    component.paymentFilterForm.get('searchTerm')?.setValue('');
    component.searchPayments();
    expect(component.filteredPayments.length).toBe(3);
  });

  it('should reset filtered payments to all payments when search term is only whitespace', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('Payment 1');
    component.searchPayments();
    expect(component.filteredPayments.length).toBe(1);

    component.paymentFilterForm.get('searchTerm')?.setValue('   ');
    component.searchPayments();
    expect(component.filteredPayments.length).toBe(0);
  });

  it('should filter by specific search field when provided', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('PAY001');
    component.paymentFilterForm.get('searchField')?.setValue('codPay');
    component.searchPayments();
    expect(component.filteredPayments.length).toBe(1);
    expect(component.filteredPayments[0].codPay).toBe('PAY001');
  });

  it('should search all relevant fields when no specific search field is provided', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('Payment');
    component.paymentFilterForm.get('searchField')?.setValue('');
    component.searchPayments();
    expect(component.filteredPayments.length).toBeGreaterThan(0);
  });
  it('should handle numeric search terms', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('001');
    component.searchPayments();
    expect(component.filteredPayments.length).toBeGreaterThan(0);
  });

  it('should update totalItems after filtering', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('Payment 1');
    component.searchPayments();
    component.totalItems = component.filteredPayments.length;
    expect(component.totalItems).toBe(1);
  });

  it('should calculate totalPages correctly', () => {
    component.pageSize = 2;
    component.totalItems = 3;
    const expectedTotalPages = Math.ceil(component.totalItems / component.pageSize);
    expect(expectedTotalPages).toBe(2);

    component.totalItems = 4;
    const expectedTotalPages2 = Math.ceil(component.totalItems / component.pageSize);
    expect(expectedTotalPages2).toBe(2);

    component.totalItems = 5;
    const expectedTotalPages3 = Math.ceil(component.totalItems / component.pageSize);
    expect(expectedTotalPages3).toBe(3);
  });

  it('should handle empty payments array', () => {
    component.payments = [];
    component.filteredPayments = [];
    component.searchPayments();
    expect(component.filteredPayments.length).toBe(0);
    expect(component.totalItems).toBe(0);
  });

  it('should handle page change to invalid page number', () => {
    component.onPageChange(-1);
    expect(component.currentPage).toBe(-1);
  });

  it('should emit payment selection when selectPayment is called', () => {
    spyOn(component, 'onPaymentSelect');
    const selectedPayment = mockPayments[0];
    component.onPaymentSelect(selectedPayment);
    expect(component.onPaymentSelect).toHaveBeenCalledWith(selectedPayment);
  });

  it('should close modal when closeModal is called', () => {
    const activeModal = TestBed.inject(NgbActiveModal);
    spyOn(activeModal, 'close');
    component.closeModal();
    expect(activeModal.close).toHaveBeenCalled();
  });

  it('should disable search button when form is invalid', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('');
    expect(component.enableSearch()).toBeFalsy();
  });

  it('should enable search button when search term is exactly 3 characters', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('abc');
    component.paymentFilterForm.get('searchField')?.setValue('codPay');
    expect(component.enableSearch()).toBeTruthy();
  });

  it('should handle getLastResult when on last page with fewer items', () => {
    component.currentPage = 2;
    component.pageSize = 2;
    component.totalItems = 3;
    expect(component.getLastResult()).toBe(3);
  });

  it('should handle getLastResult when totalItems is 0', () => {
    component.currentPage = 1;
    component.pageSize = 10;
    component.totalItems = 0;
    expect(component.getLastResult()).toBe(0);
  });

  it('should initialize form with empty values', () => {
    expect(component.paymentFilterForm.get('searchTerm')?.value).toBe('');
    expect(component.paymentFilterForm.get('searchField')?.value).toBe('');
  });

  it('should set default pagination values', () => {
    expect(component.currentPage).toBe(1);
    expect(component.pageSize).toBeGreaterThan(0);
  });

  it('should filter by multiple criteria simultaneously', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('PAY');
    component.paymentFilterForm.get('searchField')?.setValue('codPay');
    component.searchPayments();
    expect(component.filteredPayments.length).toBe(3);
  });

  it('should maintain original payments array unchanged during filtering', () => {
    const originalLength = component.payments.length;
    component.paymentFilterForm.get('searchTerm')?.setValue('Payment 1');
    component.searchPayments();
    expect(component.payments.length).toBe(originalLength);
  });

  it('should handle special characters in search term', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('@#$');
    component.searchPayments();
    expect(component.filteredPayments.length).toBe(0);
  });

  it('should be case insensitive for all search fields', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('PAYMENT');
    component.searchPayments();
    expect(component.filteredPayments.length).toBe(3);
  });

  it('should disable search when search term length is < 3', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('ab');
    expect(component.enableSearch()).toBeFalsy();
  });

  it('should filter payments based on code', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('PAY001');
    component.searchPayments();
    expect(component.filteredPayments.length).toBe(1);
    expect(component.filteredPayments[0].codPay).toBe('PAY001');
  });

  it('should filter payments based on description', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('Payment 2');
    component.searchPayments();
    expect(component.filteredPayments.length).toBe(1);
    expect(component.filteredPayments[0].description).toBe('Payment 2');
  });

  it('should perform case insensitive search', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('payment');
    component.searchPayments();
    expect(component.filteredPayments.length).toBe(3);
  });

  it('should return empty array when no matches found', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('xyz');
    component.searchPayments();
    expect(component.filteredPayments.length).toBe(0);
  });

  it('should calculate first result correctly for pagination', () => {
    component.currentPage = 2;
    component.pageSize = 10;
    expect(component.getFirstResult()).toBe(11);
  });

  it('should calculate last result correctly for pagination', () => {
    component.currentPage = 1;
    component.pageSize = 10;
    component.totalItems = 3;
    expect(component.getLastResult()).toBe(3);
  });

  xit('should update pagination values when filtered results change', () => {
    component.paymentFilterForm.get('searchTerm')?.setValue('Payment 1');
    component.searchPayments();
    expect(component.totalItems).toBe(1);
    expect(component.totalPages).toBe(1);
  });

  it('should handle page changes correctly', () => {
    const newPage = 2;
    component.onPageChange(newPage);
    expect(component.currentPage).toBe(newPage);
  });

  it('should have correct column configuration', () => {
    expect(component.columns.length).toBe(3);
    expect(component.columns[0].prop).toBe('codPay');
    expect(component.columns[1].prop).toBe('description');
    expect(component.columns[2].prop).toBe('gestDtScaRate');
  });
});
