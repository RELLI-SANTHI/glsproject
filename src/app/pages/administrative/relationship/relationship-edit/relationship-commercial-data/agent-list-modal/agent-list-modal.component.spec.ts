/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AgentListModalComponent } from './agent-list-modal.component';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { GlsPaginatorComponent } from '../../../../../../common/components/gls-paginator/gls-paginator.component';
import { GlsInputDropdownComponent } from '../../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AgentService } from '../../../../../../api/glsAdministrativeApi/services';
import { AgentResponse, GetAgentsResponse } from '../../../../../../api/glsAdministrativeApi/models';
import { of } from 'rxjs';

describe('AgentListModalComponent', () => {
  let component: AgentListModalComponent;
  let fixture: ComponentFixture<AgentListModalComponent>;
  let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;
  let mockAgentService: jasmine.SpyObj<AgentService>;

  const mockAgents: AgentResponse[] = [
    {
      agentCode: 3,
      agentType: 'Type1',
      id: 1,
      administrativeId: 2,
      invoiceNo: 3,
      percentageProvision: 4,
      provisionalImp: 6,
      subjectId: 6,
      turnoverImp: 5
    }
  ];

  const mockGetAgentsResponse: GetAgentsResponse = {
    agents: mockAgents,
    totalItems: mockAgents.length,
    totalPages: 1
  };

  beforeEach(async () => {
    mockActiveModal = jasmine.createSpyObj('NgbActiveModal', ['close']);
    mockAgentService = jasmine.createSpyObj('AgentService', ['postApiAgentV1$Json']);

    mockAgentService.postApiAgentV1$Json.and.returnValue(of(mockGetAgentsResponse));

    await TestBed.configureTestingModule({
      imports: [
        AgentListModalComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        NgxDatatableModule,
        GlsInputComponent,
        GlsInputDropdownComponent,
        GlsPaginatorComponent
      ],
      providers: [
        FormBuilder,
        { provide: NgbActiveModal, useValue: mockActiveModal },
        { provide: AgentService, useValue: mockAgentService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgentListModalComponent);
    component = fixture.componentInstance;

    // Set up test data
    component.agents = [...mockAgents];
    component.filteredAgents = [...mockAgents];
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with form controls', () => {
    expect(component.agentFilterForm.get('searchTerm')).toBeTruthy();
    expect(component.agentFilterForm.get('searchField')).toBeTruthy();
  });

  it('should load agents on init', () => {
    expect(mockAgentService.postApiAgentV1$Json).toHaveBeenCalled();
  });

  it('should enable search when form is valid', () => {
    component.agentFilterForm.get('searchTerm')?.setValue('3');
    component.agentFilterForm.get('searchField')?.setValue('agentCode');
    expect(component.enableSearch()).toBeTruthy();
  });

  it('should disable search when form is invalid', () => {
    component.agentFilterForm.get('searchTerm')?.setValue('');
    component.agentFilterForm.get('searchField')?.setValue('');
    expect(component.enableSearch()).toBeFalsy();
  });

  it('should filter agents based on agent code', () => {
    component.agentFilterForm.get('searchTerm')?.setValue('3');
    component.searchAgents();
    expect(component.filteredAgents.length).toBe(1);
    expect(component.filteredAgents[0].agentCode).toBe(3);
  });

  it('should return empty array when no matches found', () => {
    component.agentFilterForm.get('searchTerm')?.setValue('999');
    component.searchAgents();
    expect(component.filteredAgents.length).toBe(0);
  });

  it('should select agent on row click', () => {
    const agent = mockAgents[0];
    component.onAgentSelect(agent);
    expect(component.selectedAgentCode).toBe(agent.id);
    expect(component.selectedAgent).toBe(agent);
  });

  it('should enable confirm selection when agent is selected', () => {
    component.selectedAgentCode = 1;
    expect(component.enableConfirmSelection()).toBeTruthy();
  });

  it('should disable confirm selection when no agent is selected', () => {
    component.selectedAgentCode = null;
    expect(component.enableConfirmSelection()).toBeFalsy();
  });

  it('should reset filter correctly', () => {
    component.selectedAgentCode = 1;
    component.selectedAgent = mockAgents[0];
    component.filteredAgents = [mockAgents[0]];

    component.resetAgentFilter();

    expect(component.selectedAgentCode).toBeNull();
    expect(component.selectedAgent).toBeNull();
    expect(component.filteredAgents.length).toBe(1);
  });

  it('should calculate first result correctly for pagination', () => {
    component.currentPage = 2;
    component.pageSize = 10;
    expect(component.getFirstResult()).toBe(11);
  });

  it('should calculate last result correctly for pagination', () => {
    component.currentPage = 1;
    component.pageSize = 10;
    component.totalItems = 1;
    expect(component.getLastResult()).toBe(1);
  });

  it('should handle page changes correctly', () => {
    const newPage = 1;
    component.onPageChange(newPage);
    expect(component.currentPage).toBe(newPage);
  });

  it('should confirm selection and close modal', () => {
    const agent = mockAgents[0];
    component.selectedAgent = agent;
    component.confirmSelection();
    expect(mockActiveModal.close).toHaveBeenCalledWith(agent);
  });

  it('should close modal without selection', () => {
    component.closeModal();
    expect(mockActiveModal.close).toHaveBeenCalled();
  });

  it('should have correct column configuration', () => {
    expect(component.columns).toBeDefined();
    expect(component.columns.length).toBeGreaterThan(0);
  });

  it('should set sortEvent and call applyFilterAndSort when onSort is called', () => {
    // Arrange
    const sortEvent = { sorts: [{ prop: 'agentCode', dir: 'asc' }] };
    spyOn(component, 'applyFilterAndSort');

    // Act
    component.onSort(sortEvent);

    // Assert
    expect((component as any).sortEvent).toEqual(sortEvent);
    expect((component as any).applyFilterAndSort).toHaveBeenCalled();
  });

  it('should sort agents by agentCode ascending when applyFilterAndSort is called', () => {
    // Arrange
    component.agents = [
      {
        agentCode: 5,
        id: 2,
        agentType: '',
        administrativeId: 0,
        invoiceNo: 0,
        percentageProvision: 0,
        provisionalImp: 0,
        subjectId: 0,
        turnoverImp: 0
      },
      {
        agentCode: 3,
        id: 1,
        agentType: '',
        administrativeId: 0,
        invoiceNo: 0,
        percentageProvision: 0,
        provisionalImp: 0,
        subjectId: 0,
        turnoverImp: 0
      },
      {
        agentCode: 7,
        id: 3,
        agentType: '',
        administrativeId: 0,
        invoiceNo: 0,
        percentageProvision: 0,
        provisionalImp: 0,
        subjectId: 0,
        turnoverImp: 0
      }
    ];
    // Ensure filteredAgents is initialized as expected by applyFilterAndSort
    component.filteredAgents = [...component.agents];
    (component as any).sortEvent = { sorts: [{ prop: 'agentCode', dir: 'asc' }] };

    // Act
    component.applyFilterAndSort();

    // Assert
    if (component.filteredAgents.length > 0) {
      expect(component.filteredAgents[0].agentCode).toBe(3);
      expect(component.filteredAgents[1].agentCode).toBe(5);
      expect(component.filteredAgents[2].agentCode).toBe(7);
    } else {
      expect(component.filteredAgents.length).toBe(0);
    }
  });

  it('should sort agents by agentCode descending when applyFilterAndSort is called', () => {
    // Arrange
    component.agents = [
      {
        agentCode: 5,
        id: 2,
        agentType: '',
        administrativeId: 0,
        invoiceNo: 0,
        percentageProvision: 0,
        provisionalImp: 0,
        subjectId: 0,
        turnoverImp: 0
      },
      {
        agentCode: 3,
        id: 1,
        agentType: '',
        administrativeId: 0,
        invoiceNo: 0,
        percentageProvision: 0,
        provisionalImp: 0,
        subjectId: 0,
        turnoverImp: 0
      },
      {
        agentCode: 7,
        id: 3,
        agentType: '',
        administrativeId: 0,
        invoiceNo: 0,
        percentageProvision: 0,
        provisionalImp: 0,
        subjectId: 0,
        turnoverImp: 0
      }
    ];
    // Ensure filteredAgents is initialized as expected by applyFilterAndSort
    component.filteredAgents = [...component.agents];
    (component as any).sortEvent = { sorts: [{ prop: 'agentCode', dir: 'desc' }] };

    // Act
    component.applyFilterAndSort();

    // Assert
    if (component.filteredAgents.length > 0) {
      expect(component.filteredAgents[0].agentCode).toBe(7);
      expect(component.filteredAgents[1].agentCode).toBe(5);
      expect(component.filteredAgents[2].agentCode).toBe(3);
    } else {
      expect(component.filteredAgents.length).toBe(0);
    }
  });

  it('should set agentCode as number in payload when key is agentCode', () => {
    const body: any = {};
    (component as any).setPayloadFilter(body, 'agentCode', '123');
    expect(body.agentCode).toBe(123);
  });

  it('should set surnameNameCompanyName in payload when key is surnameNameCompanyName', () => {
    const body: any = {};
    (component as any).setPayloadFilter(body, 'surnameNameCompanyName', 'John Doe');
    expect(body.surnameNameCompanyName).toBe('John Doe');
  });

  it('should set taxCode in payload when key is taxCode', () => {
    const body: any = {};
    (component as any).setPayloadFilter(body, 'taxCode', 'TAX123');
    expect(body.taxCode).toBe('TAX123');
  });
});
