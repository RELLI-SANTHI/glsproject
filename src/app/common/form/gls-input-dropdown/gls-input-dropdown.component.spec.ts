/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlsInputDropdownComponent } from './gls-input-dropdown.component';

describe('GlsInputDropdownComponent', () => {
  let component: GlsInputDropdownComponent;
  let fixture: ComponentFixture<GlsInputDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlsInputDropdownComponent, ReactiveFormsModule, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GlsInputDropdownComponent);
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

  it('should initialize with default values', () => {
    expect(component.placeholder).toBe('generic.select');
    expect(component.showError).toBe(false);
  });

  it('should emit valueChanged when onChange is called', () => {
    spyOn(component.valueChanged, 'emit');
    const event = { target: { value: '1' } };
    component.onChange(event);
    expect(component.valueChanged.emit).toHaveBeenCalledWith('1');
  });

  it('should return true for invalid control', () => {
    component.fc.setErrors({ required: true });
    expect(component.invalid()).toBe(true);
  });

  it('should return the form control', () => {
    const control = component.fc; // This should be of type FormControl
    expect(control).toBeInstanceOf(FormControl);
    expect(control).toBe(component.formGroup.controls[component.controlName] as FormControl);
  });
});
