import { Component, input } from '@angular/core';
import { Utility } from '../../utilities/utility';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gls-input-status-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input-status-section.component.html',
  styleUrl: './input-status-section.component.scss'
})
export class InputStatusSectionComponent {
  formGroup = input.required<FormGroup>();
  controlName = input.required<string>();
  showError = input<boolean>();

  isrRquiredFieldControl(): boolean {
    return Utility.isrRquiredFieldControl(this.formGroup(), this.controlName());
  }

  invalid(): boolean {
    const control = this.formGroup().controls[this.controlName()];

    return control?.invalid;
  }

  dirty(): boolean {
    const control = this.formGroup().controls[this.controlName()];

    return control?.dirty || control?.touched;
  }
}
