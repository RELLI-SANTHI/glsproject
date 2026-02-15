import { FormGroup, Validators } from '@angular/forms';

export class CompanyValidator {
  static updateVatGroupValidators(formGroup: FormGroup): void {
    const vatGroup = formGroup.get('vatGr')?.value;
    const vatNumberControl = formGroup.get('vatNo');
    // const taxCodeControl = formGroup.get('taxIdcode');
    // if vatGroup is true, vatNumber end taxCode are required
    if (!vatGroup) {
      vatNumberControl?.removeValidators(Validators.required);
      // taxCodeControl?.removeValidators(Validators.required);
    } else {
      vatNumberControl?.addValidators(Validators.required);
      // taxCodeControl?.addValidators(Validators.required);
    }
    vatNumberControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    // taxCodeControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  static updateBillingDataValidators(formGroup: FormGroup): void {
    const custCodeRecControl = formGroup.get('custCodeRec');
    const pecControl = formGroup.get('pec');
    if (!custCodeRecControl?.value) {
      pecControl?.addValidators(Validators.required);
    } else {
      pecControl?.removeValidators(Validators.required);
    }
    if (!pecControl?.value) {
      custCodeRecControl?.addValidators(Validators.required);
    } else {
      custCodeRecControl?.removeValidators(Validators.required);
    }

    custCodeRecControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    pecControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }
}
