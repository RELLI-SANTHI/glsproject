import { Pipe, PipeTransform } from '@angular/core';
import { StructureResponse } from '../../../../api/glsNetworkApi/models/structure-response';

@Pipe({
  name: 'structureInfo',
  standalone: true
})
export class StructureInfoPipe implements PipeTransform {
  transform(slide: StructureResponse): string {
    if (!slide?.fields) {
      return '';
    }

    const getField = (name: string): string | undefined => {
      const field = slide.fields.find((f) => f.fieldName === name);

      return field?.description ?? field?.value;
    };

    const info = [getField('BuildingType'), getField('Name'), getField('Region')].filter(Boolean);

    return info.join(' | ');
  }
}
