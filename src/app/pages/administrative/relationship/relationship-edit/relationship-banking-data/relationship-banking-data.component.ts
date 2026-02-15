import { Component, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { BankService, CustomerService } from '../../../../../api/glsAdministrativeApi/services';
import { BankResponse, GenerateIbanCinResponse, GetBankResponse } from '../../../../../api/glsAdministrativeApi/models';
import { PostApiBankV1$Json$Params } from '../../../../../api/glsAdministrativeApi/fn/bank/post-api-bank-v-1-json';
import { GenericService } from '../../../../../common/utilities/services/generic.service';
import { IBAN_REGEX, NO_SPECIAL_CHARACTER_REGEX } from '../../../../../common/utilities/constants/constant-validator';
import { PostApiCustomerV1GenerateIbanCin$Json$Params } from '../../../../../api/glsAdministrativeApi/fn/customer/post-api-customer-v-1-generate-iban-cin-json';
import { WarningStatusComponent } from '../../../../../common/components/warning-status/warning-status.component';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-relationship-banking-data',
  standalone: true,
  imports: [GlsInputComponent, ReactiveFormsModule, TranslatePipe, WarningStatusComponent, NgClass, DecimalPipe],
  templateUrl: './relationship-banking-data.component.html',
  styleUrl: './relationship-banking-data.component.scss'
})
export class RelationshipBankingDataComponent implements OnInit {
  relationshipBankingDataForm = input.required<FormGroup>();
  isWriting = input<boolean>();
  isFromSubject = input<boolean>();
  isItalianRelationship = input<boolean>();
  isRemittance = input<boolean>(false);
  error = input<boolean>(false);
  warning = input<boolean>(false);
  titleLabel = input.required<string>();
  titleLabelCard = input.required<string>();
  isDraft = input.required<boolean>();
  bankDetailEvent = output<BankResponse | undefined>();
  bankDetail: BankResponse | undefined;
  showEmptyMsg = signal(false);
  private readonly genericService = inject(GenericService);
  private readonly bankService = inject(BankService);
  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);

  constructor() {
    effect(() => {
      this.updateBankingValidators();
    });
  }

  /**
   * Component for managing banking data in a relationship.
   * It allows users to input and search for bank details, with validation based on the type of relationship.
   * It also handles changes in the relationship type to update validators accordingly.
   */
  ngOnInit(): void {
    const idBankProp = this.isRemittance() ? 'remittanceBankId' : 'bankId';
    const idBank = this.relationshipBankingDataForm().get(idBankProp)?.value;
    if (idBank) {
      this.bankService.getApiBankV1Id$Json({ id: idBank }).subscribe({
        next: (res: BankResponse) => {
          this.bankDetail = res;
          this.bankDetailEvent.emit(this.bankDetail);

          // Delay needed to allow the form to update before setting the error state
          if (this.error()) {
            setTimeout(() => this.setErrorState(), 1000);
          }
          if (this.warning() && !this.error()) {
            setTimeout(() => this.setWarningState(), 1000);
          }
        },
        error: (error) => {
          this.bankDetail = undefined;
          this.genericService.manageError(error);
        }
      });
    }
  }

  /**
   * Initializes the banking data form with default values and validators.
   * @returns void
   */
  getLabel(field: string): string {
    const prefix = 'administrative.relationshipEdit.relationshipBankingData.';
    let label = '';
    switch (field) {
      case 'abi':
        label = this.isRemittance() ? 'remittanceAbi' : 'abi';
        break;
      case 'cab':
        label = this.isRemittance() ? 'remittanceCab' : 'cab';
        break;
      case 'bankDescription':
        label = this.isRemittance() ? 'remittanceBankDescription' : 'bankDescription';
        break;
      case 'agencyDescription':
        label = this.isRemittance() ? 'remittanceAgencyDescription' : 'agencyDescription';
        break;
    }

    return prefix + label;
  }

  /**
   * Returns the control name for a given field based on whether the relationship is a remittance.
   * @param field - The field for which to get the control name.
   * @returns The control name as a string.
   * This method checks if the relationship is a remittance and returns the appropriate control name.
   * If the field is not recognized, it returns the field name itself.
   */
  getFieldControlName(field: string): string {
    let fieldName = '';
    switch (field) {
      case 'accountNumber':
        fieldName = this.isRemittance() ? 'remittanceAccountNumber' : 'accountNumber';
        break;
      case 'cin':
        fieldName = this.isRemittance() ? 'remittanceCin' : 'cin';
        break;
      case 'iban':
        fieldName = this.isRemittance() ? 'remittanceIban' : 'iban';
        break;
      case 'bic':
        fieldName = this.isRemittance() ? 'remittanceBic' : 'bic';
        break;
      case 'abi':
        fieldName = this.isRemittance() ? 'remittanceAbiCode' : 'abiCode';
        break;
      case 'cab':
        fieldName = this.isRemittance() ? 'remittanceCabCode' : 'cabCode';
        break;
    }

    return fieldName ?? field;
  }

  /**
   * Searches for a bank based on the ABI and CAB codes provided in the form.
   * If the search is successful, it emits the first bank found through the `bankDetailEvent`.
   * If an error occurs, it handles the error and resets the `bankDetail`.
   * @param void
   * @returns void
   * This method constructs a payload with the ABI and CAB codes from the form,
   * then calls the bank service to search for banks.
   * It subscribes to the response and updates the `bankDetail` accordingly.
   * If no banks are found, it sets `bankDetail` to undefined.
   * If an error occurs during the search, it calls the `manageError` method of the `genericService`.
   */
  searchBank(): void {
    this.showEmptyMsg.set(false);

    const payload: PostApiBankV1$Json$Params = {
      body: {
        abiCode: this.relationshipBankingDataForm().get(this.getFieldControlName('abi'))?.value,
        cabCode: this.relationshipBankingDataForm().get(this.getFieldControlName('cab'))?.value
      }
    };

    this.bankService.postApiBankV1$Json(payload).subscribe({
      next: (res: GetBankResponse) => {
        const firstBank = res?.banks?.length ? res.banks[0] : undefined;
        this.bankDetailEvent.emit(firstBank);
        this.bankDetail = firstBank;
        this.searchCinIban();
        if (!res?.banks?.length) {
          this.showEmptyMsg.set(true);
        }
      },
      error: (error) => {
        this.bankDetail = undefined;
        this.genericService.manageError(error);
      }
    });
  }

  /**
   * Checks if the search functionality should be disabled based on the ABI and CAB fields.
   * If either field is empty or invalid, the search will be disabled.
   * @param void
   * @returns A boolean indicating whether the search is disabled.
   * This method checks the values and validity of the ABI and CAB fields in the banking data form.
   * If either field is empty or invalid, it returns true, indicating that the search should be disabled.
   * Otherwise, it returns false.
   * This is useful for preventing unnecessary API calls when the required fields are not properly filled out.
   */
  searchDisable(): boolean | undefined {
    return (
      !this.relationshipBankingDataForm().get(this.getFieldControlName('abi'))?.value ||
      !this.relationshipBankingDataForm().get(this.getFieldControlName('cab'))?.value ||
      this.relationshipBankingDataForm().get(this.getFieldControlName('abi'))?.invalid ||
      this.relationshipBankingDataForm().get(this.getFieldControlName('cab'))?.invalid
    );
  }

  onAccountNumberBlur(): void {
    const accountNumberControl = this.relationshipBankingDataForm().get(this.getFieldControlName('accountNumber'));
    if (accountNumberControl && this.isItalianRelationship()) {
      let value = accountNumberControl.value;

      // se il valore non è vuoto o contiene caratteri diversi da 0, lo converto in maiuscolo
      if (value && !/^[0]+$/.test(value)) {
        value = value.toUpperCase();
        // rimuovo tutti i caratteri iniziali 0
        value = value.replace(/^0+/, '');
        // aggiungo tanti 0 all'inizio della stringa fino a raggiungere i 12 caratteri
        value = value.padStart(12, '0');
      }

      // se il valore non è vuoto e contiene solo 0, lo converto in una stringa vuota
      if (value && /^[0]+$/.test(value)) {
        value = '';
      }
      accountNumberControl.setValue(value?.toUpperCase(), { emitEvent: false });
      this.searchCinIban();
    }
  }

  searchCinIban(): void {
    const abiCode = this.relationshipBankingDataForm().get(this.getFieldControlName('abi'))?.value;
    const cabCode = this.relationshipBankingDataForm().get(this.getFieldControlName('cab'))?.value;
    const accountNumber = this.relationshipBankingDataForm().get(this.getFieldControlName('accountNumber'))?.value;
    if (this.isItalianRelationship() && abiCode && cabCode && accountNumber) {
      const payload: PostApiCustomerV1GenerateIbanCin$Json$Params = {
        body: {
          abiCode,
          cabCode,
          accountNumber
        }
      };

      this.customerService.postApiCustomerV1GenerateIbanCin$Json(payload).subscribe({
        next: (res: GenerateIbanCinResponse) => {
          this.relationshipBankingDataForm().get(this.getFieldControlName('cin'))?.setValue(res.cin);
          this.relationshipBankingDataForm().get(this.getFieldControlName('iban'))?.setValue(res.iban);
        },
        error: (error) => {
          this.genericService.manageError(error);
        }
      });
    }
  }

  /**
   * Determines whether to show an error message for a specific form field.
   * @param param {string} - The name of the form field to check for errors.
   */
  showErrorForm(param: string): boolean {
    const ctrl = this.relationshipBankingDataForm().get(this.getFieldControlName(param));

    return this.isWriting() ? (ctrl?.hasError('error') && ctrl?.pristine) || false : false;
  }

  /**
   * Checks if the relationship is Italian based on the `isItalianRelationship` input.
   * @return A boolean indicating whether the relationship is Italian.
   * This method returns the value of the `isItalianRelationship` input,
   * which is expected to be set by the parent component.
   * It is used to determine if the banking data form should apply specific validators or logic based on the relationship type.
   */
  private updateBankingValidators(): void {
    const ibanControl = this.relationshipBankingDataForm().get(this.getFieldControlName('iban'));
    const bicControl = this.relationshipBankingDataForm().get(this.getFieldControlName('bic'));
    const accountNumberControl = this.relationshipBankingDataForm().get(this.getFieldControlName('accountNumber'));
    const isItalian = this.isItalianRelationship();
    if (ibanControl && bicControl && accountNumberControl) {
      if (!isItalian) {
        if (!this.isRemittance()) {
          ibanControl.setValidators([Validators.required, Validators.maxLength(34)]);
          bicControl.addValidators([Validators.required]);
        } else {
          ibanControl.setValidators([Validators.maxLength(34)]);
        }
        accountNumberControl.setValidators([Validators.maxLength(14), Validators.pattern(NO_SPECIAL_CHARACTER_REGEX)]);
      } else {
        ibanControl.clearValidators();
        bicControl.removeValidators(Validators.required);
        ibanControl.setValidators([Validators.pattern(IBAN_REGEX), Validators.maxLength(27)]);
        accountNumberControl.setValidators([Validators.maxLength(12), Validators.pattern(NO_SPECIAL_CHARACTER_REGEX)]);
      }
      ibanControl.updateValueAndValidity();
      bicControl.updateValueAndValidity();
      accountNumberControl.updateValueAndValidity();
    }
  }

  private setWarningState(): void {
    this.setBankErrorOrWarning('warning');
  }

  /**
   * Sets the error state on the form controls if there is an error.
   * This method is called to visually indicate errors on the form fields.
   * It sets a generic error on the account number, CIN, IBAN, BIC, and bank credit fields if they have values.
   * @private
   */
  private setErrorState(): void {
    this.setBankErrorOrWarning('error');
  }

  setBankErrorOrWarning(errorMessage: string): void {
    const abiNumberCtrl = this.relationshipBankingDataForm().get(this.getFieldControlName('abi'));
    const cabCtrl = this.relationshipBankingDataForm().get(this.getFieldControlName('cab'));
    const accountNumberCtrl = this.relationshipBankingDataForm().get(this.getFieldControlName('accountNumber'));
    const cinCtrl = this.relationshipBankingDataForm().get(this.getFieldControlName('cin'));
    const ibanCtrl = this.relationshipBankingDataForm().get(this.getFieldControlName('iban'));
    const bicCtrl = this.relationshipBankingDataForm().get(this.getFieldControlName('bic'));
    const bankCreditCtrl = this.relationshipBankingDataForm().get(this.getFieldControlName('bankCredit'));

    if (abiNumberCtrl?.value) {
      abiNumberCtrl.setErrors({ error: errorMessage }, { emitEvent: true });
    }

    if (cabCtrl?.value) {
      cabCtrl.setErrors({ error: errorMessage }, { emitEvent: true });
    }

    if (accountNumberCtrl?.value) {
      accountNumberCtrl.setErrors({ error: errorMessage }, { emitEvent: true });
    }

    if (cinCtrl?.value) {
      cinCtrl.setErrors({ error: errorMessage }, { emitEvent: true });
    }

    if (ibanCtrl?.value) {
      ibanCtrl.setErrors({ error: errorMessage }, { emitEvent: true });
    }

    if (bicCtrl?.value) {
      bicCtrl.setErrors({ error: errorMessage }, { emitEvent: true });
    }

    if (bankCreditCtrl?.value) {
      bankCreditCtrl.setErrors({ error: errorMessage }, { emitEvent: true });
    }
  }
}
