import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
// import { IcommonOption } from '../../models/select-option-interface';
import { ErrorMessage } from '../../models/error-message';
import { Utility } from '../../utilities/utility';
import { OptionModel } from '../../../api/glsNetworkApi/models';
import { InputStatusSectionComponent } from '../input-status-section/input-status-section.component';

@Component({
  selector: 'gls-input-dropdown',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, InputStatusSectionComponent],
  templateUrl: './gls-input-dropdown.component.html',
  styleUrl: './gls-input-dropdown.component.scss'
})
export class GlsInputDropdownComponent implements OnInit {
  @Input() id!: string; // unic id
  @Input() formGroup!: FormGroup; // Form of control
  @Input() controlName!: string; // form control name
  @Input() label?: string; // field label - ariaLabel - ariaDescribedby
  @Input() placeholder?: string; // placeholder
  @Input() keyValue!: string;
  @Input() keyDecsName!: string;
  @Input() keyCode!: string; // key for option value
  @Input() emptyOption?: string;
  @Input() emptyOptionValue?: string | number; // value for empty option
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() options!: OptionModel[] | any[];
  @Input() selectedValue: string | number | boolean | undefined;
  @Input() showError?: boolean; // true if there are some error to show
  @Input() showStatus?: boolean; // true if there are some status to show
  @Input() errorMessage?: ErrorMessage; // list of error error label
  @Input() required!: string | boolean;
  @Input() optionType?: string = '';
  @Input() multipleDecNameShow?: string = '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() customOptions!: any[];
  @Output() valueChanged: EventEmitter<string | number> = new EventEmitter<string | number>();

  protected utility = Utility;

  ngOnInit(): void {
    // this.getOption();
    this.placeholder = this.placeholder ? this.placeholder : 'generic.select';
    this.showError = this.showError ? this.showError : false;
  }

  /**
   *
   * @param event get select change value
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange(event: any): void {
    if (event && event.target) {
      this.valueChanged.emit(event.target?.value);
    }
  }

  invalid(): boolean {
    const control = this.formGroup.controls[this.controlName];

    return control?.invalid;
  }

  dirty(): boolean {
    const control = this.formGroup.controls[this.controlName];

    return control?.dirty || control?.touched;
  }

  /**
   * return control
   */
  get fc(): FormControl {
    return this.formGroup.controls[this.controlName] as FormControl;
  }
}
