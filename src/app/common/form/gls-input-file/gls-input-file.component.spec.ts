/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ErrorMessage } from '../../models/error-message';
import { Utility } from '../../utilities/utility';
import { GlsInputFileComponent } from './gls-input-file.component';

describe('GlsInputFileComponent', () => {
  let component: GlsInputFileComponent;
  let fixture: ComponentFixture<GlsInputFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlsInputFileComponent, ReactiveFormsModule, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GlsInputFileComponent);
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

  it('should return error message', () => {
    spyOn(Utility, 'getErrorMessage').and.returnValue('Error message');
    component.errorMessage = { required: 'This field is required' } as ErrorMessage;
    component.formGroup.controls['testControl'].setErrors({ required: true });
    expect(component.getErrorMessage()).toBe('Error message');
  });

  it('should return required field control message', () => {
    spyOn(Utility, 'requiredFieldControl').and.returnValue('This field is required');
    expect(component.requiredFieldControl()).toBe('This field is required');
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

  it('should emit the selected file when a file is chosen', () => {
    // Arrange
    const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
    const event = {
      target: {
        files: [mockFile]
      }
    } as unknown as Event;
    spyOn(component.fileSelected, 'emit');

    // Act
    component.onFileChange(event);

    // Assert
    expect(component.fileSelected.emit).toHaveBeenCalledWith(mockFile);
  });

  it('should keep readOnly and showError as true if they are set before ngOnInit', () => {
    // Arrange
    component.readOnly = true;
    component.showError = true;

    // Act
    component.ngOnInit();

    // Assert
    expect(component.readOnly).toBeTrue();
    expect(component.showError).toBeTrue();
  });
});
