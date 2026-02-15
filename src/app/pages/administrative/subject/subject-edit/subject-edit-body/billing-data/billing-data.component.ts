import { Component, inject, input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { ProvinceModel } from '../../../../../../api/glsNetworkApi/models';
import { ProvinceService } from '../../../../../../api/glsAdministrativeApi/services';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { GlsInputDropdownComponent } from '../../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { SubjectResponse } from '../../../../../../api/glsAdministrativeApi/models';
import { GenericDropdown } from '../../../../../../common/models/generic-dropdown';
import { NATIONS_LABELS } from '../../../../../../common/utilities/constants/generic-constants';

@Component({
  selector: 'app-billing-data',
  standalone: true,
  imports: [TranslatePipe, ReactiveFormsModule, GlsInputComponent, GlsInputDropdownComponent],
  templateUrl: './billing-data.component.html',
  styleUrl: './billing-data.component.scss'
})
export class BillingDataComponent implements OnInit {
  isWriting = input.required<boolean>();
  nationDefault = input<GenericDropdown | null>(null);
  nationList = input<GenericDropdown[] | null>([]);
  formInvoiceDetail = input.required<FormGroup>();
  allFormsDetails = input<FormGroup>();
  subjectData = input<SubjectResponse | null>();
  isDraft = input.required<boolean>();
  protected provinceList: ProvinceModel[] = [];

  private readonly InvoiceProvinceService = inject(ProvinceService);
  private readonly genericService = inject(GenericService);

  ngOnInit() {
    this.setNationValidators();

    if (this.isWriting()) {
      this.getProvincesForInvoiceDelivery();
      this.allFormsDetails()
        ?.get('nationId')
        ?.valueChanges.subscribe(() => {
          this.setNationValidators();
        });

      this.allFormsDetails()
        ?.get('isPhysicalPerson')
        ?.valueChanges.subscribe(() => {
          this.setNationValidators();
        });

      this.allFormsDetails()
        ?.get('nonProfitAssociation')
        ?.valueChanges.subscribe(() => {
          this.setNationValidators();
        });

      this.formInvoiceDetail()
        ?.get('recipientCustomerCode')
        ?.valueChanges.subscribe(() => {
          this.setNationValidators();
        });

      this.formInvoiceDetail()
        ?.get('pec')
        ?.valueChanges.subscribe(() => {
          this.setNationValidators();
        });
    }
  }

  protected setNationValidators(): void {
    const nationId = this.allFormsDetails()?.get('nationId')?.value;
    const nationIT = this.nationList()?.find((nation) => nation.code === NATIONS_LABELS.ISOCODE_IT);

    const recipientCustomerCodeControl = this.formInvoiceDetail().get('recipientCustomerCode');
    const pecControl = this.formInvoiceDetail().get('pec');
    const isPhysicalPerson = this.allFormsDetails()?.get('isPhysicalPerson')?.value;
    const nonProfitAssociation = this.allFormsDetails()?.get('nonProfitAssociation')?.value;

    if (!isPhysicalPerson && (nationId === nationIT?.id || nationId === String(nationIT?.id)) && !nonProfitAssociation) {
      if (!recipientCustomerCodeControl?.value) {
        pecControl?.addValidators(Validators.required);
      } else {
        pecControl?.removeValidators(Validators.required);
      }
      if (!pecControl?.value) {
        recipientCustomerCodeControl?.addValidators(Validators.required);
      } else {
        recipientCustomerCodeControl?.removeValidators(Validators.required);
      }
    } else {
      recipientCustomerCodeControl?.removeValidators(Validators.required);
      pecControl?.removeValidators(Validators.required);
    }
    recipientCustomerCodeControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    pecControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  getProvincesForInvoiceDelivery() {
    const payload = { body: {} };
    this.InvoiceProvinceService.postApiProvinceV1Getall$Json(payload).subscribe({
      next: (response) => {
        this.provinceList = response;
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  onValueChange(value: string | number, controlName: string): void {
    const control = this.formInvoiceDetail().get(controlName);
    if (control) {
      control.setValue(Number(value));
    }
  }

  isAtLastOneRequired(): boolean {
    const form = this.formInvoiceDetail();

    const hasRequired = (name: string) => {
      const control = form.get(name);
      if (!control || !control.validator) {
        return false;
      }
      const result = control.validator({} as AbstractControl);

      return !!result?.['required'];
    };

    return hasRequired('recipientCustomerCode') || hasRequired('pec');
  }
}
