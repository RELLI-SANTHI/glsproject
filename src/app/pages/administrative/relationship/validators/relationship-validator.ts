import { FormGroup, Validators } from '@angular/forms';
import { Utility } from '../../../../common/utilities/utility';

export class RelationshipValidator {
  /*
   * financialDetail.declarationOfIntentProtocol
   * financialDetail.declarationOfIntentProtocolProgressive
   * financialDetail.declarationOfIntentDate
   * If the customer has VAT exemption (financialDetail.vatSubjection), then these fields can be filled in.
   * If the customer is no longer exempt and therefore the VAT Subjection field is different from 'E', these 3 fields must be automatically cleared.
   * If one of the 3 fields is filled in, the other 2 are mandatory
   * */
  static updateFinancialDetailValidators(formGroup: FormGroup): void {
    const vatSubjection = formGroup.get('vatSubjection')?.value;
    const declarationOfIntentProtocolControl = formGroup.get('declarationOfIntentProtocol');
    const declarationOfIntentProtocolProgressiveControl = formGroup.get('declarationOfIntentProtocolProgressive');
    const declarationOfIntentDateControl = formGroup.get('declarationOfIntentDate');
    const vatExemptionControl = formGroup.get('vatExemptionId');
    const vatRateValueControl = formGroup.get('vatRateValue');
    if (vatSubjection === 'E') {
      vatExemptionControl?.addValidators(Validators.required);
      vatRateValueControl?.removeValidators(Validators.required);
    } else {
      vatExemptionControl?.removeValidators(Validators.required);
      vatRateValueControl?.addValidators(Validators.required);
    }
    if (
      vatSubjection === 'E' &&
      ((!!declarationOfIntentProtocolControl?.value && declarationOfIntentProtocolControl?.value !== '') ||
        (!!declarationOfIntentProtocolProgressiveControl?.value && declarationOfIntentProtocolProgressiveControl?.value !== '') ||
        (!!declarationOfIntentDateControl?.value && declarationOfIntentDateControl?.value !== ''))
    ) {
      declarationOfIntentProtocolControl?.addValidators(Validators.required);
      declarationOfIntentProtocolProgressiveControl?.addValidators(Validators.required);
      declarationOfIntentDateControl?.addValidators(Validators.required);
    } else {
      declarationOfIntentProtocolControl?.removeValidators(Validators.required);
      declarationOfIntentProtocolProgressiveControl?.removeValidators(Validators.required);
      declarationOfIntentDateControl?.removeValidators(Validators.required);
    }
    declarationOfIntentProtocolControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    declarationOfIntentProtocolProgressiveControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    declarationOfIntentDateControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    vatExemptionControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    vatRateValueControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  static updateInvoiceDetailValidators(formGroup: FormGroup): void {
    const startControl = formGroup.get('startOfAccountingActivity');
    const endControl = formGroup.get('endOfAccountingActivity');

    if (startControl?.value && endControl?.value) {
      endControl.setValidators([
        (control) => {
          const startValue = Utility.convertFromGenericDataToDate(startControl.value);
          const endValue = Utility.convertFromGenericDataToDate(control.value);
          if (startValue && endValue && startValue > endValue) {
            return { endBeforeStart: true };
          }

          return null;
        }
      ]);
      startControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      endControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
  }
}
