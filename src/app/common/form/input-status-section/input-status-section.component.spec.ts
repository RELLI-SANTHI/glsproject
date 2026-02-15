/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputStatusSectionComponent } from './input-status-section.component';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { FormControl, FormGroup } from '@angular/forms';
describe('InputStatusSectionComponent', () => {
  let component: InputStatusSectionComponent;
  let fixture: ComponentFixture<InputStatusSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputStatusSectionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InputStatusSectionComponent);
    component = fixture.componentInstance;

    signalSetFn(
      component.formGroup[SIGNAL],
      new FormGroup({
        name: new FormControl('')
      })
    );
    signalSetFn(component.controlName[SIGNAL], 'name');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return true if the control is dirty', () => {
    // Arrange
    const control = component.formGroup().controls[component.controlName()];
    control.markAsDirty();

    // Act
    const result = component.dirty();

    // Assert
    expect(result).toBeTrue();
  });

  it('should return true if the control is touched', () => {
    // Arrange
    const control = component.formGroup().controls[component.controlName()];
    control.markAsTouched();

    // Act
    const result = component.dirty();

    // Assert
    expect(result).toBeTrue();
  });
});
