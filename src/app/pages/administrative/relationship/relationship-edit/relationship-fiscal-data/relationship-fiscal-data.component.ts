import { Component, effect, inject, input, OnInit } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { GeneralModalComponent } from '../../../../../common/components/general-modal/general-modal.component';
import { GeneralTableComponent } from '../../../../../common/components/general-table/general-table.component';
import { GetVatRateResponse, VatExemptionModel, VatExpemtionsResponseModel } from '../../../../../api/glsAdministrativeApi/models';
import { EXEMPTION_COLUMN_LIST } from '../../../subject/constants/subject-constants';
import { VatExemptionService, VatRateService } from '../../../../../api/glsAdministrativeApi/services';
import { GlsInputCheckboxComponent } from '../../../../../common/form/gls-input-checkbox/gls-input-checkbox.component';
import { Utility } from '../../../../../common/utilities/utility';
import { GenericService } from '../../../../../common/utilities/services/generic.service';
import { GlsInputDataComponent } from '../../../../../common/form/gls-input-data/gls-input-date.component';
import { MODAL_XL } from '../../../../../common/utilities/constants/modal-options';
import { GlsInputDropdownComponent } from '../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { GenericDropdown } from '../../../../../common/models/generic-dropdown';
import { forkJoin } from 'rxjs';
import { PostApiVatexemptionV1$Json$Params } from '../../../../../api/glsAdministrativeApi/fn/vat-exemption/post-api-vatexemption-v-1-json';
import { InputStatusSectionComponent } from '../../../../../common/form/input-status-section/input-status-section.component';

@Component({
  selector: 'app-relationship-fiscal-data',
  standalone: true,
  imports: [
    TranslatePipe,
    GlsInputComponent,
    ReactiveFormsModule,
    CommonModule,
    GlsInputCheckboxComponent,
    GlsInputDataComponent,
    GlsInputDropdownComponent,
    InputStatusSectionComponent
  ],
  templateUrl: './relationship-fiscal-data.component.html',
  styleUrl: './relationship-fiscal-data.component.scss'
})
export class RelationshipFiscalDataComponent implements OnInit {
  filscalDataForm = input.required<FormGroup>();
  formParent = input.required<FormGroup>();
  showForm = false;
  selectedRow: VatExemptionModel | undefined;
  exemptionValue: VatExemptionModel[] = [];
  isWriting = input<boolean>(true);
  isDraft = input.required<boolean>();
  corporateGroupId = input<number>();
  vatRateOptions: GenericDropdown[] = [];
  protected readonly utility = Utility;
  private readonly modalService = inject(NgbModal);
  private readonly translateService = inject(TranslateService);
  private readonly columnsCurTable = EXEMPTION_COLUMN_LIST;
  private readonly vatExemptionService = inject(VatExemptionService);
  private readonly genericService = inject(GenericService);
  private readonly vatService = inject(VatRateService);

  constructor() {
    effect(
      () => {
        if (this.corporateGroupId()) {
          this.loadFiscalData();
        }
      },
      {
        allowSignalWrites: true
      }
    );
  }

  ngOnInit() {
    this.changeVatSubjection();
    if (this.filscalDataForm().get('invoiceVatRate')?.value) {
      this.filscalDataForm().get('invoiceVatRateToggle')?.setValue(true);
      this.filscalDataForm().get('invoiceVatRate')?.setValue(this.filscalDataForm().get('vatRateValue')?.value);
    } else {
      this.filscalDataForm().get('invoiceVatRateToggle')?.setValue(false);
      this.filscalDataForm().get('invoiceVatRate')?.setValue(null);
    }

    if (!this.isDraft()) {
      this.filscalDataForm()?.get('invoiceVatRate')?.disable();
    }
    let previousVatSubjection = this.filscalDataForm()?.get('vatSubjection')?.value;
    this.filscalDataForm()
      ?.get('vatSubjection')
      ?.valueChanges.subscribe((value) => {
        if (value === 'E' && value !== previousVatSubjection) {
          this.filscalDataForm().get('vatExemptionId')?.setValue(null);
          this.filscalDataForm().get('exemptionReference')?.setValue(null);
          this.filscalDataForm().get('exemptionReferenceSecondLine')?.setValue(null);
          this.filscalDataForm().get('vatExemptionCode')?.setValue(null);
          this.filscalDataForm().get('vatXmlNewCode')?.setValue(null);
          this.filscalDataForm().get('description')?.setValue(null);
          this.selectedRow = {} as VatExemptionModel;

          this.filscalDataForm().get('invoiceVatRate')?.setValue(null);
          this.filscalDataForm().get('declarationOfIntentProtocol')?.setValue(null);
          this.filscalDataForm().get('declarationOfIntentProtocolProgressive')?.setValue(null);
          this.filscalDataForm().get('declarationOfIntentDate')?.setValue(null);
          previousVatSubjection = value;
        } else if (value === 'I' && value !== previousVatSubjection) {
          previousVatSubjection = value;
          this.filscalDataForm().get('vatRateValue')?.setValue(null);
          this.filscalDataForm().get('invoiceVatRate')?.setValue(null);
        }
      });
  }

