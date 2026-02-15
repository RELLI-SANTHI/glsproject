import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Trims leading spaces from dynamic form fields and prevents invalid characters for number inputs
 */
@Directive({
  selector: '[appTrimInput]',
  standalone: true
})
export class TrimInputDirective {
  private readonly el = inject(ElementRef);
  private readonly control = inject(NgControl);

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const inputElement = this.el.nativeElement as HTMLInputElement;

    // If it's a number input, prevent invalid characters
    if (inputElement.type === 'number') {
      this.handleNumberKeydown(event);
    }
  }

  @HostListener('input', ['$event'])
  onInput(): void {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    let processedValue = inputElement.value;

    // Trim leading spaces
    processedValue = processedValue.replace(/^\s+/, '');

    if (inputElement.value !== processedValue) {
      inputElement.value = processedValue;
      this.control.control?.setValue(processedValue, { emitEvent: false });
    }
  }

  /**
   * Handles keydown events for number inputs to prevent invalid characters
   */
  private handleNumberKeydown(event: KeyboardEvent): void {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    const key = event.key;
    const currentValue = inputElement.value;
    const selectionStart = inputElement.selectionStart || 0;

    // Allow control keys (backspace, delete, arrow keys, tab, etc.)
    if (this.isControlKey(event)) {
      return;
    }

    // Prevent 'e', 'E', '+' characters
    if (['e', 'E', '+'].includes(key)) {
      event.preventDefault();
      return;
    }

    // Allow digits
    if (/^\d$/.test(key)) {
      return;
    }

    // Allow decimal point only if there isn't one already
    if (key === '.' && !currentValue.includes('.')) {
      return;
    }

    // Allow minus sign only at the beginning and if there isn't one already
    if (key === '-' && selectionStart === 0 && !currentValue.includes('-')) {
      return;
    }

    // Prevent all other characters
    event.preventDefault();
  }

  /**
   * Checks if the pressed key is a control key that should be allowed
   */
  private isControlKey(event: KeyboardEvent): boolean {
    return (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      [
        'Backspace',
        'Delete',
        'Tab',
        'Enter',
        'Home',
        'End',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Escape',
        'F1',
        'F2',
        'F3',
        'F4',
        'F5',
        'F6',
        'F7',
        'F8',
        'F9',
        'F10',
        'F11',
        'F12'
      ].includes(event.key)
    );
  }
}
