/* eslint-disable max-lines-per-function */
/* eslint-disable no-extra-boolean-cast */
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormGroup } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { Component, inject, OnDestroy, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, Subscription, switchMap, throwError } from 'rxjs';

import { ContentHeaderComponent } from '../../../../common/components/content-header/content-header.component';
import { GlsStepperComponent } from '../../../../common/components/gls-stepper/gls-stepper.component';
import { ISetpperInterface } from '../../../../common/models/stepper-interface';
import { FieldModel, TemplateFieldModel } from '../../../../api/glsNetworkApi/models';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { RelationshipDataComponent } from './relationship-data/relationship-data.component';
import { RelationshipSubjectContainerComponent } from './relationship-subject-container/relationship-subject-container.component';
import { RelationshipGeneralDataAgentComponent } from './relationship-general-data-agent/relationship-general-data-agent.component';
import { RelationshipCommercialDataComponent } from './relationship-commercial-data/relationship-commercial-data.component';
import { RelationshipOtherDataComponent } from './relationship-other-data/relationship-other-data.component';
import { AdministrativeCommonService } from '../../services/administrative.service';
import { RelationshipBankingDataComponent } from './relationship-banking-data/relationship-banking-data.component';
import { RelationshipBillingDataComponent } from './relationship-billing-data/relationship-billing-data.component';
import { BankResponse } from '../../../../api/glsAdministrativeApi/models/bank-response';
import { RelationshipType } from '../enum/relationship-type';
import { RelationshipGeneralDataComponent } from './relationship-general-data/relationship-general-data.component';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { CustomerService } from '../../../../api/glsAdministrativeApi/services/customer.service';
import { AgentService } from '../../../../api/glsAdministrativeApi/services/agent.service';
import { PostApiCustomerV1Create$Json$Params } from '../../../../api/glsAdministrativeApi/fn/customer/post-api-customer-v-1-create-json';
import { CustomerResponse } from '../../../../api/glsAdministrativeApi/models/customer-response';
import { PostApiAgentV1Create$Json$Params } from '../../../../api/glsAdministrativeApi/fn/agent/post-api-agent-v-1-create-json';
import { AgentResponse } from '../../../../api/glsAdministrativeApi/models/agent-response';
import { RelationshipFiscalDataComponent } from './relationship-fiscal-data/relationship-fiscal-data.component';
import { UtilityConcurrency } from '../../../../common/utilities/utility-concurrency';
import { CONCURRENCY } from '../../../../common/utilities/constants/concurrency';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { ConfirmationDialogData } from '../../../../common/models/confirmation-dialog-interface';
import { StrictHttpResponse } from '../../../../api/glsAdministrativeApi/strict-http-response';
import { TypeCustomer } from '../enum/type-customer';
import { Utility } from '../../../../common/utilities/utility';
import { PatchApiCustomerV1Id$Json$Params } from '../../../../api/glsAdministrativeApi/fn/customer/patch-api-customer-v-1-id-json';
import { PatchApiAgentV1Id$Json$Params } from '../../../../api/glsAdministrativeApi/fn/agent/patch-api-agent-v-1-id-json';
import { AgentCodeResponse, CustomerCodeResponse, NationsCodeModel, SubjectResponse } from '../../../../api/glsAdministrativeApi/models';
import { NationsCodeService, SubjectService } from '../../../../api/glsAdministrativeApi/services';
import { GetApiSubjectV1Id$Json$Params } from '../../../../api/glsAdministrativeApi/fn/subject/get-api-subject-v-1-id-json';
import { TitleBudgeComponent } from '../../../../common/components/title-budge/title-budge.component';
import { DatePipe } from '@angular/common';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../common/utilities/constants/profile';
import { FORM_TYPE, RELATIONSHIP_CUSTOMER_TYPE, RELATIONSHIP_MESSAGES } from '../constants/relationship-constants';
import { DeactivationModalComponent } from '../../../../common/components/deactivation-modal/deactivation-modal.component';
import { NATIONS_LABELS, STATUS } from '../../../../common/utilities/constants/generic-constants';
import { WarningStatusComponent } from '../../../../common/components/warning-status/warning-status.component';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { UserDetailsModel } from '../../../../api/glsUserApi/models';
import { GenericDropdown } from '../../../../common/models/generic-dropdown';

