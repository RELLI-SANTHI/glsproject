/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactInfoComponent } from './contact-info.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { CompanyDetailResponse } from '../../../../../../api/glsAdministrativeApi/models';

describe('ContactInfoComponent', () => {
  let component: ContactInfoComponent;
  let fixture: ComponentFixture<ContactInfoComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactInfoComponent, ReactiveFormsModule, TranslateModule.forRoot(), GlsInputComponent],
      providers: [FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactInfoComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);

    // Set up required input signals
    const parentForm = fb.group({
      contactInformation: fb.group({
        email: [''],
        phone: [''],
        fax: [''] // <-- add missing controls
      })
    });
    const contactInformationForm = parentForm.get('contactInformation') as FormGroup;

    fixture.componentRef.setInput('parentForm', parentForm);
    fixture.componentRef.setInput('contactInformationForm', contactInformationForm);
    fixture.componentRef.setInput('isWriting', true);
    fixture.componentRef.setInput('isDraft', true);
    fixture.componentRef.setInput('companyData', {
      id: 1,
      name: 'Test Company',
      status: 'COMPLETED'
    } as CompanyDetailResponse);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have parentForm input signal', () => {
    expect(component.parentForm()).toBeInstanceOf(FormGroup);
  });

  it('should have contactInformationForm input signal', () => {
    expect(component.contactInformationForm()).toBeInstanceOf(FormGroup);
  });

  it('should have isWriting input signal', () => {
    expect(component.isWriting()).toBeTrue();
  });

  it('should accept companyData input', () => {
    expect(component.companyData).toEqual(jasmine.objectContaining({ id: 1 }));
  });

  it('should have email and phone controls in contactInformationForm', () => {
    const form = component.contactInformationForm();
    expect(form.get('email')).toBeTruthy();
    expect(form.get('phone')).toBeTruthy();
  });
});
