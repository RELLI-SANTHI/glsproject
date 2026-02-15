import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ErrorMessage } from '../../models/error-message';
import { InputStatusSectionComponent } from '../input-status-section/input-status-section.component';

@Component({
  selector: 'gls-input-checkbox',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, InputStatusSectionComponent],
  templateUrl: './gls-input-checkbox.component.html',
  styleUrl: './gls-input-checkbox.component.scss'
})
export class GlsInputCheckboxComponent implements OnInit, AfterViewInit {
  @Input() id!: string; // unic id
  @Input() formGroup!: FormGroup; // Form of control
  @Input() controlName!: string; // form control name
  @Input() label?: string; // field label - ariaLabel - ariaDescribedby
  @Input() type = 'checkbox';
  @Input() class = '';
  @Input() readOnly?: boolean; // true if disable. default false
  @Input() showError?: boolean; // true if there are some error to show
  @Input() errorMessage?: ErrorMessage; // list of error error label
  @Input() showStatus?: boolean; // true if there are some status to show
  @Input() checked?: boolean; // true if the checkbox is checked. default false
  @Output() valueChange = new EventEmitter();

  ngOnInit(): void {
    this.readOnly = this.readOnly ? this.readOnly : false;
    this.showError = this.showError ? this.showError : false;

    // Set the default value of the 'All' checkbox to true
    if (this.formGroup.controls['all']) {
      this.formGroup.controls['all'].setValue(false);
    }
  }

  ngAfterViewInit(): void {
    // Imposta il valore iniziale del controllo
    if (this.type === 'checkbox' && (this.fc.value === true || this.fc.value === 'true')) {
      const input = document.getElementById(this.id) as HTMLInputElement;
      if (input) {
        input.checked = true;
      }
    }
  }

  /**
   * return control
   */
  get fc(): FormControl {
    return this.formGroup.controls[this.controlName] as FormControl;
  }

  invalid(): boolean {
    const control = this.formGroup.controls[this.controlName];

    return control?.invalid;
  }
  /**
   * @description - check if the checkbox is checked or not
   * @param event - event of checkbox 'all'
   * @description - set all checkbox to true or false. If 'all' is checked, all checkboxes are checked.
   */
  onAllChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;

    // Iterate over all controls in the formGroup
    Object.keys(this.formGroup.controls).forEach((key) => {
      if (key === 'all') {
        return;
      }

      const control = this.formGroup.get(key) as FormControl;
      if (control && control.enabled) {
        control.setValue(isChecked);

        const checkbox = document.getElementById(key) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = isChecked;
        }
      }
    });

    // Emit the value change event with the updated state
    this.valueChange.emit(isChecked);
  }
  /**
   * @description - check if the checkbox is checked or not
   * @param event - event of checkbox
   */
  onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fc?.setValue(input.checked);
    if (this.controlName !== 'all') {
      this.getCheckboxValue();
    }

    this.valueChange?.emit(input.checked); // Emit the value change event
  }
  /**
   * @description - check if the checkbox is checked or not
   * @param event - event of checkbox
   */
  getCheckboxValue(): void {
    // Count how many checkboxes (excluding 'all') are checked
    const checkboxKeys = Object.keys(this.formGroup.controls).filter((key) => key !== 'all');
    const allChecked = checkboxKeys.every((key) => {
      const control = this.formGroup.get(key) as FormControl;

      return control.value === true;
    });
    const checkbox = document.getElementById('all') as HTMLInputElement;
    const allControl = this.formGroup.get('all') as FormControl;
    if (allControl) {
      allControl.setValue(allChecked); // don't emit to avoid loops
    }
    // Also update the native checkbox visually (if needed)
    if (checkbox) {
      checkbox.checked = allChecked;
    }
  }
}
