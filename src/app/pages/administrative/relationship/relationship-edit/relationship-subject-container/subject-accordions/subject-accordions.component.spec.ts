/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubjectAccordionsComponent } from './subject-accordions.component';
import { RoleModel } from '../../../../../../api/glsUserApi/models';
import { MessageStatusService } from '../../../../../../common/utilities/services/message/message.service';
import { FormControl, FormGroup } from '@angular/forms';
import { signal } from '@angular/core';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SubjectService } from '../../../../../../api/glsAdministrativeApi/services/subject.service';
import { SubjectResponseShort } from '../../../../../../api/glsAdministrativeApi/models/subject-response-short';
import { of, throwError } from 'rxjs';
import { SubjectResponse } from '../../../../../../api/glsAdministrativeApi/models';
import { AdministrativeCommonService } from '../../../../services/administrative.service';
import { UtilityProfile } from '../../../../../../common/utilities/utility-profile';

describe('SubjectAccordionsComponent', () => {
  let component: SubjectAccordionsComponent;
  let fixture: ComponentFixture<SubjectAccordionsComponent>;
  let administrativeServiceSpy: jasmine.SpyObj<AdministrativeCommonService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;
  let subjectServiceSpy: jasmine.SpyObj<SubjectService>;
  let mockModalRef: jasmine.SpyObj<NgbModalRef>;

  class MockResizeObserver {
    observe = jasmine.createSpy('observe');
    disconnect = jasmine.createSpy('disconnect');
  }

  beforeEach(async () => {
    administrativeServiceSpy = jasmine.createSpyObj('AdministrativeService', ['setSubjectForm']);
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    subjectServiceSpy = jasmine.createSpyObj('SubjectService', ['getApiSubjectV1Id$Json']);

    mockModalRef = jasmine.createSpyObj('NgbModalRef', ['result']);
    mockModalRef.result = Promise.resolve(null);
    Object.defineProperty(mockModalRef, 'componentInstance', {
      value: {
        title: '',
        cancelText: '',
        confirmText: '',
        formParent: null
      },
      writable: true
    });

    administrativeServiceSpy.setSubjectForm.and.returnValue(new FormGroup({}));
    modalServiceSpy.open.and.returnValue(mockModalRef);
    translateServiceSpy.instant.and.returnValue('translated-text');
    await TestBed.configureTestingModule({
      imports: [SubjectAccordionsComponent, TranslateModule.forRoot()],
      providers: [
        HttpClient,
        HttpHandler,
        { provide: MessageStatusService, useValue: {} },
        { provide: ResizeObserver, useClass: MockResizeObserver },
        { provide: AdministrativeCommonService, useValue: administrativeServiceSpy },
        { provide: NgbModal, useValue: modalServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: SubjectService, useValue: subjectServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectAccordionsComponent);
    component = fixture.componentInstance;

    (component as any).pageSize = signal(10);
    (component as any).currentPage = signal(2);
    (component as any).totalItems = signal(25);
    (component as any).totalPages = signal(3);
    (component as any).roleData = signal([{ id: 1, name: 'Admin' } as RoleModel]);
    (component as any).disabledAccordionIds = signal([]);
    (component as any).showTabs = signal(true);
    (component as any).isWrite = signal(true);
    (component as any).showEditSuccessMessage = signal(false);
    (component as any).showSelectionWarningMessage = signal(false);
    (component as any).formParent = signal(new FormGroup({}));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute first result correctly', () => {
    expect(component.getFirstResult()).toBe(11);
  });

  it('should compute last result correctly', () => {
    expect(component.getLastResult()).toBe(20);
  });

  it('should compute first result correctly for first page', () => {
    (component as any).currentPage = signal(1);
    expect(component.getFirstResult()).toBe(1);
  });

  it('should compute last result correctly when total items is less than page size', () => {
    (component as any).currentPage = signal(3);
    (component as any).totalItems = signal(25);
    expect(component.getLastResult()).toBe(25);
  });

  it('should initialize form on ngOnInit', () => {
    const mockForm = new FormGroup({});
    administrativeServiceSpy.setSubjectForm.and.returnValue(mockForm);

    component.ngOnInit();

    expect(administrativeServiceSpy.setSubjectForm).toHaveBeenCalled();
    expect(component.formParent).toBe(mockForm);
  });

  it('should call loadDetailSubject when toggleExpandRow is called', () => {
    spyOn(component as any, 'loadDetailSubject');
    const mockSubject = { id: 1, name: 'Test Subject' } as SubjectResponseShort;

    component.toggleExpandRow(mockSubject);

    expect((component as any).loadDetailSubject).toHaveBeenCalledWith(mockSubject);
  });

  it('should load subject details successfully', () => {
    const mockSubject = { id: 1, name: 'Test Subject' } as SubjectResponseShort;
    const mockResponse = { id: 1, name: 'Test Subject' } as SubjectResponse;
    const mockForm = new FormGroup({});

    subjectServiceSpy.getApiSubjectV1Id$Json.and.returnValue(of(mockResponse));
    administrativeServiceSpy.setSubjectForm.and.returnValue(mockForm);

    (component as any).loadDetailSubject(mockSubject);

    expect(subjectServiceSpy.getApiSubjectV1Id$Json).toHaveBeenCalledWith({ id: 1 });
    expect(administrativeServiceSpy.setSubjectForm).toHaveBeenCalled();
    expect(component.formParent).toBe(mockForm);
  });

  it('should handle error when loading subject details fails', () => {
    const mockSubject = { id: 1, name: 'Test Subject' } as SubjectResponseShort;
    const mockError = new Error('API Error');

    subjectServiceSpy.getApiSubjectV1Id$Json.and.returnValue(throwError(() => mockError));
    spyOn(console, 'error');

    (component as any).loadDetailSubject(mockSubject);

    expect(subjectServiceSpy.getApiSubjectV1Id$Json).toHaveBeenCalledWith({ id: 1 });
    expect(console.error).toHaveBeenCalledWith('Error', mockError);
  });

  it('should emit page change event', () => {
    spyOn(component.pageChange, 'emit');
    const newPage = 3;

    component.pageChange.emit(newPage);

    expect(component.pageChange.emit).toHaveBeenCalledWith(newPage);
  });

  it('should handle edge case when pageSize is 0', () => {
    (component as any).pageSize = signal(0);
    (component as any).currentPage = signal(1);

    expect(component.getFirstResult()).toBe(1);
    expect(component.getLastResult()).toBe(0);
  });

  it('should handle edge case when totalItems is 0', () => {
    (component as any).totalItems = signal(0);
    (component as any).currentPage = signal(1);
    (component as any).pageSize = signal(10);

    expect(component.getLastResult()).toBe(0);
  });

  it('should initialize signals correctly', () => {
    expect(component.idAccordWarning()).toBeNull();
    expect(component.idAccordSuccess()).toBeNull();
    expect(component.selectedId()).toBeNull();
    expect(component.type).toBe('create');
  });

  it('should remove permanentEstablishmentDetail if subjectType is falsy', () => {
    const form = new FormGroup({
      permanentEstablishmentDetail: new FormGroup({
        subjectType: new FormControl(null)
      })
    });

    (component as any).removeEmptyFields(form);

    expect(form.get('permanentEstablishmentDetail')).toBeNull();
  });

  it('should keep permanentEstablishmentDetail and remove subjectType if subjectType is truthy', () => {
    const permEstGroup = new FormGroup({
      subjectType: new FormControl('A')
    });
    const form = new FormGroup({
      permanentEstablishmentDetail: permEstGroup
    });

    (component as any).removeEmptyFields(form);

    expect(form.get('permanentEstablishmentDetail')).toBeTruthy();
    expect(permEstGroup.get('subjectType')).toBeNull();
  });

  it('should remove permanentEstablishmentDetail if subjectType is falsy', () => {
    const form = new FormGroup({
      permanentEstablishmentDetail: new FormGroup({
        subjectType: new FormControl(null)
      })
    });

    (component as any).removeEmptyFields(form);

    expect(form.get('permanentEstablishmentDetail')).toBeNull();
  });

  it('should keep permanentEstablishmentDetail and remove subjectType if subjectType is truthy', () => {
    const permEstGroup = new FormGroup({
      subjectType: new FormControl('A')
    });
    const form = new FormGroup({
      permanentEstablishmentDetail: permEstGroup
    });

    (component as any).removeEmptyFields(form);

    expect(form.get('permanentEstablishmentDetail')).toBeTruthy();
    expect(permEstGroup.get('subjectType')).toBeNull();
  });

  it('should remove taxRepresentativeDetail if selectRadioFiscalRapp is falsy', () => {
    const form = new FormGroup({
      taxRepresentativeDetail: new FormGroup({
        selectRadioFiscalRapp: new FormControl(null)
      })
    });

    (component as any).removeEmptyFields(form);

    expect(form.get('taxRepresentativeDetail')).toBeNull();
  });

  it('should keep taxRepresentativeDetail and remove selectRadioFiscalRapp if selectRadioFiscalRapp is truthy', () => {
    const taxRepGroup = new FormGroup({
      selectRadioFiscalRapp: new FormControl('B')
    });
    const form = new FormGroup({
      taxRepresentativeDetail: taxRepGroup
    });

    (component as any).removeEmptyFields(form);

    expect(form.get('taxRepresentativeDetail')).toBeTruthy();
    expect(taxRepGroup.get('selectRadioFiscalRapp')).toBeNull();
  });

  it('should return result of UtilityProfile.checkAccessProfile for hasAccess', () => {
    // Arrange
    spyOn(UtilityProfile, 'checkAccessProfile').and.returnValue(true);

    const result = component.hasAccess('EVA_ADMIN', 'SOME_FUNCTIONALITY', 'SOME_PERMISSION');

    expect(UtilityProfile.checkAccessProfile).toHaveBeenCalledWith(
      component['userProfileService'],
      'EVA_ADMIN',
      'SOME_FUNCTIONALITY',
      'SOME_PERMISSION'
    );
    expect(result).toBeTrue();

    // Test false case
    (UtilityProfile.checkAccessProfile as jasmine.Spy).and.returnValue(false);
    expect(component.hasAccess('EVA_USER', 'OTHER_FUNCTIONALITY', 'OTHER_PERMISSION')).toBeFalse();
  });
});
