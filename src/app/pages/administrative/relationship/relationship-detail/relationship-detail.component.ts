/* eslint-disable max-lines-per-function */
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RelationshipType } from '../enum/relationship-type';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe, NgClass } from '@angular/common';
import { catchError, switchMap } from 'rxjs/operators';
import { forkJoin, Observable, throwError } from 'rxjs';

import { CustomerService } from '../../../../api/glsAdministrativeApi/services/customer.service';
import { AgentService } from '../../../../api/glsAdministrativeApi/services/agent.service';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { AdministrativeCommonService } from '../../services/administrative.service';
import { ContentHeaderComponent } from '../../../../common/components/content-header/content-header.component';
import { UtilityProfile } from '../../../../common/utilities/utility-profile';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../common/utilities/constants/profile';
import { RelationshipGeneralDataAgentComponent } from '../relationship-edit/relationship-general-data-agent/relationship-general-data-agent.component';
import { RelationshipDataComponent } from '../relationship-edit/relationship-data/relationship-data.component';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { TypeCustomer } from '../enum/type-customer';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { SubjectService } from '../../../../api/glsAdministrativeApi/services/subject.service';
import { TitleBudgeComponent } from '../../../../common/components/title-budge/title-budge.component';
import { RelationshipBankingDataComponent } from '../relationship-edit/relationship-banking-data/relationship-banking-data.component';
import { RelationshipBillingDataComponent } from '../relationship-edit/relationship-billing-data/relationship-billing-data.component';
import { RelationshipCommercialDataComponent } from '../relationship-edit/relationship-commercial-data/relationship-commercial-data.component';
import { RelationshipFiscalDataComponent } from '../relationship-edit/relationship-fiscal-data/relationship-fiscal-data.component';
import { RelationshipGeneralDataComponent } from '../relationship-edit/relationship-general-data/relationship-general-data.component';
import { RelationshipOtherDataComponent } from '../relationship-edit/relationship-other-data/relationship-other-data.component';
import {
  AgentFieldHistoryResponse,
  AgentResponse,
  CustomerFieldHistoryResponse,
  CustomerResponse,
  HistoryExportRequest,
  HistoryFields,
  HistoryFieldToExport,
  NationsCodeModel,
  SubjectResponse
} from '../../../../api/glsAdministrativeApi/models';
import { BadgeLinkComponent } from '../../../../common/components/badge-link/badge-link.component';
import { AdministrativeHistoryModalComponent } from '../../administrative-history-modal/administrative-history-modal.component';
import { MODAL_LG } from '../../../../common/utilities/constants/modal-options';
import { Utility } from '../../../../common/utilities/utility';
import { HistoryModalModel } from '../../models/history-modal-model';

import { SpinnerStatusService } from '../../../../common/utilities/services/spinner/spinner.service';
import { PostApiCustomerV1IdHistoryExport$Json$Params } from '../../../../api/glsAdministrativeApi/fn/customer/post-api-customer-v-1-id-history-export-json';
import { PostApiAgentV1IdHistoryExport$Json$Params } from '../../../../api/glsAdministrativeApi/fn/agent/post-api-agent-v-1-id-history-export-json';
import { GlsMessagesComponent } from '../../../../common/components/gls-messages/gls-messages.component';
import { RELATIONSHIP_MESSAGES } from '../constants/relationship-constants';
import { NATIONS_LABELS } from '../../../../common/utilities/constants/generic-constants';
import { VIEW_MODE } from '../../../../common/app.constants';
import { WarningStatusComponent } from '../../../../common/components/warning-status/warning-status.component';
import { NationsCodeService } from '../../../../api/glsAdministrativeApi/services';

