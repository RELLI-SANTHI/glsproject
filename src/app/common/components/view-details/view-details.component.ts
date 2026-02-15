import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormGroup } from '@angular/forms';
import { NgClass } from '@angular/common';

import { ViewDetailsReadComponent } from './view-details-read/view-details-read.component';
import { ViewDetailsWriteComponent } from './view-details-write/view-details-write.component';
import { FieldModel, TemplateFieldModel } from '../../../api/glsNetworkApi/models';

@Component({
  selector: 'gls-view-details',
  standalone: true,
  imports: [TranslateModule, NgbNavModule, ViewDetailsReadComponent, ViewDetailsWriteComponent, NgClass],
  templateUrl: './view-details.component.html',
  styleUrl: './view-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewDetailsComponent {
  readonly = input(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formGroupInput = input<FormGroup | any>();
  fieldsList = input.required<TemplateFieldModel[] | FieldModel[]>();
  active = 'anagrafica';

  /**
   * Filters out duplicate field names
   */
  get filteredFieldsList() {
    return this.fieldsList().filter((field, index, self) => index === self.findIndex((f) => f.fieldName === field.fieldName));
  }

  /**
   * Returns unique sections from fieldsList
   */
  uniqueSections(): string[] {
    return [...new Set(this.fieldsList().map((field) => field.section))];
  }

  getBuildingAcronymMin(): string {
    return this.formGroupInput()?.get('buildingAcronymMin')?.value?.toString();
  }

  getBuildingAcronymMax(): string {
    return this.formGroupInput()?.get('buildingAcronymMax')?.value?.toString();
  }

  /**
   * Counts selected fields in a section
   */
  getSelectedFieldsInSection(section: string): number {
    return this.fieldsList().filter(
      (field) => field.section === section && this.formGroupInput()?.get(field.fieldName)?.value.toString() === 'true'
    ).length;
  }

  /**
   * Counts total fields in a section
   */
  getTotalFieldsInSection(section: string): number {
    return this.fieldsList().filter((field) => field.section === section).length;
  }

  /**
   * Counts only mandatory fields in a section
   */
  getMandatoryFieldsInSection(section: string): number {
    if (this.readonly()) {
      return this.fieldsList().filter((field) => field.section === section && field.isVisible && field.isRequired).length;
    }

    return this.fieldsList().filter(
      (field) =>
        field.section === section &&
        this.formGroupInput()
          ?.get(field.fieldName + '_toggle')
          ?.value.toString() === 'true'
    ).length;
  }

  /**
   * Return fields in a section selected
   */
  getFieldsInSection(section: string): (TemplateFieldModel | FieldModel)[] {
    return this.fieldsList().filter((field) => field.section === section);
  }
}
