import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { FormControl, FormGroup } from '@angular/forms';

import { GlsInputCheckboxComponent } from '../../../form/gls-input-checkbox/gls-input-checkbox.component';
import { GlsInputComponent } from '../../../form/gls-input/gls-input.component';
import { FieldModel, TemplateFieldModel } from '../../../../api/glsNetworkApi/models';

@Component({
  selector: 'app-view-details-write',
  standalone: true,
  imports: [GlsInputCheckboxComponent, GlsInputComponent, TranslatePipe, NgClass],
  templateUrl: './view-details-write.component.html',
  styleUrl: './view-details-write.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewDetailsWriteComponent implements OnInit {
  /**
   * Input property for the list of fields to display in the component.
   * Each field can be either a `TemplateFieldModel` or a `FieldModel`.
   */
  fieldsListInput = input.required<(TemplateFieldModel | FieldModel)[]>();

  /**
   * Input property for the reactive form group used to manage form controls.
   */
  formGroupInput = input.required<FormGroup>();

  /**
   * A record to maintain the order of subsections for styling purposes.
   * The key is the subsection name, and the value is its order.
   */
  private subSectionOrder: Record<string, number> = {};

  /**
   * Lifecycle hook that initializes the component.
   * It sets up the subsection order for styling purposes.
   */
  ngOnInit(): void {
    this.initializeSubSectionOrder();
  }

  /**
   * Returns a CSS class for styling subsections based on their order.
   * Subsections with even order get the 'even' class, and odd ones get the 'odd' class.
   * @param subSection - The name of the subsection.
   * @returns A string representing the CSS class ('even' or 'odd').
   */
  getSubSectionClass(subSection: string): string {
    return this.subSectionOrder[subSection] % 2 === 0 ? 'even' : 'odd';
  }

  /**
   * Handles changes to a field's checkbox.
   * Enables or disables the corresponding toggle control based on the checkbox state.
   * Updates the visibility of the field in the `fieldsListInput`.
   * @param event - The event triggered by the checkbox change.
   */
  onFieldChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const toggleControl = this.formGroupInput().get(`${target.id}_toggle`) as FormControl;
    if (toggleControl) {
      if (target.checked) {
        toggleControl.enable();
      } else {
        setTimeout(() => {
          const checkbox = document.getElementById(target.id + '-toggle') as HTMLInputElement;
          if (checkbox) {
            checkbox.checked = false;
          }
          toggleControl.disable();
          this.updateFieldOnChangeToggle(target.id, false);
        }, 0);
      }
      const field = this.fieldsListInput().filter((field) => field.fieldName === target.id)?.[0];
      field.isVisible = target.checked;
    } else {
      console.error(`Toggle element ${target.id}_toggle not found!`);
    }
  }

  /**
   * Handles changes to a field's toggle control.
   * Updates the `isRequired` property of the corresponding field in the `fieldsListInput`.
   * @param event - The event triggered by the toggle control change.
   */
  onFieldChangeToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateFieldOnChangeToggle(target.id.split('-')[0], target.checked);
  }

  /**
   * Updates the `isRequired` property of a field in the `fieldsListInput`.
   * @param fieldId - The ID of the field to update.
   * @param isRequired - The new value for the `isRequired` property.
   */
  public updateFieldOnChangeToggle(fieldId: string, isRequired: boolean): void {
    const field = this.fieldsListInput().filter((field) => field.fieldName === fieldId)?.[0];
    field.isRequired = isRequired;
  }

  /**
   * Initializes the `subSectionOrder` record to maintain the order of subsections.
   * Each unique subsection is assigned an order based on its appearance in the `fieldsListInput`.
   */
  private initializeSubSectionOrder(): void {
    let orderCounter = 0;
    this.fieldsListInput().forEach((field) => {
      if (!(field.subSection in this.subSectionOrder)) {
        this.subSectionOrder[field.subSection] = orderCounter++;
      }
    });
  }
}
