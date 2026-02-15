import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { NgClass, NgForOf } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { GlsPaginatorComponent } from '../../../../../../common/components/gls-paginator/gls-paginator.component';
import { AgentService } from '../../../../../../api/glsAdministrativeApi/services';
import { AgentResponse, GetAgentsBaseRequest, GetAgentsResponse } from '../../../../../../api/glsAdministrativeApi/models';
import { GlsInputDropdownComponent } from '../../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { PostApiAgentV1$Plain$Params } from '../../../../../../api/glsAdministrativeApi/fn/agent/post-api-agent-v-1-plain';
import { AGENT_MODAL_COLUMNS, AGENT_OPTIONS_SEARCH } from '../../../constants/relationship-constants';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { VIEW_MODE } from '../../../../../../common/app.constants';

@Component({
  selector: 'app-agent-list-modal',
  standalone: true,
  imports: [TranslateModule, NgxDatatableModule, NgForOf, GlsInputComponent, GlsPaginatorComponent, GlsInputDropdownComponent, NgClass],
  templateUrl: './agent-list-modal.component.html',
  styleUrl: './agent-list-modal.component.scss'
})
export class AgentListModalComponent implements OnInit {
  @ViewChild('agentTable') table!: DatatableComponent;
  @ViewChild('datatableWrapper') datatableWrapper!: ElementRef;

  administrativeId: number | null = null;
  isSmallMobile = signal(false);
  agentFilterForm: FormGroup;
  selectedAgentCode: number | null = null;
  selectedAgent: AgentResponse | null = null;
  // Table configuration
  columns = AGENT_MODAL_COLUMNS;
  optionsPaymentSearch = AGENT_OPTIONS_SEARCH;
  // Pagination
  pageSize = 10;
  currentPage = 1;
  totalItems = 0;
  totalPages = 1;
  agents: AgentResponse[] = [];
  filteredAgents: AgentResponse[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sortEvent: any = null;
  private readonly agentService = inject(AgentService);
  private readonly genericService = inject(GenericService);

  constructor(
    private fb: FormBuilder,
    private readonly activeModal: NgbActiveModal
  ) {
    this.agentFilterForm = this.fb.group({
      searchTerm: [''],
      searchField: ['']
    });
  }

  ngOnInit(): void {
    this.loadAgents();
    this.getFilterFormValue();
    this.isSmallMobile.set(this.genericService.viewMode() === VIEW_MODE.MOBILE);
  }

  getFilterFormValue(): void {
    this.agentFilterForm.get('searchTerm')?.valueChanges.subscribe((value) => {
      if (value === '' || value === null) {
        this.agentFilterForm.get('searchField')?.setValue('');
        this.loadAgents();
      }
    });
  }

  enableSearch(): boolean {
    return this.agentFilterForm.get('searchTerm')?.value !== '' && this.agentFilterForm.get('searchField')?.value !== '';
  }

  enableConfirmSelection(): boolean {
    return this.selectedAgentCode !== null;
  }

  resetAgentFilter(): void {
    this.selectedAgentCode = null;
    this.selectedAgent = null;
    this.filteredAgents = [...this.agents]; // Reset to original payments
    const getAgentsResponse: GetAgentsResponse = { agents: [], totalItems: 0, totalPages: 1 };
    this.updatePagination(getAgentsResponse);
  }

  searchAgents(): void {
    const searchTerm = this.agentFilterForm.get('searchTerm')?.value.toLowerCase();
    const searchField = this.agentFilterForm.get('searchField')?.value;
    const payload = {
      searchTerm: searchTerm || '',
      searchField: searchField || ''
    };
    this.loadAgents(payload);
    this.filteredAgents = this.agents.filter((agent) => agent.agentCode.toString().includes(searchTerm));
  }

  onAgentSelect(row: AgentResponse): void {
    this.selectedAgentCode = row.id;
    this.selectedAgent = row;
    // Emit selection event if needed
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    const payload: PostApiAgentV1$Plain$Params = {
      body: {
        administrativeId: this.administrativeId,
        status: ['COMPLETED'],
        page: page,
        pageSize: this.pageSize,
        orderBy: {
          field: 'AgentCode',
          direction: 'asc'
        }
      }
    };
    this.agentService.postApiAgentV1$Json(payload).subscribe({
      next: (response: GetAgentsResponse) => {
        this.agents = response?.agents ?? [];
        this.filteredAgents = [...this.agents].slice(0, this.pageSize); // Initialize filtered agents
        this.updatePagination(response);
      },
      error: (error) => {
        this.genericService.manageError(error);
      }
    });
  }

  // Handle sort events
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSort(event: any) {
    this.sortEvent = event;
    this.applyFilterAndSort();
  }

  // Apply filters and sorting to the full dataset
  applyFilterAndSort() {
    // First apply any filters to get filtered data from allPayments
    let filteredData = [...this.agents]; // Apply your filters here if needed
    // Then apply sorting if we have a sort event
    if (this.sortEvent) {
      const { prop, dir } = this.sortEvent.sorts[0];
      filteredData = filteredData.sort((a, b) => {
        const valueA = a[prop as keyof AgentResponse] ?? '';
        const valueB = b[prop as keyof AgentResponse] ?? '';

        if (dir === 'asc') {
          return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        } else {
          return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
        }
      });
    }
    // Update the total count (if needed)
    this.totalItems = filteredData.length;
    // Apply pagination to get just the current page
    const start = (this.currentPage - 1) * this.pageSize;
    const end = Math.min(start + this.pageSize, filteredData.length);
    this.filteredAgents = filteredData.slice(start, end);
  }

  getFirstResult(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getLastResult(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  confirmSelection(): void {
    this.activeModal.close(this.selectedAgent);
  }

  closeModal(): void {
    this.activeModal.close();
  }

  private updatePagination(agentsData: GetAgentsResponse): void {
    if (agentsData && agentsData.agents.length > 0) {
      this.totalItems = agentsData.totalItems || 0;
      this.totalPages = agentsData.totalPages || 1;
      this.pageSize = Number(agentsData?.pageSize) || 0;
      this.currentPage = agentsData?.currentPage || 1;
    }
  }

  private setPayloadFilter(body: GetAgentsBaseRequest, key: string, value: string): void {
    delete body.status;
    switch (key) {
      case 'agentCode':
        body.agentCode = Number(value);
        break;
      case 'surnameNameCompanyName':
        body.surnameNameCompanyName = value;
        break;
      case 'taxCode':
        body.taxCode = value;
        break;
      case 'vatNumber':
        body.vatNumber = value;
        break;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private loadAgents(filters?: any): void {
    const payload: PostApiAgentV1$Plain$Params = {
      body: {
        page: this.currentPage,
        pageSize: this.pageSize,
        administrativeId: this.administrativeId,
        status: ['COMPLETED'],
        orderBy: {
          field: 'AgentCode',
          direction: 'asc'
        }
      }
    };
    if (filters) {
      this.setPayloadFilter(payload.body!, filters.searchField, filters.searchTerm);
    }
    this.agentService.postApiAgentV1$Json(payload).subscribe({
      next: (response: GetAgentsResponse) => {
        this.agents = response?.agents ?? [];
        this.filteredAgents = [...this.agents].slice(0, this.pageSize); // Initialize filtered agents
        this.updatePagination(response);
      },
      error: (error) => {
        this.genericService.manageError(error);
      }
    });
  }
}
