import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubjectEditBodyComponent } from './subject-edit-body.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeneralDataComponent } from './general-data/general-data.component';
import { BillingDataComponent } from './billing-data/billing-data.component';
import { ContactInformationComponent } from './contact-information/contact-information.component';
import { FiscalDataComponent } from './fiscal-data/fiscal-data.component';
import { DataFiscalRappFiscComponent } from './data-fiscal-rapp-fisc/data-fiscal-rapp-fisc.component';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';

describe('SubjectEditBodyComponent', () => {
  let component: SubjectEditBodyComponent;
  let fixture: ComponentFixture<SubjectEditBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SubjectEditBodyComponent,
        GeneralDataComponent,
        BillingDataComponent,
        NgbNavModule,
        TranslateModule.forRoot(),
        ContactInformationComponent,
        FormsModule,
        CommonModule,
        FiscalDataComponent,
        DataFiscalRappFiscComponent
      ]
    })
      .overrideComponent(SubjectEditBodyComponent, {
        set: { template: '' }
      })
      .compileComponents();

    fixture = TestBed.createComponent(SubjectEditBodyComponent);
    component = fixture.componentInstance;
    signalSetFn(component.formParent[SIGNAL], {} as FormGroup);
    signalSetFn(component.isWrite[SIGNAL], true);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize activeTab to "tab1"', () => {
    expect(component.activeTab).toBe('tab1');
  });
});
