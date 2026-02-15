/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, fakeAsync, TestBed, tick, discardPeriodicTasks } from '@angular/core/testing';
import { RelationshipDetailComponent } from './relationship-detail.component';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RelationshipType } from '../enum/relationship-type';
import { of, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHandler } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { AdministrativeCommonService } from '../../services/administrative.service';
import { AgentService, CustomerService } from '../../../../api/glsAdministrativeApi/services';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { Utility } from '../../../../common/utilities/utility';
import { RELATIONSHIP_MESSAGES } from '../constants/relationship-constants';

describe('RelationshipDetailComponent', () => {
  let component: RelationshipDetailComponent;
  let fixture: ComponentFixture<RelationshipDetailComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let agentServiceSpy: any;
  let customerServiceSpy: any;
  let administrativeServiceSpy: any;
  let messageStatusServiceSpy: any;

  let agentApiResponse: any;
  let customerApiResponse: any;
  let agentForm: any;
  let customerForm: any;

  let paramMapData = { idRelationship: '1', fromType: RelationshipType.Agent };
  const activatedRouteStub = {
    snapshot: {
      get paramMap() {
        return convertToParamMap(paramMapData);
      }
    }
  };
  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    spyOn(UtilityRouting, 'navigateToRelationshipEditById');
    agentServiceSpy = jasmine.createSpyObj('AgentService', [
      'getApiAgentV1Id$Json',
      'postApiAgentV1IdLock$Response',
      'postApiAgentV1IdUnlock$Response'
    ]);
    customerServiceSpy = jasmine.createSpyObj('CustomerService', [
      'getApiCustomerV1Id$Json',
      'postApiCustomerV1IdLock$Response',
      'postApiCustomerV1IdUnlock$Response'
    ]);
    administrativeServiceSpy = jasmine.createSpyObj('AdministrativeCommonService', [
      'setDetailRelationshipAgent',
      'setDetailRelationshipCustomer'
    ]);
    messageStatusServiceSpy = jasmine.createSpyObj('MessageStatusService', [
      'show',
      'setWarningMessage',
      'getWarningMessage',
      'getSuccessMessage'
    ]);
    messageStatusServiceSpy.setWarningMessage.and.stub();
    messageStatusServiceSpy.getWarningMessage.and.returnValue(null);
    messageStatusServiceSpy.getSuccessMessage.and.returnValue(null);

    agentApiResponse = { agentCode: 'A123' };
    customerApiResponse = { surnameNameCompanyName: 'Mario Rossi' };
    agentForm = new FormBuilder().group({});
    customerForm = new FormBuilder().group({ someField: ['test'] });

    agentServiceSpy.getApiAgentV1Id$Json.and.returnValue(of(agentApiResponse));
    agentServiceSpy.postApiAgentV1IdLock$Response.and.returnValue(of({ status: 204, body: {} }));
    agentServiceSpy.postApiAgentV1IdUnlock$Response.and.returnValue(of({ status: 204, body: {} }));
    customerServiceSpy.getApiCustomerV1Id$Json.and.returnValue(of(customerApiResponse));
    customerServiceSpy.postApiCustomerV1IdLock$Response.and.returnValue(of({ status: 204, body: {} }));
    customerServiceSpy.postApiCustomerV1IdUnlock$Response.and.returnValue(of({ status: 204, body: {} }));
    administrativeServiceSpy.setDetailRelationshipAgent.and.returnValue(agentForm);
    administrativeServiceSpy.setDetailRelationshipCustomer.and.returnValue(customerForm);
    paramMapData = { idRelationship: '1', fromType: RelationshipType.Agent }; // default

    await TestBed.configureTestingModule({
      imports: [RelationshipDetailComponent, TranslateModule.forRoot(), ReactiveFormsModule],
      providers: [
        FormBuilder,
        HttpClient,
        HttpHandler,
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: AgentService, useValue: agentServiceSpy },
        { provide: CustomerService, useValue: customerServiceSpy },
        { provide: AdministrativeCommonService, useValue: administrativeServiceSpy },
        { provide: MessageStatusService, useValue: messageStatusServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RelationshipDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should navigate to edit page on editRelationship()', () => {
    component['idRelationship'] = 42;
    component.editRelationship();
    expect(UtilityRouting.navigateToRelationshipEditById).toHaveBeenCalledWith('42', RelationshipType.CustomerLac);
  });

  xit('should load agent data and update form', () => {
    paramMapData = { idRelationship: '1', fromType: RelationshipType.Agent };
    agentApiResponse = { agentCode: 'A123' };
    agentForm = new FormBuilder().group({});
    agentServiceSpy.getApiAgentV1Id$Json.and.returnValue(of(agentApiResponse));
    administrativeServiceSpy.setDetailRelationshipAgent.and.returnValue(agentForm);

    // Crea il componente solo ora!
    fixture = TestBed.createComponent(RelationshipDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(administrativeServiceSpy.setDetailRelationshipAgent).toHaveBeenCalledWith(agentApiResponse);
    expect(component.relationshipForm).toBeDefined();
    expect(component.relTitle()).toContain('agentTitle');
    expect(component.secondLabel()).toContain('A123');
  });

  it('should call manageError when subject API fails', () => {
    agentServiceSpy.getApiAgentV1Id$Json.and.returnValue(of(agentApiResponse));
    const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error', error: 'fail' });
    spyOn(component['subjectService'], 'getApiSubjectV1Id$Json').and.returnValue(throwError(() => error));
    const genericServiceSpy = spyOn(component['genericService'], 'manageError');

    component['isFromAgent'].set(true);
    (component as any).loadRelationshipData(42);

    expect(genericServiceSpy).toHaveBeenCalledWith(error);
  });

  it('should handle API error for customer and call messageStatusService.show', fakeAsync(() => {
    const error = new HttpErrorResponse({ status: 404, statusText: 'Not Found', error: 'fail' });
    customerServiceSpy.getApiCustomerV1Id$Json.and.returnValue(throwError(() => error));
    paramMapData = { idRelationship: '1', fromType: RelationshipType.Customer };

    fixture = TestBed.createComponent(RelationshipDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();

    expect(messageStatusServiceSpy.show).toHaveBeenCalledWith('administrative.relationship.error.load ' + error.message);

    discardPeriodicTasks();
  }));

  it('should call agent lock service when editing agent relationship', () => {
    // Setup component manually
    component['idRelationship'] = 123;
    component['isFromAgent'].set(true);

    // Call method directly
    component.editRelationship();

    // Verify correct service was called
    expect(agentServiceSpy.postApiAgentV1IdLock$Response).toHaveBeenCalledWith({ id: 123 });
    expect(customerServiceSpy.postApiCustomerV1IdLock$Response).not.toHaveBeenCalled();
  });

  it('should call customer lock service when editing customer relationship', () => {
    // Setup component manually
    component['idRelationship'] = 456;
    component['isFromAgent'].set(false);

    // Call method directly
    component.editRelationship();

    // Verify correct service was called
    expect(customerServiceSpy.postApiCustomerV1IdLock$Response).toHaveBeenCalledWith({ id: 456 });
    expect(agentServiceSpy.postApiAgentV1IdLock$Response).not.toHaveBeenCalled();
  });

  it('should navigate to agent edit page after successful lock', () => {
    // Setup component manually
    component['idRelationship'] = 789;
    component['isFromAgent'].set(true);

    // Reset the navigation spy
    (UtilityRouting.navigateToRelationshipEditById as jasmine.Spy).calls.reset();

    // Call method directly
    component.editRelationship();

    // Verify navigation occurred with correct parameters
    expect(UtilityRouting.navigateToRelationshipEditById).toHaveBeenCalledWith('789', RelationshipType.Agent);
  });

  it('should navigate to customer edit page after successful lock', () => {
    // Setup component manually
    component['idRelationship'] = 101;
    component['isFromAgent'].set(false);

    // Reset the navigation spy
    (UtilityRouting.navigateToRelationshipEditById as jasmine.Spy).calls.reset();

    // Call method directly
    component.editRelationship();

    // Verify navigation occurred with correct parameters
    expect(UtilityRouting.navigateToRelationshipEditById).toHaveBeenCalledWith('101', RelationshipType.CustomerLac);
  });

  it('should call agent API when loading agent relationship', () => {
    // Setup component manually
    component['isFromAgent'].set(true);

    // Directly call the private method using type assertion
    (component as any).loadRelationshipData(42);

    expect(agentServiceSpy.getApiAgentV1Id$Json).toHaveBeenCalledWith({ id: 42 }, jasmine.any(Object));
  });

  it('should call customer API when loading customer relationship', () => {
    // Setup component manually
    component['isFromAgent'].set(false);

    // Directly call the private method using type assertion
    (component as any).loadRelationshipData(42);

    expect(customerServiceSpy.getApiCustomerV1Id$Json).toHaveBeenCalledWith({ id: 42 }, jasmine.any(Object));
  });

  it('should set warning message with translated end date in setEndRelationshipMsg', () => {
    const endDate = '2025-12-31';
    const dateExp = '31/12/2025';
    // Mock Utility.fromIsoStringToString
    spyOn(Utility, 'fromIsoStringToString').and.returnValue(dateExp);
    // Mock Utility.translate
    spyOn(Utility, 'translate').and.callFake((key, service, params) => {
      expect(key).toBe(RELATIONSHIP_MESSAGES.ELATIONSHIP_DEACTIVATED);
      expect(params).toEqual({ endDate: dateExp });

      return 'Deactivated on ' + dateExp;
    });

    (component as any).setEndRelationshipMsg(endDate);

    expect(messageStatusServiceSpy.setWarningMessage).toHaveBeenCalledWith({
      title: 'Deactivated on ' + dateExp
    });
  });
});
