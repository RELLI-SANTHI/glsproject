import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { ContactInformationComponent } from './contact-information.component';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';

// eslint-disable-next-line max-lines-per-function
describe('ContactInformationComponent', () => {
  let component: ContactInformationComponent;
  let fixture: ComponentFixture<ContactInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactInformationComponent, ReactiveFormsModule, TranslateModule.forRoot(), GlsInputComponent]
    })
      .overrideComponent(ContactInformationComponent, {
        set: { template: '' }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ContactInformationComponent);
    component = fixture.componentInstance;

    const mockForm = new FormGroup({
      email: new FormControl(''),
      phone: new FormControl(''),
      fax: new FormControl(''),
      cellPhone: new FormControl(''),
      contact: new FormControl('')
    });

    signalSetFn(component.isWriting[SIGNAL], true);
    signalSetFn(component.formContactDetail[SIGNAL], mockForm);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have form controls for email, phone, fax, cellPhone, and contact', () => {
    const form = component.formContactDetail();
    expect(form.contains('email')).toBeTrue();
    expect(form.contains('phone')).toBeTrue();
    expect(form.contains('fax')).toBeTrue();
    expect(form.contains('cellPhone')).toBeTrue();
    expect(form.contains('contact')).toBeTrue();
  });

  it('should handle mandatory isWriting input correctly', () => {
    expect(component.isWriting()).toBeTrue();
  });
});
