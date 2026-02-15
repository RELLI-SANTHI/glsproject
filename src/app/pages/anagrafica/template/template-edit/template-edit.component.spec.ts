/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemplateEditComponent } from './template-edit.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable, of } from 'rxjs';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TemplateService } from '../../../../api/glsNetworkApi/services/template.service';
import { ICONS } from '../../../../common/utilities/constants/icon';
import { TemplateFieldModel } from '../../../../api/glsNetworkApi/models/template-field-model';
import { FieldModel } from '../../../../api/glsNetworkApi/models/field-model';
import { TemplateDetailsModel, TemplateModel } from '../../../../api/glsNetworkApi/models';
import { HttpErrorResponse } from '@angular/common/http';
import { Utility } from '../../../../common/utilities/utility';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';

describe('TemplateEditComponent', () => {
  let component: TemplateEditComponent;
  let fixture: ComponentFixture<TemplateEditComponent>;
  let templateService: any;
  let router: jasmine.SpyObj<Router>;
  let modalService: jasmine.SpyObj<NgbModal>;

  const activatedRoute = {
    snapshot: {
      paramMap: convertToParamMap({ idTemplate: '42' })
    },
    queryParams: of({})
  };

  beforeEach(async () => {
    const mockTemplateService = jasmine.createSpyObj('TemplateService', [
      'getTemplateById$Json',
      'getApiTemplateV1Fields$Json',
      'postApiTemplateV1$Json',
      'putApiTemplateV1$Json'
    ]);

    // Mock dei metodi del servizio
    mockTemplateService.getTemplateById$Json.and.returnValue(of({}));
    mockTemplateService.getApiTemplateV1Fields$Json.and.returnValue(of([]));
    mockTemplateService.postApiTemplateV1$Json.and.returnValue(of({ id: 1, templateName: 'New Template' }));
    mockTemplateService.putApiTemplateV1$Json.and.returnValue(of({}));

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);

    await TestBed.configureTestingModule({
      imports: [TemplateEditComponent, TranslateModule.forRoot(), HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Router, useValue: routerSpy },
        { provide: NgbModal, useValue: modalServiceSpy },
        TranslateService,
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TemplateEditComponent);
    component = fixture.componentInstance;
    templateService = TestBed.inject(TemplateService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    fixture.detectChanges();
    UtilityRouting.initialize(router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call resizeMainPage set on ngOnDestroy', () => {
    spyOn(component['genericService'].resizeMainPage, 'set');
    component.ngOnDestroy();
    expect(component['genericService'].resizeMainPage.set).toHaveBeenCalledWith(component['genericService'].defaultValue());
  });

  it('should return all icons', () => {
    const icons = component.getAllIcons();
    expect(icons).toBeTruthy();
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should set icon value on icon select', () => {
    const mockEvent = { preventDefault: jasmine.createSpy() } as any;
    component.step1FormGroup = new FormBuilder().group({ icon: [''] });
    component.onIconSelect('test-icon', mockEvent);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(component.step1FormGroup.get('icon')?.value).toBe('test-icon');
  });

  it('should open confirmation dialog and call updateTemplate on save', async () => {
    component.type = 'edit';
    component['idTemplate'] = 1;
    modalService.open.and.returnValue({
      componentInstance: { data: null },
      result: Promise.resolve('confirm')
    } as NgbModalRef);

    spyOn(component as any, 'updateTemplate');

    await component.onSaveTemplate();

    expect(modalService.open).toHaveBeenCalled();
    expect(component['updateTemplate']).toHaveBeenCalled();
  });
  it('should handle error case in updateTemplate', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-function
    spyOn(Utility, 'logErrorForDevEnvironment').and.callFake(() => {}); // Ignora il log dell'errore

    component.step1FormGroup = new FormBuilder().group({
      name: ['Updated Template'],
      icon: ['updated-icon']
    });
    component.step2FormGroup = new FormBuilder().group({
      buildingAcronymMin: [5],
      buildingAcronymMax: [15]
    });
    spyOn(component, 'getFormFields').and.returnValue([{ fieldId: 2, isVisible: true, isRequired: true }]);

    component['idTemplate'] = 42;

    const updateTemplateSpy = spyOn<any>(component, 'updateTemplate').and.callThrough();
    const openErrorModalSpy = spyOn<any>(component, 'openErrorModal');

    const errorResponse = {
      error: { error: 'Error occurred while updating the template' }
    };
    spyOn(templateService, 'putApiTemplateV1$Json').and.returnValue(
      new Observable((observer) => {
        observer.error(errorResponse);
      })
    );

    (component as any).updateTemplate();

    expect(updateTemplateSpy).toHaveBeenCalled();
    expect(templateService.putApiTemplateV1$Json).toHaveBeenCalledWith({
      body: {
        id: 42,
        templateName: 'Updated Template',
        icon: 'updated-icon',
        fields: [{ fieldId: 2, isVisible: true, isRequired: true }],
        buildingAcronymMinLength: 5,
        buildingAcronymMaxLength: 15
      }
    });
    expect(openErrorModalSpy).toHaveBeenCalledWith('attention', 'serviceMessage.genericError', false, undefined);
  });
  it('should handle error case in createTemplate', () => {
    component.step1FormGroup = new FormBuilder().group({
      name: ['New Template'],
      icon: ['new-icon']
    });
    component.step2FormGroup = new FormBuilder().group({
      buildingAcronymMin: [3],
      buildingAcronymMax: [10]
    });
    spyOn(component, 'getFormFields').and.returnValue([{ fieldId: 1, isVisible: true, isRequired: false }]);

    const createTemplateSpy = spyOn<any>(component, 'createTemplate').and.callThrough();
    const openErrorModalSpy = spyOn<any>(component, 'openErrorModal');

    const errorResponse = {
      error: { error: 'Error occurred while creating the template' }
    };
    spyOn(templateService, 'postApiTemplateV1$Json').and.returnValue(
      new Observable((observer) => {
        observer.error(errorResponse);
      })
    );

    (component as any).createTemplate();

    expect(createTemplateSpy).toHaveBeenCalled();
    expect(templateService.postApiTemplateV1$Json).toHaveBeenCalledWith({
      body: {
        templateName: 'New Template',
        icon: 'new-icon',
        fields: [{ fieldId: 1, isVisible: true, isRequired: false }],
        buildingAcronymMinLength: 3,
        buildingAcronymMaxLength: 10
      }
    });
    expect(openErrorModalSpy).toHaveBeenCalledWith('attention', 'serviceMessage.genericError', false, undefined);
  });

  it('should open confirmation dialog and call createTemplate on save when idTemplate is null', async () => {
    component.type = 'create';
    component['idTemplate'] = null; // Simula la condizione per la creazione di un nuovo template
    modalService.open.and.returnValue({
      componentInstance: { data: null },
      result: Promise.resolve('confirm')
    } as NgbModalRef);

    spyOn(component as any, 'createTemplate');

    await component.onSaveTemplate();

    expect(modalService.open).toHaveBeenCalled();
    expect(component['createTemplate']).toHaveBeenCalled();
  });

  it('should return the correct icon path', () => {
    const mockIcon = 'icon1';
    const mockPath = 'path/to/icon1';
    (ICONS as any)[mockIcon] = mockPath;

    const result = component.getTemplateIcon(mockIcon);

    expect(result).toBe(mockPath);
  });

  it('should return default icon if icon is not found', () => {
    const result = component.getTemplateIcon('nonexistent-icon');

    expect(result).toBe(component.titleIcon);
  });

  it('should navigate to template-detail if idTemplate is present', () => {
    component['idTemplate'] = 1;

    component.goToExit();

    expect(router.navigate).toHaveBeenCalledWith(['anagrafica/template-detail', '1']);
  });

  it('should navigate to template-list if idTemplate is not present', () => {
    component['idTemplate'] = null;

    component.goToExit();

    expect(router.navigate).toHaveBeenCalledWith(['anagrafica/template-list']);
  });

  it('should return the correct form fields', () => {
    component.fieldsList.update(() => [
      {
        id: 1,
        fieldName: 'Field1',
        isVisible: true,
        isRequired: false,
        section: 'section1',
        subSection: 'subSection1'
      },
      { id: -1, fieldName: 'Field2', isVisible: true, isRequired: true, section: 'section2', subSection: 'subSection2' }
    ]);

    component.step2FormGroup = new FormBuilder().group({
      Field1: [true],
      Field1_toggle: [true],
      Field2: [true],
      Field2_toggle: [true]
    });

    const result = component.getFormFields();

    expect(result).toEqual([{ fieldId: 1, isVisible: true, isRequired: true }]);
  });

  it('should open error modal and navigate if goToPrevPage is true', async () => {
    spyOn(component, 'goToExit');
    modalService.open.and.returnValue({
      componentInstance: { data: null },
      result: Promise.resolve('ok')
    } as NgbModalRef);

    await component['openErrorModal']('Error Title', 'Error Message', true);

    expect(modalService.open).toHaveBeenCalled();
    expect(component.goToExit).toHaveBeenCalled();
  });

  it('should enable or disable toggle fields based on field changes', () => {
    // Mock dei campi
    const mockField: TemplateFieldModel[] = [
      {
        id: 1,
        fieldName: 'testField',
        section: 'anagrafica',
        subSection: 'general',
        isVisible: true,
        isRequired: false,
        mandatory: false // Se necessario, aggiungi altre proprietà richieste
      }
    ];

    component.fieldsList.set(mockField);

    // Aggiungiamo i controlli al form
    component.step2FormGroup = new FormBuilder().group({
      testField: ['true'],
      testField_toggle: [{ value: 'false', disabled: true }]
    });

    // Spiamo i metodi enable e disable
    const toggleControl = component.step2FormGroup.get('testField_toggle')!;
    spyOn(toggleControl, 'enable').and.callThrough();
    spyOn(toggleControl, 'disable').and.callThrough();

    // Chiamiamo il metodo observeFieldChanges
    component['observeFieldChanges']();

    // Simuliamo un cambiamento del valore del campo
    const fieldControl = component.step2FormGroup.get('testField')!;
    fieldControl.setValue('false');

    // Verifica che il toggle field sia stato disabilitato
    expect(toggleControl.disable).toHaveBeenCalled();

    // Simuliamo un altro cambiamento del valore del campo
    fieldControl.setValue('true');

    // Verifica che il toggle field sia stato abilitato
    expect(toggleControl.enable).toHaveBeenCalled();
  });

  it('should create form controls with correct values and states', () => {
    const mockField: FieldModel = {
      id: 1,
      fieldName: 'testField',
      section: 'anagrafica',
      subSection: 'general',
      isVisible: true,
      isRequired: false,
      mandatory: true,
      fieldType: 'string'
    };

    component.step2FormGroup = new FormBuilder().group({});

    component['createFormControlFromField'](mockField);

    const fieldControl = component.step2FormGroup.get('testField');
    const toggleControl = component.step2FormGroup.get('testField_toggle');

    expect(fieldControl).toBeTruthy();
    expect(fieldControl?.value).toBe('true');
    expect(fieldControl?.disabled).toBeTrue();

    expect(toggleControl).toBeTruthy();
    expect(toggleControl?.value).toBe('false');
    expect(toggleControl?.disabled).toBeFalse();
  });

  it('Should correctly initialize the form controls in buildStep2', () => {
    const mockFields: FieldModel[] = [
      {
        id: 1,
        fieldName: 'testField1',
        section: 'anagrafica',
        subSection: 'general',
        isVisible: true,
        isRequired: false,
        mandatory: false,
        fieldType: 'string'
      },
      {
        id: 2,
        fieldName: 'testField2',
        section: 'anagrafica',
        subSection: 'general',
        isVisible: false,
        isRequired: true,
        mandatory: true,
        fieldType: 'number'
      }
    ];

    component.fieldsList.set(mockFields);

    component['buildStep2']();

    expect(component.step2FormGroup.get('buildingAcronymMin')).toBeTruthy();
    expect(component.step2FormGroup.get('buildingAcronymMax')).toBeTruthy();

    const field1Control = component.step2FormGroup.get('testField1');
    const field1ToggleControl = component.step2FormGroup.get('testField1_toggle');
    expect(field1Control).toBeTruthy();
    expect(field1Control?.value).toBe('true');
    expect(field1Control?.disabled).toBeFalse();

    expect(field1ToggleControl).toBeTruthy();
    expect(field1ToggleControl?.value).toBe('false');
    expect(field1ToggleControl?.disabled).toBeFalse();

    const field2Control = component.step2FormGroup.get('testField2');
    const field2ToggleControl = component.step2FormGroup.get('testField2_toggle');
    expect(field2Control).toBeTruthy();
    expect(field2Control?.value).toBe('false');
    expect(field2Control?.disabled).toBeTrue();

    expect(field2ToggleControl).toBeTruthy();
    expect(field2ToggleControl?.value).toBe('true');
    expect(field2ToggleControl?.disabled).toBeTrue();
  });

  it('Should correctly initialize the form controls in buildStep1', () => {
    (component as any).buildStep1();

    expect(component.step1FormGroup).toBeTruthy();
    expect(component.step1FormGroup.get('name')).toBeTruthy();
    expect(component.step1FormGroup.get('icon')).toBeTruthy();

    expect(component.step1FormGroup.get('name')?.value).toBe('');
    expect(component.step1FormGroup.get('icon')?.value).toBe('');

    if (component.type === 'edit') {
      expect(component.step1FormGroup.get('name')?.value).toBe(component.title);
      expect(component.step1FormGroup.get('icon')?.value).toBe(component.titleIcon);
    }
  });

  it('should correctly initialize the forms and stepper steps in buildForms', () => {
    const mockFields: FieldModel[] = [
      {
        id: 1,
        fieldName: 'testField1',
        section: 'anagrafica',
        subSection: 'general',
        isVisible: true,
        isRequired: false,
        mandatory: false,
        fieldType: 'string'
      }
    ];

    component.fieldsList.set(mockFields);

    (component as any).buildForms();

    expect(component.createTemplateFormGroup).toBeTruthy();
    expect(component.createTemplateFormGroup.get('templateName')).toBeTruthy();

    expect(component.step1FormGroup).toBeTruthy();
    expect(component.step1FormGroup.get('name')).toBeTruthy();
    expect(component.step1FormGroup.get('icon')).toBeTruthy();

    expect(component.step2FormGroup).toBeTruthy();
    expect(component.step2FormGroup.get('buildingAcronymMin')).toBeTruthy();
    expect(component.step2FormGroup.get('buildingAcronymMax')).toBeTruthy();
    expect(component.step2FormGroup.get('testField1')).toBeTruthy();
    expect(component.step2FormGroup.get('testField1_toggle')).toBeTruthy();

    expect(component.steps.length).toBe(3);
    expect(component.steps[0].title).toBe('chooseIconName');
    expect(component.steps[1].title).toBe('compileData');
    expect(component.steps[2].title).toBe('controlData');
  });
  it('should initialize step1FormGroup with correct values when type is edit', () => {
    component.type = 'edit';
    component.title = 'Edit Template Title';
    component.titleIcon = 'edit-icon-path';

    (component as any).buildStep1();

    expect(component.step1FormGroup).toBeTruthy();
    expect(component.step1FormGroup.get('name')).toBeTruthy();
    expect(component.step1FormGroup.get('icon')).toBeTruthy();

    expect(component.step1FormGroup.get('name')?.value).toBe('Edit Template Title');
    expect(component.step1FormGroup.get('icon')?.value).toBe('edit-icon-path');
  });

  it('should correctly initialize the forms and stepper steps in buildForms', (done) => {
    const mockFields: FieldModel[] = [
      {
        id: 1,
        fieldName: 'TestField',
        section: 'section1',
        subSection: 'subSection1',
        isVisible: true,
        isRequired: false,
        mandatory: false,
        fieldType: 'string'
      }
    ];

    spyOn(templateService, 'getApiTemplateV1Fields$Json').and.returnValue(of(mockFields));

    (component as any).retrieveTemplateFields().subscribe((fields: FieldModel[]) => {
      expect(fields).toEqual(mockFields);
      expect(templateService.getApiTemplateV1Fields$Json).toHaveBeenCalled();
      done();
    });
  });

  it('should update activeStep with the passed value', () => {
    const mockEvent = { index: 2 };

    component.getStepperValue(mockEvent);

    expect(component.activeStep).toBe(2);
  });

  it('should correctly set the initial data of the page', () => {
    const mockFields: FieldModel[] = [
      {
        id: 1,
        fieldName: 'TestField',
        section: 'section1',
        subSection: 'subSection1',
        isVisible: true,
        isRequired: false,
        mandatory: false,
        fieldType: 'string'
      }
    ];
    const mockTitle = 'Test Title';
    const mockType = 'edit';

    const setInitialPageDataSpy = spyOn<any>(component, 'setInitialPageData').and.callThrough();

    (component as any).setInitialPageData(mockFields, mockTitle, mockType);

    expect(setInitialPageDataSpy).toHaveBeenCalledWith(mockFields, mockTitle, mockType);

    expect(component.fieldsList()).toEqual(mockFields);
    expect(component.title).toBe(mockTitle);
    expect(component.type).toBe(mockType);
  });

  it('should correctly create a TemplateFieldModel for Building Acronym', () => {
    const createBuildingAcronymTemplateSpy = spyOn<any>(component, 'createBuildingAcronymTemplate').and.callThrough();

    const result = (component as any).createBuildingAcronymTemplate();

    expect(createBuildingAcronymTemplateSpy).toHaveBeenCalled();

    expect(result).toEqual({
      id: -1,
      fieldName: 'BuildingAcronym',
      section: 'anagrafica',
      subSection: 'general',
      isVisible: true,
      isRequired: true,
      mandatory: true
    });
  });

  it('should correctly create a FieldModel for Building Acronym', () => {
    const createBuildingAcronymFieldModelSpy = spyOn<any>(component, 'createBuildingAcronymFieldModel').and.callThrough();

    const result = (component as any).createBuildingAcronymFieldModel();

    expect(createBuildingAcronymFieldModelSpy).toHaveBeenCalled();

    expect(result).toEqual({
      id: -1,
      fieldName: 'BuildingAcronym',
      section: 'anagrafica',
      subSection: 'general',
      isVisible: true,
      isRequired: true,
      mandatory: true,
      fieldType: 'string'
    });
  });

  it('should correctly create a new template', () => {
    component.step1FormGroup = new FormBuilder().group({
      name: ['Test Template'],
      icon: ['test-icon']
    });
    component.step2FormGroup = new FormBuilder().group({
      buildingAcronymMin: [3],
      buildingAcronymMax: [10]
    });
    spyOn(component, 'getFormFields').and.returnValue([{ fieldId: 1, isVisible: true, isRequired: false }]);

    const createTemplateSpy = spyOn<any>(component, 'createTemplate').and.callThrough();

    const templateModel: TemplateModel = {
      buildingAcronymMaxLength: 10,
      buildingAcronymMinLength: 3,
      createdAt: '2023-10-01T00:00:00Z',
      createdBy: 'user',
      icon: 'test-icon',
      id: 1,
      templateName: 'Test Template'
    };

    const response$: Observable<TemplateModel> = of(templateModel);
    const spyOnpostApiTemplateV1 = spyOn(templateService, 'postApiTemplateV1$Json').and.callFake(() => response$);

    (component as any).createTemplate();

    expect(createTemplateSpy).toHaveBeenCalled();
    expect(spyOnpostApiTemplateV1).toHaveBeenCalled();

    expect(templateService.postApiTemplateV1$Json).toHaveBeenCalledWith({
      body: {
        buildingAcronymMaxLength: 10,
        buildingAcronymMinLength: 3,
        fields: [{ fieldId: 1, isVisible: true, isRequired: false }],
        icon: 'test-icon',
        templateName: 'Test Template'
      }
    });
  });

  it('should correctly update a template', () => {
    component.step1FormGroup = new FormBuilder().group({
      name: ['Updated Template'],
      icon: ['updated-icon']
    });
    component.step2FormGroup = new FormBuilder().group({
      buildingAcronymMin: [5],
      buildingAcronymMax: [15]
    });
    spyOn(component, 'getFormFields').and.returnValue([{ fieldId: 2, isVisible: true, isRequired: true }]);

    component['idTemplate'] = 42;

    const updateTemplateSpy = spyOn<any>(component, 'updateTemplate').and.callThrough();

    const templateDetailsModel: TemplateDetailsModel = {
      id: 42,
      templateName: 'Updated Template',
      icon: 'updated-icon',
      fields: [],
      buildingAcronymMaxLength: 15,
      buildingAcronymMinLength: 5
    };
    const response$: Observable<TemplateDetailsModel> = of(templateDetailsModel);
    const spyOnPutApiTemplateV1 = spyOn(templateService, 'putApiTemplateV1$Json').and.callFake(() => response$);

    (component as any).updateTemplate();

    expect(updateTemplateSpy).toHaveBeenCalled();
    expect(spyOnPutApiTemplateV1).toHaveBeenCalled();

    expect(templateService.putApiTemplateV1$Json).toHaveBeenCalledWith({
      body: {
        id: 42,
        templateName: 'Updated Template',
        icon: 'updated-icon',
        fields: [{ fieldId: 2, isVisible: true, isRequired: true }],
        buildingAcronymMinLength: 5,
        buildingAcronymMaxLength: 15
      }
    });
  });

  it('should properly initialize the component with an idTemplate', () => {
    component['idTemplate'] = 42;

    const mockTemplateDetails: TemplateDetailsModel = {
      id: 42,
      templateName: 'Test Template',
      icon: 'test-icon',
      fields: [],
      buildingAcronymMaxLength: 10,
      buildingAcronymMinLength: 3
    };
    spyOn(templateService, 'getTemplateById$Json').and.returnValue(of(mockTemplateDetails));
    spyOn(component as any, 'createBuildingAcronymTemplate').and.returnValue({
      id: -1,
      fieldName: 'BuildingAcronym',
      section: 'anagrafica',
      subSection: 'general',
      isVisible: true,
      isRequired: true,
      mandatory: true
    });
    spyOn(component as any, 'buildForms');

    component.ngOnInit();

    expect(templateService.getTemplateById$Json).toHaveBeenCalledWith(
      { id: 42 },
      jasmine.objectContaining({
        map: jasmine.any(Map)
      })
    );

    expect(component['createBuildingAcronymTemplate']).toHaveBeenCalled();
    expect(component['buildForms']).toHaveBeenCalled();

    expect(component.titleIcon).toBe('test-icon');
    expect(component.activeStep).toBe(1);
    expect(component['showPage']).toBeTrue();
  });
  it('should handle error case in ngOnInit when retrieving template by id', () => {
    component['idTemplate'] = 42;

    const errorResponse = new HttpErrorResponse({
      error: { error: 'Error occurred while retrieving template' },
      status: 500
    });

    spyOn(templateService, 'getTemplateById$Json').and.returnValue(
      new Observable((observer) => {
        observer.error(errorResponse);
      })
    );
    const openErrorModalSpy = spyOn<any>(component, 'openErrorModal');
    const logErrorSpy = spyOn(Utility, 'logErrorForDevEnvironment');

    component.ngOnInit();

    expect(templateService.getTemplateById$Json).toHaveBeenCalledWith(
      { id: 42 },
      jasmine.objectContaining({
        map: jasmine.any(Map)
      })
    );
    expect(logErrorSpy).toHaveBeenCalledWith(errorResponse);
    expect(openErrorModalSpy).toHaveBeenCalledWith('attention', 'serviceMessage.genericError', true, undefined);
  });

  it('should correctly create a new template', () => {
    component.step1FormGroup = new FormBuilder().group({
      name: ['Test Template'],
      icon: ['test-icon']
    });
    component.step2FormGroup = new FormBuilder().group({
      buildingAcronymMin: [3],
      buildingAcronymMax: [10]
    });
    spyOn(component, 'getFormFields').and.returnValue([{ fieldId: 1, isVisible: true, isRequired: false }]);

    const mockTemplateModel: TemplateModel = {
      id: 1,
      templateName: 'Test Template',
      icon: 'test-icon',
      buildingAcronymMaxLength: 10,
      buildingAcronymMinLength: 3,
      createdAt: '2023-10-01T00:00:00Z',
      createdBy: 'user'
    };
    spyOn(templateService, 'postApiTemplateV1$Json').and.returnValue(of(mockTemplateModel));

    const createTemplateSpy = spyOn<any>(component, 'createTemplate').and.callThrough();

    (component as any).createTemplate();

    expect(createTemplateSpy).toHaveBeenCalled();

    expect(templateService.postApiTemplateV1$Json).toHaveBeenCalledWith({
      body: {
        templateName: 'Test Template',
        icon: 'test-icon',
        fields: [{ fieldId: 1, isVisible: true, isRequired: false }],
        buildingAcronymMinLength: 3,
        buildingAcronymMaxLength: 10
      }
    });
  });
});
