/* eslint-disable max-lines-per-function */
import { Utilities } from './utilities';

describe('Utilities.transformSubjectsForTable', () => {
  it('should transform subjects array correctly with companyName present', () => {
    const input = [
      {
        id: 1,
        companyName: '  ACME Corp  ',
        vatNumber: '123456789',
        taxCode: 'ABC123',
        surname: 'Rossi',
        name: 'Mario',
        surnameNameCompanyName: 'company name'
      }
    ];

    const result = Utilities.transformSubjectsForTable(input);

    expect(result).toEqual([
      {
        id: 1,
        companyName: 'ACME Corp',
        vatNumber: '123456789',
        taxCode: 'ABC123',
        warning: undefined,
        error: undefined,
        status: undefined,
        nation: undefined,
        surnameNameCompanyName: 'company name'
      }
    ]);
  });

  it('should use surname and name if companyName is empty or whitespace', () => {
    const input = [
      {
        id: 2,
        companyName: '  ',
        vatNumber: '987654321',
        taxCode: 'XYZ789',
        surname: 'Bianchi',
        name: 'Luca',
        surnameNameCompanyName: 'company name'
      }
    ];

    const result = Utilities.transformSubjectsForTable(input);

    expect(result).toEqual([
      {
        id: 2,
        companyName: 'Bianchi Luca',
        vatNumber: '987654321',
        taxCode: 'XYZ789',
        warning: undefined,
        error: undefined,
        status: undefined,
        nation: undefined,
        surnameNameCompanyName: 'company name'
      }
    ]);
  });

  it('should handle missing surname and name gracefully when companyName is missing', () => {
    const input = [
      {
        id: 3,
        companyName: null,
        vatNumber: '555555555',
        taxCode: 'DEF456',
        surname: null,
        name: null,
        surnameNameCompanyName: 'company name'
      }
    ];

    const result = Utilities.transformSubjectsForTable(input);

    expect(result).toEqual([
      {
        id: 3,
        companyName: '',
        vatNumber: '555555555',
        taxCode: 'DEF456',
        warning: undefined,
        error: undefined,
        status: undefined,
        nation: undefined,
        surnameNameCompanyName: 'company name'
      }
    ]);
  });

  it('should return an empty array if input is empty', () => {
    const input: any[] = [];

    const result = Utilities.transformSubjectsForTable(input);

    expect(result).toEqual([]);
  });

  it('should trim surname and name when companyName is missing', () => {
    const input = [
      {
        id: 4,
        companyName: undefined,
        vatNumber: '111222333',
        taxCode: 'GHI012',
        surname: '  Verdi ',
        name: '  Anna  ',
        surnameNameCompanyName: ' company name '
      }
    ];

    const result = Utilities.transformSubjectsForTable(input);

    expect(result).toEqual([
      {
        id: 4,
        companyName: 'Verdi Anna',
        vatNumber: '111222333',
        taxCode: 'GHI012',
        warning: undefined,
        error: undefined,
        status: undefined,
        nation: undefined,
        surnameNameCompanyName: ' company name '
      }
    ]);
  });
});