@Component({
  selector: 'app-relationship-detail',
  standalone: true,
  imports: [
    ContentHeaderComponent,
    TranslatePipe,
    NgbNavModule,
    RelationshipDataComponent,
    RelationshipGeneralDataAgentComponent,
    RelationshipBankingDataComponent,
    RelationshipCommercialDataComponent,
    RelationshipOtherDataComponent,
    RelationshipBillingDataComponent,
    RelationshipGeneralDataComponent,
    RelationshipFiscalDataComponent,
    TitleBudgeComponent,
    DatePipe,
    BadgeLinkComponent,
    GlsMessagesComponent,
    NgClass,
    WarningStatusComponent
  ],
  providers: [AdministrativeCommonService],
  templateUrl: './relationship-detail.component.html',
  styleUrl: './relationship-detail.component.scss'
})
export class RelationshipDetailComponent implements OnInit, OnDestroy {
  fromType: RelationshipType | null = null;
  relationshipForm!: FormGroup;
  active = 1;
  isFromAgent = signal(false);
  isFromSubject = signal<boolean>(false);
  relTitle = signal('');
  secondLabel = signal('');
  showBtnEdit = signal(false);
  isItalianSubject = signal<boolean>(false);
  warningOrError = signal<boolean>(false);
  isBankError = signal<boolean>(false);
  isBankWarning = signal<boolean>(false);
  isRemittanceBankError = signal<boolean>(false);
  isRemittanceBankWarning = signal<boolean>(false);
  warning = signal<boolean>(false);
  error = signal<boolean>(false);
  lastUpdate = '';
  subjectName = '';
  status = '';
  isSmallMobile = signal(false);
  isTablet = signal(false);
  typeViewMode: VIEW_MODE | undefined;
  protected responseAgent?: AgentResponse;
  protected responseCustomer?: CustomerResponse;
  private idRelationship = 0;
  private readonly messageStatusService = inject(MessageStatusService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly customerService = inject(CustomerService);
  private readonly agentService = inject(AgentService);
  private readonly subjectService = inject(SubjectService);
  private readonly administrativeService = inject(AdministrativeCommonService);
  private readonly userProfileService = inject(UserProfileService);
  private readonly genericService = inject(GenericService);
  private readonly modalService = inject(NgbModal);
  private readonly translateService = inject(TranslateService);
  private readonly spinnerService = inject(SpinnerStatusService);
  private readonly nationsCodeService = inject(NationsCodeService);

  get headerTitle(): string {
    const key = this.relTitle() || 'generic.agent'; // or another sensible default

    return this.translateService.instant(key) + ' ' + this.secondLabel();
  }

  ngOnInit(): void {
    this.idRelationship = Number(this.activatedRoute.snapshot.paramMap.get('idRelationship'));
    this.fromType = this.activatedRoute.snapshot.paramMap.get('fromType') as RelationshipType;
    this.isFromSubject.set(this.fromType === RelationshipType.Subject);
    this.isFromAgent.set(this.fromType === RelationshipType.Agent);
    if (this.isFromAgent()) {
      this.showBtnEdit.set(
        UtilityProfile.checkAccessProfile(this.userProfileService, PROFILE.any, FUNCTIONALITY.networkAdministrativeAgent, PERMISSION.write)
      );
    } else {
      this.showBtnEdit.set(
        UtilityProfile.checkAccessProfile(
          this.userProfileService,
          PROFILE.any,
          FUNCTIONALITY.networkAdministrativeCustomer,
          PERMISSION.write
        )
      );
    }
    this.loadRelationshipData(this.idRelationship);
    this.setupViewMode();
  }

  ngOnDestroy(): void {
    this.messageStatusService.setWarningMessage(null);
  }

  /**
   * Get the financial detail form group from the relationship form.
   */
  getFinancialDetail(): FormGroup {
    return this.relationshipForm?.get('financialDetail') as FormGroup;
  }

  /**
   * Get the billing data form group from the relationship form.
   */
  getBillingDataForm(): FormGroup {
    return this.relationshipForm?.get('invoiceDetail') as FormGroup;
  }

  /**
   * Get the banking data form group from the relationship form.
   */
  getBankingDataForm(): FormGroup {
    return this.relationshipForm?.get('bankDetail') as FormGroup;
  }

  /**
   * Checks if a section in the form is invalid.
   * A section is considered invalid if any of its fields are invalid.
   *
   * @param section - The name of the section to check.
   * @returns `true` if the section has invalid fields, otherwise `false`.
   */
  isSectionInvalid(section: string): boolean {
    if (!this.idRelationship || this.idRelationship == 0) {
      return false;
    }
    switch (section) {
      case 'generalData':
        // eslint-disable-next-line no-extra-boolean-cast
        if (!!this.isFromAgent()) {
          return this.relationshipForm?.invalid ?? false;
        } else {
          return this.relationshipForm?.get('categoryId')?.invalid ?? false;
        }
      case 'fiscalData':
        return this.getFinancialDetail()?.invalid;
      case 'bankingData':
        return this.getBankingDataForm()?.invalid;
      case 'billingData':
        return this.getBillingDataForm()?.invalid;
      case 'commercialData':
        return false; // Assuming commercialData does not have specific validation
      case 'otherData':
        return false; // Assuming otherData does not have specific validation
      default:
        return false;
    }
  }

  /**
   * Navigate to the edit relationship page.
   */
  editRelationship(): void {
    if (this.isFromAgent()) {
      this.agentService.postApiAgentV1IdLock$Response({ id: this.idRelationship! }).subscribe({
        next: (response) => {
          if (response.status === 204) {
            UtilityRouting.navigateToRelationshipEditById(this.idRelationship.toString(), RelationshipType.Agent);
          } else {
            this.genericService.openErrorModal('generic.error.generic', 'concurrency.lockedAgent');
          }
        },
        error: (err: HttpErrorResponse) => {
          this.genericService.manageError(err);
        }
      });
    } else {
      this.customerService.postApiCustomerV1IdLock$Response({ id: this.idRelationship! }).subscribe({
        next: (response) => {
          if (response.status === 204) {
            UtilityRouting.navigateToRelationshipEditById(
              this.idRelationship.toString(),
              this.fromType === RelationshipType.Customer ? RelationshipType.Customer : RelationshipType.CustomerLac
            );
          } else {
            this.genericService.openErrorModal('generic.error.generic', 'concurrency.lockedCustomer');
          }
        },
        error: (err: HttpErrorResponse) => {
          this.genericService.manageError(err);
        }
      });
    }
  }

  onClickGetHistoricalInfo(): void {
    const params = {
      id: this.idRelationship,
      body: {}
    };

    const method = this.isFromAgent()
      ? this.agentService.postApiAgentV1IdHistory$Json(params)
      : (this.customerService.postApiCustomerV1IdHistory$Json(params) as Observable<
          AgentFieldHistoryResponse | CustomerFieldHistoryResponse
        >);

    method.subscribe({
      next: (res: AgentFieldHistoryResponse | CustomerFieldHistoryResponse) => {
        // res.item can be undefined/null, so fallback to []
        const mapped: HistoryModalModel[] = res.item
          ? Utility.mapHistoryApiResponseToModel(res.item, 'administrative.fields.', this.translateService.currentLang)
          : [];
        this.lunchHistoryModal(mapped);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  exportDataHystory(filters: any): void {
    const languageUsed = this.translateService.currentLang;
    const prefixTranslated = 'administrative.fields.';

    const getExportFields = <T extends string>(fields: T[]): { field: T; label: string }[] =>
      fields.map((key) => ({
        field: key,
        label: Utility.translate(prefixTranslated + key, this.translateService)
      }));

    const agentFields: HistoryFields[] = ['FieldName', 'Value', 'ReferenceDate'];

    const customerFields: HistoryFields[] = ['FieldName', 'Value', 'ReferenceDate'];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleResponse = (res: any, type: string) => {
      Utility.handleExportDataResponse(res, type);
    };

    if (this.isFromAgent()) {
      const exportFields: HistoryFieldToExport[] = getExportFields(agentFields);
      const body: HistoryExportRequest = {
        languageTranslate: (languageUsed.toUpperCase() as 'EN' | 'IT') ?? 'IT',
        fieldsToExport: exportFields
        // fieldName: filters?.searchField && filters.searchField !== '' ? filters.searchField : undefined,
        // fieldValue: filters?.searchTerm && filters.searchTerm !== '' ? filters.searchTerm : undefined
      };
      const exportPayload: PostApiAgentV1IdHistoryExport$Json$Params = { id: this.idRelationship, body };
      this.agentService.postApiAgentV1IdHistoryExport$Json$Response(exportPayload).subscribe({
        next: (res) => handleResponse(res, 'Agents_history'),
        error: (err: HttpErrorResponse) => this.genericService.manageError(err)
      });
    } else {
      const exportFields: HistoryFieldToExport[] = getExportFields(customerFields);
      const body: HistoryExportRequest = {
        languageTranslate: (languageUsed.toUpperCase() as 'EN' | 'IT') ?? 'IT',
        fieldsToExport: exportFields
        // fieldName: filters?.searchField && filters.searchField !== '' ? filters.searchField : undefined,
        // fieldValue: filters?.searchTerm && filters.searchTerm !== '' ? filters.searchTerm : undefined
      };
      const exportPayload: PostApiCustomerV1IdHistoryExport$Json$Params = {
        id: this.idRelationship,
        body
      };
      this.customerService.postApiCustomerV1IdHistoryExport$Json$Response(exportPayload).subscribe({
        next: (res) => handleResponse(res, 'Customers_history'),
        error: (err: HttpErrorResponse) => this.genericService.manageError(err)
      });
    }
  }

  /**
   * Load relationship data based on the type of relationship (Agent or Customer).
   * @param idRelationship {number} - The ID of the relationship to load.
   * @private
   */
  private loadRelationshipData(idRelationship: number): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let callApi!: any;

    // Create HTTP context with custom headers
    const context = Utility.setPermissionHeaders(
      this.isFromAgent() ? FUNCTIONALITY.networkAdministrativeAgent : FUNCTIONALITY.networkAdministrativeCustomer,
      PERMISSION.read
    );

    if (this.isFromAgent()) {
      callApi = this.agentService.getApiAgentV1Id$Json({ id: idRelationship }, context);
    } else {
      callApi = this.customerService.getApiCustomerV1Id$Json({ id: idRelationship }, context);
    }
    callApi
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.messageStatusService.show('administrative.relationship.error.load ' + err.message);

          return throwError(() => err);
        }),
        switchMap((response: AgentResponse | CustomerResponse) => {
          if (this.isFromAgent()) {
            this.responseAgent = response as AgentResponse;
            this.relationshipForm = this.administrativeService.setDetailRelationshipAgent(this.responseAgent);
            // this.relTitle.set(this.responseAgent.surnameNameCompanyName!);
            this.relTitle.set('generic.agent');
            this.secondLabel.set(this.responseAgent!.agentCode!.toString());
          } else {
            this.responseCustomer = response as CustomerResponse;
            this.warningOrError.set(!!response.warningOrError);
            this.error.set(!!response.error);
            this.warning.set(!!response.warning);
            this.isBankError.set(response.errorList?.some((e) => e === 'BankId') ?? false);
            this.isRemittanceBankError.set(response.errorList?.some((e) => e === 'RemittanceBankId') ?? false);
            this.isBankWarning.set(response.warningList?.some((e) => e === 'BankId') ?? false);
            this.isRemittanceBankWarning.set(response.warningList?.some((e) => e === 'RemittanceBankId') ?? false);
            const typeCustomer = this.fromType === RelationshipType.Customer ? TypeCustomer['Client'] : TypeCustomer['ClientLac'];
            this.relationshipForm = this.administrativeService.setDetailRelationshipCustomer(typeCustomer, this.responseCustomer);
            this.relTitle.update((value) =>
              typeCustomer === TypeCustomer.Client ? value.concat('generic.client') : value.concat('generic.clientLac')
            );
            this.secondLabel.set(this.responseCustomer!.customerCode!.toString());
          }
          this.lastUpdate = response.lastUpdated ?? '';
          this.status = response.status ?? '';
          if (response.endOfRelationshipValidity) {
            this.setEndRelationshipMsg(response.endOfRelationshipValidity);
          }
          // Switch to subject API call using the subjectId from the relationship response

          return forkJoin({
            subject: this.subjectService.getApiSubjectV1Id$Json({ id: response.subjectId }),
            nations: this.nationsCodeService.postApiNationscodeV1$Json({ body: {} })
          });
        })
      )
      .subscribe({
        next: (result: { subject: SubjectResponse; nations: NationsCodeModel[] }) => {
          const nationIT = result.nations.find((nation) => nation.isoCode === NATIONS_LABELS.ISOCODE_IT);
          this.isItalianSubject.set(result.subject?.nationId === nationIT?.id);
          this.subjectName = result.subject?.surnameNameCompanyName ?? '';
        },
        error: (err: HttpErrorResponse) => {
          this.genericService.manageError(err);
        }
      });
  }

  private lunchHistoryModal(list: HistoryModalModel[]): void {
    const modalRef = this.modalService.open(AdministrativeHistoryModalComponent, MODAL_LG);
    modalRef.componentInstance.historyList = list;

    modalRef.result.then((toExport) => {
      if (toExport) {
        this.spinnerService.show();
        this.exportDataHystory(toExport.filters);
        this.spinnerService.hide();
      }
    });
  }

  /**
   * Sets a warning message indicating the end of the relationship validity.
   * @param endDate {string} - The end date of the relationship validity.
   * @private
   */
  private setEndRelationshipMsg(endDate: string): void {
    const dateExp = Utility.fromIsoStringToString(endDate);
    const titleMsg = Utility.translate(RELATIONSHIP_MESSAGES.ELATIONSHIP_DEACTIVATED, this.translateService, { endDate: dateExp });
    this.messageStatusService.setWarningMessage({
      title: titleMsg
    });
  }

  /**
   * Configura la modalità di visualizzazione.
   */
  private setupViewMode(): void {
    this.typeViewMode = this.genericService.viewMode();
    this.isSmallMobile.set(this.typeViewMode === VIEW_MODE.MOBILE);
    this.isTablet.set(this.typeViewMode === VIEW_MODE.TABLET);
  }
}
