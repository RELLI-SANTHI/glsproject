/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EndActivityComponent } from './end-activity.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CompanyDetailResponse } from '../../../../../../api/glsAdministrativeApi/models';
import { TranslateModule } from '@ngx-translate/core';

describe('EndActivityComponent', () => {
  let component: EndActivityComponent;
  let fixture: ComponentFixture<EndActivityComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndActivityComponent, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(EndActivityComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);

    // Set up required input signals
    const activityEndDateFg = fb.group({
      activityEndDate: new FormControl({ value: '', disabled: false })
    });
    fixture.componentRef.setInput('activityEndDateFg', activityEndDateFg);
    fixture.componentRef.setInput('parentForm', fb.group({}));
    fixture.componentRef.setInput('isWriting', true);
    fixture.componentRef.setInput('isDraft', true);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have input signals set', () => {
    expect(component.activityEndDateFg()).toBeInstanceOf(FormGroup);
    expect(component.parentForm()).toBeInstanceOf(FormGroup);
    expect(component.isWriting()).toBeTrue();
  });

  it('should disable activityEndDate control if companyData is null (not edit mode)', () => {
    fixture.componentRef.setInput('companyData', null);
    component.ngOnChanges();
    expect(component.isEditMode).toBeFalse();
    expect(component.activityEndDateFg().get('activityEndDate')?.disabled).toBeTrue();
  });

  it('should enable activityEndDate control if companyData is set (edit mode)', () => {
    const companyData: CompanyDetailResponse = { id: 1, name: 'Test', status: 'COMPLETED', corporateGroupId: 1, vatNumber: '123456789' };
    fixture.componentRef.setInput('companyData', companyData);
    component.ngOnChanges();
    expect(component.isEditMode).toBeTrue();
    expect(component.activityEndDateFg().get('activityEndDate')?.enabled).toBeTrue();
  });

  it('should not throw if activityEndDate control is missing', () => {
    // Remove the control
    const fg = component.activityEndDateFg();
    fg.removeControl('activityEndDate');
    expect(() => component.ngOnChanges()).not.toThrow();
  });
});
