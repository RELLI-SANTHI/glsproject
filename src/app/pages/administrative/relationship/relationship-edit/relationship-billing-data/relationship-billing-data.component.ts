import { Component, inject, input, OnInit } from '@angular/core';
import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { GlsInputDataComponent } from '../../../../../common/form/gls-input-data/gls-input-date.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PaymentListModalComponent } from './payment-list-modal/payment-list-modal.component';
import { DatePipe } from '@angular/common';
import { PaymentModel } from '../../../../../api/glsAdministrativeApi/models';
import { GlsInputCheckboxComponent } from '../../../../../common/form/gls-input-checkbox/gls-input-checkbox.component';
import { Utility } from '../../../../../common/utilities/utility';
import { MODAL_LG } from '../../../../../common/utilities/constants/modal-options';
import { PaymentService } from '../../../../../api/glsAdministrativeApi/services/payment.service';
import { GenericService } from '../../../../../common/utilities/services/generic.service';
import {
  InputStatusSectionComponent
} from '../../../../../common/form/input-status-section/input-status-section.component';

@Component({
  selector: 'app-relationship-billing-data',
  standalone: true,
  imports: [GlsInputComponent, ReactiveFormsModule, TranslatePipe, GlsInputDataComponent, GlsInputCheckboxComponent, DatePipe, InputStatusSectionComponent],
  templateUrl: './relationship-billing-data.component.html',
  styleUrl: './relationship-billing-data.component.scss'
})
export class RelationshipBillingDataComponent implements OnInit {
  relationshipBillingDataForm = input.required<FormGroup>();
  isWriting = input<boolean>();
  isFromSubject = input<boolean>();
  isDraft = input.required<boolean>();
  corporateGroupId = input<number | null>();
  modalRef!: NgbModalRef;
  selectedPayment: PaymentModel | null = null;
  readonly utility = Utility;
  private readonly paymentService = inject(PaymentService);
  private readonly genericService = inject(GenericService);
  private readonly modalService = inject(NgbModal);

  ngOnInit(): void {
    if (this.relationshipBillingDataForm()?.get('paymentId')?.value) {
      this.loadPayment();
    }

    const startDate = this.relationshipBillingDataForm()?.get('startOfAccountingActivity')?.value;
    if (this.isWriting() && startDate) {
      this.relationshipBillingDataForm()?.get('startOfAccountingActivity')?.setValue(Utility.fromIsoStringToDatepicker(startDate));
    }
    const endDate = this.relationshipBillingDataForm()?.get('endOfAccountingActivity')?.value;
    if (this.isWriting() && endDate) {
      this.relationshipBillingDataForm()?.get('endOfAccountingActivity')?.setValue(Utility.fromIsoStringToDatepicker(endDate));
    }
  }

  getPaymentCodeBtnLabel(): string {
    if (this.selectedPayment) {
      return 'administrative.relationshipEdit.relationshipBillingData.changePaymentCode';
    } else {
      return 'administrative.relationshipEdit.relationshipBillingData.choosePaymentCode';
    }
  }

  choosePaymentCode(): void {
    this.modalRef = this.modalService.open(PaymentListModalComponent, MODAL_LG);
    this.modalRef.componentInstance.corporateGroupId = this.corporateGroupId();
    this.modalRef.result.then((payment: PaymentModel) => {
      if (payment) {
        this.relationshipBillingDataForm()!.get('paymentId')!.setValue(payment!.id);
        this.selectedPayment = payment;
      }
    });
  }

  private loadPayment(): void {
    const payload = {
      id: Number(this.relationshipBillingDataForm()?.get('paymentId')?.value)
    };
    this.paymentService.getApiPaymentV1Id$Json(payload).subscribe({
      next: (response: PaymentModel) => {
        this.selectedPayment = response;
      },
      error: (error) => {
        this.genericService.manageError(error);
      }
    });
  }
}
