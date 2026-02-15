import { FormGroup, Validators } from '@angular/forms';

export class SubjectValidator {
  static updatePersonValidators(formGroup: FormGroup): void {
    const isPhysicalPerson = formGroup.get('isPhysicalPerson')?.value;
    const nameControl = formGroup.get('name');
    const surnameControl = formGroup.get('surname');
    const companyNameControl = formGroup.get('companyName');
    if (isPhysicalPerson) {
      surnameControl?.addValidators(Validators.required);
      nameControl?.addValidators(Validators.required);

      companyNameControl?.removeValidators(Validators.required);
    } else {
      surnameControl?.removeValidators(Validators.required);
      nameControl?.removeValidators(Validators.required);

      companyNameControl?.addValidators(Validators.required);
    }
    surnameControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    nameControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    companyNameControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  static updateVatGroupValidators(formGroup: FormGroup): void {
    const nonProfitAssociation = formGroup.get('nonProfitAssociation')?.value;
    const isPhysicalPerson = formGroup.get('isPhysicalPerson')?.value;
    const vatNumberControl = formGroup.get('vatNumber');
    if (nonProfitAssociation) {
      vatNumberControl?.removeValidators(Validators.required);
    } else {
      if (!isPhysicalPerson) {
        vatNumberControl?.addValidators(Validators.required);
      } else {
        vatNumberControl?.removeValidators(Validators.required);
      }
    }
    vatNumberControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  static updatePermanentEstablishmentDetailValidators(formGroup: FormGroup): void {
    const subjectType = formGroup.get('subjectType')?.value;
    const nationIdControl = formGroup.get('nationId');
    const addressControl = formGroup.get('address');
    const postCodeControl = formGroup.get('postCode');
    const cityControl = formGroup.get('city');
    if (subjectType) {
      nationIdControl?.addValidators(Validators.required);
      addressControl?.addValidators(Validators.required);
      postCodeControl?.addValidators(Validators.required);
      cityControl?.addValidators(Validators.required);
    } else {
      nationIdControl?.removeValidators(Validators.required);
      addressControl?.removeValidators(Validators.required);
      postCodeControl?.removeValidators(Validators.required);
      cityControl?.removeValidators(Validators.required);
    }
    nationIdControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    addressControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    postCodeControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    cityControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  static updateTaxRepresentativeDetailValidators(formGroup: FormGroup): void {
    const selectRadioFiscalRapp = formGroup.get('taxRepresentativeDetail')?.get('selectRadioFiscalRapp')?.value;
    const countryIDControl = formGroup.get('taxRepresentativeDetail')?.get('countryID');
    const codeIdControl = formGroup.get('taxRepresentativeDetail')?.get('codeId');
    const taxCodeControl = formGroup.get('taxRepresentativeDetail')?.get('taxCode');
    const taxRepresentativeDetailControl = formGroup.get('taxRepresentativeDetail');
    if (selectRadioFiscalRapp) {
      countryIDControl?.addValidators(Validators.required);
      codeIdControl?.addValidators(Validators.required);
      taxCodeControl?.addValidators(Validators.required);
    } else {
      countryIDControl?.removeValidators(Validators.required);
      codeIdControl?.removeValidators(Validators.required);
      taxCodeControl?.removeValidators(Validators.required);
    }
    countryIDControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    codeIdControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    taxCodeControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    taxRepresentativeDetailControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }
}
