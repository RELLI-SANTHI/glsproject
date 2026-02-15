/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyDataComponent } from './company-data.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { GlsInputDropdownComponent } from '../../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { ProvinceService } from '../../../../../../api/glsAdministrativeApi/services';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { of } from 'rxjs';
import { CompanyDetailResponse, ProvinceModel } from '../../../../../../api/glsAdministrativeApi/models';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('CompanyDataComponent', () => {
  let component: CompanyDataComponent;
  let fixture: ComponentFixture<CompanyDataComponent>;
  let mockProvinceService: jasmine.SpyObj<ProvinceService>;
  let mockGenericService: jasmine.SpyObj<GenericService>;
  let fb: FormBuilder;

  const mockProvinces: ProvinceModel[] = [{ id: 1, code: 'MI', name: 'Milan' }];

  beforeEach(async () => {
    mockProvinceService = jasmine.createSpyObj('ProvinceService', ['postApiProvinceV1Getall$Json']);
    mockGenericService = jasmine.createSpyObj('GenericService', ['manageError']);

    await TestBed.configureTestingModule({
      imports: [
        CompanyDataComponent, // standalone component
        ReactiveFormsModule,
        GlsInputComponent,
        GlsInputDropdownComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ProvinceService, useValue: mockProvinceService },
        { provide: GenericService, useValue: mockGenericService },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyDataComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);

    const formGroup = fb.group({
      companyName: ['Test Company'],
      vatNumber: ['123456789'],
      province: ['MI'],
      rea: ['REA123'],
      taxCode: ['TAX123'],
      shareCapital: ['10000'],
      businessRegister: ['Register A'],
      stateSocialCapital: ['Active'],
      singleMultipleMember: ['Single'],
      provinceofcRegister: ['MI'], // ✅ required by template
      registrationNumber: ['REG123'], // ✅ required by template
      reaNumber: ['REA123'] // ✅ required by template
    });

    fixture.componentRef.setInput('companyDataFg', formGroup);
    fixture.componentRef.setInput('isWriting', true);
    fixture.componentRef.setInput('companyData', {
      id: 1,
      name: 'Test Company',
      status: 'COMPLETED'
    } as CompanyDetailResponse);
    fixture.componentRef.setInput('isDraft', true);

    mockProvinceService.postApiProvinceV1Getall$Json.and.returnValue(of(mockProvinces));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have companyDataFg input signal', () => {
    expect(component.companyDataFg()).toBeInstanceOf(FormGroup);
  });

  it('should have isWriting input signal', () => {
    expect(component.isWriting()).toBeTrue();
  });

  it('should have companyData input', () => {
    expect(component.companyData).toEqual(jasmine.objectContaining({ id: 1 }));
  });

  it('should call getProvinceOfComRegisterOptions on init and set provinceofcRegisterOptions', () => {
    expect(mockProvinceService.postApiProvinceV1Getall$Json).toHaveBeenCalled();
    expect(component.provinceofcRegisterOptions).toEqual(mockProvinces);
  });

  it('should have singleMultipleMemberOptions', () => {
    expect(component.singleMultipleMemberOptions.length).toBe(2);
  });

  it('should return single member value when companyData.isSingleMember is true', () => {
    component.companyData = { isSingleMember: true } as any;
    const result = component.getMember();
    expect(result).toBe('administrative.companyCreate.companyData.singleMultipleMemberValue.single');
  });

  it('should return multiple member value when companyData.isSingleMember is false', () => {
    component.companyData = { isSingleMember: false } as any;
    const result = component.getMember();
    expect(result).toBe('administrative.companyCreate.companyData.singleMultipleMemberValue.multiple');
  });

  it('should return empty string when companyData is undefined', () => {
    component.companyData = undefined as any;
    const result = component.getMember();
    expect(result).toBe('--');
  });
});
