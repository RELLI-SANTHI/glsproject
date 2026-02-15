import { Component, inject, OnInit, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { GlsInputDropdownComponent } from '../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgentsTableComponent } from './agents-table/agents-table.component';
import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { AdministrativeService, AgentService } from '../../../../../api/glsAdministrativeApi/services';
import {
  Agent,
  AgentReplaceExportField,
  AgentReplaceField,
  AgentReplaceRequest,
  GetAdministrativesResponse,
  GetAgentsResponse
} from '../../../../../api/glsAdministrativeApi/models';
import { PostApiAdministrativeV1$Json$Params } from '../../../../../api/glsAdministrativeApi/fn/administrative/post-api-administrative-v-1-json';
import { AgencyOption, AgentDTO } from '../../models/relationship-models';
import { CHOISE_SEARCH } from '../../constants/relationship-constants';
import { PostApiAgentV1$Json$Params } from '../../../../../api/glsAdministrativeApi/fn/agent/post-api-agent-v-1-json';
import { MessageStatusService } from '../../../../../common/utilities/services/message/message.service';
import { GenericService } from '../../../../../common/utilities/services/generic.service';
import { Utility } from '../../../../../common/utilities/utility';
import { PostApiAgentV1Replace$Json$Params } from '../../../../../api/glsAdministrativeApi/fn/agent/post-api-agent-v-1-replace-json';
import { NgClass } from '@angular/common';
import { VIEW_MODE } from '../../../../../common/app.constants';

@Component({
  selector: 'app-replace-agents-modal',
  standalone: true,
  imports: [TranslatePipe, GlsInputDropdownComponent, AgentsTableComponent, GlsInputComponent, ReactiveFormsModule, NgClass],
  templateUrl: './replace-agents-modal.component.html',
  styleUrl: './replace-agents-modal.component.scss'
})
export class ReplaceAgentsModalComponent implements OnInit {
  title = 'administrative.replaceAgentModal.title';
  selection = 'administrative.replaceAgentModal.selection';
  placeholder = 'administrative.replaceAgentModal.placeholder';
  cancel = 'administrative.replaceAgentModal.cancel';
  confirm = 'administrative.replaceAgentModal.confirm';
  selectAgToRep = 'administrative.replaceAgentModal.selectAgentToReplace';
  selectNewAg = 'administrative.replaceAgentModal.selectNewAgent';
  search = 'administrative.replaceAgentModal.search';
  replaceAgentFormFg!: FormGroup;
  isVisibleFirstTable = false;
  isVisibleSecondTable = false;

  filteredOldAgents = signal<AgentDTO[]>([]);

  filteredNewAgents = signal<AgentDTO[]>([]);

  selectedAgentReplaced = signal<Agent | null>(null);
  selectedAgentNew = signal<Agent | null>(null);

  replacedAgent = signal<AgentDTO[]>([]);
  isSmallMobile = signal(false);
  newAgent = signal<AgentDTO[]>([]);
  public choiseAgency: AgencyOption[] = [];
  protected readonly messageStatusService = inject(MessageStatusService);
  protected readonly choiseSearch = CHOISE_SEARCH;
  private readonly modalRef = inject(NgbActiveModal);
  private readonly fb = inject(FormBuilder);
  private readonly agentService = inject(AgentService);
  private readonly administrativeService = inject(AdministrativeService);
  private readonly genericService = inject(GenericService);
  private readonly translateService = inject(TranslateService);

  get oldAgentForm(): FormGroup {
    return this.replaceAgentFormFg.get('oldAgent') as FormGroup;
  }

  get newAgentForm(): FormGroup {
    return this.replaceAgentFormFg.get('newAgent') as FormGroup;
  }

  ngOnInit() {
    this.buildFormAg();
    this.loadCompanies();
    this.isSmallMobile.set(this.genericService.viewMode() === VIEW_MODE.MOBILE);
  }

  filterFirTableByAcronym(): void {
    const inputValue = this.replaceAgentFormFg.get('oldAgent.inputSr')?.value?.toLowerCase();
    const selectedChoice = this.replaceAgentFormFg.get('oldAgent.choiseSr')?.value;

    this.selectedAgentReplaced.set(null);

    if (!inputValue || !selectedChoice) {
      this.filteredOldAgents.set([]);
      this.isVisibleFirstTable = true;

      return;
    }

    const filtered = this.replacedAgent().filter((agent) => {
      if (selectedChoice === 'filterSearchAgent') {
        return agent.agentCode.toString().includes(inputValue);
      } else if (selectedChoice === 'filterSearchCompany') {
        return agent.companyName.toLowerCase().includes(inputValue);
      }

      return false;
    });

    this.filteredOldAgents.set(filtered);
    this.isVisibleFirstTable = true;
  }

  filterSecTableByAcronym(): void {
    const inputValue = this.replaceAgentFormFg.get('newAgent.inputSr')?.value?.toLowerCase();
    const selectedChoice = this.replaceAgentFormFg.get('newAgent.choiseSr')?.value;

    if (!inputValue || !selectedChoice) {
      this.filteredNewAgents.set([]);
      this.isVisibleSecondTable = true;

      return;
    }

    this.selectedAgentNew.set(null);

    const filtered = this.newAgent().filter((agent) => {
      if (selectedChoice === 'filterSearchAgent') {
        return agent.agentCode.toString().includes(inputValue);
      } else if (selectedChoice === 'filterSearchCompany') {
        return agent.companyName.toLowerCase().includes(inputValue);
      }

      return false;
    });

    this.filteredNewAgents.set(filtered);
    this.isVisibleSecondTable = true;
  }

  isSelectionValid(): boolean {
    return this.selectedAgentReplaced() !== null && this.selectedAgentNew() !== null;
  }

  closeModal(): void {
    this.modalRef.dismiss();
  }

  passParams(): void {
    // Todo call api here
    this.closeModal();
  }

  onCompanySelected(event: string | number): void {
    const params: PostApiAgentV1$Json$Params = {
      body: {
        administrativeId: Number(event),
        status: ['COMPLETED']
      }
    };

    this.agentService.postApiAgentV1$Json(params).subscribe({
      next: (response: GetAgentsResponse) => {
        const agents =
          response?.agents?.map((agent) => ({
            companyName: agent.surnameNameCompanyName ?? '',
            agentCode: agent.agentCode ?? 0,
            vatNumber: agent.vatNumber ?? '',
            fiscalCode: agent.taxCode ?? '',
            id: agent.id ?? 0
          })) ?? [];

        this.replacedAgent.set(agents);
        this.newAgent.set(agents);
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  // eslint-disable-next-line max-lines-per-function
  replaceAgents(): void {
    const oldAgent = this.selectedAgentReplaced();
    const newAgent = this.selectedAgentNew();

    if (!oldAgent?.id || !newAgent?.id) {
      return;
    }

    const prefixTranslate = 'administrative.replaceAgentModal.';
    const agentFields: AgentReplaceField[] = [
      'CustomerCode',
      'NameSurnameCompanyName',
      'VatNumber',
      'TaxCode',
      'CompanyName',
      'OldAgentCode',
      'OldAgentName',
      'NewAgentCode',
      'NewAgentName'
    ];

    const exportFields: AgentReplaceExportField[] = agentFields.map(
      (key: string) =>
        ({
          field: key,
          label: Utility.translate(prefixTranslate + key, this.translateService)
        }) as AgentReplaceExportField
    );

    const body: AgentReplaceRequest = {
      oldAgentId: oldAgent!.id,
      newAgentId: newAgent!.id,
      fieldsToExport: exportFields
    };

    const params = {
      body
    } as PostApiAgentV1Replace$Json$Params;

    this.agentService.postApiAgentV1Replace$Json$Response(params).subscribe({
      next: (response) => {
        this.modalRef.close({ response });
        (async () => {
          const numberOfCustomers = await Utility.countCsvRecordsFromBlob(response.body);
          this.messageStatusService.setSuccessMessage(
            {
              title: 'message.relationshipCustomerList.massiveAgentReplacement.success',
              message: 'message.relationshipCustomerList.massiveAgentReplacement.successSecondMessage',
              showDownloadReportButton: true
            },
            {
              idOldAgent: oldAgent?.agentCode,
              numberOfCustomers: numberOfCustomers
            }
          );
        })();
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  private buildFormAg(): void {
    this.replaceAgentFormFg = this.fb.group({
      agencyName: ['', Validators.required],
      oldAgent: this.fb.group({
        choiseSr: ['', Validators.required],
        inputSr: ['']
      }),
      newAgent: this.fb.group({
        choiseSr: ['', Validators.required],
        inputSr: ['']
      })
    });
  }

  private loadCompanies(): void {
    const params: PostApiAdministrativeV1$Json$Params = {
      body: {
        page: 1,
        pageSize: 100,
        orderBy: {
          field: 'Name',
          direction: 'ASC'
        },
        status: ['COMPLETED']
      }
    };

    this.administrativeService.postAdministrativeV1CompaniesWithoutBreakVisibility$Json(params).subscribe({
      next: (response: GetAdministrativesResponse) => {
        this.choiseAgency = response.companies.map((company) => ({
          id: company.id as number,
          name: company.name
        }));
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }
}
