/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { NgClass, NgForOf } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { GlsPaginatorComponent } from '../../../../../../common/components/gls-paginator/gls-paginator.component';
import { PaymentService } from '../../../../../../api/glsAdministrativeApi/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PaymentModel, PaymentResponseModel } from '../../../../../../api/glsAdministrativeApi/models';
import { PAYMENT_MODAL_COLUMNS, PAYMENT_OPTIONS_SEARCH } from '../../../constants/relationship-constants';
import { PostApiPaymentV1$Json$Params } from '../../../../../../api/glsAdministrativeApi/fn/payment/post-api-payment-v-1-json';
import { GlsInputDropdownComponent } from '../../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { VIEW_MODE } from '../../../../../../common/app.constants';

@Component({
  selector: 'app-payment-list-modal',
  standalone: true,
  imports: [TranslateModule, NgxDatatableModule, NgForOf, GlsInputComponent, GlsPaginatorComponent, GlsInputDropdownComponent, NgClass],
  templateUrl: './payment-list-modal.component.html',
  styleUrl: './payment-list-modal.component.scss'
})
export class PaymentListModalComponent implements OnInit {
  public corporateGroupId: number | null = null;

  @ViewChild('paymentTable') table!: DatatableComponent;
  @ViewChild('datatableWrapper') datatableWrapper!: ElementRef;
  isSmallMobile = signal(false);
  paymentFilterForm: FormGroup;
  selectedPaymentId: number | null = null;
  selectedPayment: PaymentModel | null = null;
  // Table configuration
  columns = PAYMENT_MODAL_COLUMNS;
  optionsPaymentSearch = PAYMENT_OPTIONS_SEARCH;
  // Pagination
  pageSize = 10;
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  payments: PaymentModel[] = [];
  filteredPayments: PaymentModel[] = [];
  private sortEvent: any = null;
  private readonly paymentService = inject(PaymentService);
  private readonly genericService = inject(GenericService);

  constructor(
    private fb: FormBuilder,
    private readonly activeModal: NgbActiveModal
  ) {
    this.paymentFilterForm = this.fb.group({
      searchTerm: [''],
      searchField: ['']
    });
  }

  ngOnInit(): void {
    this.loadPayments();
    this.paymentFilterForm.get('searchTerm')?.valueChanges.subscribe((value) => {
      if (!value) {
        this.resetPaymentFilter();
      }
    });
    this.isSmallMobile.set(this.genericService.viewMode() === VIEW_MODE.MOBILE);
  }

  enableSearch(): boolean {
    return this.paymentFilterForm.get('searchTerm')?.value !== '' && this.paymentFilterForm.get('searchField')?.value !== '';
  }

  enableConfirmSelection(): boolean {
    return this.selectedPaymentId !== null;
  }

  resetPaymentFilter(): void {
    this.selectedPaymentId = null;
    this.selectedPayment = null;
    this.filteredPayments = [...this.payments]; // Reset to original payments
    this.updatePagination();
  }

  searchPayments(): void {
    const searchTerm = this.paymentFilterForm.get('searchTerm')?.value.toLowerCase();
    /*     const searchField = this.paymentFilterForm.get('searchField')?.value;
        const payload = {
          searchTerm: searchTerm || '',
          searchField: searchField || ''
        }
        this.loadPayments(payload); */
    this.filteredPayments = this.payments.filter(
      (payment) => payment.codPay.toLowerCase().includes(searchTerm) || payment.description.toLowerCase().includes(searchTerm)
    );
    this.updatePagination();
  }

  onPaymentSelect(row: PaymentModel): void {
    this.selectedPaymentId = row.id;
    this.selectedPayment = row;
    // Emit selection event if needed
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFilterAndSort();
  }

  // Handle sort events
  onSort(event: any) {
    this.sortEvent = event;
    this.applyFilterAndSort();
  }

  // Apply filters and sorting to the full dataset
  applyFilterAndSort() {
    // First apply any filters to get filtered data from allPayments
    let filteredData = [...this.payments]; // Apply your filters here if needed
    // Then apply sorting if we have a sort event
    if (this.sortEvent) {
      const { prop, dir } = this.sortEvent.sorts[0];
      filteredData = filteredData.sort((a, b) => {
        let valueA = a[prop as keyof PaymentModel] ?? '';
        let valueB = b[prop as keyof PaymentModel] ?? '';
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }

        if (dir === 'asc') {
          return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        } else {
          return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
        }
      });
    }
    // Update the total count (if needed)
    this.totalItems = filteredData.length;
    // Apply pagination to get just the current page
    const start = (this.currentPage - 1) * this.pageSize;
    const end = Math.min(start + this.pageSize, filteredData.length);
    this.filteredPayments = filteredData.slice(start, end);
  }

  getFirstResult(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getLastResult(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  confirmSelection(): void {
    this.activeModal.close(this.selectedPayment);
  }

  closeModal(): void {
    this.activeModal.close();
  }

  private updatePagination(): void {
    this.totalItems = this.payments.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
  }

  private loadPayments(): void {
    const payload: PostApiPaymentV1$Json$Params = {
      body: {
        corporateGroupId: this.corporateGroupId ?? 0
      }
    };
    this.paymentService.postApiPaymentV1$Json(payload).subscribe({
      next: (response: PaymentResponseModel) => {
        this.payments = response.payments ?? [];
        this.filteredPayments = [...this.payments].slice(0, this.pageSize); // Initialize filtered payments
        this.updatePagination();
        this.applyFilterAndSort(); // Apply current sorting and filtering
      },
      error: (error) => {
        this.genericService.manageError(error);
      }
    });
  }
}
