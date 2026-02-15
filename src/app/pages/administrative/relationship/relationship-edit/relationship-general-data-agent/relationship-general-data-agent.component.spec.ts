/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RelationshipGeneralDataAgentComponent } from './relationship-general-data-agent.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { GlsInputDropdownComponent } from '../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { GlsInputDataComponent } from '../../../../../common/form/gls-input-data/gls-input-date.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';

describe('RelationshipGeneralDataAgentComponent', () => {
  let fixture: ComponentFixture<RelationshipGeneralDataAgentComponent>;
  let component: RelationshipGeneralDataAgentComponent;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RelationshipGeneralDataAgentComponent,
        ReactiveFormsModule,
        GlsInputComponent,
        GlsInputDropdownComponent,
        GlsInputDataComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        FormBuilder,
        {
          provide: TranslatePipe,
          useValue: jasmine.createSpyObj('TranslatePipe', ['transform'])
        }
      ]
    }).compileComponents();

    formBuilder = TestBed.inject(FormBuilder);
    fixture = TestBed.createComponent(RelationshipGeneralDataAgentComponent);
    component = fixture.componentInstance;

    const form = formBuilder.group({
      agentType: [''],
      percentageProvision: [''],
      invoiceNo: [''],
      turnoverImp: [''],
      provisionalImp: ['']
    });

    // Initialize required inputs using componentRef
    const componentRef = fixture.componentRef;
    componentRef.setInput('relationshipGeneralDataAgentForm', form);
    componentRef.setInput('isWriting', true);
    componentRef.setInput('isDraft', false);
    componentRef.setInput('isFromSubject', false);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have all required form controls', async () => {
    const form = component.relationshipGeneralDataAgentForm();
    expect(form).toBeTruthy();

    const controls = ['agentType', 'percentageProvision', 'invoiceNo', 'turnoverImp', 'provisionalImp'];
    controls.forEach((controlName) => {
      expect(form.get(controlName)).toBeTruthy();
    });
  });

  it('should bind agentType control correctly', async () => {
    await fixture.whenStable();
    const form = component.relationshipGeneralDataAgentForm();
    const control = form.get('agentType');

    control?.setValue('ABC123');
    fixture.detectChanges();

    expect(control?.value).toBe('ABC123');
  });

  it('should bind invoiceNo control correctly', async () => {
    await fixture.whenStable();
    const form = component.relationshipGeneralDataAgentForm();
    const control = form.get('invoiceNo');

    control?.setValue('6');
    fixture.detectChanges();

    expect(control?.value).toBe('6');
  });

  it('should handle form control changes', async () => {
    await fixture.whenStable();
    const form = component.relationshipGeneralDataAgentForm();
    // Add null check to prevent the error
    if (!form) {
      fail('Form is not initialized');

      return;
    }

    form.patchValue({
      agentType: 'TEST',
      percentageProvision: '10',
      invoiceNo: '123',
      turnoverImp: '1000',
      provisionalImp: '100'
    });

    fixture.detectChanges();

    expect(form.get('agentType')?.value).toBe('TEST');
    expect(form.get('percentageProvision')?.value).toBe('10');
    expect(form.get('invoiceNo')?.value).toBe('123');
    expect(form.get('turnoverImp')?.value).toBe('1000');
    expect(form.get('provisionalImp')?.value).toBe('100');
  });

  it('should handle input property changes', async () => {
    await fixture.whenStable();

    fixture.componentRef.setInput('isWriting', false);
    fixture.detectChanges();

    expect(component.isWriting()).toBeFalse();
  });
});
