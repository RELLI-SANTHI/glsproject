/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { RelationshipOtherDataComponent } from './relationship-other-data.component';
import { GlsInputCheckboxComponent } from '../../../../../common/form/gls-input-checkbox/gls-input-checkbox.component';

describe('RelationshipOtherDataComponent', () => {
  let component: RelationshipOtherDataComponent;
  let fixture: ComponentFixture<RelationshipOtherDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelationshipOtherDataComponent, ReactiveFormsModule, TranslateModule.forRoot(), GlsInputCheckboxComponent],
      providers: [
        FormBuilder,
        {
          provide: TranslatePipe,
          useValue: jasmine.createSpyObj('TranslatePipe', ['transform'])
        }
      ]
    }).compileComponents();

    const formBuilder = TestBed.inject(FormBuilder);
    fixture = TestBed.createComponent(RelationshipOtherDataComponent);
    component = fixture.componentInstance;

    // Create form as separate variable (like in billing data)
    const form = formBuilder.group({
      chargeForStampDutyExpenses: [false],
      bankChargesBilling: [false],
      chargeForStampingFeesReceipt: [false],
      expired: [false],
      blocked: [false],
      sendingAccountStatement: [false],
      reminder: [''],
      genericCustomer: [false]
    });

    // Initialize required inputs
    fixture.componentRef.setInput('relationshipOtherDataForm', form);
    fixture.componentRef.setInput('isWriting', true);
    fixture.componentRef.setInput('isDraft', true);
    fixture.componentRef.setInput('isFromSubject', false);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have all required form controls', () => {
    const form = component.relationshipOtherDataForm();
    expect(form).toBeTruthy();
    expect(form.get('chargeForStampDutyExpenses')).toBeTruthy();
    expect(form.get('bankChargesBilling')).toBeTruthy();
    expect(form.get('chargeForStampingFeesReceipt')).toBeTruthy();
    expect(form.get('expired')).toBeTruthy();
    expect(form.get('blocked')).toBeTruthy();
    expect(form.get('sendingAccountStatement')).toBeTruthy();
    expect(form.get('reminder')).toBeTruthy();
  });

  it('should have correct initial input values', () => {
    expect(component.isWriting()).toBe(true);
    expect(component.isFromSubject()).toBe(false);
  });

  it('should bind chargeForStampDutyExpenses control correctly', () => {
    const control = component.relationshipOtherDataForm().get('chargeForStampDutyExpenses');
    expect(control).toBeTruthy();

    control?.setValue(true);
    expect(control?.value).toBe(true);
  });

  it('should bind bankChargesBilling control correctly', () => {
    const control = component.relationshipOtherDataForm().get('bankChargesBilling');
    expect(control).toBeTruthy();

    control?.setValue(false);
    expect(control?.value).toBe(false);
  });

  it('should pass isWriting input as true', () => {
    expect(component.isWriting()).toBeTrue();
  });
});
