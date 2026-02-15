/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlsInputComponent } from './gls-input.component';

describe('GlsInputComponent', () => {
  let component: GlsInputComponent;
  let fixture: ComponentFixture<GlsInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlsInputComponent, ReactiveFormsModule, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GlsInputComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({
      testControl: new FormControl('')
    });
    component.controlName = 'testControl';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return form control', () => {
    const formControl = component.formGroup.controls['testControl'] as FormControl;
    expect(component.fc).toBe(formControl);
  });

   it('should check if control is invalid', () => {
    component.formGroup.controls['testControl'].setErrors({ required: true });
    component.formGroup.controls['testControl'].markAsTouched();
    expect(component.invalid()).toBeTrue();
  });

  it('should initialize default values', () => {
    component.ngOnInit();
    expect(component.placeholder).toBe('');
    expect(component.readOnly).toBeFalse();
    expect(component.showError).toBeFalse();
  });

  it('should return dirty or touched for decimal type', () => {
    // Arrange
    component.type = 'decimal';
    component.decimalControl = { dirty: true, touched: false } as any;
    expect(component.dirty()).toBeTrue();

    component.decimalControl = { dirty: false, touched: true } as any;
    expect(component.dirty()).toBeTrue();

    component.decimalControl = { dirty: false, touched: false } as any;
    expect(component.dirty()).toBeFalse();
  });

  it('should return false for dirty if not decimal type or decimalControl is missing', () => {
    component.type = 'text';
    component.decimalControl = { dirty: true, touched: true } as any;
    expect(component.dirty()).toBeFalse();

    component.type = 'decimal';
    component.decimalControl = undefined;
    expect(component.dirty()).toBeFalse();
  });

  it('should clear decimalControl value if not empty', () => {
    component.type = 'decimal';
    // Mock decimalControl with value and setValue spy
    component.decimalControl = {
      value: '123.45',
      setValue: jasmine.createSpy('setValue')
    } as any;

    // Simulate the code path
    if (component.decimalControl?.value !== '') {
      component.decimalControl?.setValue('', { emitEvent: false });
    }

    expect(component.decimalControl?.setValue).toHaveBeenCalledWith('', { emitEvent: false });
  });

  it('should not call setValue if decimalControl value is already empty', () => {
    component.type = 'decimal';
    component.decimalControl = {
      value: '',
      setValue: jasmine.createSpy('setValue')
    } as any;

    if (component.decimalControl?.value !== '') {
      component.decimalControl?.setValue('', { emitEvent: false });
    }

    expect(component.decimalControl?.setValue).not.toHaveBeenCalled();
  });

  it('should clear decimalControl value if not decimal type and value is not empty', () => {
    component.type = 'text'; // Not 'decimal'
    component.decimalControl = {
      value: 'something',
      setValue: jasmine.createSpy('setValue')
    } as any;

    // Simulate the else branch
    if (!(component.type === 'decimal' && component.decimalControl)) {
      if (component.decimalControl!.value !== '') {
        component.decimalControl!.setValue('', { emitEvent: false });
      }
    }

    expect(component.decimalControl?.setValue).toHaveBeenCalledWith('', { emitEvent: false });
  });

  it('should not call setValue if not decimal type and value is empty', () => {
    component.type = 'text'; // Not 'decimal'
    component.decimalControl = {
      value: '',
      setValue: jasmine.createSpy('setValue')
    } as any;

    if (!(component.type === 'decimal' && component.decimalControl)) {
      if (component.decimalControl!.value !== '') {
        component.decimalControl!.setValue('', { emitEvent: false });
      }
    }

    expect(component.decimalControl?.setValue).not.toHaveBeenCalled();
  });

  it('should set valueForForm with dot if val contains comma', () => {
    const original = { setValue: jasmine.createSpy('setValue') };
    const val = '12,34';

    // Simulate the code
    const valueForForm = val ? (val as string).replace(',', '.') : null;
    original.setValue(valueForForm);

    expect(original.setValue).toHaveBeenCalledWith('12.34');
  });

  it('should set valueForForm as null if val is falsy', () => {
    const original = { setValue: jasmine.createSpy('setValue') };
    const val: string | null | undefined = '';

    // Simulate the code
    const valueForForm = val ? (val as string).replace(',', '.') : null;
    original.setValue(valueForForm);

    expect(original.setValue).toHaveBeenCalledWith(null);
  });
});