@Component({
  selector: 'app-relationship-edit',
  standalone: true,
  imports: [
    ContentHeaderComponent,
    GlsStepperComponent,
    TranslateModule,
    NgbNavModule,
    RelationshipDataComponent,
    RelationshipGeneralDataAgentComponent,
    RelationshipBankingDataComponent,
    RelationshipCommercialDataComponent,
    RelationshipOtherDataComponent,
    RelationshipBillingDataComponent,
    RelationshipSubjectContainerComponent,
    RelationshipSubjectContainerComponent,
    RelationshipGeneralDataComponent,
    RelationshipFiscalDataComponent,
    TitleBudgeComponent,
    DatePipe,
    WarningStatusComponent
  ],
  providers: [AdministrativeCommonService],
  templateUrl: './relationship-edit.component.html',
  styleUrl: './relationship-edit.component.scss'
})
export class RelationshipEditComponent implements OnInit, OnDestroy {
  steps: ISetpperInterface[] = [];
  activeStep = 0;
  active = 1;
  type = 'create';
  title = '';
  lastUpdate = '';
  subjectName = '';
  status = '';
  relationshipForm!: FormGroup;
  fromType: RelationshipType | string = '';
  fieldsList = signal<TemplateFieldModel[] | FieldModel[]>([]);
  btnCreateRelation = signal<boolean>(true);
  isEnabledDate = signal<boolean>(false);
  isFromSubject = signal<boolean>(false);
  isFromCustomer = signal<boolean>(false);
  warningOrError = signal<boolean>(false);
  isBankError = signal<boolean>(false);
  isBankWarning = signal<boolean>(false);
  isRemittanceBankError = signal<boolean>(false);
  isRemittanceBankWarning = signal<boolean>(false);
  protected nationList = signal<GenericDropdown[]>([]);
  protected nationDefault = signal<GenericDropdown | null>(null);
  warning = signal<boolean>(false);
  error = signal<boolean>(false);
  chooseAgentRelationship = false;
  lastInteractionTime: number = new Date().getTime();
  modalRef!: NgbModalRef;
  dialogData!: ConfirmationDialogData;
  isSubjectSelected = false;
  isItalianSubject = signal<boolean>(false);
  canSaveDraft = signal<boolean>(true);
  corporateGroupId = signal<number>(0);
  administrativeId = signal<number | null>(null);
  subjectId: number | undefined;
  @ViewChild('relationshipData', { static: true }) relationshipData!: TemplateRef<unknown>;
  @ViewChild('createSubject', { static: true }) createSubject!: TemplateRef<unknown>;
  @ViewChild('personalData', { static: true }) personalData!: TemplateRef<unknown>;
  @ViewChild('bank', { static: true }) bank!: RelationshipBankingDataComponent;
  @ViewChild('bankRemittance', { static: true }) bankRemittance!: RelationshipBankingDataComponent;
  @ViewChild('stepper', { static: true }) stepper!: GlsStepperComponent;
  protected readonly messageStatusService = inject(MessageStatusService);
  protected readonly modalService = inject(NgbModal);
  protected readonly userProfileService = inject(UserProfileService);
  private idRelationship: number | undefined;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private subject: SubjectResponse | undefined;
  private readonly genericService = inject(GenericService);
  private readonly administrativeService = inject(AdministrativeCommonService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly customerService = inject(CustomerService);
  private readonly agentService = inject(AgentService);
  private readonly subjectService = inject(SubjectService);
  private readonly translateService = inject(TranslateService);
  private readonly nationsCodeService = inject(NationsCodeService);

  private administrativeIdSubscription: Subscription | null = null;
  private currentTypeRelationship: string | null = null;
  private lastTypeCustomer: string | null = null;
  private lastCustomerCode: number | null = null;
  private lastAgentCode: number | null = null;
  private secondLabel = '';
  private surnameNameCompanyName = '';

  get isDraft(): boolean {
    return this.idRelationship === null || this.canSaveDraft();
  }

  get headerTitle(): string {
    if (this.isFromAgent()) {
      const key = this.title || 'administrative.relationshipDetail.newAgent';

      return this.translateService.instant(key) + ' ' + this.secondLabel;
    } else {
      const key = this.title || 'administrative.relationshipDetail.newClient';

      return this.translateService.instant(key) + ' ' + this.secondLabel;
    }
  }

  ngOnInit() {
    this.idRelationship = this.activatedRoute.snapshot.paramMap.get('idRelationship')
      ? Number(this.activatedRoute.snapshot.paramMap.get('idRelationship'))
      : undefined;
    this.fromType = this.activatedRoute.snapshot.paramMap.get('fromType')
      ? (this.activatedRoute.snapshot.paramMap.get('fromType') as RelationshipType)
      : '';
    if (this.fromType === RelationshipType.Subject) {
      this.subjectId = this.activatedRoute.snapshot.queryParams['idSubject'];
    }
    this.isFromSubject.set(this.fromType === RelationshipType.Subject);
    this.isFromCustomer.set(this.fromType === RelationshipType.Customer || this.fromType === RelationshipType.CustomerLac);
    this.genericService.resizePage();
    this.loadRelationshipData(this.idRelationship);
    this.lockUnlock();
    this.translateService.onLangChange.subscribe(() => {
      this.updateTitle();
      this.updateAgentTitle();
    });
    // retrive user data. if user is not EVA_ADMIN, set this.corporateGroupId with the user corporateGroupId
    this.retrieveLoggedUserPrfile();
  }

  ngOnDestroy(): void {
    this.genericService.resizeMainPage.set(this.genericService.defaultValue());
    if (this.administrativeIdSubscription) {
      this.administrativeIdSubscription.unsubscribe();
    }
    if (!!this.idRelationship && this.intervalId !== null) {
      this.unlockRelationship(this.idRelationship).subscribe({
        next: () => {
          clearInterval(this.intervalId!);
        },
        error: (err: HttpErrorResponse) => {
          Utility.logErrorForDevEnvironment(err);
        }
      });
    }
  }

  onSubjectSelected(selected: boolean) {
    this.isSubjectSelected = selected;
  }

  getLabelSave(): string {
    return this.type == 'edit'
      ? 'administrative.relationshipEdit.footerButtonsRelation.saveUpdates'
      : 'administrative.relationshipEdit.footerButtonsRelation.confirm';
  }

  /**
   * Locks the Relationship by its ID.
   * This method sends a request to lock the Relationship, preventing further modifications.
   *
   * @param idRelationship - The ID of the Relationship to lock.
   * @returns An observable of the locked Relationship details.
   */
  lockRelationship(idRelationship: number): Observable<StrictHttpResponse<void>> {
    const param = {
      id: idRelationship
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let apiCall!: any;
    switch (this.fromType) {
      case RelationshipType.Agent:
        apiCall = this.agentService.postApiAgentV1IdLock$Response(param);
        break;
      case RelationshipType.Customer:
      default:
        apiCall = this.customerService.postApiCustomerV1IdLock$Response(param);
        break;
      /*  case RelationshipType.Subject:
        apiCall = this.subjectService.postApiSubjectV1IdLock$Response(param);
        break; */
    }

    return apiCall;
  }

  /**
   * Unlocks the Relationship by its ID.
   * This method sends a request to unlock the Relationship, allowing further modifications.
   *
   * @param idRelationship - The ID of the Relationship to unlock.
   * @returns An observable of the unlocked Relationship details.
   */
  unlockRelationship(idRelationship: number): Observable<StrictHttpResponse<void>> {
    const param = {
      id: idRelationship
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let apiCall!: any;
    switch (this.fromType) {
      case RelationshipType.Agent:
        apiCall = this.agentService.postApiAgentV1IdUnlock$Response(param);
        break;
      case RelationshipType.Customer:
      default:
        apiCall = this.customerService.postApiCustomerV1IdUnlock$Response(param);
        break;
    }

    return apiCall;
  }

  redirect(): void {
    UtilityRouting.navigateTo('administrative/subject-list');
  }

  /**
   * Go to specific step
   * @param ev
   */
  getStepperValue(ev: { index: number }) {
    this.activeStep = ev.index;
  }

  nextStep(): void {
    this.activeStep++;
  }

  /**
   * Navigate to the edit relationship page.
   */
  goToExit() {
    UtilityRouting.navigateToRelationshipExit(this.fromType, this.subjectId);
  }

  /**
   * Set bank detail in the form based on the event received.
   * @param event {BankResponse | undefined} - The bank response object containing bank details.
   * @param isRemittance {boolean} - Flag indicating if the bank detail is for remittance.
   */
  setBankDetailApi(event: BankResponse | undefined, isRemittance: boolean) {
    if (event) {
      if (isRemittance) {
        this.relationshipForm?.get('bankDetail')?.get('remittanceBankId')?.setValue(event.id);
      } else {
        this.relationshipForm?.get('bankDetail')?.get('bankId')?.setValue(event.id);
      }
    }
  }

  /**
   * Check if the save draft button should be disabled.
   * @returns boolean
   */
  disableSaveDraft(): boolean {
    if (this.isFromCustomer()) {
      return !this.relationshipForm?.get('categoryId')?.value;
    }

    return false;
  }

  /**
   * Method to check if the form is valid and if the next step can be enabled.
   * @returns boolean
   */
  isDisabledNextStep(): boolean {
    if (this.activeStep === 0) {
      if (!!this.idRelationship) {
        return false;
      }

      let codeControl;
      if (this.fromType === RelationshipType.Agent || this.chooseAgentRelationship) {
        codeControl = this.relationshipForm?.get('agentCode');
      } else if (this.relationshipForm?.get('typeRelationship')?.value === TypeCustomer['ClientLac'] || TypeCustomer['Client']) {
        codeControl = this.relationshipForm?.get('typeRelationship');
      }

      const isValidFirstStepForm = !!codeControl?.value && !this.relationshipForm?.get('administrativeId')?.invalid;

      return !isValidFirstStepForm;
    } else {
      return this.activeStep === 1 ? !this.isSubjectSelected && this.isWritingSubject() : false;
    }
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
        return this.relationshipForm?.get('categoryId')?.invalid ?? false;
      case 'fiscalData':
        return this.getFinancialDetail()?.invalid;
      case 'bankingData':
        return this.getBankingDataForm()?.invalid;
      case 'billingData':
        return this.getBillingDataForm()?.invalid;
      case 'commercialData':
        return false;
      case 'otherData':
        return false; // Assuming otherData does not have specific validation
      default:
        return false;
    }
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
   * Get the title for the third stepper based on the relationship type.
   */
  getThirdStepperTitle(): string {
    switch (this.fromType) {
      case RelationshipType.Customer:
      case RelationshipType.Subject:
        return this.chooseAgentRelationship ? 'generalData' : 'biographicalData';
      case RelationshipType.Agent:
        return 'generalData';
      default:
        return 'generalData';
    }
  }

  /**
   * Check if the relationship is from a subject.
   */
  isFromAgent(): boolean {
    return this.fromType === RelationshipType.Agent;
  }

  /**
   * Save the relationship data based on whether it is a draft or not.
   * @param isDraft {boolean} - Flag indicating if the relationship is a draft.
   */
  saveRelationship(isDraft: boolean): void {
    if (!this.idRelationship) {
      if (this.isFromAgent() || this.chooseAgentRelationship) {
        this.callApiRelationshipAgent(isDraft);
      } else {
        this.callApiRelationshipCustomer(isDraft);
      }
    } else {
      this.checkEndRelationship(isDraft);
    }
  }

  getSubtitleRelatioshipEdit(): string {
    return this.idRelationship && !this.isFromSubject()
      ? 'administrative.relationshipEdit.subtitleEdit'
      : 'administrative.relationshipEdit.subtitle';
  }

  isWritingSubject(): boolean {
    return !this.idRelationship || this.idRelationship === 0;
  }

  private retrieveLoggedUserPrfile(): void {
    let loggedUser!: UserDetailsModel;

    const subscriptionList: Subscription[] = [];
    subscriptionList.push(
      this.userProfileService.profile$.subscribe((user: UserDetailsModel | null) => {
        if (user) {
          loggedUser = user;
        }
      })
    );

    subscriptionList.push(
      this.userProfileService.impersonatedUser$.subscribe((user: UserDetailsModel | null) => {
        if (user) {
          loggedUser = user;
        }
      })
    );

    if (loggedUser && loggedUser.profile !== PROFILE.EVA_ADMIN && loggedUser.corporateGroup?.id) {
      this.corporateGroupId.set(loggedUser.corporateGroup.id);
    }
  }

  private updateTitle(): void {
    if (this.lastTypeCustomer && this.lastCustomerCode) {
      const key = this.lastTypeCustomer === TypeCustomer.Client ? 'generic.client' : 'generic.clientLac';
      this.translateService.get(key).subscribe((translated) => {
        this.title = translated + this.lastCustomerCode;
      });
    }
  }

  private updateAgentTitle(): void {
    if (this.lastAgentCode) {
      this.translateService.get('generic.agent').subscribe((translated) => {
        this.title = translated + this.lastAgentCode;
      });
    }
  }

  /**
   * Switch to the agent form and update the relationship form accordingly.
   * @private
   */
  private switchToAgentForm(): void {
    const dataToKeep = { ...this.relationshipForm.getRawValue() };
    this.relationshipForm = this.administrativeService.setDetailRelationshipAgent(dataToKeep);
    this.generateCodeAgentCustomer(true);
    this.relationshipForm?.get(FORM_TYPE.typeRelationship)?.setValue('Agent');
    this.relationshipForm?.get('endOfRelationshipValidity')?.disable();
    this.relationshipForm?.get('administrativeId')?.setValue(dataToKeep.administrativeId, { emitEvent: true });
    this.buildFormsStepper();
    this.changeFormRelationship();
  }

  /**
   * Switch to the customer form and update the relationship form accordingly.
   * @param value
   * @private
   */
  private switchToCustomerForm(value: string): void {
    const dataToKeep = { ...this.relationshipForm.getRawValue() };
    this.relationshipForm = this.administrativeService.setDetailRelationshipCustomer(value as TypeCustomer, dataToKeep);
    this.relationshipForm?.get(FORM_TYPE.typeRelationship)?.setValue(value);
    this.relationshipForm?.get('endOfRelationshipValidity')?.disable();
    this.relationshipForm?.get('administrativeId')?.setValue(dataToKeep.administrativeId, { emitEvent: true });
    this.buildFormsStepper();
    this.changeFormRelationship();
  }

  /**
   * Build the forms stepper with the necessary form groups and templates.
   * @private
   */
  private buildFormsStepper(): void {
    this.steps = [{ title: 'dataReport', template: this.relationshipData, formGroup: this.relationshipForm }];

    if (!this.isFromSubject() && this.isWritingSubject()) {
      this.steps.push({ title: 'creataSubject', template: this.createSubject, formGroup: this.relationshipForm });
    }

    this.steps.push({
      title: this.getThirdStepperTitle(),
      template: this.personalData,
      formGroup: this.relationshipForm
    });
    if (this.isFromSubject()) {
      this.setSubjectValues();
    }
  }

  private callNationAndSetDefault(): Observable<NationsCodeModel[]> {
    const nationsCall = this.nationsCodeService.postApiNationscodeV1$Json({ body: {} });

    return nationsCall.pipe(
      map((nations: NationsCodeModel[]) => {
        this.nationList.set(
          nations.map((item: NationsCodeModel) => ({
            id: item.id,
            value: `${item.isoCode} - ${item.description}`,
            isDefault: item.isDefault || false,
            code: item.isoCode
          }))
        );
        this.nationDefault.set(this.nationList()?.find((nation) => nation.isDefault) ?? null);

        return nations;
      })
    );
  }

  /**
   * Load relationship data based on the provided ID.
   * @param idRelationship {number | undefined} - The ID of the relationship to load.
   * @private
   */
  private loadRelationshipData(idRelationship: number | undefined): void {
    if (idRelationship && !this.isFromSubject()) {
      const typeCustomer = this.fromType === RELATIONSHIP_CUSTOMER_TYPE.customer ? TypeCustomer['Client'] : TypeCustomer['ClientLac'];
      this.isEnabledDate.set(true);
      this.type = 'edit';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let callApi!: any;

      // Create HTTP context with custom headers
      const context = Utility.setPermissionHeaders(
        this.isFromAgent() ? FUNCTIONALITY.networkAdministrativeAgent : FUNCTIONALITY.networkAdministrativeCustomer,
        PERMISSION.write
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
              const responseAgent = response as AgentResponse;
              this.relationshipForm = this.administrativeService.setDetailRelationshipAgent(responseAgent);

              this.title = 'generic.agent';
              this.secondLabel = responseAgent.agentCode!.toString();
            } else {
              const responseCustomer = response as CustomerResponse;
              this.warningOrError.set(!!responseCustomer.warningOrError);
              this.error.set(!!responseCustomer.error);
              this.warning.set(!!responseCustomer.warning);
              this.isBankError.set(responseCustomer.errorList?.some((e) => e === 'BankId') ?? false);
              this.isRemittanceBankError.set(responseCustomer.errorList?.some((e) => e === 'RemittanceBankId') ?? false);
              this.isBankWarning.set(responseCustomer.warningList?.some((e) => e === 'BankId') ?? false);
              this.isRemittanceBankWarning.set(responseCustomer.warningList?.some((e) => e === 'RemittanceBankId') ?? false);
              this.relationshipForm = this.administrativeService.setDetailRelationshipCustomer(typeCustomer, responseCustomer);
              this.title = typeCustomer === 'Client' ? 'generic.client' : 'generic.clientLac';
              this.secondLabel = responseCustomer.customerCode.toString();
            }
            this.administrativeId.set(response.administrativeId!);
            this.lastUpdate = response.lastUpdated ?? '';
            this.status = response.status ?? '';
            this.canSaveDraft.set(response.status == STATUS.DRAFT);
            this.relationshipForm.statusChanges.subscribe(() => {
              this.lastInteractionTime = new Date().getTime();
            });
            this.surnameNameCompanyName = response.surnameNameCompanyName ?? '';
            // Switch to subject API call using the subjectId from the relationship response

            return forkJoin({
              subject: this.subjectService.getApiSubjectV1Id$Json({ id: response.subjectId }),
              nationsCall: this.callNationAndSetDefault()
            });
          })
        )
        .subscribe({
          next: (result: { subject: SubjectResponse; nationsCall: NationsCodeModel[] }) => {
            this.subjectName = result.subject?.surnameNameCompanyName ?? '';

            const nationIT = result.nationsCall.find((nation) => nation.isoCode === NATIONS_LABELS.ISOCODE_IT) ?? null;
            this.isItalianSubject.set(result.subject.nationId === nationIT?.id);
            this.corporateGroupId.set(result.subject.corporateGroupId!);
            this.buildFormsStepper();
          },
          error: (err: HttpErrorResponse) => {
            this.genericService.manageError(err);
          }
        });
    } else if (this.isFromSubject() && this.subjectId) {
      this.retrieveSubject(this.subjectId);
      this.changeFormRelationship();
    } else {
      this.isEnabledDate.set(false);
      this.setDefaultForm();
      this.buildFormsStepper();
      if (this.isFromAgent()) {
        this.generateCodeAgentCustomer(true);
      }
    }
  }

