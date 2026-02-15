/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlsInputToggleComponent } from './gls-input-toggle.component';

describe('GlsInputToggleComponent', () => {
  let component: GlsInputToggleComponent;
  let fixture: ComponentFixture<GlsInputToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlsInputToggleComponent, ReactiveFormsModule, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GlsInputToggleComponent);
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
    expect(component.readOnly).toBeFalse();
    expect(component.showError).toBeFalse();
  });

  it('should set input.checked to true if fc.value is "true" and input exists', () => {
    // Arrange
    component.id = 'test-toggle';
    component.formGroup.controls['testControl'].setValue('true');
    spyOnProperty(component, 'fc', 'get').and.returnValue(component.formGroup.controls['testControl'] as FormControl<any>);

    // Create a mock input element and add it to the DOM
    const input = document.createElement('input');
    input.id = 'test-toggle';
    document.body.appendChild(input);

    // Act
    component.ngAfterViewInit();

    // Assert
    expect(input.checked).toBeTrue();

    // Cleanup
    document.body.removeChild(input);
  });

  it('should keep readOnly as true if it is already true', () => {
    // Arrange
    component.readOnly = true;

    // Act
    component.ngOnInit();

    // Assert
    expect(component.readOnly).toBeTrue();
  });
});
