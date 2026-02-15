import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ErrorMessage } from '../../models/error-message';
import { Utility } from '../../utilities/utility';
import { InputStatusSectionComponent } from '../input-status-section/input-status-section.component';

@Component({
  selector: 'gls-input-file',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, InputStatusSectionComponent],
  templateUrl: './gls-input-file.component.html',
  styleUrl: './gls-input-file.component.scss'
})
export class GlsInputFileComponent implements OnInit {
  @Input() id!: string; // unic id
  @Input() formGroup!: FormGroup; // Form of control
  @Input() controlName!: string; // form control name
  @Input() label?: string; // field label - ariaLabel - ariaDescribedby
  @Input() placeholder?: string; // placeholder
  @Input() type = 'file';
  @Input() class = '';
  @Input() readOnly?: boolean; // true if disable. default false
  @Input() showError?: boolean; // true if there are some error to show
  @Input() showStatus?: boolean; // true if there are some status to show
  @Input() errorMessage?: ErrorMessage; // list of error error label

  @Output() fileSelected = new EventEmitter<File>(); // event to emit when file is selected

  ngOnInit(): void {
    this.readOnly = this.readOnly ? this.readOnly : false;
    this.showError = this.showError ? this.showError : false;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileSelected.emit(file); // Emit the selected file
    }
  }

  /**
   * return control
   */
  get fc(): FormControl {
    return this.formGroup.controls[this.controlName] as FormControl;
  }

  /**
   * return error message
   */
  getErrorMessage(): string {
    return Utility.getErrorMessage(this.fc.errors, this.errorMessage);
  }

  requiredFieldControl(): string {
    return Utility.requiredFieldControl(this.formGroup, this.controlName);
  }

  isrRquiredFieldControl(): boolean {
    return Utility.isrRquiredFieldControl(this.formGroup, this.controlName);
  }

  invalid(): boolean {
    const control = this.formGroup.controls[this.controlName];

    return control?.invalid;
  }
}
