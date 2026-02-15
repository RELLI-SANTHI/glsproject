/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiscalDataComponent } from './fiscal-data.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { NationsCodeService, ProvinceService } from '../../../../../../api/glsAdministrativeApi/services';
import { NationsCodeModel } from '../../../../../../api/glsAdministrativeApi/models';
import { HttpClient, HttpHandler } from '@angular/common/http';

// eslint-disable-next-line max-lines-per-function
describe('FiscalDataComponent', () => {
  let component: FiscalDataComponent;
  let fixture: ComponentFixture<FiscalDataComponent>;
  let mockNationsCodeService: jasmine.SpyObj<NationsCodeService>;
  let mockProvinceService: jasmine.SpyObj<ProvinceService>;

  const form = new FormBuilder().group({
    subjectType: [false],
    address: [''],
    city: [''],
    provinceId: [''],
    postCode: [''],
    nationId: ['']
  });

  beforeEach(async () => {
    mockNationsCodeService = jasmine.createSpyObj('NationsCodeService', ['postApiNationscodeV1$Json']);
    mockProvinceService = jasmine.createSpyObj('ProvinceService', ['postApiProvinceV1Getall$Json']);

    await TestBed.configureTestingModule({
      imports: [FiscalDataComponent, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: NationsCodeService, useValue: mockNationsCodeService },
        { provide: ProvinceService, useValue: mockProvinceService },
        HttpClient,
        HttpHandler
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FiscalDataComponent);
    component = fixture.componentInstance;

    (component as any).formFiscalData = () => form;
    (component as any).isWriting = () => true;

    mockNationsCodeService.postApiNationscodeV1$Json.and.returnValue(of([]));
    mockProvinceService.postApiProvinceV1Getall$Json.and.returnValue(of([]));

    fixture.detectChanges();
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('should add validators when subjectType is true', () => {
    component.formFiscalData()?.get('subjectType')?.setValue(true);

    expect(form.get('address')?.hasValidator(Validators.required)).toBeTrue();
    expect(form.get('city')?.hasValidator(Validators.required)).toBeTrue();
    expect(form.get('provinceId')?.hasValidator(Validators.required)).toBeTrue();
    expect(form.get('postCode')?.hasValidator(Validators.required)).toBeTrue();
    expect(form.get('nationId')?.hasValidator(Validators.required)).toBeTrue();
  });

  xit('should remove validators and reset fields when subjectType is false', () => {
    form.patchValue({
      address: 'Via Roma',
      city: 'Milano',
      provinceId: 'MI',
      postCode: '20100',
      nationId: '1'
    });

    component.formFiscalData()?.get('subjectType')?.setValue(false);

    expect(form.get('address')?.validator).toBeNull();
    expect(form.get('city')?.validator).toBeNull();
    expect(form.get('provinceId')?.validator).toBeNull();
    expect(form.get('postCode')?.validator).toBeNull();
    expect(form.get('nationId')?.validator).toBeNull();

    expect(form.get('address')?.value).toBeNull();
    expect(form.get('city')?.value).toBeNull();
    expect(form.get('provinceId')?.value).toBeNull();
    expect(form.get('postCode')?.value).toBeNull();
    expect(form.get('nationId')?.value).toBeNull();
  });

  it('should populate nations on successful API call', () => {
    const mockResponse: NationsCodeModel[] = [{ id: 123, isoCode: 'IT', description: 'Italia' }];

    mockNationsCodeService.postApiNationscodeV1$Json.and.returnValue(of(mockResponse));

    component.retrieveListDropdowns();

    expect(mockNationsCodeService.postApiNationscodeV1$Json).toHaveBeenCalled();
    expect(component.nations).toEqual(
      mockResponse.map((item: NationsCodeModel) => ({
        id: item.id,
        value: `${item.isoCode} - ${item.description}`,
        code: item.isoCode
      }))
    );
  });

  it('should handle error on API call', () => {
    const consoleSpy = spyOn(console, 'error');
    mockNationsCodeService.postApiNationscodeV1$Json.and.returnValue(throwError(() => new Error('API error')));

    component.retrieveListDropdowns();

    expect(consoleSpy).toHaveBeenCalledWith('Error', jasmine.any(Error));
  });
});
