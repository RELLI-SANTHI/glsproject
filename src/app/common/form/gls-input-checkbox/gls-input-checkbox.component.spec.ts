/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlsInputCheckboxComponent } from './gls-input-checkbox.component';

describe('GlsInputCheckboxComponent', () => {
  let component: GlsInputCheckboxComponent;
  let fixture: ComponentFixture<GlsInputCheckboxComponent>;
  let formGroup: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlsInputCheckboxComponent, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(GlsInputCheckboxComponent);
    component = fixture.componentInstance;

    formGroup = new FormGroup({
      checkbox1: new FormControl(false),
      checkbox2: new FormControl(false),
      all: new FormControl(false)
    });

    component.formGroup = formGroup;
    component.controlName = 'checkbox1';
    component.id = 'checkbox1';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return form control', () => {
    // Arrange
    formGroup = new FormGroup({
      checkbox1: new FormControl(false), // Ensure checkbox1 is defined in the formGroup
      checkbox2: new FormControl(false),
      all: new FormControl(false)
    });
    component.formGroup = formGroup; // Assign the formGroup to the component
    component.controlName = 'checkbox1'; // Ensure controlName matches a control in the formGroup

    // Act
    const formControl = component.fc;

    // Assert
    expect(formControl).toBe(formGroup.controls['checkbox1'] as FormControl);
  });

  it('should check if control is invalid', () => {
    // Arrange
    component.formGroup.addControl('testControl', new FormControl()); // Add testControl to the formGroup
    component.controlName = 'testControl'; // Set controlName to testControl

    // Act
    component.formGroup.controls['testControl'].setErrors({ required: true });
    component.formGroup.controls['testControl'].markAsTouched();
    const isInvalid = component.invalid();

    // Assert
    expect(isInvalid).toBeTrue();
  });

  it('should check if control is invalid', () => {
    // Arrange
    component.formGroup.addControl('testControl', new FormControl()); // Add testControl to the formGroup
    component.controlName = 'testControl'; // Set controlName to testControl

    // Act
    component.formGroup.controls['testControl'].setErrors({ required: true }); // Set validation error
    component.formGroup.controls['testControl'].markAsTouched(); // Mark the control as touched
    const isInvalid = component.invalid(); // Call the invalid method

    // Assert
    expect(isInvalid).toBeTrue(); // Verify that the control is invalid
  });

  it('should initialize default values', () => {
    component.ngOnInit();
    expect(component.readOnly).toBeFalse();
    expect(component.showError).toBeFalse();
  });

  it('should initialize readOnly and showError to false by default', () => {
    component.ngOnInit();
    expect(component.readOnly).toBeFalse();
    expect(component.showError).toBeFalse();
  });

  it('should set the "all" checkbox value to false on initialization', () => {
    component.ngOnInit();
    expect(formGroup.controls['all'].value).toBeFalse();
  });

  it('should set the initial value of the checkbox in ngAfterViewInit', () => {
    formGroup.controls['checkbox1'].setValue(true);
    component.ngAfterViewInit();
    const input = document.getElementById('checkbox1') as HTMLInputElement;
    expect(input.checked).toBeTrue();
  });

  it('should return the FormControl for the given controlName', () => {
    // Arrange
    component.controlName = 'checkbox1'; // Ensure controlName is set
    component.formGroup = formGroup; // Ensure formGroup is assigned

    // Act
    const control = component.fc as FormControl; // Explicitly cast to FormControl

    // Assert
    expect(control).toBe(formGroup.controls['checkbox1'] as FormControl);
  });

  it('should return true if the control is invalid', () => {
    formGroup.controls['checkbox1'].setErrors({ required: true });
    const result = component.invalid();
    expect(result).toBeTrue();
  });

  it('should update all checkboxes when "all" checkbox is changed', () => {
    const event = { target: { checked: true } } as unknown as Event;
    spyOn(component.valueChange, 'emit');

    component.onAllChange(event);

    expect(formGroup.controls['checkbox1'].value).toBeTrue();
    expect(formGroup.controls['checkbox2'].value).toBeTrue();
    expect(component.valueChange.emit).toHaveBeenCalledWith(true);
  });

  it('should update the specific checkbox value when onChange is called', () => {
    const event = { target: { checked: true } } as unknown as Event;
    spyOn(component.valueChange, 'emit');
    spyOn(component, 'getCheckboxValue');

    component.onChange(event);

    expect(formGroup.controls['checkbox1'].value).toBeTrue();
    expect(component.getCheckboxValue).toHaveBeenCalled();
    expect(component.valueChange.emit).toHaveBeenCalledWith(true);
  });

  it('should update the "all" checkbox value when getCheckboxValue is called', () => {
    formGroup.controls['checkbox1'].setValue(true);
    formGroup.controls['checkbox2'].setValue(true);
    const checkbox = document.createElement('input');
    checkbox.id = 'all';
    document.body.appendChild(checkbox);

    component.getCheckboxValue();

    expect(formGroup.controls['all'].value).toBeTrue();
    expect(checkbox.checked).toBeTrue();

    document.body.removeChild(checkbox);
  });

  it('should set "all" checkbox to false if not all checkboxes are checked', () => {
    formGroup.controls['checkbox1'].setValue(true);
    formGroup.controls['checkbox2'].setValue(false);
    const checkbox = document.createElement('input');
    checkbox.id = 'all';
    document.body.appendChild(checkbox);

    component.getCheckboxValue();

    expect(formGroup.controls['all'].value).toBeFalse();
    expect(checkbox.checked).toBeFalse();

    document.body.removeChild(checkbox);
  });
});
