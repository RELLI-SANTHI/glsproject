/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeneralDataComponent } from './general-data.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LanguageService } from '../../../../../../api/glsAdministrativeApi/services';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { of, throwError } from 'rxjs';
import { LanguageModel } from '../../../../../../api/glsAdministrativeApi/models';
import { HttpErrorResponse } from '@angular/common/http';
import { UserProfileService } from '../../../../../../common/utilities/services/profile/user-profile.service';
import { UserDetailsModel } from '../../../../../../api/glsUserApi/models';

describe('GeneralDataComponent', () => {
  let component: GeneralDataComponent;
  let fixture: ComponentFixture<GeneralDataComponent>;
  let languageService: jasmine.SpyObj<LanguageService>;
  let genericService: jasmine.SpyObj<GenericService>;

  const mockLanguages: LanguageModel[] = [
    { id: 1, description: 'English', code: 'EN', corporateGroupId: 0 },
    { id: 2, description: 'Italian', code: 'IT', corporateGroupId: 0 }
  ];

  beforeEach(async () => {
    languageService = jasmine.createSpyObj('LanguageService', ['getApiLanguageV1$Json']);
    genericService = jasmine.createSpyObj('GenericService', ['manageError']);

    await TestBed.configureTestingModule({
      imports: [GeneralDataComponent, TranslateModule.forRoot(), ReactiveFormsModule],
      providers: [
        {
          provide: UserProfileService,
          useValue: {
            profile$: of({ name: 'Test User', profile: 'EVA_USER' } as UserDetailsModel),
            impersonatedUser$: of(null),
            clearImpersonation: jasmine.createSpy('clearImpersonation')
          }
        },
        { provide: LanguageService, useValue: languageService },
        { provide: GenericService, useValue: genericService },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralDataComponent);
    component = fixture.componentInstance;

    // Set required signal inputs
    fixture.componentRef.setInput('isWriting', true);
    fixture.componentRef.setInput('isDraft', true);
    const formBuilder = TestBed.inject(FormBuilder);
    const fg = formBuilder.group({
      companyname: ['', Validators.required],
      vatGr: [false],
      vatNo: [''],
      taxIdcode: [''],
      languageId: ['', Validators.required]
    });
    fixture.componentRef.setInput('generalDataFg', fg);
    fixture.componentRef.setInput('parentForm', new FormGroup({ generalData: fg }));

    // Default mock
    languageService.getApiLanguageV1$Json.and.returnValue(of(mockLanguages));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load language list on init', () => {
    expect(languageService.getApiLanguageV1$Json).toHaveBeenCalled();
    expect(component.languageList).toEqual(mockLanguages);
  });

  it('should handle error when loading language list', () => {
    const error = new HttpErrorResponse({ error: 'error', status: 500 });
    languageService.getApiLanguageV1$Json.and.returnValue(throwError(() => error));
    component.loadLanguageList();
    expect(genericService.manageError).toHaveBeenCalledWith(error);
  });

  it('should clear validators when vatGr is false', () => {
    const fg = component.generalDataFg();
    fg.get('vatGr')?.setValue(false);
    fg.get('vatNo')?.setValue('');
    fg.get('taxIdcode')?.setValue('');
    expect(fg.get('vatNo')?.hasError('required')).toBeFalse();
    expect(fg.get('taxIdcode')?.hasError('required')).toBeFalse();
  });

  it('should have isWriting input signal', () => {
    expect(component.isWriting()).toBeTrue();
  });

  it('should have parentForm input signal', () => {
    expect(component.parentForm()).toBeInstanceOf(FormGroup);
  });

  it('should call loadLanguageList on ngOnInit', () => {
    spyOn(component, 'loadLanguageList');
    component.ngOnInit();
    expect(component.loadLanguageList).toHaveBeenCalled();
  });

  it('should set languageList when loadLanguageList is called', () => {
    component.languageList = [];
    component.loadLanguageList();
    expect(component.languageList).toEqual(mockLanguages);
  });

  it('should have null as default companyData', () => {
    expect(component.companyData).toBeNull();
  });

  it('should accept companyData input', () => {
    const mockCompanyData = { id: 1, name: 'Test Company' } as any;
    component.companyData = mockCompanyData;
    expect(component.companyData).toEqual(mockCompanyData);
  });
});
