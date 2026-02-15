import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommercialRelationsComponent } from './commercial-relations.component';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SubjectService } from '../../../../../../api/glsAdministrativeApi/services';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { GetCompanyAgentsResponse, GetCompanyCustomersResponse } from '../../../../../../api/glsAdministrativeApi/models';

describe('CommercialRelationsComponent', () => {
  let component: CommercialRelationsComponent;
  let fixture: ComponentFixture<CommercialRelationsComponent>;
  let subjectServiceSpy: jasmine.SpyObj<SubjectService>;
  let genericServiceSpy: jasmine.SpyObj<GenericService>;

  beforeEach(async () => {
    subjectServiceSpy = jasmine.createSpyObj('SubjectService', ['getApiSubjectV1IdCustomers$Json', 'getApiSubjectV1IdAgents$Json']);
    genericServiceSpy = jasmine.createSpyObj('GenericService', ['manageError']);

    await TestBed.configureTestingModule({
      imports: [CommercialRelationsComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '123'
              }
            }
          }
        },
        { provide: SubjectService, useValue: subjectServiceSpy },
        { provide: GenericService, useValue: genericServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommercialRelationsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load agents and customers on init', () => {
    const mockAgents: GetCompanyAgentsResponse = {
      agents: [
        {
          id: 1,
          businessName: 'Agent Rossi',
          agentType: '',
          agentTypeDescription: '',
          creationDate: '',
          status: ''
        }
      ],
      totalItems: 1,
      totalPages: 1
    };
    const mockCustomers: GetCompanyCustomersResponse = {
      customers: [
        {
          id: 2,
          businessName: 'Customer Bianchi',
          categoryCode: '',
          categoryDescription: '',
          creationDate: '',
          status: ''
        }
      ],
      totalItems: 1,
      totalPages: 1
    };

    subjectServiceSpy.getApiSubjectV1IdCustomers$Json.and.callFake(({ Type }) =>
      Type === 'Customer' ? of(mockCustomers) : of(mockCustomers)
    );
    subjectServiceSpy.getApiSubjectV1IdAgents$Json.and.returnValue(of(mockAgents));

    component.ngOnInit();

    expect(component.customersList().length).toBe(1);
    expect(component.customersList()[0].businessName).toBe('Customer Bianchi');
    expect(component.customersLACList().length).toBe(1);
    expect(component.agentsList().length).toBe(1);
    expect(component.agentsList()[0].businessName).toBe('Agent Rossi');
  });

  it('should handle error when service fails', () => {
    subjectServiceSpy.getApiSubjectV1IdCustomers$Json.and.returnValue(
      of({
        customers: [],
        totalItems: 0,
        totalPages: 0
      })
    );
    subjectServiceSpy.getApiSubjectV1IdAgents$Json.and.returnValue(throwError(() => new Error('Service error')));

    component.ngOnInit();

    expect(genericServiceSpy.manageError).toHaveBeenCalled();
  });

  it('should have default active tab as tab1', () => {
    expect(component.active).toBe('tab1');
  });
});
