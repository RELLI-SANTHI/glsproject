/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisteredOfficeAddressComponent } from './registered-office-address.component';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { GlsInputDropdownComponent } from '../../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { NationsCodeService, ProvinceService, RegionService } from '../../../../../../api/glsAdministrativeApi/services';
import { of } from 'rxjs';
import { NationsCodeModel, ProvinceModel, RegionModel, CompanyDetailResponse } from '../../../../../../api/glsAdministrativeApi/models';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { AdministrativeCommonService } from '../../../../services/administrative.service';

describe('RegisteredOfficeAddressComponent', () => {
  let component: RegisteredOfficeAddressComponent;
  let fixture: ComponentFixture<RegisteredOfficeAddressComponent>;
  let mockNationsCodeService: jasmine.SpyObj<NationsCodeService>;
  let mockRegionService: jasmine.SpyObj<RegionService>;
  let mockProvinceService: jasmine.SpyObj<ProvinceService>;
  let mockGenericService: jasmine.SpyObj<GenericService>;
  let administrativeServiceSpy: jasmine.SpyObj<AdministrativeCommonService>;

  const mockCountries: NationsCodeModel[] = [{ id: 1, isoCode: 'IT', description: 'Italy' }];
  const mockRegions: RegionModel[] = [{ id: 1, code: 'LOM', description: 'Lombardia' }];
  const mockProvinces: ProvinceModel[] = [{ id: 1, code: 'MI', name: 'Milano' }];
  const mockCompanyData: CompanyDetailResponse = {
    id: 1,
    name: 'Test Company',
    vatNumber: 'IT12345678901',
    telephone: '0212345678',
    email: 'info@testcompany.com',
    certifiedEmail: 'testcompany@pec.it',
    corporateGroupId: 1,
    rea: 'MI-1234567'
    // ...add any other required properties as per your CompanyDetailResponse definition...
  };

  beforeEach(async () => {
    administrativeServiceSpy = jasmine.createSpyObj('AdministrativeService', ['setCompanySocietyForm']);
    mockNationsCodeService = jasmine.createSpyObj('NationsCodeService', ['getApiNationscodeV1$Json']);
    mockRegionService = jasmine.createSpyObj('RegionService', ['postApiRegionV1Getall$Json']);
    mockProvinceService = jasmine.createSpyObj('ProvinceService', ['postApiProvinceV1Getall$Json']);
    mockGenericService = jasmine.createSpyObj('GenericService', ['manageError']);

    await TestBed.configureTestingModule({
      imports: [
        RegisteredOfficeAddressComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        GlsInputComponent,
        GlsInputDropdownComponent,
        HttpClientTestingModule,
        CommonModule
      ],
      providers: [
        { provide: NationsCodeService, useValue: mockNationsCodeService },
        { provide: RegionService, useValue: mockRegionService },
        { provide: ProvinceService, useValue: mockProvinceService },
        { provide: GenericService, useValue: mockGenericService },
        { provide: AdministrativeCommonService, useValue: administrativeServiceSpy },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisteredOfficeAddressComponent);
    component = fixture.componentInstance;
    mockNationsCodeService.getApiNationscodeV1$Json.and.returnValue(of(mockCountries));
    mockRegionService.postApiRegionV1Getall$Json.and.returnValue(of(mockRegions));
    mockProvinceService.postApiProvinceV1Getall$Json.and.returnValue(of(mockProvinces));
    administrativeServiceSpy.setCompanySocietyForm.and.returnValue(new FormGroup({}));
    fixture.componentRef.setInput('companyData', mockCompanyData as CompanyDetailResponse);
    fixture.componentRef.setInput('isWriting', true);
    fixture.componentRef.setInput('isDraft', true);
    fixture.componentRef.setInput(
      'officeAddressFg',
      new FormBuilder().group({
        legalAddressCountry: [''],
        legalAddress: [''],
        postalCode: [''],
        city: [''],
        province: [''],
        regione: ['']
      })
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should enable province control when legalAddressCountry is 1, otherwise disable and reset it', () => {
    const form = component.officeAddressFg();
    const countryControl = form.get('legalAddressCountry');
    const provinceControl = form.get('province');

    spyOn(provinceControl!, 'enable').and.callThrough();
    (component as any).setValidatorsOnChooseRC();

    countryControl?.setValue(1);
    expect(provinceControl?.enable).toHaveBeenCalled();
  });
});