  getIvaBtnLabel(): string {
    return this.selectedRow && this.selectedRow.id
      ? 'administrative.relationshipEdit.relationshipBillingData.changePaymentCode'
      : 'administrative.relationshipEdit.relationshipBillingData.choosePaymentCode';
  }

  selectIvaCode(): void {
    this.openVatExemptionModal();
  }

  private openVatExemptionModal() {
    const modalRef = this.modalService.open(GeneralModalComponent, MODAL_XL);

    modalRef.componentInstance.title = this.translateService.instant('administrative.generalData.modalValues.titleVatExemption');
    modalRef.componentInstance.cancelText = this.translateService.instant('administrative.generalData.modalValues.btnCancel');
    modalRef.componentInstance.confirmText = this.translateService.instant('administrative.generalData.modalValues.btnConfirm');
    modalRef.componentInstance.contentComponent = GeneralTableComponent;
    modalRef.componentInstance.contentInputs = {
      columns: this.columnsCurTable,
      data: this.exemptionValue
    };

    modalRef.result.then((selectedRows: VatExemptionModel) => {
      this.setVatExemptionValue(selectedRows);
    });
  }

  // eslint-disable-next-line max-lines-per-function
  private loadFiscalData() {
    const params: PostApiVatexemptionV1$Json$Params = { body: {} };

    if (this.corporateGroupId()) {
      params.body!.corporateGroupId = this.corporateGroupId();
    }

    forkJoin({
      vatRates: this.vatService.postApiVatrateV1$Json(params),
      vatExemptions: this.vatExemptionService.postApiVatexemptionV1$Json(params)
    }).subscribe({
      next: (response: { vatRates: GetVatRateResponse; vatExemptions: VatExpemtionsResponseModel }) => {
        // Handle VAT rates:
        this.vatRateOptions =
          response.vatRates.items?.flatMap((item) => {
            return Object.keys(item)
              .filter((key) => {
                const value = (item as unknown as Record<string, unknown>)[key];

                return /^rate\d+$/.test(key) && typeof value === 'number';
              })
              .map((key) => {
                const rateValue = (item as unknown as Record<string, number>)[key];

                return {
                  id: rateValue.toString(), // item.id + '-' + key,
                  value: rateValue.toString()
                };
              });
          }) || [];

        // Handle VAT exemptions
        this.exemptionValue = response.vatExemptions.items || [];
        if (this.filscalDataForm().get('vatExemptionId')?.value) {
          const selectedRow = this.exemptionValue.find((item) => item.id === this.filscalDataForm().get('vatExemptionId')?.value);
          if (selectedRow) {
            this.setVatExemptionValue(selectedRow);
          }
        }
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  private setVatExemptionValue(row: VatExemptionModel) {
    if (row) {
      this.showForm = true;
      this.selectedRow = row;
      const description = row.description;
      const vatId = row.id;
      const vatCode = row.code;
      const vatXmlNewCode = row.vatXmlNewCode;
      this.filscalDataForm().patchValue({
        vatExemptionId: vatId,
        vatExemptionCode: vatCode,
        vatXmlNewCode: vatXmlNewCode,
        description: description
      });
      this.filscalDataForm().get('vatExemptionId')?.enable();
      // this.formParent().get('invoiceDetail')?.get('xmlInvoiceStamp')?.setValue(row.xmlStampContribution);
    }
  }

  invoiceRateToggle(): void {
    const isChecked = this.filscalDataForm().get('invoiceVatRateToggle')?.value;
    const vatRateControlValue = this.filscalDataForm().get('vatRateValue')?.value;
    if (isChecked) {
      this.filscalDataForm().get('invoiceVatRate')?.setValue(vatRateControlValue);
    } else {
      this.filscalDataForm().get('invoiceVatRate')?.setValue(null);
    }
  }

  onVatRateChange(): void {
    const vatRateValue = this.filscalDataForm().get('vatRateValue')?.value;
    if (vatRateValue && this.filscalDataForm().get('invoiceVatRateToggle')?.value) {
      this.filscalDataForm().get('invoiceVatRate')?.setValue(vatRateValue);
    } else {
      this.filscalDataForm().get('invoiceVatRate')?.setValue(null);
    }
  }

  changeVatSubjection() {
    const vatSubjection = this.filscalDataForm().get('vatSubjection')?.value;
    if (
      vatSubjection === 'I' &&
      this.filscalDataForm().get('invoiceVatRate')?.value === null &&
      this.filscalDataForm().get('vatRateValue')?.value === null
    ) {
      this.filscalDataForm().get('invoiceVatRateToggle')?.setValue(false);
    }
  }

  protected convertFromGenericDataToString(date: any): string {
    return Utility.convertFromGenericDataToString(date);
  }
}
