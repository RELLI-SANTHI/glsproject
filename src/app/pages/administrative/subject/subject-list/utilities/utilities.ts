/* eslint-disable @typescript-eslint/no-explicit-any */
export class Utilities {
  static transformSubjectsForTable(subjects: any[]): any[] {
    return subjects.map((subject) => {
      const companyName =
        (subject.companyName ?? '').trim() || `${subject.surname ?? ''} ${subject.name ?? ''}`.trim().replace(/\s+/g, ' ');

      return {
        id: subject.id,
        warning: subject.warning,
        error: subject.error,
        status: subject.status,
        nation: subject.nation,
        companyName,
        vatNumber: subject.vatNumber,
        taxCode: subject.taxCode,
        surnameNameCompanyName: subject.surnameNameCompanyName
      };
    });
  }
}
