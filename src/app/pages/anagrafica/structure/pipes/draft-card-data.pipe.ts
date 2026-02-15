import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'draftCardData',
  standalone: true
})
export class DraftCardDataPipe implements PipeTransform {
  transform<T extends Field>(
    slide: {
      fields: T[];
    },
    fieldNames: string | string[]
  ): string | undefined {
    if (!slide?.fields) {
      return undefined;
    }

    const keys = Array.isArray(fieldNames) ? fieldNames : [fieldNames];

    for (const key of keys) {
      const match = slide.fields.find((field) => field.fieldName === key);
      if (match?.value) {
        return match.value;
      }
    }

    return undefined;
  }
}

interface Field {
  fieldName: string;
  value: string;
}
