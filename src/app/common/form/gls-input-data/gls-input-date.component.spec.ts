
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomDateParserFormatter, GlsInputDataComponent, ItalianDatepickerI18n } from './gls-input-date.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

describe('GlsInputDataComponent', () => {
  let component: GlsInputDataComponent;
  let fixture: ComponentFixture<GlsInputDataComponent>;
  let formGroup: FormGroup;
  let ngbCalendarSpy: jasmine.SpyObj<NgbCalendar>;

  beforeEach(async () => {
    ngbCalendarSpy = jasmine.createSpyObj('NgbCalendar', ['getToday', 'isValid']);
    ngbCalendarSpy.getToday.and.returnValue(new NgbDate(2023, 10, 5)); // Mock getToday method
    ngbCalendarSpy.isValid.and.returnValue(true); // Mock isValid method
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TranslateModule.forRoot(), GlsInputDataComponent],
      providers: [
        FormBuilder,
        { provide: NgbCalendar, useValue: ngbCalendarSpy },
        { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GlsInputDataComponent);
    component = fixture.componentInstance;

    formGroup = new FormGroup({
      dateField: new FormControl(null)
    });

    component.formGroup = formGroup;
    component.controlName = 'dateField';
    component.id = 'dateField';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize placeholder, readOnly, and showError with default values', () => {
    component.ngOnInit();
    expect(component.placeholder).toBe('');
    expect(component.readOnly).toBeFalse();
    expect(component.showError).toBeFalse();
  });

  it('should keep existing values in ngOnInit when inputs are defined', () => {
    component.placeholder = 'Enter Name';
    component.readOnly = true;
    component.showError = true;

    component.ngOnInit();

    expect(component.placeholder).toBe('Enter Name');
    expect(component.readOnly).toBeTrue();
    expect(component.showError).toBeTrue();
  });

  it('should return the FormControl for the given controlName', () => {
    // Ensure the control exists in the form group
    expect(component.formGroup.contains('dateField')).toBeTrue();

    // Retrieve the control using the getter
    const control = component.fc;

    // Assert that the control is the same as the one in the form group
    expect(control).toBe(formGroup.controls['dateField'] as FormControl);
    expect(control instanceof FormControl).toBeTrue();
  });

  it('should return true if the control is invalid', () => {
    formGroup.controls['dateField'].setErrors({ required: true });
    formGroup.controls['dateField'].markAsTouched();
    const result = component.invalid();
    expect(result).toBeTrue();
  });

  xit('should set the current date when selectNow is called', () => {
    component.selectNow();

    const ngbDateStruct = ngbCalendarSpy.getToday();
    const dateString = `${ngbDateStruct.year}/${ngbDateStruct.month}/${ngbDateStruct.day}`;

    expect(component.fc.value).toBe(new Date(dateString).toISOString());
  });

  it('should format a date correctly using CustomDateParserFormatter', () => {
    const formatter = new CustomDateParserFormatter();
    const date: NgbDateStruct = { year: 2023, month: 10, day: 5 };
    const formattedDate = formatter.format(date);

    expect(formattedDate).toBe('05/10/2023');
  });

  it('should parse a date string correctly using CustomDateParserFormatter', () => {
    const formatter = new CustomDateParserFormatter();
    const parsedDate = formatter.parse('5/10/2023');

    expect(parsedDate).toEqual({ year: 2023, month: 10, day: 5 });
  });

  // it('should return null when parsing an invalid date string using CustomDateParserFormatter', () => {
  //   const formatter = new CustomDateParserFormatter();
  //   const parsedDate = formatter.parse('invalid-date');

  //   expect(parsedDate).toBeNull();
  // });

  it('should return correct Italian weekday label for given number', () => {
    const i18n = new ItalianDatepickerI18n();

    expect(i18n.getWeekdayLabel(1)).toBe('Lu');
    expect(i18n.getWeekdayLabel(3)).toBe('Me');
    expect(i18n.getWeekdayLabel(7)).toBe('Do');
  });

  it('should return correct Italian month short name for given number', () => {
    const i18n = new ItalianDatepickerI18n();

    expect(i18n.getMonthShortName(1)).toBe('Gen');
    expect(i18n.getMonthShortName(6)).toBe('Giu');
    expect(i18n.getMonthShortName(12)).toBe('Dic');
  });

  it('should return correct Italian month full name for given number', () => {
    const i18n = new ItalianDatepickerI18n();

    expect(i18n.getMonthFullName(1)).toBe('Gen');
    expect(i18n.getMonthFullName(7)).toBe('Lug');
    expect(i18n.getMonthFullName(11)).toBe('Nov');
  });

  it('should return correct aria label for given date', () => {
    const i18n = new ItalianDatepickerI18n();
    const date: NgbDateStruct = { year: 2024, month: 7, day: 18 };

    expect(i18n.getDayAriaLabel(date)).toBe('18/7/2024');
  });

  it('should return correct Italian week label', () => {
    const i18n = new ItalianDatepickerI18n();

    expect(i18n.getWeekLabel()).toBe('Sett');
  });
});
