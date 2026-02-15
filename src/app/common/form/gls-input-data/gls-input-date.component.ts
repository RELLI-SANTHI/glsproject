import { CommonModule } from '@angular/common';
import { Component, Injectable, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ErrorMessage } from '../../models/error-message';
import { Utility } from '../../utilities/utility';
import {
  NgbAlertModule,
  NgbCalendar,
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDatepickerModule,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { InputStatusSectionComponent } from '../input-status-section/input-status-section.component';

@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct | null {
    return Utility.fromStringToDatepicker(value);
  }

  format(date: NgbDateStruct | null): string {
    return Utility.fromDatepickerToString(date);
  }
}

@Injectable()
export class ItalianDatepickerI18n extends NgbDatepickerI18n {
  private WEEKDAYS = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'];
  private MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

  getWeekdayLabel(weekday: number): string {
    return this.WEEKDAYS[weekday - 1];
  }

  getMonthShortName(month: number): string {
    return this.MONTHS[month - 1];
  }

  getMonthFullName(month: number): string {
    return this.getMonthShortName(month);
  }

  getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.day}/${date.month}/${date.year}`;
  }

  override getWeekLabel(): string {
    return 'Sett';
  }
}

@Component({
  selector: 'gls-input-date',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NgbDatepickerModule,
    NgbAlertModule,
    FormsModule,
    InputStatusSectionComponent
  ],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
    // { provide: NgbDateAdapter, useClass: StringDateAdapter },
    { provide: NgbDatepickerI18n, useClass: ItalianDatepickerI18n }
  ],
  templateUrl: './gls-input-date.component.html',
  styleUrl: './gls-input-date.component.scss'
})
export class GlsInputDataComponent implements OnInit {
  @Input() id!: string; // unic id
  @Input() formGroup!: FormGroup; // Form of control
  @Input() controlName!: string; // form control name
  @Input() label?: string; // field label - ariaLabel - ariaDescribedby
  @Input() placeholder?: string; // placeholder
  @Input() showSelectNow?: boolean; // true if show now button. default false
  @Input() type = 'date';
  @Input() class = '';
  @Input() readOnly?: boolean; // true if disable. default false
  @Input() showError?: boolean; // true if there are some error to show
  @Input() showStatus?: boolean; // true if there are some status to show
  @Input() errorMessage?: ErrorMessage; // list of error error label

  protected utility = Utility;

  constructor(
    private ngbCalendar: NgbCalendar,
    private dateAdapter: NgbDateAdapter<string>
  ) {}

  ngOnInit(): void {
    this.placeholder = this.placeholder ? this.placeholder : '';
    this.readOnly = this.readOnly ? this.readOnly : false;
    this.showError = this.showError ? this.showError : false;
  }

  /**
   * return control
   */
  get fc(): FormControl {
    return this.formGroup.controls[this.controlName] as FormControl;
  }

  invalid(): boolean {
    const control = this.formGroup.controls[this.controlName];

    return control?.invalid && control?.touched;
  }

  selectNow(): void {
    this.fc.setValue(this.ngbCalendar.getToday());
  }
}
