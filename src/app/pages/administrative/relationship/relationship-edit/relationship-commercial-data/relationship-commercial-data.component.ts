import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { GlsInputDropdownComponent } from '../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { RELATIONSHIP_TYPE_LIST_COMMERCIAL, TYPE_DISCOUNTS_LIST } from '../../constants/relationship-constants';
import { AgentResponse, CustomerResponse } from '../../../../../api/glsAdministrativeApi/models';
import { AgentListModalComponent } from './agent-list-modal/agent-list-modal.component';
import { GetStructuresResponse, StructureResponse } from '../../../../../api/glsNetworkApi/models';
import { StructureService } from '../../../../../api/glsNetworkApi/services/structure.service';
import { PostApiStructureV1$Json$Params } from '../../../../../api/glsNetworkApi/fn/structure/post-api-structure-v-1-json';
import { GenericDropdown } from '../../../../../common/models/generic-dropdown';
import { GenericService } from '../../../../../common/utilities/services/generic.service';
import { MODAL_LG } from '../../../../../common/utilities/constants/modal-options';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-relationship-commercial-data',
  standalone: true,
  imports: [CommonModule, GlsInputComponent, GlsInputDropdownComponent, ReactiveFormsModule, TranslatePipe],
  templateUrl: './relationship-commercial-data.component.html',
  styleUrl: './relationship-commercial-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RelationshipCommercialDataComponent implements OnInit {
  relationshipCommercialDataForm = input.required<FormGroup>();
  relationshipForm = input.required<FormGroup>();
  isDraft = input.required<boolean>();
  isWriting = input<boolean>();
  isEnabledDate = input<boolean>();
  isFromSubject = input<boolean>();
  corporateGroupId = input<number>();
  administrativeId = input<number | null>();
  customer = input<CustomerResponse | undefined>();
  relationshipTypeList = RELATIONSHIP_TYPE_LIST_COMMERCIAL;
  typeDiscountsOptions = TYPE_DISCOUNTS_LIST;
  structureList = signal<GenericDropdown[]>([]);
  selectedAgent: AgentResponse | null = null;
  modalRef!: NgbModalRef;
  private readonly genericService = inject(GenericService);
  private readonly modalService = inject(NgbModal);
  private readonly structureService = inject(StructureService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    effect(
      () => {
        if (this.corporateGroupId()) {
          this.loadStructureList();
        }
      },
      {
        allowSignalWrites: true
      }
    );
  }

  ngOnInit(): void {
    if (this.relationshipCommercialDataForm()?.get('agentId')?.value) {
      this.selectedAgent = {
        id: this.relationshipCommercialDataForm()?.get('agentId')?.value ?? '',
        agentCode: this.relationshipCommercialDataForm()?.get('agentCode')?.value ?? '',
        surnameNameCompanyName: this.relationshipCommercialDataForm()?.get('agentName')?.value ?? ''
      } as AgentResponse;
    }
    this.loadStructureList();
  }

  loadStructureList(): void {
    const params: PostApiStructureV1$Json$Params = {
      body: {
        status: ['ACTIVE', 'COMPLETED'],
        isDepot: true
      }
    };

    if (this.corporateGroupId()) {
      params.body!.corporateGroupId = this.corporateGroupId();
    }
    this.structureService.postApiStructureV1$Json(params).subscribe({
      next: (res: GetStructuresResponse) => {
        const list = res.structures.map((structure: StructureResponse) => {
          return {
            id: structure.id,
            value: structure.fields.find((field) => field.fieldName === 'BuildingName')?.value || ''
          };
        });
        this.structureList.set(list);
      },
      error: (error) => {
        this.genericService.manageError(error);
      }
    });
  }

  getAgentCodeBtnLabel(): string {
    if (this.selectedAgent) {
      return 'administrative.relationshipEdit.relationshipBillingData.changePaymentCode';
    } else {
      return 'administrative.relationshipEdit.relationshipBillingData.choosePaymentCode';
    }
  }

  getCommercialDataType(): string {
    const type = this.relationshipCommercialDataForm()?.get('type')?.value;

    return this.relationshipTypeList?.find((item) => item.id === type)?.value || '';
  }

  chooseAgentCode(): void {
    this.modalRef = this.modalService.open(AgentListModalComponent, MODAL_LG);
    const administrativeId = this.relationshipForm().get('administrativeId')?.value || this.administrativeId();
    this.modalRef.componentInstance.administrativeId = administrativeId;
    this.modalRef.result.then((agent: AgentResponse) => {
      if (agent) {
        this.relationshipCommercialDataForm()!.get('agentId')!.setValue(agent!.id);
        this.relationshipCommercialDataForm()!.get('agentCode')!.setValue(agent!.agentCode);
        this.selectedAgent = agent;
        this.cdr.detectChanges();
      }
    });
  }

  removeAgent(): void {
    this.relationshipCommercialDataForm()!.get('agentId')!.setValue(null);
    this.relationshipCommercialDataForm()!.get('agentCode')!.setValue(null);
    this.selectedAgent = null;
    this.cdr.detectChanges();
  }

  get agentDisplayInfo(): string {
    if (this.selectedAgent) {
      return `${this.selectedAgent.agentCode} - ${this.selectedAgent.surnameNameCompanyName}`;
    }

    return '';
  }

  get getCommercialDataDetailsAgentCode(): string {
    return `${this.relationshipCommercialDataForm()?.get('agentCode')?.value ?? ''} -  ${this.relationshipCommercialDataForm().get('agentName')?.value ?? ''}`;
  }

  get getReferenceOfficeId(): string {
    return `${this.customer()?.referenceOfficeAcronym ?? ''} - ${this.customer()?.referenceOfficeName ?? ''}`.trim();
  }
}
