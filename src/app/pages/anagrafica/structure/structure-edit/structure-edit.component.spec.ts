/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { StructureEditComponent } from './structure-edit.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AttachmentService } from '../../../../api/glsNetworkApi/services';
import { StructureService } from '../../../../api/glsNetworkApi/services/structure.service';
import { TemplateService } from '../../../../api/glsNetworkApi/services/template.service';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { BreadcrumbService } from '../../../../common/utilities/services/breadcrumb/breadcrumb.service';
import { StructureDisableService } from '../../../../common/utilities/services/structure-disable/structure-disable.service';
import { Utility } from '../../../../common/utilities/utility';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { STATUS } from '../../../../common/utilities/constants/generic-constants';
import { UtilityConcurrency } from '../../../../common/utilities/utility-concurrency';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CONCURRENCY } from '../../../../common/utilities/constants/concurrency';

describe('StructureEditComponent', () => {
  let component: StructureEditComponent;
  let fixture: ComponentFixture<StructureEditComponent>;
  let mockModalService: jasmine.SpyObj<NgbModal>;
  let mockAttachmentService: jasmine.SpyObj<AttachmentService>;
  let mockStructureService: jasmine.SpyObj<StructureService>;
  let mockTemplateService: jasmine.SpyObj<TemplateService>;
  let mockMessageStatusService: jasmine.SpyObj<MessageStatusService>;
  let mockGenericService: jasmine.SpyObj<GenericService>;
  let mockBreadcrumbService: jasmine.SpyObj<BreadcrumbService>;
  let mockStructureDisableService: jasmine.SpyObj<StructureDisableService>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);
    mockAttachmentService = jasmine.createSpyObj('AttachmentService', [
      'postApiAttachmentV1$Json',
      'deleteApiAttachmentV1Id',
      'getApiAttachmentV1Id$Json'
    ]);
    mockStructureService = jasmine.createSpyObj('StructureService', [
      'postApiStructureV1Create$Json',
      'putApiStructureV1Id$Json',
      'getStructureById$Json',
      'postApiStructureV1IdLock$Response',
      'postApiStructureV1IdUnlock$Response'
    ]);
    mockTemplateService = jasmine.createSpyObj('TemplateService', ['getApiTemplateV1$Json', 'getApiTemplateV1Fields$Json']);
    mockMessageStatusService = jasmine.createSpyObj('MessageStatusService', ['show']);
    // Patch: resizeMainPage as signal-like object with update spy
    mockGenericService = jasmine.createSpyObj('GenericService', ['resizePage', 'manageError', 'openErrorModal'], {
      resizeMainPage: { update: jasmine.createSpy('update') },
      defaultValue: () => true
    });
    mockBreadcrumbService = jasmine.createSpyObj('BreadcrumbService', ['removeLastBreadcrumb']);
    mockStructureDisableService = jasmine.createSpyObj('StructureDisableService', ['toDisable'], {
      disableStructure$: of(true)
    });
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => {
            if (key === 'idStructure') {
              return null;
            }

            return null;
          }
        }
      }
    };

    // StructureService
    const mockStructureDetailResponse = {
      id: 1,
      buildingAcronym: '',
      buildingAcronymMaxLength: 10,
      buildingAcronymMinLength: 2,
      buildingType: 1,
      fields: [],
      attachments: [],
      status: 'ACTIVE'
    } as any;
    mockStructureService.postApiStructureV1Create$Json.and.returnValue(of({ id: 1 } as any));
    mockStructureService.putApiStructureV1Id$Json.and.returnValue(of(mockStructureDetailResponse));
    mockStructureService.getStructureById$Json.and.returnValue(of(mockStructureDetailResponse));
    // StrictHttpResponse<void> mock
    const mockStrictHttpResponse = {
      body: undefined,
      type: 4,
      clone: () => mockStrictHttpResponse,
      headers: undefined,
      status: 200,
      statusText: 'OK',
      url: '',
      ok: true
    } as any;
    mockStructureService.postApiStructureV1IdLock$Response.and.returnValue(of(mockStrictHttpResponse));
    mockStructureService.postApiStructureV1IdUnlock$Response.and.returnValue(of(mockStrictHttpResponse));
    // TemplateService
    mockTemplateService.getApiTemplateV1$Json.and.returnValue(of([]));
    mockTemplateService.getApiTemplateV1Fields$Json.and.returnValue(of([]));
    // AttachmentService
    const mockAttachmentModel = {
      id: 1,
      blobUrl: '',
      fileName: 'file.pdf',
      fileSize: 123,
      name: 'file.pdf',
      structureId: 1,
      updatedAt: '',
      isMap: false
    } as any;
    mockAttachmentService.postApiAttachmentV1$Json.and.returnValue(of(mockAttachmentModel));
    mockAttachmentService.deleteApiAttachmentV1Id.and.returnValue(of(void 0));
    mockAttachmentService.getApiAttachmentV1Id$Json.and.returnValue(of(new Blob()));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, StructureEditComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        FormBuilder,
        { provide: NgbModal, useValue: mockModalService },
        { provide: AttachmentService, useValue: mockAttachmentService },
        { provide: StructureService, useValue: mockStructureService },
        { provide: TemplateService, useValue: mockTemplateService },
        { provide: MessageStatusService, useValue: mockMessageStatusService },
        { provide: GenericService, useValue: mockGenericService },
        { provide: BreadcrumbService, useValue: mockBreadcrumbService },
        { provide: StructureDisableService, useValue: mockStructureDisableService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();
  });

  // Spia la property disableStructure$ una sola volta per tutta la suite
  beforeAll(() => {
    spyOnProperty(StructureDisableService.prototype, 'disableStructure$', 'get').and.returnValue(of(true));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureEditComponent);
    component = fixture.componentInstance;
    component.structureFg = new FormGroup({});
    component.structureCreateFgControl = new FormGroup({});
    // Spy openErrorModal once for all tests that need it
    spyOn(component, 'openErrorModal').and.callThrough();
    // Mock modalService.open to always return an object with componentInstance
    mockModalService.open.and.returnValue({
      componentInstance: {},
      result: Promise.resolve('ok')
    } as any);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and set showForm true', () => {
    spyOn(component, 'getStructureButtonType');
    spyOn(component, 'loadStructurePage');
    spyOn(component as any, 'lockUnlock');
    component.ngOnInit();
    expect(component.getStructureButtonType).toHaveBeenCalled();
    expect(component.loadStructurePage).toHaveBeenCalled();
    expect((component as any).lockUnlock).toHaveBeenCalled();
    expect(component.showForm).toBeTrue();
  });

  it('should call getStructureButtonType and set stuctureButtonType', () => {
    component.getStructureButtonType();
    expect(component.stuctureButtonType).toBeTrue();
  });

  it('should call loadStructurePage with idStructure and handle success', fakeAsync(() => {
    const mockResponse = { fields: [], attachments: [], status: 'ACTIVE' };
    mockStructureService.getStructureById$Json.and.returnValue(of(mockResponse as any));
    spyOn(component as any, 'initializeFormStructureFields');
    spyOn(component as any, 'loadAtachment');
    component.stuctureButtonType = false;
    component.structureId = 1;
    component.loadStructurePage(1);
    tick();
    expect(component.structureDetailResponse).toEqual(mockResponse as any);
    expect((component as any).initializeFormStructureFields).toHaveBeenCalled();
    expect((component as any).loadAtachment).toHaveBeenCalled();
  }));

  it('should call loadStructurePage without idStructure and handle success', fakeAsync(() => {
    mockTemplateService.getApiTemplateV1$Json.and.returnValue(of([]));
    mockTemplateService.getApiTemplateV1Fields$Json.and.returnValue(of([]));
    component.loadStructurePage();
    tick();
    expect(component.templateResponseList).toEqual([]);
  }));

  it('should call disabledFieldObject and set EndOfOperationalActivity', () => {
    component.structureDetailResponse = {
      fields: [{ fieldName: 'EndOfOperationalActivity', value: 'test', isRequired: false }]
    } as any;
    component.disabledFieldObject();
    expect(component.structureDetailResponse?.fields[0].value).toBeNull();
    expect(component.structureDetailResponse?.fields[0].isRequired).toBeTrue();
  });

  it('should set currentStep on getStepperValue if type is create', () => {
    component.type = 'create';
    component.getStepperValue({ index: 1, data: { acronym: 'test' } });
    expect(component.currentStep).toBe(1);
  });

  it('should return icon from getTemplateIcon', () => {
    expect(component.getTemplateIcon('pdf')).toBeDefined();
  });

  it('should return field description', () => {
    component.structureDetailResponse = {
      fields: [{ fieldName: 'desc', value: 'val' }]
    } as any;
    expect(component.getFieldDescription('desc')).toBe('val');
    expect(component.getFieldDescription('notfound')).toBe('');
  });

  it('should enable control and set validators on selectTemplate', () => {
    component.structureCreateFgControl.addControl('acronym', new FormControl(''));
    const templateObj = { templateName: 'T', id: 1, buildingAcronymMinLength: 2, buildingAcronymMaxLength: 5 } as any;
    component.selectTemplate(templateObj);
    expect(component.selectTemplateName).toBe('T');
    expect(component.structureCreateFgControl.controls['acronym'].enabled).toBeTrue();
  });

  it('should call saveCompilationData and handle success', fakeAsync(() => {
    component.structureCreateFgControl.addControl('acronym', new FormControl('VAL'));
    component.structureCreateObject.buildingType = 1;
    mockStructureService.postApiStructureV1Create$Json.and.returnValue(of({ id: 2 }));
    spyOn(component, 'loadStructurePage');
    spyOn(component, 'onStepComplete');
    component.saveCompilationData();
    tick();
    expect(component.loadStructurePage).toHaveBeenCalledWith(2);
    expect(component.onStepComplete).toHaveBeenCalled();
  }));

  it('should call onStepComplete', () => {
    component.stepperComponent = { onStepComplete: jasmine.createSpy('onStepComplete') } as any;
    component.onStepComplete();
    expect(component.stepperComponent.onStepComplete).toHaveBeenCalled();
  });

  it('should call openErrorModal and open modal', fakeAsync(() => {
    const modalRefMock = { componentInstance: {}, result: Promise.resolve('ok') };
    mockModalService.open.and.returnValue(modalRefMock as any);
    component.openErrorModal('title', 'msg');
    tick();
    expect(mockModalService.open).toHaveBeenCalled();
    expect(component.dialogData.title).toBe('title');
  }));

  it('should return invalid true if control is invalid and touched', () => {
    const fg = new FormGroup({ test: new FormControl('', { validators: [() => ({ error: true })] }) });
    fg.controls['test'].markAsTouched();
    expect(component.invalid(fg, 'test')).toBeTrue();
  });

  it('should matchType return true if field matches', () => {
    component.structureDetailResponse = {
      fields: [{ fieldName: 'a', fieldType: 'varchar' }]
    } as any;
    expect(component.matchType('a', 'varchar')).toBeTrue();
    expect(component.matchType('a', 'int')).toBeFalse();
  });
  it('should return control from structureFgControl', () => {
    component.structureFg.addControl('test', new FormControl('val'));
    expect(component.structureFgControl('test').value).toBe('val');
  });

  it('should call save and handle success', fakeAsync(() => {
    component.structureDetailResponse = {
      fields: [{ id: 1, fieldName: 'a', fieldType: 'varchar', value: 'v' }]
    } as any;
    component.structureFg.addControl('a', new FormControl('v'));

    mockStructureService.putApiStructureV1Id$Json.and.returnValue(of({ id: 1 } as any));
    spyOn(UtilityRouting, 'navigateToStructureDetailByStructureId');
    component.save();
    tick();
    expect(mockMessageStatusService.show).toHaveBeenCalled();
    expect(mockBreadcrumbService.removeLastBreadcrumb).toHaveBeenCalled();
    expect(UtilityRouting.navigateToStructureDetailByStructureId).toHaveBeenCalledWith('1');
  }));

  it('should call onFileSelected and handle no file', () => {
    const event = { target: { files: null } } as any;
    component.onFileSelected(event);
    expect(component.openErrorModal).toHaveBeenCalled();
  });

  it('should call onFileSelected and handle file', () => {
    const file = new File([''], 'test.pdf');
    const event = { target: { files: [file] } } as any;
    spyOn(component as any, 'startUpload');
    component.onFileSelected(event);
    expect((component as any).startUpload).toHaveBeenCalledWith(file);
  });

  it('should call onFileSelectedonFields and startUpload', () => {
    const file = new File([''], 'test.pdf');
    spyOn(component as any, 'startUpload');
    component.onFileSelectedonFields('Map', file);
    expect((component as any).startUpload).toHaveBeenCalledWith(file, true);
  });

  it('should call retrieveAttachById and return attachment', () => {
    component.attachmentModel = [{ id: 1 } as any];
    expect(component.retrieveAttachById(1)).toEqual({ id: 1 } as any);
    expect(component.retrieveAttachById(2)).toBeUndefined();
  });

  it('should call resetMapFc and reset control', () => {
    component.structureFg.addControl('Map', new FormControl('val'));
    component.resetMapFc(true);
    expect(component.structureFg.get('Map')?.value).toBeNull();
  });

  it('should call reloadAttach and reset fields', fakeAsync(() => {
    component.fileName = 'test';
    component.progress = 50;
    component.selectedFile = new File([''], 'test.pdf');
    component.showAttach = true;
    component.reloadAttach();
    expect(component.fileName).toBe('');
    expect(component.progress).toBe(0);
    expect(component.selectedFile).toBeNull();
    expect(component.showAttach).toBeFalse();
    tick();
    expect(component.showAttach).toBeTrue();
  }));

  it('should call closeSuccessMessage and reset fields', () => {
    component.uploadComplete = true;
    component.fileName = 'test';
    component.progress = 50;
    component.closeSuccessMessage();
    expect(component.uploadComplete).toBeFalse();
    expect(component.fileName).toBe('');
    expect(component.progress).toBe(0);
  });

  it('should call exit and navigate', () => {
    spyOn(UtilityRouting, 'navigateToStructureList');
    component.exit();
    expect(UtilityRouting.navigateToStructureList).toHaveBeenCalled();
  });

  it('should call onSaveDraft and open modal', fakeAsync(() => {
    const modalRefMock = { componentInstance: {}, result: Promise.resolve('ok') };
    mockModalService.open.and.returnValue(modalRefMock as any);
    spyOn(component, 'saveDraft');
    component.onSaveDraft();
    tick();
    expect(mockModalService.open).toHaveBeenCalled();
    expect(component.saveDraft).toHaveBeenCalled();
  }));

  it('should call deleteAttachment and remove attachment', fakeAsync(() => {
    component.attachmentModel = [{ id: 1 } as any];
    mockAttachmentService.deleteApiAttachmentV1Id.and.returnValue(of(void 0));
    spyOn(component, 'resetMapFc');
    component.deleteAttachment(1, true);
    tick();
    expect(component.attachmentModel.length).toBe(0);
    expect(component.resetMapFc).toHaveBeenCalledWith(true);
  }));

  it('should call downloadAttachment and save file', fakeAsync(() => {
    const blob = new Blob(['test'], { type: 'application/pdf' });
    mockAttachmentService.getApiAttachmentV1Id$Json.and.returnValue(of(blob));
    spyOn<any>(component, 'saveFile');
    component.downloadAttachment(1, 'file.pdf');
    tick();
    expect((component as any).saveFile).toHaveBeenCalledWith(blob, 'file.pdf');
  }));

  it('should call goToExit and navigate', () => {
    spyOn(UtilityRouting, 'navigateToStructureList');
    component.goToExit();
    expect(UtilityRouting.navigateToStructureList).toHaveBeenCalled();
  });

  it('should call isSectionInvalid and return correct value', () => {
    component.structureFg = new FormGroup({ a: new FormControl('', { validators: [() => ({ error: true })] }) });
    component.structureDetailResponse = { fields: [{ fieldName: 'a', section: 's', isVisible: true }] } as any;
    expect(component.isSectionInvalid('s')).toBeTrue();
  });

  it('should call checkToShowSection and checkToShowSubSection', () => {
    component.structureDetailResponse = {
      fields: [{ fieldName: 'a', section: 's', subSection: 'ss', isVisible: true, value: 'v' }]
    } as any;
    expect(component.checkToShowSection('s')).toBeTrue();
    expect(component.checkToShowSubSection('s', 'ss')).toBeTrue();
    expect(component.checkToShowSection('notfound')).toBeFalse();
    expect(component.checkToShowSubSection('s', 'notfound')).toBeFalse();
  });

  it('should call saveDraft and handle completed status', () => {
    component.structureDetailResponse = { status: STATUS.COMPLETED } as any;
    component.saveDraft();
    expect(component.openErrorModal).toHaveBeenCalled();
  });

  it('should call saveDraft and handle success', fakeAsync(() => {
    component.structureDetailResponse = {
      status: 'DRAFT',
      fields: [{ id: 1, fieldName: 'a', fieldType: 'varchar', value: 'v' }]
      // ...other required StructureDetailResponse properties if needed...
    } as any;
    component.structureFg.addControl('a', new FormControl('v'));
    // Provide a minimal valid StructureDetailResponse mock
    mockStructureService.putApiStructureV1Id$Json.and.returnValue(of({ id: 1 } as any));
    spyOn(UtilityRouting, 'navigateToStructureList');
    component.saveDraft();
    tick();
    expect(mockMessageStatusService.show).toHaveBeenCalled();
    expect(UtilityRouting.navigateToStructureList).toHaveBeenCalled();
  }));

  it('should call deactivate and save', () => {
    spyOn(component, 'save');
    component.deactivate();
    expect(component.save).toHaveBeenCalled();
  });

  it('should call validateDecimalInput and set error maps', () => {
    const input = document.createElement('input');
    input.value = '12.345';
    const event = { target: input } as any;
    component.validateDecimalInput(event, 'field', 2, 0, 100);
    expect(component.decimalErrorMap['field']).toBeTrue();
    input.value = '12.34';
    component.validateDecimalInput(event, 'field', 2, 0, 100);
    expect(component.decimalErrorMap['field']).toBeFalse();
    input.value = '200';
    component.validateDecimalInput(event, 'field', 2, 0, 100);
    expect(component.rangeErrorMap['field']).toBeTrue();
  });

  it('should call private retrieveValidatorFromField and return validators', () => {
    const field = { isRequired: true, fieldType: 'number', minLength: 1, maxLength: 10, pattern: '\\d+' } as any;
    const validators = (component as any).retrieveValidatorFromField(field);
    expect(validators.length).toBeGreaterThan(0);
  });

  it('should call private initializeFormStructureFields', () => {
    component.structureDetailResponse = {
      fields: [{ fieldName: 'a', fieldType: 'varchar', value: 'v', isVisible: true }]
    } as any;
    (component as any).initializeFormStructureFields();
    expect(component.structureFg.contains('a')).toBeTrue();
  });

  it('should call private initializeFormGroupFromFields', () => {
    const fields = [{ fieldName: 'a', isRequired: true, fieldType: 'varchar' }];
    (component as any).initializeFormGroupFromFields(fields);
    expect(component.structureFg.contains('a')).toBeTrue();
  });

  it('should call private returnValueToSaveStructure for all types', () => {
    expect((component as any).returnValueToSaveStructure('1', 'int')).toBe(1);
    expect((component as any).returnValueToSaveStructure('2', 'combo')).toBe(2);
    expect((component as any).returnValueToSaveStructure('3.5', 'decimal')).toBe(3.5);
    spyOn(Utility, 'convertFromGenericDataToIsoString').and.returnValue('2024-01-01');
    expect((component as any).returnValueToSaveStructure('date', 'timestamp')).toBe('2024-01-01');
    expect((component as any).returnValueToSaveStructure('true', 'bool')).toBeTrue();
    expect((component as any).returnValueToSaveStructure('test', 'varchar')).toBe('test');
  });

  xit('should call private saveFile', () => {
    const blob = new Blob(['test'], { type: 'text/plain' });
    spyOn(document.body, 'appendChild');
    spyOn(document.body, 'removeChild');
    (component as any).saveFile(blob, 'file.txt');
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
  });

  it('should call private loadAtachment', () => {
    const attachments = [{ id: 1, fileName: 'f', name: 'n', fileSize: 1, updatedAt: '', isMap: false }];
    component.structureId = 10;
    (component as any).loadAtachment(attachments);
    expect(component.attachmentModel.length).toBeGreaterThan(0);
  });

  it('should call private lockUnlock if structureId is set', fakeAsync(() => {
    component.structureId = 1;
    spyOn(UtilityRouting, 'navigateToStructureList');
    spyOn(UtilityConcurrency, 'handleInterval');
    (component as any).lockUnlock();

    tick(CONCURRENCY.sessionMaxTimeMs);
    expect(UtilityConcurrency.handleInterval).toHaveBeenCalled();

    if ((component as any).intervalId) {
      clearInterval((component as any).intervalId);
      (component as any).intervalId = null;
    }
  }));

  afterEach(() => {
    // Ensure all intervals are cleared to avoid errors during cleanup
    if (component && (component as any).intervalId) {
      clearInterval((component as any).intervalId);
      (component as any).intervalId = null;
    }
    // Destroy the fixture if it exists
    if (fixture) {
      fixture.destroy();
    }
  });
});
