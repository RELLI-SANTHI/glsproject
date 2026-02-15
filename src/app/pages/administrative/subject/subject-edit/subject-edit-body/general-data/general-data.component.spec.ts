/* eslint-disable @typescript-eslint/no-explicit-any */
import { of, throwError } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { GeneralDataComponent } from './general-data.component';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';

import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { GeneralTableComponent } from '../../../../../../common/components/general-table/general-table.component';
import { GeneralModalComponent } from '../../../../../../common/components/general-modal/general-modal.component';
import { AtecoModalComponent } from '../ateco-modal/ateco-modal.component';
import { signal } from '@angular/core';
import { UtilityRouting } from '../../../../../../common/utilities/utility-routing';
import { Router } from '@angular/router';
import { CURRECY_COLUMN_LIST } from '../../../constants/subject-constants';
import { HttpClient, HttpHandler } from '@angular/common/http';

// eslint-disable-next-line max-lines-per-function
describe('GeneralDataComponent', () => {
  let component: GeneralDataComponent;
  let fixture: ComponentFixture<GeneralDataComponent>;
  let modalService: jasmine.SpyObj<NgbModal>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const modalSpy = jasmine.createSpyObj('NgbModal', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    UtilityRouting.initialize(routerSpy);

    await TestBed.configureTestingModule({
      imports: [GeneralDataComponent, ReactiveFormsModule, TranslateModule.forRoot(), GlsInputComponent],
      providers: [
        HttpClient,
        HttpHandler,
        { provide: NgbModal, useValue: modalSpy },
        {
          provide: Router,
          useValue: routerSpy
        }
      ]
    })
      .overrideComponent(GeneralDataComponent, {
        set: { template: '' }
      })
      .compileComponents();

    modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralDataComponent);
    component = fixture.componentInstance;
    signalSetFn(component.isWriting[SIGNAL], true);

    const fb = new FormBuilder();
    const mockForm = fb.group({
      isPhysicalPerson: [''],
      surname: [''],
      name: [''],
      companyName: [''],
      nationId: [''],
      provinceId: [''],
      regionId: ['']
    });

    (component as any).formGeneralData = signal(mockForm);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should not disable/enable fields based on nation value', () => {
    const form = component.formGeneralData();
    signalSetFn(component.nationList[SIGNAL], [
      { id: 158, value: 'Italia', code: 'IT', isDefault: true },
      { id: 3, value: 'USA' }
    ]);

    signalSetFn(component.nationDefault[SIGNAL], { id: 158, code: 'IT', value: 'Italia', isDefault: true });

    (component as any).setValidatorsOnChooseRC();

    form.get('nationId')?.setValue(3);
    expect(form.get('provinceId')?.value).toBeNull();

    form.get('nationId')?.setValue(158);
    expect(form.get('provinceId')?.enabled).toBeTrue();
  });

  xit('should set validators based on isPhysicalPerson value', () => {
    const form = component.formGeneralData();

    form.get('isPhysicalPerson')?.setValue(true);

    expect(form.get('surname')?.validator).toBeTruthy();
    expect(form.get('name')?.validator).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    expect(component.formGeneralData()).toBeDefined();
    expect(component.formGeneralData().get('isPhysicalPerson')).toBeTruthy();
  });

  it('should call setValidatorsOnChooseRC and initialize formGeneralDataForm in ngOnInit', () => {
    const setValidatorsSpy = spyOn<any>(component, 'setValidatorsOnChooseRC').and.callThrough();
    component.ngOnInit();
    expect(setValidatorsSpy).toHaveBeenCalled();
    expect(component.formGeneralDataForm).toBeDefined();
    expect(component.formGeneralDataForm.get('region')).toBeTruthy();
    expect(component.formGeneralDataForm.get('province')).toBeTruthy();
  });

  it('should not call retrieveListDropdowns or subscribe to companyName if isWriting is false', () => {
    spyOn(component as any, 'retrieveListDropdowns');
    spyOn(component, 'isWriting').and.returnValue(false);
    const companyNameControl = component.formGeneralData().get('companyName');
    spyOn(companyNameControl!.valueChanges, 'subscribe');
    component.ngOnInit();
    expect((component as any).retrieveListDropdowns).not.toHaveBeenCalled();
    expect(companyNameControl!.valueChanges.subscribe).not.toHaveBeenCalled();
  });

  // eslint-disable-next-line max-lines-per-function
  describe('retrieveListDropdowns - success', () => {
    // eslint-disable-next-line max-lines-per-function
    it('should populate all dropdown lists and set default values on success', (done) => {
      const regionsRes: any[] = [{ id: 10, name: 'Lazio' }];
      const languageRes: any[] = [{ id: 100, name: 'Italiano' }];
      const provinceRes: any[] = [{ id: 1000, name: 'Roma' }];
      const currencyRes: any[] = [
        { id: 1, acronym: 'EUR' },
        { id: 2, acronym: 'USD' }
      ];
      const corporateGroupRes: any[] = [
        {
          id: 5,
          corporateName: 'TestGroup',
          administratives: []
        }
      ];
      spyOn((component as any).regionService, 'postApiRegionV1Getall$Json').and.returnValue(of(regionsRes));
      spyOn((component as any).languageService, 'postApiLanguageV1$Json').and.returnValue(of(languageRes));
      spyOn((component as any).provinceService, 'postApiProvinceV1Getall$Json').and.returnValue(of(provinceRes));
      spyOn((component as any).currencyService, 'postApiCurrencyV1$Json').and.returnValue(of(currencyRes));
      spyOn((component as any).corporateGroupService, 'getApiCorporategroupV1$Json').and.returnValue(
        of([{ ...corporateGroupRes[0], administratives: [] }])
      );
      spyOn((component as any).atecoCodeService, 'postApiAtecocodeV1$Json').and.returnValue(of({ atecoCodes: [] }));
      spyOn<any>(component, 'setDefaultValues');
      const fb = new FormBuilder();
      const mockForm = fb.group({ corporateGroupId: [''] });
      (component as any).formGeneralData = signal(mockForm);
      (component as any).retrieveListDropdowns();
      setTimeout(() => {
        expect((component as any).regionList.length).toBe(1);
        expect((component as any).languageList.length).toBe(1);
        expect((component as any).regOffProvList.length).toBe(1);
        expect((component as any).listCurrency.length).toBe(2);
        expect((component as any).corporateGroupList.length).toBe(1);
        expect(Number(mockForm.get('corporateGroupId')?.value)).toBe(5);
        expect((component as any).setDefaultValues).toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  describe('retrieveListDropdowns - error', () => {
    it('should call manageError on error', (done) => {
      // spyOn((component as any).nationsCodeService, 'postApiNationscodeV1$Json').and.returnValue(throwError(() => 'test error'));
      spyOn((component as any).regionService, 'postApiRegionV1Getall$Json').and.returnValue(throwError(() => 'test error'));
      // spyOn((component as any).regionService, 'postApiRegionV1Getall$Json').and.returnValue(of([]));
      spyOn((component as any).languageService, 'postApiLanguageV1$Json').and.returnValue(of([]));
      spyOn((component as any).provinceService, 'postApiProvinceV1Getall$Json').and.returnValue(of([]));
      spyOn((component as any).currencyService, 'postApiCurrencyV1$Json').and.returnValue(of([]));
      spyOn((component as any).corporateGroupService, 'getApiCorporategroupV1$Json').and.returnValue(of([]));
      const manageErrorSpy = spyOn((component as any).genericService, 'manageError');
      (component as any).retrieveListDropdowns();
      setTimeout(() => {
        expect(manageErrorSpy).toHaveBeenCalledWith('test error');
        done();
      }, 0);
    });
  });

  describe('retrieveListDropdowns - administratives', () => {
    it('should push new object into administratives and map correctly', (done) => {
      const regionsRes: any[] = [];
      const languageRes: any[] = [];
      const provinceRes: any[] = [];
      const currencyRes: any[] = [];
      const corporateGroupRes: any[] = [
        {
          id: 5,
          corporateName: 'TestGroup',
          administratives: [{ id: 1, name: 'Admin1' }]
        }
      ];
      spyOn((component as any).regionService, 'postApiRegionV1Getall$Json').and.returnValue(of(regionsRes));
      spyOn((component as any).languageService, 'postApiLanguageV1$Json').and.returnValue(of(languageRes));
      spyOn((component as any).provinceService, 'postApiProvinceV1Getall$Json').and.returnValue(of(provinceRes));
      spyOn((component as any).currencyService, 'postApiCurrencyV1$Json').and.returnValue(of(currencyRes));
      spyOn((component as any).corporateGroupService, 'getApiCorporategroupV1$Json').and.returnValue(of([corporateGroupRes[0]]));
      spyOn((component as any).atecoCodeService, 'postApiAtecocodeV1$Json').and.returnValue(of({ atecoCodes: [] }));
      const fb = new FormBuilder();
      const mockForm = fb.group({ corporateGroupId: [''] });
      (component as any).formGeneralData = signal(mockForm);
      spyOn<any>(component, 'setDefaultValues');
      (component as any).retrieveListDropdowns();
      setTimeout(() => {
        expect((component as any).corporateGroupList.length).toBe(1);
        expect((component as any).corporateGroupList[0].id).toBe(5);
        expect((component as any).corporateGroupList[0].value).toBe('TestGroup');
        done();
      }, 0);
    });
  });

  it('should handle mandatory isWriting input correctly', () => {
    expect(component.isWriting()).toBeTrue();
  });

  it('should open AtecoModalComponent modal and set selectedRow on confirm', async () => {
    const modalRefMock = {
      componentInstance: {
        title: '',
        cancelText: '',
        confirmText: ''
      },
      result: Promise.resolve([{ id: 123, name: 'Test Row' }])
    } as NgbModalRef;

    modalService.open.and.returnValue(modalRefMock);

    component.openAtecoCodeModal();

    await modalRefMock.result;

    expect(modalService.open).toHaveBeenCalledWith(
      AtecoModalComponent,
      jasmine.objectContaining({
        centered: true,
        backdrop: 'static',
        size: 'xl'
      })
    );
  });

  it('should handle error in openAtecoCodeModal catch block', async () => {
    const modalRefMock = {
      componentInstance: {
        title: '',
        cancelText: '',
        confirmText: ''
      },
      result: Promise.reject('Test error')
    } as unknown as NgbModalRef;

    modalService.open.and.returnValue(modalRefMock);
    spyOn(console, 'error');

    component.openAtecoCodeModal();
    try {
      await modalRefMock.result;
    } catch {
      // swallow
    }
    await Promise.resolve();
    expect(console.error).toHaveBeenCalledWith('Modal dismissed without selection', 'Test error');
  });

  it('should open GeneralModalComponent modal, set inputs and selectedRow on confirm', async () => {
    const modalRefMock = {
      componentInstance: {
        title: '',
        cancelText: '',
        confirmText: '',
        contentComponent: null,
        contentInputs: null
      },
      result: Promise.resolve([{ sigla: 'EUR', denominazione: 'Euro' }])
    } as NgbModalRef;

    modalService.open.and.returnValue(modalRefMock);

    component.openCurrencyModal();

    await modalRefMock.result;

    expect(modalService.open).toHaveBeenCalledWith(
      GeneralModalComponent,
      jasmine.objectContaining({
        centered: true,
        backdrop: 'static',
        size: 'xl'
      })
    );

    expect(modalRefMock.componentInstance.title).toContain('administrative.generalData.modalValues.titolo');
    expect(modalRefMock.componentInstance.cancelText).toContain('administrative.generalData.modalValues.btnCancel');
    expect(modalRefMock.componentInstance.confirmText).toContain('administrative.generalData.modalValues.btnConfirm');

    expect(modalRefMock.componentInstance.contentComponent).toBe(GeneralTableComponent);
    expect(modalRefMock.componentInstance.contentInputs).toEqual({
      columns: CURRECY_COLUMN_LIST,
      data: []
    });
  });

  it('should update the control value as number when onValueChange is called', () => {
    const form = component.formGeneralData();
    form.addControl('testControl', new FormBuilder().control(''));
    component.onValueChange('42', 'testControl');
    expect(form.get('testControl')?.value).toBe(42);
    component.onValueChange(7, 'testControl');
    expect(form.get('testControl')?.value).toBe(7);
  });

  it('should not throw if control does not exist in onValueChange', () => {
    expect(() => component.onValueChange('10', 'nonExistingControl')).not.toThrow();
  });

  it('should return changePaymentCode label if selectedCurrency is set', () => {
    (component as any).selectedCurrency = { id: 1, acronym: 'EUR' };
    expect(component.getCurrencyBtnLabel()).toBe('administrative.relationshipEdit.relationshipBillingData.changePaymentCode');
  });

  it('should return choosePaymentCode label if selectedCurrency is undefined', () => {
    (component as any).selectedCurrency = undefined;
    expect(component.getCurrencyBtnLabel()).toBe('administrative.relationshipEdit.relationshipBillingData.choosePaymentCode');
  });
  it('should set selectedCurrency and currencyId to EUR if currencyId control does not exist', () => {
    (component as any).listCurrency = [
      { id: 1, acronym: 'EUR', isDefault: true },
      { id: 2, acronym: 'USD' }
    ];
    (component as any).formGeneralData = signal(
      new FormBuilder().group({
        currencyId: [null]
      })
    );
    (component as any).setDefaultValues();
    expect((component as any).selectedCurrency).toEqual(jasmine.objectContaining({ acronym: 'EUR' }));
  });

  it('should not change selectedCurrency or currencyId if currencyId control exists', () => {
    (component as any).listCurrency = [
      { id: 1, acronym: 'EUR' },
      { id: 2, acronym: 'USD' }
    ];
    const form = component.formGeneralData();
    form.addControl('currencyId', new FormBuilder().control(2));
    (component as any).selectedCurrency = { id: 2, acronym: 'USD' };
    (component as any).setDefaultValues();
    expect((component as any).selectedCurrency).toEqual(jasmine.objectContaining({ id: 2, acronym: 'USD' }));
    expect(form.get('currencyId')?.value).toBe(2);
  });

  it('should not set selectedCurrency if EUR is not in listCurrency', () => {
    (component as any).listCurrency = [{ id: 2, acronym: 'USD' }];
    const form = component.formGeneralData();
    if (form.contains('currencyId')) {
      form.removeControl('currencyId');
    }
    (component as any).setDefaultValues();
    expect((component as any).selectedCurrency).toBeUndefined();
  });

  // describe('getCorporateGroupName', () => {
  //   it('should return "--" if id is falsy', () => {
  //     expect(component.getCorporateGroupName(undefined as any)).toBe('--');
  //     expect(component.getCorporateGroupName(null as any)).toBe('--');
  //     expect(component.getCorporateGroupName('')).toBe('--');
  //     expect(component.getCorporateGroupName(0 as any)).toBe('--');
  //   });

  //   it('should return "--" if id is not found in corporateGroupList', () => {
  //     (component as any).corporateGroupList = [{ id: 1, value: 'Group 1' }];
  //     expect(component.getCorporateGroupName(2)).toBe('--');
  //   });

  //   it('should return the value if id is found in corporateGroupList', () => {
  //     (component as any).corporateGroupList = [
  //       { id: 1, value: 'Group 1' },
  //       { id: 2, value: 'Group 2' }
  //     ];
  //     expect(component.getCorporateGroupName(2)).toBe('Group 2');
  //     expect(component.getCorporateGroupName(1)).toBe('Group 1');
  //   });
  // });
});
