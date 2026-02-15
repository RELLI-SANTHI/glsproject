/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CompanyGroupCreateComponent } from './company-group-create.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';

describe('CompanyGroupCreateComponent', () => {
  let component: CompanyGroupCreateComponent;
  let fixture: ComponentFixture<CompanyGroupCreateComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let corporateGroupServiceSpy: any;
  let messageStatusServiceSpy: any;
  let genericServiceSpy: any;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    corporateGroupServiceSpy = jasmine.createSpyObj('CorporateGroupService', ['postApiCorporategroupV1$Json']);
    messageStatusServiceSpy = jasmine.createSpyObj('MessageStatusService', ['show']);
    genericServiceSpy = jasmine.createSpyObj('GenericService', ['manageError']);

    await TestBed.configureTestingModule({
      imports: [CompanyGroupCreateComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: 'CorporateGroupService', useValue: corporateGroupServiceSpy },
        { provide: 'MessageStatusService', useValue: messageStatusServiceSpy },
        { provide: 'GenericService', useValue: genericServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyGroupCreateComponent);
    component = fixture.componentInstance;

    // Inject spies
    (component as any).corporateGroupService = corporateGroupServiceSpy;
    (component as any).messageStatusService = messageStatusServiceSpy;
    (component as any).genericService = genericServiceSpy;
    (component as any).router = routerSpy;

    UtilityRouting.initialize(TestBed.inject(Router));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to administrative/company-list on goToExit', () => {
    spyOn(UtilityRouting, 'navigateToCompanyList'); // Spy on UtilityRouting method
    component.goToExit();
    expect(UtilityRouting.navigateToCompanyList).toHaveBeenCalled(); // Verify navigation
  });

  it('should call service, show message, and navigate on successful corporateGroupCreate', () => {
    const mockResponse = { id: 1, corporateName: 'Test Group', status: 'created' };
    // Mock companyGroupNameFg to have a 'name' control with value 'Test Group'
    component.companyGroupNameFg = {
      get: (key: string) => (key === 'name' ? { value: 'Test Group' } : null)
    } as any;
    corporateGroupServiceSpy.postApiCorporategroupV1$Json.and.returnValue(of(mockResponse));
    component.corporateGroupCreate();
    expect(corporateGroupServiceSpy.postApiCorporategroupV1$Json).toHaveBeenCalledWith({
      body: { corporateName: mockResponse.corporateName }
    });
    expect(messageStatusServiceSpy.show).toHaveBeenCalledWith('message.corporateGroup.create.success');
    spyOn(UtilityRouting, 'navigateToCompanyList'); // Spy on UtilityRouting method
    component.corporateGroupCreate();
    expect(UtilityRouting.navigateToCompanyList).toHaveBeenCalled(); // Verify navigation
  });

  it('should call genericService.manageError on error in corporateGroupCreate', () => {
    const error = new HttpErrorResponse({ error: 'error' });
    corporateGroupServiceSpy.postApiCorporategroupV1$Json.and.returnValue(throwError(() => error));
    component.corporateGroupCreate();
    expect(genericServiceSpy.manageError).toHaveBeenCalledWith(error);
  });
});
