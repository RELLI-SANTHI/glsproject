import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function numericValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isValid = /^[0-9]+$/.test(control.value);

    return isValid ? null : { numeric: true };
  };
}

export function maxTwoDecimalsValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value == null || value === '') {
    return null;
  }
  // Gestisce sia numeri che stringhe
  const valueStr = value.toString();
  if (/^\d+(,\d{1,2})?$/.test(valueStr) || /^\d+(\.\d{1,2})?$/.test(valueStr)) {
    return null;
  }

  return { pattern: true };
}