  private retrieveSubject(subjectId: number): void {
    const params: GetApiSubjectV1Id$Json$Params = {
      id: subjectId
    };
    forkJoin({ subject: this.subjectService.getApiSubjectV1Id$Json(params), nationsCall: this.callNationAndSetDefault() }).subscribe({
      next: (result: { subject: SubjectResponse; nationsCall: NationsCodeModel[] }) => {
        this.subject = result.subject;
        this.subjectName = result?.subject.surnameNameCompanyName ?? '';
        const nationIT = result.nationsCall.find((nation) => nation.isoCode === NATIONS_LABELS.ISOCODE_IT) ?? null;
        this.isItalianSubject.set(result.subject.nationId === nationIT?.id);
        this.setDefaultForm();
        this.relationshipForm?.get(FORM_TYPE.typeRelationship)?.setValue('');
        this.relationshipForm?.get('subjectId')?.setValue(result.subject.id);
        this.corporateGroupId.set(result.subject.corporateGroupId!);
        this.changeFormRelationship();
        this.buildFormsStepper();
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * This method parses decimal values in the body of the relationship form.
   * It replaces commas with dots in the string representation of decimal values
   * and converts them to floating-point numbers.
   * If the value cannot be parsed, it defaults to null.
   * @param body
   * @param isAgent {boolean} - Flag indicating if the relationship is for an agent.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseDecimalValues(isAgent: boolean, body: any): void {
    if (isAgent) {
      body.percentageProvision = parseFloat(body.percentageProvision) || null;
      body.turnoverImp = parseFloat(body.turnoverImp) || null;
      body.provisionalImp = parseFloat(body.provisionalImp);
    } else {
      body.fixedRight = parseFloat(body.fixedRight) || null;
      body.provPercentage = parseFloat(body.provPercentage) || null;
      body.discount1 = parseFloat(body.discount1) || null;
      body.discount2 = parseFloat(body.discount2) || null;
      body.discount3 = parseFloat(body.discount3) || null;
      body.bankDetail.bankCredit = parseFloat(body.bankDetail?.bankCredit) || null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseDateValues(isAgent: boolean, body: any): void {
    if (isAgent) {
      const start = Utility.convertFromGenericDataToIsoString(body.startOfAccountingActivity);
      const end = Utility.convertFromGenericDataToIsoString(body.endOfAccountingActivity);
      body.startOfAccountingActivity = start && start !== '' ? start : null;
      body.endOfAccountingActivity = end && end !== '' ? end : null;
    } else {
      const start = Utility.convertFromGenericDataToIsoString(body.invoiceDetail.startOfAccountingActivity);
      const end = Utility.convertFromGenericDataToIsoString(body.invoiceDetail.endOfAccountingActivity);
      const dateFiscal = Utility.convertFromGenericDataToIsoString(body.financialDetail.declarationOfIntentDate);
      body.invoiceDetail.startOfAccountingActivity = start && start !== '' ? start : null;
      body.invoiceDetail.endOfAccountingActivity = end && end !== '' ? end : null;
      body.financialDetail.declarationOfIntentDate = dateFiscal && dateFiscal !== '' ? dateFiscal : null;
    }
  }

  /**
   * Call the API to save the relationship data for a customer.
   * @param isDraft {boolean} - Flag indicating if the relationship is a draft.
   * @private
   */
  private callApiRelationshipCustomer(isDraft: boolean): void {
    const customerForm = this.relationshipForm.getRawValue();
    customerForm.status = isDraft ? STATUS.DRAFT : STATUS.COMPLETED;
    customerForm.IsCustomerLac = customerForm.typeRelationship === TypeCustomer['ClientLac'];
    this.parseDecimalValues(false, customerForm);
    this.parseDateValues(false, customerForm);

    if (this.subject) {
      customerForm.subjectId = this.subject.id;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let callApi!: any;
    let isUpdate = false;
    if (!!this.idRelationship) {
      isUpdate = true;
      const payload: PatchApiCustomerV1Id$Json$Params = {
        id: this.idRelationship!,
        body: {
          ...Utility.preparePayloadForPatch(this.relationshipForm),
          status: {
            isModified: true,
            value: isDraft ? STATUS.DRAFT : STATUS.COMPLETED
          }
        }
      };
      if (payload.body) {
        delete (payload.body as Record<string, unknown>)['invoiceVatRateToggle'];
      }
      callApi = this.customerService.patchApiCustomerV1Id$Json(payload);
    } else {
      const payload: PostApiCustomerV1Create$Json$Params = {
        body: customerForm
      };
      if (payload.body) {
        delete (payload.body as unknown as Record<string, unknown>)['invoiceVatRateToggle'];
      }
      callApi = this.customerService.postApiCustomerV1Create$Json(payload);
    }

    callApi.subscribe({
      next: (response: CustomerResponse) => {
        let msg = 'administrative.relationshipEdit.messages.';
        let messageKey: string;
        if (response.status === STATUS.DRAFT) {
          messageKey = 'draft';
        } else {
          messageKey = isUpdate ? 'update' : 'success';
        }
        msg += messageKey;

        this.messageStatusService.setSuccessMessage(
          {
            title: msg,
            message: 'administrative.relationshipEdit.messages.successSecondMessage',
            showDownloadReportButton: false
          },
          {
            customerCode: response.customerCode
          }
        );
        this.returnToList();
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Call the API to save the relationship data for an agent.
   * @param isDraft
   * @private
   */
  private callApiRelationshipAgent(isDraft: boolean): void {
    const agentForm = this.relationshipForm.getRawValue();
    agentForm.status = isDraft ? STATUS.DRAFT : STATUS.COMPLETED;
    this.parseDecimalValues(true, agentForm);
    this.parseDateValues(true, agentForm);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let callApi!: any;
    let isUpdate = false;
    if (!!this.idRelationship) {
      isUpdate = true;
      const payload: PatchApiAgentV1Id$Json$Params = {
        id: this.idRelationship!,
        body: {
          ...Utility.preparePayloadForPatch(this.relationshipForm),
          status: {
            isModified: true,
            value: isDraft ? STATUS.DRAFT : STATUS.COMPLETED
          }
        }
      };
      callApi = this.agentService.patchApiAgentV1Id$Json(payload);
    } else {
      const payload: PostApiAgentV1Create$Json$Params = {
        body: agentForm
      };
      callApi = this.agentService.postApiAgentV1Create$Json(payload);
    }

    callApi.subscribe({
      next: (response: AgentResponse) => {
        let msg = 'administrative.relationshipEdit.messages.';
        let messageKey: string;
        if (response.status === STATUS.DRAFT) {
          messageKey = 'draft';
        } else {
          messageKey = isUpdate ? 'update' : 'success';
        }
        msg += messageKey;
        this.messageStatusService.setSuccessMessage(
          {
            title: msg,
            message: 'administrative.relationshipEdit.messages.successSecondAgentMessage',
            showDownloadReportButton: false
          },
          {
            agentCode: response.agentCode
          }
        );
        this.returnToList();
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  private retrieveCodeAgentCustomer(isAgent = false): void {
    const administrativeId = this.relationshipForm?.get('administrativeId')?.value;
    if (administrativeId && this.type !== 'edit') {
      const context = Utility.setPermissionHeaders(
        this.isFromAgent() || isAgent ? FUNCTIONALITY.networkAdministrativeAgent : FUNCTIONALITY.networkAdministrativeCustomer,
        PERMISSION.write
      );
      if (this.isFromAgent() || isAgent || !!this.chooseAgentRelationship) {
        this.agentService
          .postApiAgentV1GenerateCode$Json(
            {
              body: {
                administrativeId: administrativeId
              }
            },
            context
          )
          .subscribe((res: AgentCodeResponse) => {
            this.relationshipForm?.get('agentCode')?.setValue(res.code);
            this.relationshipForm?.get('customerCode')?.setValue(null);
          });
      } else {
        this.customerService
          .postApiCustomerV1GenerateCode$Json(
            {
              body: {
                administrativeId: administrativeId,
                isCustomerLac: this.relationshipForm?.get('typeRelationship')?.value === TypeCustomer['ClientLac']
              }
            },
            context
          )
          .subscribe((res: CustomerCodeResponse) => {
            this.relationshipForm?.get('customerCode')?.setValue(res.code);
            this.relationshipForm?.get('agentCode')?.setValue(null);
          });
      }
    }
  }

  private generateCodeAgentCustomer(isAgent = false): void {
    if (this.administrativeIdSubscription) {
      this.administrativeIdSubscription.unsubscribe();
    }
    this.administrativeIdSubscription = this.relationshipForm.get('administrativeId')!.valueChanges.subscribe((value) => {
      if (typeof value === 'number' && value > 0) {
        this.retrieveCodeAgentCustomer(isAgent);
      }
    });
  }

  /**
   * Subscribe to changes in the relationship type form field and update the form accordingly.
   * @private
   */
  private changeFormRelationship(): void {
    this.relationshipForm?.get(FORM_TYPE.typeRelationship)!.valueChanges.subscribe((value) => {
      if (value && value !== this.currentTypeRelationship && typeof value === 'string') {
        this.currentTypeRelationship = value;
        if (value === 'Agent') {
          this.chooseAgentRelationship = true;
          this.switchToAgentForm();
        } else {
          this.chooseAgentRelationship = false;
          this.switchToCustomerForm(value);
        }
      }
    });
  }

  private returnToList(): void {
    switch (this.fromType) {
      case RelationshipType.Agent:
        UtilityRouting.navigateTo('administrative/relationship-agents-list');
        break;
      case RelationshipType.Customer:
        UtilityRouting.navigateTo('administrative/relationship-customers-list');
        break;
      case RelationshipType.CustomerLac:
        UtilityRouting.navigateTo('administrative/relationship-customers-list-lac');
        break;
      case RelationshipType.Subject:
        UtilityRouting.navigateTo('administrative/subject-list');
        break;
    }
  }

  /**
   * Sets the default form based on the relationship type.
   * @private
   */
  private setDefaultForm(): void {
    if (this.isFromSubject()) {
      this.relationshipForm = this.administrativeService.setDetailRelationshipCustomer(TypeCustomer.Client);
    } else {
      this.relationshipForm = this.isFromCustomer()
        ? this.administrativeService.setDetailRelationshipCustomer(
            this.fromType === RelationshipType.Customer ? TypeCustomer.Client : TypeCustomer.ClientLac
          )
        : this.administrativeService.setDetailRelationshipAgent();
    }
  }

  /**
   * Locks the relationship and sets up an interval to check for concurrency issues.
   * @private
   */
  private lockUnlock(): void {
    if (this.idRelationship) {
      const redirectPage = this.isFromAgent() ? RelationshipType.Agent : this.fromType;
      this.intervalId = setInterval(() => {
        UtilityConcurrency.handleInterval(
          this.idRelationship!,
          this.lastInteractionTime,
          (entityId: number) => this.lockRelationship(entityId),
          (title: string, message: string) => this.genericService.openErrorModal(title, message),
          () => UtilityRouting.navigateToRelationshipExit(redirectPage)
        );
      }, CONCURRENCY.sessionMaxTimeMs);
    }
  }

  /**
   * Sets the subject values in the relationship form.
   * @private
   */
  private setSubjectValues(): void {
    const dateFormatted = Utility.convertFromGenericDataToDatepicker(this.subject?.dateAdded ?? null);
    this.relationshipForm.get('invoiceDetail')?.get('startOfAccountingActivity')?.setValue(dateFormatted);
  }

  private openDeactivationModal(endDate: string, isDraft: boolean): void {
    const titleLabel = Utility.translate(RELATIONSHIP_MESSAGES.LABEL_TITLE_DEACTIVATION, this.translateService);

    const modalRef = this.modalService.open(DeactivationModalComponent, {
      centered: true,
      backdrop: 'static'
    });

    const titleParam = this.getLabelTitleModal();
    const nameParam = this.getLabelBodyModal();
    const bodyMsg = Utility.translate(RELATIONSHIP_MESSAGES.LABEL_BODY_DEACTIVATION, this.translateService, {
      subject: nameParam,
      date: endDate
    });

    modalRef.componentInstance.titleLabel = titleLabel;
    modalRef.componentInstance.titleParam = titleParam;
    modalRef.componentInstance.titleBody = bodyMsg;

    modalRef.result
      .then((confirmed) => {
        if (confirmed) {
          if (this.isFromAgent()) {
            this.callApiRelationshipAgent(isDraft);
          } else {
            this.callApiRelationshipCustomer(isDraft);
          }
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-function
      .catch(() => {});
  }

  /**
   * Checks if the end of relationship validity date is set and opens a deactivation modal if it is.
   * @param isDraft {boolean} - Flag indicating if the relationship is a draft.
   * @private
   */
  private checkEndRelationship(isDraft: boolean): void {
    const endRelValue = this.relationshipForm.get('endOfRelationshipValidity')?.value;
    if (endRelValue) {
      const dateExp = Utility.convertFromGenericDataToString(endRelValue) ?? '';
      this.openDeactivationModal(dateExp, isDraft);
    } else {
      if (this.isFromAgent()) {
        this.callApiRelationshipAgent(isDraft);
      } else {
        this.callApiRelationshipCustomer(isDraft);
      }
    }
  }

  private getLabelTitleModal(): string {
    if (this.isFromAgent()) {
      return Utility.translate(RELATIONSHIP_MESSAGES.LABEL_TITLE_AGENT, this.translateService) + ' ' + this.secondLabel;
    } else {
      const key =
        this.fromType === RelationshipType.Customer
          ? RELATIONSHIP_MESSAGES.LABEL_TITLE_CLIENT
          : RELATIONSHIP_MESSAGES.LABEL_TITLE_CLIENT_LAC;

      return Utility.translate(key, this.translateService) + ' ' + this.secondLabel;
    }
  }

  private getLabelBodyModal(): string {
    if (this.isFromAgent()) {
      return Utility.translate(RELATIONSHIP_MESSAGES.LABEL_SUB_BODY_AGENT, this.translateService, {
        number: this.secondLabel,
        surname: this.surnameNameCompanyName
      });
    } else {
      const key =
        this.fromType === RelationshipType.Customer
          ? RELATIONSHIP_MESSAGES.LABEL_SUB_BODY_CLIENT
          : RELATIONSHIP_MESSAGES.LABEL_SUB_BODY_CLIENT_LAC;

      return Utility.translate(key, this.translateService, {
        number: this.secondLabel,
        surname: this.surnameNameCompanyName
      });
    }
  }
}
