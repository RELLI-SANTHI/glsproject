/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SubjectEditComponent } from './subject-edit.component';
import { SubjectService } from '../../../../api/glsAdministrativeApi/services/subject.service';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { HttpClient, HttpErrorResponse, HttpHandler } from '@angular/common/http';
import { StrictHttpResponse } from '../../../../api/glsUserApi/strict-http-response';

describe('SubjectEditComponent', () => {
  let component: SubjectEditComponent;
  let fixture: ComponentFixture<SubjectEditComponent>;
  let subjectServiceMock: any;
  let routerMock: any;
  let activatedRouteMock: any;

  beforeEach(async () => {
    subjectServiceMock = {
      getApiSubjectV1Id$Json: jasmine.createSpy().and.returnValue(of({ id: 1, isPhysicalPerson: true })),
      postApiSubjectCreate$Json$Response: jasmine.createSpy().and.returnValue(
        of({
          status: 201,
          body: { status: 'DRAFT' }
        })
      ),
      patchApiSubjectV1Id$Json$Response: jasmine.createSpy().and.returnValue(
        of({
          status: 200,
          body: { status: 'COMPLETED' }
        })
      ),
      postApiSubjectV1IdLock$Response: jasmine.createSpy().and.returnValue(of({ status: 204, body: {} })),
      postApiSubjectV1IdUnlock$Response: jasmine.createSpy().and.returnValue(of({ status: 204, body: {} })),
      deleteApiSubjectV1Id$Response: jasmine.createSpy().and.returnValue(of({ status: 204, body: undefined }))
    };

    routerMock = { navigate: jasmine.createSpy('navigate') };

    activatedRouteMock = {
      snapshot: {
        paramMap: convertToParamMap({ idSubject: '123' })
      },
      queryParams: of({})
    };

    spyOn(UtilityRouting, 'navigateToSubjectList');

    await TestBed.configureTestingModule({
      imports: [SubjectEditComponent, TranslateModule.forRoot()],
      providers: [
        HttpClient,
        HttpHandler,
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        TranslateService,
        { provide: SubjectService, useValue: subjectServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set type to "edit" and call loadSubjectPage with id on ngOnInit if idSubject is present', () => {
    const loadSpy = spyOn<any>(component, 'loadSubjectPage');
    component.ngOnInit();
    expect(component.type).toBe('edit');
    expect(loadSpy).toHaveBeenCalledWith(123);
  });

  it('should set type to "create" and call loadSubjectPage with undefined if idSubject is not present', () => {
    activatedRouteMock.snapshot.paramMap = convertToParamMap({});
    const loadSpy = spyOn<any>(component, 'loadSubjectPage');
    component.ngOnInit();
    expect(component.type).toBe('create');
    expect(loadSpy).toHaveBeenCalledWith(undefined);
  });

  it('should call patchApiSubjectV1$Json if idSubject is set in saveSubject', () => {
    component['idSubject'] = 1;
    component['subjectEditForm'] = new FormGroup({});
    const showSpy = spyOn(component['messageStatusService'], 'show');
    component.saveSubject(false);
    expect(subjectServiceMock.patchApiSubjectV1Id$Json$Response).toHaveBeenCalled();
    expect(showSpy).toHaveBeenCalled();
  });

  it('should call postApiSubjectCreate$Json if idSubject is not set in saveSubject', () => {
    component['idSubject'] = undefined;
    component['subjectEditForm'] = new FormGroup({
      dateAdded: new FormControl('2024-01-01')
    });
    const showSpy = spyOn(component['messageStatusService'], 'show');
    component.saveSubject(true);
    expect(subjectServiceMock.postApiSubjectCreate$Json$Response).toHaveBeenCalled();
    expect(showSpy).toHaveBeenCalled();
  });

  it('should navigate to subject list after successful save', () => {
    component['idSubject'] = undefined;
    component['subjectEditForm'] = new FormGroup({
      dateAdded: new FormControl('2024-01-01')
    });
    spyOn(component['messageStatusService'], 'show');
    component.saveSubject(true);
    expect(UtilityRouting.navigateToSubjectList).toHaveBeenCalled();
  });

  it('should call router.navigate to relationship-new on addRelation', () => {
    component['idSubject'] = 42;
    component.addRelation();
    expect(routerMock.navigate).toHaveBeenCalledWith(['administrative/relationship-new', 0, 'Subject']);
  });

  it('should reset permanentEstablishmentDetail if subjectType is falsy', () => {
    const permEstablishmentForm = new FormGroup({
      subjectType: new FormControl(false)
    });
    const mainForm = new FormGroup({
      permanentEstablishmentDetail: permEstablishmentForm
    });

    spyOn<any>(permEstablishmentForm, 'reset');

    (component as any).removeEmptyFields(mainForm);
    expect(permEstablishmentForm?.reset).toHaveBeenCalled();
  });

  it('should not reset permanentEstablishmentDetail if subjectType is truthy', () => {
    const permEstablishmentForm = new FormGroup({
      subjectType: new FormControl(true)
    });
    const mainForm = new FormGroup({
      permanentEstablishmentDetail: permEstablishmentForm
    });

    spyOn<any>(permEstablishmentForm, 'reset');

    (component as any).removeEmptyFields(mainForm);
    expect(permEstablishmentForm?.reset).not.toHaveBeenCalled();
  });

  it('should reset taxRepresentativeDetail if selectRadioFiscalRapp is falsy', () => {
    const taxRepresentativeForm = new FormGroup({
      selectRadioFiscalRapp: new FormControl(false)
    });
    const mainForm = new FormGroup({
      taxRepresentativeDetail: taxRepresentativeForm
    });

    spyOn<any>(taxRepresentativeForm, 'reset');

    (component as any).removeEmptyFields(mainForm);
    expect(taxRepresentativeForm?.reset).toHaveBeenCalled();
  });

  it('should not reset taxRepresentativeDetail if selectRadioFiscalRapp is truthy', () => {
    const taxRepresentativeForm = new FormGroup({
      selectRadioFiscalRapp: new FormControl(true)
    });
    const mainForm = new FormGroup({
      taxRepresentativeDetail: taxRepresentativeForm
    });

    spyOn<any>(taxRepresentativeForm, 'reset');

    (component as any).removeEmptyFields(mainForm);
    expect(taxRepresentativeForm?.reset).not.toHaveBeenCalled();
  });

  it('should return true if any required field is missing or invalid for isDraftExitDisabled', () => {
    component['subjectEditForm'] = new FormGroup({
      companyName: new FormControl('', { nonNullable: true }), // empty
      corporateGroupId: new FormControl('123', { nonNullable: true }),
      vatNumber: new FormControl('IT123', { nonNullable: true })
    });
    expect(component.isDraftExitDisabled).toBeTrue();

    component['subjectEditForm'] = new FormGroup({
      companyName: new FormControl('ACME', { nonNullable: true }),
      corporateGroupId: new FormControl('', { nonNullable: true }), // empty
      vatNumber: new FormControl('IT123', { nonNullable: true })
    });
    expect(component.isDraftExitDisabled).toBeTrue();

    component['subjectEditForm'] = new FormGroup({
      companyName: new FormControl('ACME', { nonNullable: true }),
      corporateGroupId: new FormControl('123', { nonNullable: true }),
      vatNumber: new FormControl('', { nonNullable: true }) // empty
    });
    expect(component.isDraftExitDisabled).toBeTrue();

    // Invalid field
    const invalidControl = new FormControl('ACME', { nonNullable: true });
    invalidControl.setErrors({ required: true });
    component['subjectEditForm'] = new FormGroup({
      companyName: invalidControl,
      corporateGroupId: new FormControl('123', { nonNullable: true }),
      vatNumber: new FormControl('IT123', { nonNullable: true })
    });
    expect(component.isDraftExitDisabled).toBeTrue();
  });

  it('should return false if all required fields are filled and valid for isDraftExitDisabled', () => {
    component['subjectEditForm'] = new FormGroup({
      companyName: new FormControl('ACME', { nonNullable: true }),
      corporateGroupId: new FormControl('123', { nonNullable: true }),
      vatNumber: new FormControl('IT123', { nonNullable: true }),
      taxCode: new FormControl('TAX123', { nonNullable: true })
    });
    expect(component.isDraftExitDisabled).toBeFalse();
  });

  it('should delete subject, show success message, and navigate to subject list', () => {
    const subjectId = 123;
    const strictHttpResponse = {
      status: 204,
      body: undefined
    } as StrictHttpResponse<void>;

    subjectServiceMock.deleteApiSubjectV1Id$Response.and.returnValue(of(strictHttpResponse));
    const showSpy = spyOn(component['messageStatusService'], 'show');
    component.deleteSubject(subjectId);

    expect(subjectServiceMock.deleteApiSubjectV1Id$Response).toHaveBeenCalledWith({ id: subjectId });
    expect(showSpy).toHaveBeenCalledWith('administrative.subjectEdit.messages.deleteSuccess');
    expect(UtilityRouting.navigateToSubjectList).toHaveBeenCalled();
  });

  it('should handle error when delete subject fails', () => {
    const subjectId = 123;
    const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });

    subjectServiceMock.deleteApiSubjectV1Id$Response.and.returnValue(throwError(() => errorResponse));
    const manageErrorSpy = spyOn(component['genericService'], 'manageError');

    component.deleteSubject(subjectId);

    expect(subjectServiceMock.deleteApiSubjectV1Id$Response).toHaveBeenCalledWith({ id: subjectId });
    expect(manageErrorSpy).toHaveBeenCalledWith(errorResponse);
  });
});
