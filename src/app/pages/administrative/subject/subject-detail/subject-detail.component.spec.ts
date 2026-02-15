/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubjectDetailComponent } from './subject-detail.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SubjectService } from '../../../../api/glsAdministrativeApi/services/subject.service';
import { AdministrativeCommonService } from '../../services/administrative.service';
import { of, throwError } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { UtilityProfile } from '../../../../common/utilities/utility-profile';

describe('SubjectDetailComponent', () => {
  let component: SubjectDetailComponent;
  let fixture: ComponentFixture<SubjectDetailComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let subjectServiceSpy: jasmine.SpyObj<SubjectService>;
  let adminServiceSpy: jasmine.SpyObj<AdministrativeCommonService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    subjectServiceSpy = jasmine.createSpyObj('SubjectService', ['getApiSubjectV1Id$Json', 'postApiSubjectV1IdLock$Response']);
    adminServiceSpy = jasmine.createSpyObj('AdministrativeCommonService', ['setSubjectForm']);

    subjectServiceSpy.postApiSubjectV1IdLock$Response.and.returnValue(of({ status: 204 } as any));
    spyOn(UtilityRouting, 'navigateToSubjectEdit');
    UtilityRouting.initialize(routerSpy);

    await TestBed.configureTestingModule({
      imports: [SubjectDetailComponent, TranslateModule.forRoot()],
      providers: [
        HttpClient,
        HttpHandler,
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (key: string) => (key === 'idSubject' ? '123' : null) } } }
        },
        { provide: SubjectService, useValue: subjectServiceSpy },
        { provide: AdministrativeCommonService, useValue: adminServiceSpy }
      ]
    }).compileComponents();
  });

  xit('should create', () => {
    subjectServiceSpy.getApiSubjectV1Id$Json.and.returnValue(of({}));
    fixture = TestBed.createComponent(SubjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should navigate to edit page on editSubject', () => {
    subjectServiceSpy.getApiSubjectV1Id$Json.and.returnValue(of({}));
    fixture = TestBed.createComponent(SubjectDetailComponent);
    component = fixture.componentInstance;
    component['idSubject'] = 123;
    component.editSubject();
    expect(UtilityRouting.navigateToSubjectEdit).toHaveBeenCalledWith('123', true);
  });

  it('should navigate to add relation page on addRelation', () => {
    subjectServiceSpy.getApiSubjectV1Id$Json.and.returnValue(of({}));
    fixture = TestBed.createComponent(SubjectDetailComponent);
    component = fixture.componentInstance;
    component['idSubject'] = 123;
    component.addRelation();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['administrative/relationship-new', 0, jasmine.anything()], {
      queryParams: { idSubject: 123 }
    });
  });

  xit('should load subject detail and set form and title', async () => {
    const mockResult = { surnameNameCompanyName: 'Test Name' };

    adminServiceSpy.setSubjectForm.and.returnValue(
      new FormGroup({
        contactInformation: new FormGroup({
          email: new FormControl('test@example.com'),
          phone: new FormControl('123456789'),
          address: new FormControl('Via Roma 1'),
          // aggiungi qui altri controlli usati dal template, es:
          city: new FormControl('Milano'),
          zip: new FormControl('20100')
        }),
        personalData: new FormGroup({
          name: new FormControl('Mario'),
          surname: new FormControl('Rossi'),
          fiscalCode: new FormControl('RSSMRA80A01H501U')
        })
        // aggiungi altri gruppi/controlli se richiesti dal template
      })
    );
    subjectServiceSpy.getApiSubjectV1Id$Json.and.returnValue(of(mockResult));

    TestBed.overrideComponent(SubjectDetailComponent, {
      set: {
        providers: [{ provide: AdministrativeCommonService, useValue: adminServiceSpy }]
      }
    });

    fixture = TestBed.createComponent(SubjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(subjectServiceSpy.getApiSubjectV1Id$Json).toHaveBeenCalledWith({ id: 123 });
    expect(component.title).toBe('Test Name');
  });

  it('should handle error in loadSubjectDetail', () => {
    subjectServiceSpy.getApiSubjectV1Id$Json.and.returnValue(throwError(() => new Error('fail')));
    fixture = TestBed.createComponent(SubjectDetailComponent);
    component = fixture.componentInstance;
    // Spy on genericService.manageError
    // Aggiungi 'viewMode' allo spy
    const genericServiceSpy = jasmine.createSpyObj('GenericService', ['manageError', 'viewMode']);
    genericServiceSpy.viewMode.and.returnValue(undefined); // o il valore desiderato
    (component as any).genericService = genericServiceSpy;
    fixture.detectChanges();
    expect(genericServiceSpy.manageError).toHaveBeenCalledWith(jasmine.any(Error));
  });

  it('should open error modal if response status is not 204 in editSubject', () => {
    // Arrange
    const mockResponse = { status: 409 } as any; // status not 204
    subjectServiceSpy.postApiSubjectV1IdLock$Response.and.returnValue(of(mockResponse));
    fixture = TestBed.createComponent(SubjectDetailComponent);
    component = fixture.componentInstance;
    (component as any).idSubject = 123;

    // Spy on genericService.openErrorModal
    const genericServiceSpy = jasmine.createSpyObj('GenericService', ['openErrorModal']);
    (component as any).genericService = genericServiceSpy;

    // Act
    component.editSubject();

    // Assert
    expect(genericServiceSpy.openErrorModal).toHaveBeenCalledWith('generic.error.generic', 'concurrency.lockedSubject');
  });

  it('should call manageError on genericService if postApiSubjectV1IdLock$Response errors in editSubject', () => {
    // Arrange
    const mockError = new Error('fail');
    subjectServiceSpy.postApiSubjectV1IdLock$Response.and.returnValue(throwError(() => mockError));
    fixture = TestBed.createComponent(SubjectDetailComponent);
    component = fixture.componentInstance;
    (component as any).idSubject = 123;

    // Spy on genericService.manageError
    const genericServiceSpy = jasmine.createSpyObj('GenericService', ['manageError']);
    (component as any).genericService = genericServiceSpy;

    // Act
    component.editSubject();

    // Assert
    expect(genericServiceSpy.manageError).toHaveBeenCalledWith(mockError);
  });

  it('should return result of UtilityProfile.checkAccessProfile for hasAccess', () => {
    fixture = TestBed.createComponent(SubjectDetailComponent);
    component = fixture.componentInstance;

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
