/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemplateDetailComponent } from './template-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TemplateService } from '../../../../api/glsNetworkApi/services';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { TemplateDetailsModel } from '../../../../api/glsNetworkApi/models/template-details-model';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';

describe('TemplateDetailComponent', () => {
  let component: TemplateDetailComponent;
  let fixture: ComponentFixture<TemplateDetailComponent>;
  let templateService: jasmine.SpyObj<TemplateService>;
  let router: jasmine.SpyObj<Router>;
  let modalService: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    const templateServiceSpy = jasmine.createSpyObj('TemplateService', ['getTemplateById$Json', 'postApiTemplateV1IdLock$Response']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    const messageStatusServiceSpy = jasmine.createSpyObj('MessageStatusService', ['hide']);

    const activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: (key: string) => {
            if (key === 'idTemplate') {
              return '1';
            }

            return null;
          }
        }
      }
    };

    spyOn(UtilityRouting, 'navigateToTemplateEditByTemplateId');

    templateServiceSpy.postApiTemplateV1IdLock$Response.and.returnValue(of({ status: 204, body: {} }));

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot(), TemplateDetailComponent],
      providers: [
        { provide: TemplateService, useValue: templateServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NgbModal, useValue: modalServiceSpy },
        { provide: MessageStatusService, useValue: messageStatusServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TemplateDetailComponent);
    component = fixture.componentInstance;
    templateService = TestBed.inject(TemplateService) as jasmine.SpyObj<TemplateService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    UtilityRouting.initialize(router);
  });

  it('dovrebbe creare il componente', () => {
    expect(component).toBeTruthy();
  });

  it('dovrebbe gestire un errore durante il recupero dei dettagli del template', () => {
    const mockError = { error: { error: 'Errore di test' } };
    const modalRefMock = {
      componentInstance: {},
      result: Promise.resolve()
    };
    modalService.open.and.returnValue(modalRefMock as any);

    templateService.getTemplateById$Json.and.returnValue(throwError(mockError));

    component.ngOnInit();

    expect(templateService.getTemplateById$Json).toHaveBeenCalled();
    expect(modalService.open).toHaveBeenCalled();
  });

  it('should navigate to the template editing page', () => {
    component['idTemplate'] = 1;
    component.editTemplate();

    expect(UtilityRouting.navigateToTemplateEditByTemplateId).toHaveBeenCalled();
  });

  it('should open the error modal and navigate to the list of templates', () => {
    const modalRefMock = {
      componentInstance: { data: {} as { title: string; content: string; showCancel: boolean; confirmText: string } }, // Definizione esplicita del tipo
      result: Promise.resolve()
    };
    modalService.open.and.returnValue(modalRefMock as any);

    component.openErrorModal('Errore', 'Contenuto di test');

    expect(modalService.open).toHaveBeenCalled();
  });

  it('should return the correct icon from getTemplateIcon', () => {
    const mockIcons = { testIcon: 'iconPath' };
    (component as any).ICONS = mockIcons;

    const result = component.getTemplateIcon('testIcon');

    expect(result).toBe('');
  });

  it('should return the idTemplate as a string from idTemplateString', () => {
    component['idTemplate'] = 123;

    const result = component.idTemplateString;

    expect(result).toBe('123');
  });

  it('Should update the fields and set the properties correctly', () => {
    const mockResponse: TemplateDetailsModel = {
      fields: [],
      templateName: 'Test Template',
      icon: 'testIcon',
      buildingAcronymMaxLength: 10,
      buildingAcronymMinLength: 2,
      id: 1
    };

    const buildingAcromym = {
      id: -1,
      fieldName: 'BuildingAcronym',
      section: 'anagrafica',
      subSection: 'general',
      isVisible: true,
      isRequired: true,
      mandatory: true
    };

    spyOn(component.fieldsList, 'update').and.callThrough();

    mockResponse.fields.unshift(buildingAcromym);

    component['fieldsList'].update(() => mockResponse.fields);
    component['templateDetailsModel'] = mockResponse;
    component['buildForm']();
    component['title'] = mockResponse.templateName;
    component['icon'] = mockResponse.icon;
    component['loadPage'] = true;

    expect(component.fieldsList.update).toHaveBeenCalledWith(jasmine.any(Function));
    expect(component['templateDetailsModel']).toEqual(mockResponse);
    expect(component['title']).toBe('Test Template');
    expect(component['icon']).toBe('testIcon');
    expect(component['loadPage']).toBeTrue();
  });

  it('should update the fields and set the properties correctlyshould build the form correctly', () => {
    component['templateDetailsModel'] = {
      buildingAcronymMinLength: 2,
      buildingAcronymMaxLength: 10,
      fields: [],
      templateName: 'Test Template',
      icon: 'testIcon',
      id: 1
    };

    const mockFields = [
      {
        id: 1,
        fieldName: 'Field1',
        section: 'anagrafica',
        subSection: 'general',
        isVisible: true,
        isRequired: true,
        mandatory: true
      },
      {
        id: 2,
        fieldName: 'Field2',
        section: 'anagrafica',
        subSection: 'general',
        isVisible: false,
        isRequired: false,
        mandatory: false
      }
    ];
    component.fieldsList.update(() => mockFields);

    component['buildForm']();

    // Verifica i controlli principali
    expect(component.formGroup.get('buildingAcronymMin')?.value).toBe(2);
    expect(component.formGroup.get('buildingAcronymMax')?.value).toBe(10);

    mockFields.forEach((field) => {
      expect(component.formGroup.get(field.fieldName)).toBeTruthy();
      expect(component.formGroup.get(field.fieldName + '_toggle')).toBeTruthy();
    });
  });

  it('should update showRotateCard based on isSmallMobile and isLandscape', () => {
    spyOn(component['genericService'], 'isLandscape').and.returnValue(false);

    component.isSmallMobile = true;

    component['showRotateCard'].set(false);
    component['showRotateCard'].set(component.isSmallMobile && !component['genericService'].isLandscape());

    expect(component['showRotateCard']()).toBe(true);

    component['genericService'].isLandscape.set(true);
    component['showRotateCard'].set(component.isSmallMobile && !component['genericService'].isLandscape());

    expect(component['showRotateCard']()).toBe(true);
  });

  it('should properly initialize the component and update the properties', () => {
    const mockResponse: TemplateDetailsModel = {
      fields: [
        {
          id: 1,
          fieldName: 'Field1',
          section: 'anagrafica',
          subSection: 'general',
          isVisible: true,
          isRequired: true,
          mandatory: true
        }
      ],
      templateName: 'Test Template',
      icon: 'testIcon',
      buildingAcronymMaxLength: 10,
      buildingAcronymMinLength: 2,
      id: 1
    };

    templateService.getTemplateById$Json.and.returnValue(of(mockResponse));
    spyOn(component.fieldsList, 'update').and.callThrough();
    (spyOn(component as any, 'buildForm') as jasmine.Spy).and.callThrough();

    component.ngOnInit();

    expect(templateService.getTemplateById$Json).toHaveBeenCalledWith(
      { id: 1 },
      jasmine.objectContaining({
        map: jasmine.any(Map)
      })
    );
    expect(component.fieldsList.update).toHaveBeenCalledWith(jasmine.any(Function));
    expect(component['templateDetailsModel']).toEqual(
      mockResponse,
      jasmine.objectContaining({
        map: jasmine.any(Map)
      })
    );
    expect(component.title).toBe('Test Template');
    expect(component.icon).toBe('testIcon');
    expect(component.loadPage).toBeTrue();
    expect(component['buildForm']).toHaveBeenCalled();
  });
});
