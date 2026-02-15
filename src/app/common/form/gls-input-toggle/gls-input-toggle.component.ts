import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ErrorMessage } from '../../models/error-message';
import { Utility } from '../../utilities/utility';
import { InputStatusSectionComponent } from '../input-status-section/input-status-section.component';

@Component({
  selector: 'gls-input-toggle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, InputStatusSectionComponent],
  templateUrl: './gls-input-toggle.component.html',
  styleUrl: './gls-input-toggle.component.scss'
})
export class GlsInputToggleComponent implements OnInit, AfterViewInit {
  @Input() id!: string; // unic id
  @Input() formGroup!: FormGroup; // Form of control
  @Input() controlName!: string; // form control name
  @Input() label?: string; // field label - ariaLabel - ariaDescribedby
  @Input() type = 'checkbox';
  @Input() class = '';
  @Input() readOnly?: boolean; // true if disable. default false
  @Input() showError?: boolean; // true if there are some error to show
  @Input() showStatus?: boolean; // true if there are some status to show
  @Input() errorMessage?: ErrorMessage; // list of error error label

  protected utility = Utility;

  ngOnInit(): void {
    this.readOnly = this.readOnly ? this.readOnly : false;
    this.showError = this.showError ? this.showError : false;
  }

  ngAfterViewInit(): void {
    // Imposta il valore iniziale del controllo
    if (this.fc.value === 'true') {
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

  onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fc?.setValue(input.checked);
  }
}
