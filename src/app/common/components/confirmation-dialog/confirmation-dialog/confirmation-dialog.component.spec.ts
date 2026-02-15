/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationDialogData } from '../../../models/confirmation-dialog-interface';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let activeModal: NgbActiveModal;

  const mockData: ConfirmationDialogData = {
    title: 'Delete Item',
    content: 'Are you sure you want to delete this item?',
    cancelText: 'Cancel',
    confirmText: 'Delete',
    showCancel: false,
    additionalData: [
      { placeHolder: '{minLength}', value: 3 },
      { placeHolder: '{maxLength}', value: 10 }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent, TranslateModule.forRoot()],
      providers: [NgbActiveModal]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    activeModal = TestBed.inject(NgbActiveModal);

    // ✅ Manually set data
    component.data = mockData;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct injected data', () => {
    expect(component.data).toBeDefined();
    expect(component.data.title).toBe('Delete Item');
    expect(component.data.content).toBe('Are you sure you want to delete this item?');
    expect(component.data.cancelText).toBe('Cancel');
    expect(component.data.confirmText).toBe('Delete');
  });

  it('should close the modal with "true" when onConfirm() is called', () => {
    spyOn(activeModal, 'close');
    component.onConfirm();
    expect(activeModal.close).toHaveBeenCalledWith(true);
  });

  it('should call activeModal.dismiss when closeModal is called', () => {
    spyOn(activeModal, 'dismiss');
    component.closeModal();
    expect(activeModal.dismiss).toHaveBeenCalled();
  });

  it('should return correct additionalData', () => {
    const result = component.additionalData;
    expect(result).toEqual({ minLength: 3, maxLength: 10 });
  });

  it('should return empty object if additionalData is undefined', () => {
    component.data = { ...mockData, additionalData: undefined };
    expect(component.additionalData).toEqual({});
  });

  it('should handle empty additionalData array', () => {
    component.data = { ...mockData, additionalData: [] };
    expect(component.additionalData).toEqual({});
  });
});
