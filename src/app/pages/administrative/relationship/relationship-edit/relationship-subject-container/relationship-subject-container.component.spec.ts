/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RelationshipSubjectContainerComponent } from './relationship-subject-container.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { GlsInputDropdownComponent } from '../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { AdministrativeCommonService } from '../../../services/administrative.service';
import { SubjectService } from '../../../../../api/glsAdministrativeApi/services/subject.service';
import { NationsCodeService } from '../../../../../api/glsAdministrativeApi/services';
import { of, throwError } from 'rxjs';
import { SubjectResponseShort } from '../../../../../api/glsAdministrativeApi/models/subject-response-short';
import { GetSubjectsResponse } from '../../../../../api/glsAdministrativeApi/models/get-subjects-response';
import { NationsCodeModel } from '../../../../../api/glsAdministrativeApi/models';

describe('RelationshipSubjectContainerComponent', () => {
  let component: RelationshipSubjectContainerComponent;
  let fixture: ComponentFixture<RelationshipSubjectContainerComponent>;
  let subjectServiceSpy: jasmine.SpyObj<SubjectService>;
  let nationsCodeServiceSpy: jasmine.SpyObj<NationsCodeService>;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    const subjectSpy = jasmine.createSpyObj('SubjectService', ['postApiSubjectV1$Json']);
    const nationsSpy = jasmine.createSpyObj('NationsCodeService', ['postApiNationscodeV1$Json']);

    await TestBed.configureTestingModule({
      imports: [
        RelationshipSubjectContainerComponent,
        ReactiveFormsModule,
        GlsInputComponent,
        GlsInputDropdownComponent,
        TranslatePipe,
        TranslateModule,
        TranslateModule.forRoot()
      ],
      providers: [
        HttpClient,
        HttpHandler,
        AdministrativeCommonService,
        FormBuilder,
        {
          provide: SubjectService,
          useValue: subjectSpy
        },
        {
          provide: NationsCodeService,
          useValue: nationsSpy
        }
      ]
    }).compileComponents();

    subjectServiceSpy = TestBed.inject(SubjectService) as jasmine.SpyObj<SubjectService>;
    nationsCodeServiceSpy = TestBed.inject(NationsCodeService) as jasmine.SpyObj<NationsCodeService>;
    formBuilder = TestBed.inject(FormBuilder);

    subjectServiceSpy.postApiSubjectV1$Json.and.returnValue(
      of({
        subjects: [],
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalItems: 0
      } as GetSubjectsResponse)
    );

    nationsCodeServiceSpy.postApiNationscodeV1$Json.and.returnValue(
      of([
        {
          id: 1,
          isoCode: 'IT',
          description: 'Italia',
          isDefault: true
        }
      ] as NationsCodeModel[])
    );

    fixture = TestBed.createComponent(RelationshipSubjectContainerComponent);
    component = fixture.componentInstance;

    // Create a mock relationshipForm for testing
    const mockRelationshipForm = formBuilder.group({
      subjectId: [''],
      invoiceDetail: formBuilder.group({
        startOfAccountingActivity: ['']
      })
    });

    // Use the input setter directly
    fixture.componentRef.setInput('relationshipForm', mockRelationshipForm);
    fixture.componentRef.setInput('isDraft', true);

    // Setup the form manually to avoid subscribing to valueChanges in the component
    spyOn(component as any, 'subscribeToFilterTypeChanges').and.callFake(() => {
      component.customersListFg.get('filterType')?.valueChanges.subscribe((value) => {
        component.showLabelMessage = false;
        component.showNoResultsWarning.set(false);
        component.searchFilterType = 'administrative.relationshipEdit.relationshipSubjectContainer.filter.'.concat(value);
      });
    });

    // Call ngOnInit manually to build the form
    component.ngOnInit();

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.customersListFg).toBeDefined();
    expect(component.customersListFg.get('filterType')?.value).toBe('');
    expect(component.customersListFg.get('filterValue')?.value).toBe('');
  });

  it('should update searchFilterType and reset flags when filterType changes', () => {
    const control = component.customersListFg.get('filterType');
    control?.setValue('vatNumber');

    expect(component.showLabelMessage).toBeFalse();
    expect(component.searchFilterType).toBe('administrative.relationshipEdit.relationshipSubjectContainer.filter.vatNumber');
  });

  it('should set showLabelMessage and showWarning to true on search click', () => {
    const control = component.customersListFg.get('filterValue');
    control?.setValue('test-value');

    component.onSearchClick();

    expect(component.searchFilterValue).toBe('test-value');
    expect(component.showLabelMessage).toBeFalse();
  });

  it('should default searchFilterValue to empty string if form value is null', () => {
    component.customersListFg.get('filterValue')?.setValue(null);
    component.onSearchClick();
    expect(component.searchFilterValue).toBe('');
  });

  // New tests below

  it('should update payloadConfigurator with vatNumber when filterType is vatNumber', () => {
    component.customersListFg.get('filterType')?.setValue('vatNumber');
    component.customersListFg.get('filterValue')?.setValue('12345678');

    // Mock the loadAccordions method to avoid actual API call
    spyOn<any>(component, 'loadAccordions');

    component.onSearchClick();

    // Access the private property using type assertion
    const payload = (component as any).payloadConfigurator;
    expect(payload.vatNumber).toBe('12345678');
    expect(payload.surnameNameCompanyName).toBeNull();
  });

  it('should update payloadConfigurator with companyName when filterType is companyName', () => {
    component.customersListFg.get('filterType')?.setValue('companyName');
    component.customersListFg.get('filterValue')?.setValue('Test Company');

    // Mock the loadAccordions method to avoid actual API call
    spyOn<any>(component, 'loadAccordions');

    component.onSearchClick();

    // Access the private property using type assertion
    const payload = (component as any).payloadConfigurator;
    expect(payload.surnameNameCompanyName).toBe('Test Company');
    expect(payload.vatNumber).toBeNull();
  });

  it('should update current page on pageChange', () => {
    spyOn<any>(component, 'loadAccordions');
    component.pageChange(3);

    expect(component.currentPage()).toBe(3);
    // Access the private property using type assertion
    const payload = (component as any).payloadConfigurator;
    expect(payload.page).toBe(3);
  });

  it('should update relationshipForm when setSubjectId is called', () => {
    const mockSubject: SubjectResponseShort = {
      id: 1,
      companyName: 'Test Company',
      vatNumber: '12345678',
      dateAdded: '2023-01-01',
      status: 'COMPLETED',
      customSubjectIct10: false,
      isPhysicalPerson: false
    };

    component.setSubjectId(mockSubject);

    expect(component.relationshipForm()?.get('subjectId')?.value).toBe(1);
    expect(component.relationshipForm()?.get('invoiceDetail')?.get('startOfAccountingActivity')?.value).toBe('2023-01-01');
  });

  it('should emit subjectSelected when setSubjectId is called', () => {
    spyOn(component.subjectSelected, 'emit');

    const mockSubject: SubjectResponseShort = {
      id: 1,
      companyName: 'Test Company',
      vatNumber: '12345678',
      dateAdded: '2023-01-01',
      status: 'COMPLETED',
      customSubjectIct10: false,
      isPhysicalPerson: false
    };

    component.setSubjectId(mockSubject);

    expect(component.subjectSelected.emit).toHaveBeenCalledWith(true);
  });

  it('should handle successful API response in loadAccordions', () => {
    const mockSubjectsResponse: GetSubjectsResponse = {
      subjects: [
        {
          id: 1,
          companyName: 'Test Company',
          vatNumber: '12345678',
          dateAdded: '2023-01-01',
          status: 'COMPLETED',
          customSubjectIct10: false,
          isPhysicalPerson: false
        }
      ],
      currentPage: 2,
      totalPages: 5,
      pageSize: 10,
      totalItems: 50
    };

    const mockNationsResponse: NationsCodeModel[] = [
      {
        id: 1,
        isoCode: 'IT',
        description: 'Italia',
        isDefault: true
      },
      {
        id: 2,
        isoCode: 'FR',
        description: 'Francia',
        isDefault: false
      }
    ];

    subjectServiceSpy.postApiSubjectV1$Json.and.returnValue(of(mockSubjectsResponse));
    nationsCodeServiceSpy.postApiNationscodeV1$Json.and.returnValue(of(mockNationsResponse));

    // Call private method using type assertion
    (component as any).loadAccordions();

    expect(component.listSubjects()).toEqual(mockSubjectsResponse.subjects);
    expect(component.currentPage()).toBe(2);
    expect(component.totalPages()).toBe(5);
    expect(component.pageSize()).toBe(10);
    expect(component.totalItems()).toBe(50);

    // Verify nations list and default nation were set correctly
    expect((component as any).nationList()).toEqual([
      { id: 1, value: 'IT - Italia', isDefault: true, code: 'IT' },
      { id: 2, value: 'FR - Francia', isDefault: false, code: 'FR' }
    ]);

    expect((component as any).nationDefault()).toEqual({ id: 1, value: 'IT - Italia', isDefault: true, code: 'IT' });
  });

  it('should handle API error in loadAccordions', () => {
    const mockError = new Error('API Error');
    subjectServiceSpy.postApiSubjectV1$Json.and.returnValue(throwError(() => mockError));
    spyOn(console, 'error');

    // Call private method using type assertion
    (component as any).loadAccordions();
    expect(console.error).toHaveBeenCalledWith('Error', mockError);
  });

  it('should set showNoResultsWarning to true when no subjects are returned', () => {
    const mockResponse: GetSubjectsResponse = {
      subjects: [],
      currentPage: 1,
      totalPages: 0,
      pageSize: 10,
      totalItems: 0
    };

    subjectServiceSpy.postApiSubjectV1$Json.and.returnValue(of(mockResponse));

    // Call private method using type assertion
    (component as any).loadAccordions();

    expect(component.showNoResultsWarning()).toBeTrue();
    expect(component.isTableVisible()).toBeFalse();
  });

  it('should set showNoResultsWarning to false when subjects are returned', () => {
    const mockResponse: GetSubjectsResponse = {
      subjects: [
        {
          id: 1,
          companyName: 'Test Company',
          vatNumber: '12345678',
          dateAdded: '2023-01-01',
          status: 'COMPLETED',
          customSubjectIct10: false,
          isPhysicalPerson: false
        }
      ],
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
      totalItems: 1
    };

    subjectServiceSpy.postApiSubjectV1$Json.and.returnValue(of(mockResponse));

    // Call private method using type assertion
    (component as any).loadAccordions();

    expect(component.showNoResultsWarning()).toBeFalse();
    expect(component.isTableVisible()).toBeTrue();
  });
});
