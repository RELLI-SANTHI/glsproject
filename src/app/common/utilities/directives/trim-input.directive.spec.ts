import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrimInputDirective } from './trim-input.directive';

@Component({
  template: '<input type="text" [formControl]="control" appTrimInput />'
})
class TestComponent {
  control = new FormControl('');
}

describe('TrimInputDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let inputElement: HTMLInputElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [FormsModule, ReactiveFormsModule, TrimInputDirective]
    });

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    inputElement = fixture.nativeElement.querySelector('input');
  });

  it('should trim leading spaces from input value', () => {
    inputElement.value = '   test';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputElement.value).toBe('test');
  });

  it('should update the FormControl value without leading spaces', () => {
    inputElement.value = '   test';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const control = fixture.componentInstance.control;
    expect(control.value).toBe('test');
  });
});
