/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyListTableComponent } from './company-list-table.component';
import { TranslateModule } from '@ngx-translate/core';
import { signal, InputSignal } from '@angular/core';
import { ColTableInterface } from '../../../../../common/models/col-table-interface';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { CompanyDetailResponse } from '../../../../../api/glsAdministrativeApi/models';
import { UserProfileService } from '../../../../../common/utilities/services/profile/user-profile.service';
import { UserDetailsModel } from '../../../../../api/glsUserApi/models';
import { of } from 'rxjs';
import { UtilityProfile } from '../../../../../common/utilities/utility-profile';
import { Utility } from '../../../../../common/utilities/utility';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { UtilityRouting } from '../../../../../common/utilities/utility-routing';

describe('CompanyListTableComponent', () => {
  let component: CompanyListTableComponent;
  let fixture: ComponentFixture<CompanyListTableComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockUserProfileService: jasmine.SpyObj<UserProfileService>;
  const form = new FormBuilder().group({
    filterType: ['', Validators.required],
    filterValue: ['']
  });

  beforeEach(async () => {
    // Ensure UtilityProfile exists on window and has the method before component creation
    (window as any).UtilityProfile = {
      checkAccessProfile: () => false
    };

    mockUserProfileService = jasmine.createSpyObj('UserProfileService', ['getLoggedUser'], {
      profile$: of({} as UserDetailsModel),
      impersonatedUser$: of(null)
    });
    mockUserProfileService.getLoggedUser.and.returnValue(of({} as UserDetailsModel));
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CompanyListTableComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: UserProfileService, useValue: mockUserProfileService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyListTableComponent);
    component = fixture.componentInstance;
    signalSetFn(component.societyFilterFg[SIGNAL], form);

    // // Provide a minimal mock for userProfileService
    // (component as any).UtilityProfile = {
    // checkAccessProfile: () => false
    // };

    component.administrativeCompanyList = signal<CompanyDetailResponse[]>([]) as unknown as InputSignal<CompanyDetailResponse[]>;
    // Provide a mock InputSignal for the required input 'columns'
    component.columns = signal<ColTableInterface[]>([]) as unknown as InputSignal<ColTableInterface[]>;
    // Assign a real FormGroup instance for the required input 'societyFilterFg'
    component.societyFilterFg = signal<FormGroup<any>>(form) as any;
    // Provide a FormGroup instance if the component expects one
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to the company detail page with the correct id', () => {
    const testId = 1;
    // Spy on UtilityRouting.navigateToSocietyDetailById
    const navigateSpy = spyOn(UtilityRouting, 'navigateToSocietyDetailById');
    component.goToCompanyDetail(testId);
    expect(navigateSpy).toHaveBeenCalledWith(testId);
  });

  it('should navigate to corporate group detail when goToCoporateGroupView is called', () => {
    const spy = spyOn(UtilityRouting, 'navigateToCarporateGroupDetail');
    const testId = '123';
    component.goToCoporateGroupView(testId);
    expect(spy).toHaveBeenCalledOnceWith(testId);
  });

  it('should return the correct first result index from getFirstResult', () => {
    // Mock currentPage and pageSize
    spyOn(component, 'currentPage').and.returnValue(3);
    spyOn(component, 'pageSize').and.returnValue(10);
    expect(component.getFirstResult()).toBe(21);
  });

  it('should return the correct last result index from getLastResult when last result is less than totalItems', () => {
    spyOn(component, 'currentPage').and.returnValue(2);
    spyOn(component, 'pageSize').and.returnValue(10);
    spyOn(component, 'totalItems').and.returnValue(25);
    expect(component.getLastResult()).toBe(20);
  });

  it('should return the correct last result index from getLastResult when last result exceeds totalItems', () => {
    spyOn(component, 'currentPage').and.returnValue(3);
    spyOn(component, 'pageSize').and.returnValue(10);
    spyOn(component, 'totalItems').and.returnValue(25);
    expect(component.getLastResult()).toBe(25);
  });

  it('should return the correct status image path from getStatusImg', () => {
    const data = {
      name: 'Test Company'
    } as any;
    expect(component.getStatusImg(data)).toBe('../../../../assets/img/administrative/disabled.svg');
  });

  it('should return the correct company name when field exists in getCompanyName', () => {
    const data = {
      name: 'Test Company'
    } as any;
    expect(component.getCompanyName(data)).toBe('Test Company');
  });

  it('should return "--" when field does not exist in getCompanyName', () => {
    const data = {
      fields: [{ fieldName: 'other', value: 'Other Value' }]
    } as any;
    expect(component.getCompanyName(data)).toBe('--');
  });

  it('should return the correct group name when field exists in getGroupname', () => {
    const data = {
      corporateGroupName: 'Admin Group'
    } as any;
    expect(component.getGroupname(data)).toBe('Admin Group');
  });

  it('should return "--" when field does not exist in getGroupname', () => {
    const data = {
      fields: [{ fieldName: 'other', value: 'Other Value' }]
    } as any;
    expect(component.getGroupname(data)).toBe('--');
  });

  it('should return the correct VAT number when field exists in getVatNumber', () => {
    const data = {
      vatNumber: 123456789
    } as any;
    expect(component.getVatNumber(data)).toBe(123456789);
  });

  it('should return "--" when field does not exist in getVatNumber', () => {
    const data = {
      fields: [{ fieldName: 'other', value: 'Other Value' }]
    } as any;
    expect(component.getVatNumber(data)).toBe('--');
  });

  it('should return the correct Tax ID code when field exists in getTaxIDCode', () => {
    const data = {
      taxCode: 987654321
    } as any;
    expect(component.getTaxIDCode(data)).toBe(987654321);
  });

  it('should return "--" when field does not exist in getTaxIDCode', () => {
    const data = {
      fields: [{ fieldName: 'other', value: 'Other Value' }]
    } as any;
    expect(component.getTaxIDCode(data)).toBe('--');
  });

  it('should return true when UtilityProfile.checkAccessProfile returns true', () => {
    // Mock the userProfileService dependency
    console.log('Starting test for hasAccess with valid profile');

    (component as any).userProfileService = {
      hasPermission: jasmine.createSpy('hasPermission').and.returnValue(true),
      profile$: of({}) // Mock observable
    };

    // Spy on UtilityProfile.checkAccessProfile and simulate its behavior
    spyOn(UtilityProfile, 'checkAccessProfile').and.callFake(
      (userProfileService: any, profile: string, functionality: string, permission: string) => {
        console.log('checkAccessProfile called with:', profile, functionality, permission);

        return profile === 'mockProfile' && functionality === 'mockFunctionality' && permission === 'mockPermission';
      }
    );

    const result = component.hasAccess('mockProfile', 'mockFunctionality', 'mockPermission');
    console.log('Result of hasAccess:', result);

    expect(result).toBeTrue();
    expect(UtilityProfile.checkAccessProfile).toHaveBeenCalledWith(
      (component as any)['userProfileService'],
      'mockProfile',
      'mockFunctionality',
      'mockPermission'
    );
  });

  it('should return false when UtilityProfile.checkAccessProfile returns false', () => {
    // Mock the userProfileService dependency
    (component as any).userProfileService = {
      hasPermission: jasmine.createSpy('hasPermission').and.returnValue(false),
      profile$: of({}) // Mock observable
    };

    // Spy on UtilityProfile.checkAccessProfile and simulate its behavior
    spyOn(UtilityProfile, 'checkAccessProfile').and.callFake(
      (userProfileService: any, profile: string, functionality: string, permission: string) => {
        return profile === 'mockProfile' && functionality === 'mockFunctionality' && permission === 'mockPermission';
      }
    );

    const result = component.hasAccess('invalidProfile', 'mockFunctionality', 'mockPermission');

    expect(result).toBeFalse();
    expect(UtilityProfile.checkAccessProfile).toHaveBeenCalledWith(
      (component as any)['userProfileService'],
      'invalidProfile',
      'mockFunctionality',
      'mockPermission'
    );
  });

  it('should return the translated label sliced to 30 characters', () => {
    const mockLabel = 'Test Label';
    const mockTranslatedLabel = 'Translated Test Label with more than 30 characters';

    spyOn(Utility, 'translate').and.returnValue(mockTranslatedLabel);
    spyOn(Utility, 'sliceOverX').and.callFake((text: string, maxLength: number) => text.slice(0, maxLength));

    const result = component.getTranslatedLabel(mockLabel);

    expect(Utility.translate).toHaveBeenCalledWith(mockLabel, component['translateService']);
    expect(Utility.sliceOverX).toHaveBeenCalledWith(mockTranslatedLabel, 30);
    expect(result).toBe('Translated Test Label with mor');
  });
});
