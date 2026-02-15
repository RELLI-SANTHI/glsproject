import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ErrorMessage } from '../../models/error-message';
import { Utility } from '../../utilities/utility';
import { InputStatusSectionComponent } from '../input-status-section/input-status-section.component';
import { TrimInputDirective } from '../../utilities/directives/trim-input.directive';

@Component({
  selector: 'gls-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, InputStatusSectionComponent, TrimInputDirective],
  templateUrl: './gls-input.component.html',
  styleUrl: './gls-input.component.scss'
})
export class GlsInputComponent implements OnInit {
  @Input() id!: string; // unic id
  @Input() formGroup!: FormGroup; // Form of control
  @Input() controlName!: string; // form control name
  @Input() label?: string; // field label - ariaLabel - ariaDescribedby
  @Input() placeholder?: string; // placeholder
  @Input() type: 'text' | 'number' | 'decimal' | string = 'text'; // type of input
  @Input() class!: string; // class of input
  @Input() min?: number; // minimum value
  @Input() max?: number; // maximum value
  @Input() readOnly?: boolean; // true if disable. default false
  @Input() showError?: boolean; // true if there are some error to show
  @Input() showStatus?: boolean; // true if there are some status to show
  @Input() errorMessage?: ErrorMessage; // list of error error label

  @Output() glsBlur = new EventEmitter<FocusEvent>();

  protected utility = Utility;

  decimalControl?: FormControl;

  /**
   * return control
   */
  get fc(): FormControl {
    return this.formGroup.controls[this.controlName] as FormControl;
  }

  ngOnInit(): void {
    this.placeholder = this.placeholder ? this.placeholder : '';
    this.readOnly = this.readOnly ? this.readOnly : false;
    this.showError = this.showError ? this.showError : false;
    this.class = this.class ? this.class : 'gls-form-input';

    if (this.type === 'decimal') {
      // Create decimal form
      const original = this.formGroup.controls[this.controlName];
      // Copy validators
      this.decimalControl = new FormControl('');
      // Initialize value
      const initialValue = original.value;
      if (initialValue !== null && initialValue !== undefined && initialValue !== '') {
        this.decimalControl.setValue(initialValue?.toString().replace('.', ',') || null);
      }
      // Synchronize user changes
      this.decimalControl.valueChanges.subscribe((val) => {
        // Update the original FormControl value with the dot
        const valueForForm = val ? val.replace(',', '.') : null;
        original.setValue(valueForForm);
      });
      // Synchronize external changes
      original.valueChanges.subscribe((val) => {
        if (val !== null && val !== undefined && val !== '') {
          const viewVal = val.toString().replace('.', ',');
          if (this.decimalControl!.value !== viewVal) {
            this.decimalControl!.setValue(viewVal, { emitEvent: false });
          }
        } else {
          if (this.decimalControl!.value !== '') {
            this.decimalControl!.setValue('', { emitEvent: false });
          }
        }
      });
    }
  }

  invalid(): boolean {
    const control = this.formGroup.controls[this.controlName];

    return control?.invalid;
  }

  dirty(): boolean {
    if (this.type === 'decimal' && this.decimalControl) {
      return this.decimalControl.dirty || this.decimalControl.touched;
    }
    const control = this.formGroup.controls[this.controlName];

    return control?.dirty || control?.touched;
  }

  onBlur(event: FocusEvent) {
    this.glsBlur.emit(event);
  }
}
