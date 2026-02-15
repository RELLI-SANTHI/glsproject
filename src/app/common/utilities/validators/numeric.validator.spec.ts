import { numericValidator, maxTwoDecimalsValidator } from './numeric.validator';
import { AbstractControl } from '@angular/forms';

describe('numericValidator', () => {
  it('dovrebbe restituire null se il valore è numerico', () => {
    const control = { value: '12345' } as AbstractControl;
    const result = numericValidator()(control);
    expect(result).toBeNull();
  });

  it('dovrebbe restituire un errore se il valore non è numerico', () => {
    const control = { value: 'abc123' } as AbstractControl;
    const result = numericValidator()(control);
    expect(result).toEqual({ numeric: true });
  });

  it('dovrebbe restituire un errore se il valore è vuoto', () => {
    const control = { value: '' } as AbstractControl;
    const result = numericValidator()(control);
    expect(result).toEqual({ numeric: true });
  });

  it('dovrebbe restituire null se il valore è numerico con zeri iniziali', () => {
    const control = { value: '00123' } as AbstractControl;
    const result = numericValidator()(control);
    expect(result).toBeNull();
  });
});

describe('maxTwoDecimalsValidator', () => {
  it('should return null if value is null', () => {
    const control = { value: null } as AbstractControl;
    const result = maxTwoDecimalsValidator(control);
    expect(result).toBeNull();
  });

  it('should return null if value is an empty string', () => {
    const control = { value: '' } as AbstractControl;
    const result = maxTwoDecimalsValidator(control);
    expect(result).toBeNull();
  });

  it('should return null if value is a valid number with comma as decimal separator', () => {
    const control = { value: '12345678912,12' } as AbstractControl;
    const result = maxTwoDecimalsValidator(control);
    expect(result).toBeNull();
  });

  it('should return null if value is a valid number with dot as decimal separator', () => {
    const control = { value: '12345678912.12' } as AbstractControl;
    const result = maxTwoDecimalsValidator(control);
    expect(result).toBeNull();
  });

  it('should return error if value is not a valid number with more than two decimals', () => {
    const control = { value: "12345678912.12'2" } as AbstractControl;
    const result = maxTwoDecimalsValidator(control);
    expect(result).toEqual({ pattern: true });
  });
});
