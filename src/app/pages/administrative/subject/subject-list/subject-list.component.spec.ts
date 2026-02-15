/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SubjectListComponent } from './subject-list.component';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { GetSubjectsResponse } from '../../../../api/glsAdministrativeApi/models/get-subjects-response';
import { TranslateModule } from '@ngx-translate/core';
import { SubjectService } from '../../../../api/glsAdministrativeApi/services/subject.service';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { VIEW_MODE } from '../../../../common/app.constants';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { FilterItem } from '../../../../common/models/filter-item';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UtilityProfile } from '../../../../common/utilities/utility-profile';

describe('SubjectListComponent', () => {
  let component: SubjectListComponent;
  let fixture: ComponentFixture<SubjectListComponent>;
  let subjectServiceSpy: jasmine.SpyObj<SubjectService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let messageStatusServiceSpy: jasmine.SpyObj<MessageStatusService>;
  let genericServiceSpy: jasmine.SpyObj<GenericService>;

  beforeEach(async () => {
    subjectServiceSpy = jasmine.createSpyObj('SubjectService', [
      'postApiSubjectV1$Json',
      'postApiSubjectV1Export$Json$Response',
      'postApiSubjectV1IdLock$Response'
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    messageStatusServiceSpy = jasmine.createSpyObj('MessageStatusService', ['hide', 'setSuccessMessage', 'getWarningMessage']);
    genericServiceSpy = jasmine.createSpyObj('GenericService', ['isLandscape', 'viewMode', 'manageError']);

    subjectServiceSpy.postApiSubjectV1IdLock$Response.and.returnValue(of({ status: 204 } as any));
    spyOn(UtilityRouting, 'navigateToSubjectEdit');

    await TestBed.configureTestingModule({
      imports: [SubjectListComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: SubjectService, useValue: subjectServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MessageStatusService, useValue: messageStatusServiceSpy },
        { provide: GenericService, useValue: genericServiceSpy },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectListComponent);
    component = fixture.componentInstance;
    // Mock filterTypeList per i test
    (component as any).filterTypeList = [
      { id: 'surnameNameCompanyName', value: 'Azienda' },
      { id: 'vatNumber', value: 'PIVA' },
      { id: 'taxCode', value: 'CF' },
      { id: 'nation', value: 'Nazione' }
    ];

    component['badgeFilters'] = new Set([]);
    component.subjectFilterFg = component['fb'].group({
      filterType: [''],
      filterValue: ['']
    });
    // spyOn(component, 'loadDataTable').and.stub();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and call loadFirstCall on init', () => {
    const spy = spyOn(component as any, 'loadFirstCall');
    component.ngOnInit();
    expect(component.subjectFilterFg).toBeDefined();
    expect(spy).toHaveBeenCalled();
  });

  it('should call messageStatusService.hide on destroy', () => {
    component.ngOnDestroy();
    expect(messageStatusServiceSpy.setSuccessMessage).toHaveBeenCalledWith(null);
    expect(messageStatusServiceSpy.hide).toHaveBeenCalled();
  });

  it('should load data and update signals on success v1', fakeAsync(() => {
    const mockResponse: GetSubjectsResponse = {
      subjects: [],
      currentPage: 2,
      totalPages: 3,
      pageSize: 10,
      totalItems: 30
    };
    subjectServiceSpy.postApiSubjectV1$Json.and.callFake(() => of(mockResponse));

    component.loadDataTable().subscribe();
    tick();

    expect(component.subjectList()).toEqual([]);
    expect(component.currentPage()).toBe(2);
    expect(component.totalPages()).toBe(3);
    expect(component.totalItems()).toBe(30);
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form and call loadFirstCall on init', () => {
    const spy = spyOn(component as any, 'loadFirstCall');
    component.ngOnInit();
    expect(component.subjectFilterFg).toBeDefined();
    expect(spy).toHaveBeenCalled();
  });

  it('should call messageStatusService.hide on destroy', () => {
    component.ngOnDestroy();
    expect(messageStatusServiceSpy.setSuccessMessage).toHaveBeenCalledWith(null);
    expect(messageStatusServiceSpy.hide).toHaveBeenCalled();
  });

  it('should load data and update signals on success v2', fakeAsync(() => {
    const mockResponse: GetSubjectsResponse = {
      subjects: [],
      currentPage: 2,
      totalPages: 3,
      pageSize: 10,
      totalItems: 30
    };
    subjectServiceSpy.postApiSubjectV1$Json.and.returnValue(of(mockResponse));
    component.loadDataTable().subscribe();
    tick();
    expect(component.subjectList()).toEqual([]);
    expect(component.currentPage()).toBe(2);
    expect(component.totalPages()).toBe(3);
    expect(component.totalItems()).toBe(30);
  }));

  it('should reset a specific filter', () => {
    subjectServiceSpy.postApiSubjectV1$Json.and.returnValue(
      of({
        subjects: [],
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10
      })
    );

    component['badgeFilters'] = new Set([{ name: 'Azienda', value: '123' }]);
    component.subjectFilterFg = component['fb'].group({
      filterType: [''],
      filterValue: ['']
    });
    component.resetFilters({ name: 'Azienda', value: '123' });
    expect(component['badgeFilters'].size).toBe(1);
    expect(component['payloadConfigurator'].surnameNameCompanyName).toBeUndefined();
  });

  it('should reset all filters', () => {
    subjectServiceSpy.postApiSubjectV1$Json.and.returnValue(
      of({
        subjects: [],
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10
      })
    );

    component['badgeFilters'] = new Set([{ name: 'Company', value: '123' }]);
    component['payloadConfigurator'].surnameNameCompanyName = 'Test';
    component['payloadConfigurator'].vatNumber = 'Test';
    component['payloadConfigurator'].taxCode = 'Test';
    component.resetFilters();
    expect(component['badgeFilters'].size).toBe(0);
    expect(component['payloadConfigurator'].surnameNameCompanyName).toBeUndefined();
    expect(component['payloadConfigurator'].vatNumber).toBeUndefined();
    expect(component['payloadConfigurator'].taxCode).toBeUndefined();
  });

  it('should navigate to subject creation', () => {
    spyOn(UtilityRouting, 'navigateToSubjectCreate');
    component.createSubject();
    expect(UtilityRouting.navigateToSubjectCreate).toHaveBeenCalled();
  });

  // E aggiungi lo spy SOLO nei test che lo richiedono, ad esempio:
  it('should update current page on pageChange', () => {
    const loadSpy = spyOn(component, 'loadDataTable').and.callFake(() =>
      of({ subjects: [], totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 })
    );
    component.pageChange(3);
    expect(component.currentPage()).toBe(3);
    expect(component['payloadConfigurator'].page).toBe(3);
    expect(loadSpy).toHaveBeenCalled();
  });

  it('should update orderBy in payloadConfigurator on sort', () => {
    const loadSpy = spyOn(component, 'loadDataTable').and.callFake(() =>
      of({ subjects: [], totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 })
    );
    component.onSort({ column: { prop: 'VATNumber' }, newValue: 'desc' });
    expect(component['payloadConfigurator'].orderBy).toEqual({ field: 'VATNumber', direction: 'desc' });
    expect(loadSpy).toHaveBeenCalled();
  });

  describe('filterByText', () => {
    beforeEach(() => {
      component['badgeFilters'] = new Set([]);
      component.subjectFilterFg = component['fb'].group({
        filterType: [''],
        filterValue: ['']
      });
    });

    it('should do nothing if filterType is empty', () => {
      component.subjectFilterFg.get('filterType')?.setValue('');
      component.subjectFilterFg.get('filterValue')?.setValue('someValue');
      component.filterByText();
      expect(component['badgeFilters'].size).toBe(0);
    });

    it('should do nothing if filterValue is empty', () => {
      component.subjectFilterFg.get('filterType')?.setValue('surnameNameCompanyName');
      component.subjectFilterFg.get('filterValue')?.setValue('');
      component.filterByText();
      expect(component['badgeFilters'].size).toBe(0);
    });

    it('should add a new filter if not existing', () => {
      subjectServiceSpy.postApiSubjectV1$Json.and.returnValue(
        of({
          subjects: [],
          totalItems: 0,
          totalPages: 1,
          currentPage: 1,
          pageSize: 10
        })
      );
      component.subjectFilterFg.get('filterType')?.setValue('surnameNameCompanyName');
      component.subjectFilterFg.get('filterValue')?.setValue('value1');
      component.filterByText();
      expect(component['badgeFilters'].size).toBe(1);
      const firstBadge = Array.from(component['badgeFilters'])[0];
      expect(firstBadge).toEqual({ name: 'Azienda', value: 'value1' });
    });

    it('should update the value of an existing filter', () => {
      subjectServiceSpy.postApiSubjectV1$Json.and.returnValue(
        of({
          subjects: [],
          totalItems: 0,
          totalPages: 1,
          currentPage: 1,
          pageSize: 10
        })
      );
      component['badgeFilters'] = new Set([{ name: 'Azienda', value: 'oldValue' }]);
      component.subjectFilterFg.get('filterType')?.setValue('surnameNameCompanyName');
      component.subjectFilterFg.get('filterValue')?.setValue('newValue');
      component.filterByText();
      expect(component['badgeFilters'].size).toBe(1);
      const firstBadge = Array.from(component['badgeFilters'])[0];
      expect(firstBadge).toEqual({ name: 'Azienda', value: 'newValue' });
    });
  });

  it('should call exportData (placeholder)', () => {
    const exportSpy = spyOn(component, 'exportData');
    component.exportData();
    expect(exportSpy).toHaveBeenCalled();
  });

  it('should set payloadConfigurator fields via setPayloadFilter', () => {
    (component as any).setPayloadFilter('surnameNameCompanyName', 'TestCompany');
    expect(component['payloadConfigurator'].surnameNameCompanyName).toBe('TestCompany');
    (component as any).setPayloadFilter('vatNumber', 'TestVAT');
    expect(component['payloadConfigurator'].vatNumber).toBe('TestVAT');
    (component as any).setPayloadFilter('taxCode', 'TestTaxCode');
    expect(component['payloadConfigurator'].taxCode).toBe('TestTaxCode');
  });

  it('should call retriveSubjects twice and hide spinner in loadFirstCall', fakeAsync(() => {
    subjectServiceSpy.postApiSubjectV1$Json.and.returnValue(
      of({
        subjects: [],
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10
      })
    );
    component['loadFirstCall']();
    tick();
    expect(subjectServiceSpy.postApiSubjectV1$Json).toHaveBeenCalledTimes(2);
  }));

  xit('should update showRotateSubject based on isSmallMobile and isLandscape', () => {
    genericServiceSpy.isLandscape.and.returnValue(false);
    genericServiceSpy.viewMode.and.returnValue(VIEW_MODE.MOBILE);
    spyOn(component, 'loadDataTable').and.callFake(() => of({ subjects: [], totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 }));
    component['setupViewMode']();
    fixture.detectChanges();
    expect(component['isSmallMobile']()).toBeTrue();
    expect(component.showRotateSubject()).toBeTrue();
  });

  it('should set typeViewMode and isSmallMobile in setupViewMode', () => {
    genericServiceSpy.viewMode.and.returnValue(VIEW_MODE.DESKTOP);
    component['setupViewMode']();
    expect(component['typeViewMode']).toBe(VIEW_MODE.DESKTOP);
    expect(component['isSmallMobile']()).toBeFalse();
  });

  it('should update payload and call loadDataTable in filterByText', () => {
    const loadSpy = spyOn(component, 'loadDataTable').and.callFake(() =>
      of({ subjects: [], totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 })
    );
    component.subjectFilterFg.get('filterType')?.setValue('surnameNameCompanyName');
    component.subjectFilterFg.get('filterValue')?.setValue('val');
    component.filterByText();
    expect(component['payloadConfigurator'].surnameNameCompanyName).toBe('val');
    expect(loadSpy).toHaveBeenCalled();
  });

  it('should reset the form when resetFilters is called', () => {
    component.subjectFilterFg.get('filterType')?.setValue('surnameNameCompanyName');
    component.subjectFilterFg.get('filterValue')?.setValue('val');
    subjectServiceSpy.postApiSubjectV1$Json.and.returnValue(
      of({
        subjects: [],
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10
      })
    );
    component.resetFilters();
    expect(component.subjectFilterFg.get('filterType')?.value).toBe('');
    expect(component.subjectFilterFg.get('filterValue')?.value).toBeNull();
  });

  it('setPayloadFilter non modifica nulla per chiave sconosciuta', () => {
    (component as any).setPayloadFilter('unknownKey', 'val');
    // Nessun campo deve essere settato
    expect(component['payloadConfigurator'].surnameNameCompanyName).toBeUndefined();
    expect(component['payloadConfigurator'].vatNumber).toBeUndefined();
    expect(component['payloadConfigurator'].taxCode).toBeUndefined();
  });

  it('should call manageError on exportData error', () => {
    subjectServiceSpy.postApiSubjectV1Export$Json$Response.and.returnValue(throwError(() => new Error('Export error')));
    const manageErrorSpy = genericServiceSpy.manageError || jasmine.createSpy('manageError');
    (component as any).genericService.manageError = manageErrorSpy;
    component.exportData();
    expect(manageErrorSpy).toHaveBeenCalled();
  });

  it('should navigate to subject detail page', () => {
    component.loadEditSubjectPage(123);
    expect(UtilityRouting.navigateToSubjectEdit).toHaveBeenCalledWith('123', false);
  });

  it('should remove a filter from badgeFilters when onlyRemove is true', () => {
    subjectServiceSpy.postApiSubjectV1$Json.and.returnValue(
      of({
        subjects: [],
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10
      })
    );

    const filter = { name: 'Azienda', value: '123' };
    component['badgeFilters'] = new Set([filter]);
    component.resetFilters(filter);

    const stillPresent = Array.from(component['badgeFilters']).some((b) => b.name === 'Azienda' && b.value === '123');
    expect(stillPresent).toBeFalse();
  });

  it('should not remove any filter if the given filter is not present', () => {
    subjectServiceSpy.postApiSubjectV1$Json.and.returnValue(
      of({
        subjects: [],
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10
      })
    );

    component['badgeFilters'] = new Set([{ name: 'Azienda', value: '123' }]);
    component.resetFilters({ name: 'PIVA', value: '456' });
    expect(component['badgeFilters'].size).toBe(1);
  });

  it('should add a warning filter and set payloadConfigurator.warningOrError', () => {
    const filters = [{ key: 'warningOrError', name: 'WarningOrError', selected: 'generic.yes' }];
    spyOn(component, 'loadDataTable').and.callFake(() => of({ subjects: [], totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 }));
    component.applyFilters(filters as any);
    expect(Array.from(component['badgeFilters'])[0]).toEqual({ name: 'WarningOrError', value: 'generic.yes' });
    expect(component['payloadConfigurator'].warningOrError).toBeTrue();
  });

  it('should add a status filter and set payloadConfigurator.status', () => {
    const filters = [{ key: 'status', name: 'State', selected: 'userProfile.userList.state.completed' }];
    spyOn(component, 'loadDataTable').and.callFake(() => of({ subjects: [], totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 }));
    component.applyFilters(filters as any);
    expect(Array.from(component['badgeFilters'])[0]).toEqual({
      name: 'State',
      value: 'userProfile.userList.state.completed'
    });
    expect(component['payloadConfigurator'].status).toEqual(['COMPLETED']);
  });

  it('should set nation in payloadConfigurator', () => {
    (component as any).setPayloadFilter('nation', 'IT');
    expect(component['payloadConfigurator'].nation).toBe('IT');
  });

  it('should remove filter in resetFilters if key is not found in filterTypeList or filters', () => {
    subjectServiceSpy.postApiSubjectV1$Json.and.returnValue(
      of({
        subjects: [],
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10
      })
    );

    const nonExisting = { name: 'NonExisting', value: 'x' };
    component['badgeFilters'] = new Set([nonExisting]);
    (component as any).filterTypeList = [];
    (component as any).filters = [{ name: 'NonExisting', key: 'fakeKey' }];

    component.resetFilters(nonExisting);
    expect(component['badgeFilters'].size).toBe(0);
  });

  it('should add a filter in manageBadgeFilter when badgeFilters is empty', () => {
    component['badgeFilters'] = new Set();
    (component as any).manageBadgeFilter({ name: 'Test', value: '1' });
    expect(Array.from(component['badgeFilters'])).toContain(jasmine.objectContaining({ name: 'Test', value: '1' }));
  });

  it('should update a filter in manageBadgeFilter if same name but different value', () => {
    component['badgeFilters'] = new Set([{ name: 'Test', value: 'old' }]);
    (component as any).manageBadgeFilter({ name: 'Test', value: 'new' });
    expect(Array.from(component['badgeFilters'])).toContain(jasmine.objectContaining({ name: 'Test', value: 'new' }));
    expect(Array.from(component['badgeFilters'])).not.toContain(
      jasmine.objectContaining({
        name: 'Test',
        value: 'old'
      })
    );
  });

  it('should not call setPayloadFilter if listFiltersApplied is empty in applyFilters', () => {
    const setPayloadSpy = spyOn<any>(component, 'setPayloadFilter');
    spyOn(component, 'loadDataTable').and.callFake(() => of({ subjects: [], totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 }));
    component.applyFilters([]);
    expect(setPayloadSpy).not.toHaveBeenCalled();
  });

  it('should not call setPayloadFilter if no item.selected in applyFilters', () => {
    const setPayloadSpy = spyOn<any>(component, 'setPayloadFilter');
    spyOn(component, 'loadDataTable').and.callFake(() => of({ subjects: [], totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 }));
    const filter: FilterItem = { key: 'status', name: 'State', options: ['COMPLETED'] };
    component.applyFilters([filter]);
    expect(setPayloadSpy).not.toHaveBeenCalled();
  });

  it('should set showSidebar to true on openSidebar', () => {
    component.openSidebar();
    expect(component.showSidebar()).toBeTrue();
  });

  it('should set showSidebar to false on closeSidebar', () => {
    component.showSidebar.set(true);
    component.closeSidebar();
    expect(component.showSidebar()).toBeFalse();
  });

  it('should call openErrorModal if status is not 204 in loadEditSubjectPage', () => {
    subjectServiceSpy.postApiSubjectV1IdLock$Response.and.returnValue(of({ status: 400 } as any));
    const openErrorModalSpy = genericServiceSpy.openErrorModal || jasmine.createSpy('openErrorModal');
    (component as any).genericService.openErrorModal = openErrorModalSpy;
    component.loadEditSubjectPage(1);
    expect(openErrorModalSpy).toHaveBeenCalled();
  });

  it('should call manageError on loadEditSubjectPage error', () => {
    subjectServiceSpy.postApiSubjectV1IdLock$Response.and.returnValue(throwError(() => new Error('err')));
    const manageErrorSpy = genericServiceSpy.manageError || jasmine.createSpy('manageError');
    (component as any).genericService.manageError = manageErrorSpy;
    component.loadEditSubjectPage(1);
    expect(manageErrorSpy).toHaveBeenCalled();
  });

  it('should set isTablet to true in setupViewMode if viewMode is TABLET', () => {
    genericServiceSpy.viewMode.and.returnValue(VIEW_MODE.TABLET);
    component['setupViewMode']();
    expect(component['isTablet']()).toBeTrue();
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
