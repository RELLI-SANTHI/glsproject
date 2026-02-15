import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { BillingDataComponent } from './billing-data.component';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// eslint-disable-next-line max-lines-per-function
describe('BillingDataComponent', () => {
  let component: BillingDataComponent;
  let fixture: ComponentFixture<BillingDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingDataComponent, ReactiveFormsModule, TranslateModule.forRoot(), GlsInputComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(BillingDataComponent);
    component = fixture.componentInstance;
    signalSetFn(component.isWriting[SIGNAL], true);
    signalSetFn(component.isDraft[SIGNAL], false);

    signalSetFn(
      component.formInvoiceDetail[SIGNAL],
      new FormGroup({
        recipientCustomerCode: new FormControl(''),
        pec: new FormControl(''),
        invoiceDeliveryAddress: new FormControl(''),
        postcodeForInvoiceDelivery: new FormControl(''),
        invoiceDeliveryLocation: new FormControl(''),
        provinceForInvoiceDelivery: new FormControl(''),
        provinceForInvoiceDeliveryId: new FormControl('')
      })
    );

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with the correct controls', () => {
    const form = component.formInvoiceDetail();
    expect(form).toBeTruthy();
    expect(form.get('recipientCustomerCode')).toBeTruthy();
    expect(form.get('pec')).toBeTruthy();
    expect(form.get('invoiceDeliveryAddress')).toBeTruthy();
    expect(form.get('postcodeForInvoiceDelivery')).toBeTruthy();
    expect(form.get('invoiceDeliveryLocation')).toBeTruthy();
    expect(form.get('provinceForInvoiceDelivery')).toBeTruthy();
    expect(form.get('provinceForInvoiceDeliveryId')).toBeTruthy();
  });

  it('should handle mandatory isWriting input correctly', () => {
    expect(component.isWriting()).toBeTrue();
  });

  it('should set the value of the control as number in onValueChange', () => {
    const form = component.formInvoiceDetail();
    form.get('recipientCustomerCode')?.setValue('');
    component.onValueChange('123', 'recipientCustomerCode');
    expect(form.get('recipientCustomerCode')?.value).toBe(123);
  });

  it('should not throw if control does not exist in onValueChange', () => {
    expect(() => component.onValueChange('123', 'notExistingControl')).not.toThrow();
  });
});
