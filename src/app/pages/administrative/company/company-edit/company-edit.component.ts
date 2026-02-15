/* eslint-disable max-lines-per-function */
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../common/utilities/constants/profile';
import { UtilityProfile } from '../../../../common/utilities/utility-profile';
import { CommonModule, DatePipe } from '@angular/common';
import { ContentHeaderComponent } from '../../../../common/components/content-header/content-header.component';
import { ActivatedRoute } from '@angular/router';
import { TitleBudgeComponent } from '../../../../common/components/title-budge/title-budge.component';
import { CompanyEditBodyComponent } from './company-edit-body/company-edit-body.component';
import { FormFooterComponent } from '../../../../common/components/form-footer/form-footer.component';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AdministrativeFieldsHistoryResponse,
  CompanyDetailResponse,
  CreateCompanyRequest,
  HistoryExportRequest,
  HistoryFields,
  HistoryFieldToExport,
  NationsCodeModel,
  UpdateCompanyRequest
} from '../../../../api/glsAdministrativeApi/models';
import { forkJoin, map, Observable } from 'rxjs';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { AdministrativeService, NationsCodeService } from '../../../../api/glsAdministrativeApi/services';
import { GetApiAdministrativeV1Id$Json$Params } from '../../../../api/glsAdministrativeApi/fn/administrative/get-api-administrative-v-1-id-json';
import { ADMINISTRATIVE_COMPANY_CONSTANTS } from '../../constants/administrative-constant';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AdministrativeCommonService } from '../../services/administrative.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { PostApiAdministrativeV1IdLock$Params } from '../../../../api/glsAdministrativeApi/fn/administrative/post-api-administrative-v-1-id-lock';
import { CONCURRENCY } from '../../../../common/utilities/constants/concurrency';
import { UtilityConcurrency } from '../../../../common/utilities/utility-concurrency';
import { StrictHttpResponse } from '../../../../api/glsAdministrativeApi/strict-http-response';
import { PostApiAdministrativeV1Create$Json$Params } from '../../../../api/glsAdministrativeApi/fn/administrative/post-api-administrative-v-1-create-json';
import { PutApiAdministrativeV1Id$Json$Params } from '../../../../api/glsAdministrativeApi/fn/administrative/put-api-administrative-v-1-id-json';
import { GlsMessagesComponent } from '../../../../common/components/gls-messages/gls-messages.component';
import { Utility } from '../../../../common/utilities/utility';
import { UserDetailsModel } from '../../../../api/glsUserApi/models';
import { COMPANY_MESSAGES, DEFAULT_COMPANY_ID } from '../constants/company-constants';

import { DeactivationModalComponent } from '../../../../common/components/deactivation-modal/deactivation-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BadgeLinkComponent } from '../../../../common/components/badge-link/badge-link.component';
import { AdministrativeHistoryModalComponent } from '../../administrative-history-modal/administrative-history-modal.component';
import { MODAL_LG } from '../../../../common/utilities/constants/modal-options';
import { PostApiAdministrativeV1IdHistory$Json$Params } from '../../../../api/glsAdministrativeApi/fn/administrative/post-api-administrative-v-1-id-history-json';
import { HistoryModalModel } from '../../models/history-modal-model';
import { SpinnerStatusService } from '../../../../common/utilities/services/spinner/spinner.service';
import { PostApiAdministrativeV1IdHistoryExport$Json$Params } from '../../../../api/glsAdministrativeApi/fn/administrative/post-api-administrative-v-1-id-history-export-json';
import { STATUS } from '../../../../common/utilities/constants/generic-constants';
import { VIEW_MODE } from '../../../../common/app.constants';
import { GenericDropdown } from '../../../../common/models/generic-dropdown';

@Component({
  selector: 'app-company-edit',
  standalone: true,
  imports: [
    CommonModule,
    ContentHeaderComponent,
    TitleBudgeComponent,
    CompanyEditBodyComponent,
    FormFooterComponent,
    TranslatePipe,
    GlsMessagesComponent,
    BadgeLinkComponent
  ],
  providers: [AdministrativeCommonService, DatePipe],
  templateUrl: './company-edit.component.html',
  styleUrl: './company-edit.component.scss'
})
export class CompanyEditComponent implements OnInit, OnDestroy {
  isWrite = signal(true);
  type = ADMINISTRATIVE_COMPANY_CONSTANTS.CREATE;
  typeViewMode: VIEW_MODE | undefined;
  isSmallMobile = signal(false);
  labelBtnNext = signal('');

  protected nationList = signal<GenericDropdown[]>([]);
  protected nationDefault = signal<GenericDropdown | null>(null);

  idCompany: number | null = null;
  PROFILE = PROFILE;
  FUNCTIONALITY = FUNCTIONALITY;
  PERMISSION = PERMISSION;
  ADMINISTRATIVE_COMPANY_CONSTANTS = ADMINISTRATIVE_COMPANY_CONSTANTS;
  adminDataResponse: CompanyDetailResponse | null = null;
  companySocietyRequest!: CreateCompanyRequest | UpdateCompanyRequest;
  companySocietyForm!: FormGroup;
  currentDate = '';
  lastInteractionTime: number = new Date().getTime();
  protected readonly labelDelete = 'formFooter.delete';
  protected logedUser?: UserDetailsModel;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly administrativeService = inject(AdministrativeService);
  private readonly route = inject(ActivatedRoute);
  private readonly userProfileService = inject(UserProfileService);
  private readonly companyService = inject(AdministrativeCommonService);
  private readonly modalService = inject(NgbModal);
  private readonly translateService = inject(TranslateService);
  private readonly spinnerService = inject(SpinnerStatusService);
  private readonly nationsCodeService = inject(NationsCodeService);

  /**
   *  Constructor for CompanyEditComponent
   * @param messageStatusService
   * @param genericService
   * @param fb
   * @param cdr
   */
  constructor(
    protected messageStatusService: MessageStatusService,
    private genericService: GenericService,
    public fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.companySocietyForm = this.fb.group({});
  }

  get corporateGroupIdFc(): FormControl | null {
    return this.companySocietyForm.get(['administrativeRelations', 'referenceCorporateGroup']) as FormControl | null;
  }

  get vatNumberFc(): FormControl | null {
    return this.companySocietyForm.get(['generalData', 'vatNo']) as FormControl | null;
  }

  get companyNameFc(): FormControl | null {
    return this.companySocietyForm.get(['generalData', 'companyname']) as FormControl | null;
  }

  get labelStatus(): string {
    let status = '';
    if (this.adminDataResponse?.status === STATUS.COMPLETED || this.adminDataResponse?.status === 'active') {
      status = 'administrative.state.active';
    } else if (this.isDraft) {
      status = 'administrative.state.draft';
    } else if (this.adminDataResponse?.status === STATUS.DISABLED) {
      status = 'administrative.state.inactive';
    }

    return status;
  }

  get isDraft(): boolean {
    return this.idCompany === null || this.adminDataResponse?.status === STATUS.DRAFT;
  }

  isDraftDisabled(): boolean {
    return (this.corporateGroupIdFc?.invalid ?? true) || (this.vatNumberFc?.invalid ?? true) || (this.companyNameFc?.invalid ?? true);
  }

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   * It is invoked only once when the directive is instantiated.
   */
  ngOnInit() {
    this.userProfileService.profile$.subscribe((loguser: UserDetailsModel | null) => {
      if (loguser) {
        this.logedUser = loguser;
      }
    });

    this.companySocietyForm = this.companyService.setCompanySocietyForm(this.logedUser);
    const idParam = this.route.snapshot.paramMap.get('idCompany');
    const value = this.route.snapshot.queryParams['isEditable'];
    // Set the current date in ISO 8601 format with milliseconds and 'Z' suffix
    this.currentDate = new Date().toISOString();
    this.isWrite.set(JSON.parse(value ?? 'true'));
    if (this.isWrite()) {
      this.genericService.resizePage();
    }
    if (idParam) {
      this.idCompany = Number(idParam);
      this.loadCompanyDetails();
      this.lockUnlock();
    } else {
      this.setNextBtnLabel();
    }
    this.loadDropdownValues();
    this.type = idParam ? ADMINISTRATIVE_COMPANY_CONSTANTS.EDIT : ADMINISTRATIVE_COMPANY_CONSTANTS.CREATE;
    this.cdr.detectChanges();
    this.setupViewMode();
  }

  hasAccess(profile: string, functionality: string, permission: string): boolean {
    const visible: boolean = UtilityProfile.checkAccessProfile(this.userProfileService, profile, functionality, permission);

    return visible;
  }

  private loadDropdownValues(): void {
    const payload = { body: {} };

    const nationsCall = this.nationsCodeService.postApiNationscodeV1$Json(payload);

    forkJoin([nationsCall]).subscribe({
      next: ([nationsRes]) => {
        this.nationList.set(
          nationsRes.map((item: NationsCodeModel) => ({
            id: item.id,
            value: `${item.isoCode} - ${item.description}`,
            isDefault: item.isDefault || false,
            code: item.isoCode
          }))
        );
        this.nationDefault.set(this.nationList().find((nation) => nation.isDefault) ?? null);
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Creates or updates a customer based on the form data.
   * It constructs a request object from the form values and calls the appropriate service method.
   */
  confirmComapnyCreation(forceDeactivation = false): void {
    this.populateCompanySocietyRequest();

    const endDateControl = this.companySocietyForm.get('activityEndDate')?.get('activityEndDate');
    const endDate = endDateControl?.value ? Utility.convertFromGenericDataToDate(endDateControl.value) : null;

    if (!forceDeactivation && endDate) {
      const companyName = this.companySocietyRequest?.name ?? '';
      this.openDeactivationModal(companyName, endDate);

      return;
    }

    if (this.type === ADMINISTRATIVE_COMPANY_CONSTANTS.CREATE) {
      const createRequest: CreateCompanyRequest = {
        ...this.companySocietyRequest,
        name: this.companySocietyRequest.name ?? ''
      };
      this.createSociety(createRequest);
    } else {
      if (endDate) {
        this.companySocietyRequest.companyEndDate = Utility.convertFromGenericDataToIsoString(endDate);
      }
      this.editSociety(this.companySocietyRequest);
    }
  }

  openDeactivationModal(companyName: string, endDate: Date): void {
    const formattedDate = endDate ? Utility.convertFromGenericDataToString(endDate) : '';

    const modalRef = this.modalService.open(DeactivationModalComponent, {
      centered: true,
      backdrop: 'static'
    });

    const titleMsg = Utility.translate(COMPANY_MESSAGES.LABEL_TITLE_DEACTIVATION, this.translateService);
    const bodyMsg = Utility.translate(COMPANY_MESSAGES.LABEL_BODY_DEACTIVATION, this.translateService, {
      company: companyName,
      date: formattedDate
    });

    modalRef.componentInstance.titleLabel = titleMsg;
    modalRef.componentInstance.titleParam = companyName;
    modalRef.componentInstance.titleBody = bodyMsg;

    modalRef.result
      .then((confirmed) => {
        if (confirmed) {
          this.confirmComapnyCreation(true);
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-function
      .catch(() => {});
  }

  populateCompanySocietyRequest(): void {
    this.companySocietyRequest = this.companyService.companySocietyToCreateCompanyRequest();
    this.companySocietyRequest.name = this.companySocietyForm.get('generalData')?.get('companyname')?.value ?? '';
    this.companySocietyRequest.certifiedEmail = this.companySocietyForm.get('billingData')?.get('pec')?.value ?? null;
    this.companySocietyRequest.corporateGroupId = this.companySocietyForm.get('administrativeRelations')?.get('referenceCorporateGroup')
      ?.value
      ? Number(this.companySocietyForm.get('administrativeRelations')?.get('referenceCorporateGroup')?.value)
      : 0;
    this.companySocietyRequest.languageId = this.companySocietyForm.get('generalData')?.get('languageId')?.value
      ? Number(this.companySocietyForm.get('generalData')?.get('languageId')?.value)
      : null;
    this.companySocietyRequest.nationId = this.companySocietyForm.get('registeredOfficeAddress')?.get('legalAddressCountry')?.value
      ? Number(this.companySocietyForm.get('registeredOfficeAddress')?.get('legalAddressCountry')?.value)
      : null;
    this.companySocietyRequest.officeAddress = this.companySocietyForm.get('registeredOfficeAddress')?.get('legalAddress')?.value ?? null;
    this.companySocietyRequest.officeCity = this.companySocietyForm.get('registeredOfficeAddress')?.get('city')?.value ?? null;
    this.companySocietyRequest.officePostCode = this.companySocietyForm.get('registeredOfficeAddress')?.get('postalCode')?.value ?? null;
    this.companySocietyRequest.provinceId = this.companySocietyForm.get('registeredOfficeAddress')?.get('province')?.value
      ? Number(this.companySocietyForm.get('registeredOfficeAddress')?.get('province')?.value)
      : null;
    this.companySocietyRequest.regionId = this.companySocietyForm.get('registeredOfficeAddress')?.get('regione')?.value
      ? Number(this.companySocietyForm.get('registeredOfficeAddress')?.get('regione')?.value)
      : null;
    this.companySocietyRequest.recipientTaxCode = this.companySocietyForm.get('billingData')?.get('custCodeRec')?.value ?? null;
    this.companySocietyRequest.relationshipType =
      this.companySocietyForm.get('administrativeRelations')?.get('typeofRelationshipwithGLS')?.value ?? null;
    this.companySocietyRequest.taxCode = this.companySocietyForm.get('generalData')?.get('taxIdcode')?.value ?? null;
    this.companySocietyRequest.vatGroup = !!this.companySocietyForm.get('generalData')?.get('vatGr')?.value;
    this.companySocietyRequest.vatNumber = this.companySocietyForm.get('generalData')?.get('vatNo')?.value ?? null;
    this.companySocietyRequest.rea = this.companySocietyForm.get('companyData')?.get('reaNumber')?.value ?? null;
    this.companySocietyRequest.shareCapitalStatus = this.companySocietyForm.get('companyData')?.get('stateSocialCapital')?.value ?? '';
    this.companySocietyRequest.shareCapital = Number(this.companySocietyForm.get('companyData')?.get('shareCapital')?.value ?? 0);
    this.companySocietyRequest.businessRegisterOf = this.companySocietyForm.get('companyData')?.get('businessRegister')?.value ?? '';
    this.companySocietyRequest.businessRegisterProvinceId = this.companySocietyForm.get('companyData')?.get('provinceofcRegister')?.value
      ? Number(this.companySocietyForm.get('companyData')?.get('provinceofcRegister')?.value)
      : undefined;
    this.companySocietyRequest.isSingleMember = this.companySocietyForm.get('companyData')?.get('singleMultipleMember')?.value
      ? JSON.parse(this.companySocietyForm.get('companyData')?.get('singleMultipleMember')?.value)
      : false;
    this.companySocietyRequest.registrationNumberRegisterHauliers =
      this.companySocietyForm.get('companyData')?.get('registrationNumber')?.value ?? null;
    this.companySocietyRequest.status =
      this.type === ADMINISTRATIVE_COMPANY_CONSTANTS.EDIT || this.type === ADMINISTRATIVE_COMPANY_CONSTANTS.CREATE
        ? STATUS.COMPLETED
        : STATUS.DRAFT;
    this.companySocietyRequest.telephone = this.companySocietyForm.get('contactInformation')?.get('phone')?.value ?? null;
    this.companySocietyRequest.email = this.companySocietyForm.get('contactInformation')?.get('email')?.value ?? null;
    this.companySocietyRequest.fax = this.companySocietyForm.get('contactInformation')?.get('fax')?.value ?? null;
    this.companySocietyRequest.companyEndDate = this.companySocietyForm.get('activityEndDate')?.get('activityEndDate')?.value ?? null;
  }

  /**
   *  Updates the company society with the provided payload.
   * @param payload - The payload containing the updated company data.
   * This function updates the company society with the provided payload.
   */
  editSociety(payload: UpdateCompanyRequest): void {
    this.putComapnySociety(payload).subscribe({
      next: (response: CompanyDetailResponse) => {
        this.handleCompanySuccess(response, true);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Creates a new company society with the provided payload.
   * @param payload - The payload containing the new company data.
   */
  createSociety(payload: CreateCompanyRequest): void {
    this.postComapnySociety(payload).subscribe({
      next: (response: CompanyDetailResponse) => {
        this.handleCompanySuccess(response, false);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Navigates back to the company list page.
   * This function is called when the user clicks the back button.
   */
  goBack(): void {
    UtilityRouting.navigateToCompanyList();
  }

  /**
   * Saves the draft company society.
   * It constructs a request object from the form values and calls the createComapnySoc
   */
  saveDraftCompany(): void {
    this.populateCompanySocietyRequest();
    this.companySocietyRequest.status = STATUS.DRAFT;
    if (this.type === ADMINISTRATIVE_COMPANY_CONSTANTS.EDIT) {
      this.editSociety(this.companySocietyRequest);
    } else {
      const createSaveDraftRequest: CreateCompanyRequest = {
        ...this.companySocietyRequest,
        name: this.companySocietyRequest.name ?? ''
      };
      this.createSociety(createSaveDraftRequest);
    }
  }

  /**
   *  Creates a new company society with the provided payload.
   * @param payload - The payload containing the new company data.
   * This function creates a new company society with the provided payload.
   * @returns Observable<CompanyDetailResponse>
   */
  postComapnySociety(payload: CreateCompanyRequest): Observable<CompanyDetailResponse> {
    const param: PostApiAdministrativeV1Create$Json$Params = {
      body: payload
    };

    return this.administrativeService.postApiAdministrativeV1Create$Json(param).pipe(
      map((r: CompanyDetailResponse) => {
        return r;
      })
    );
  }

  manageCompany(): void {
    if (this.idCompany !== null) {
      this.companyService.setCompanySocietyForm(this.adminDataResponse ?? undefined);

      const idCompany = this.idCompany;
      const params: PostApiAdministrativeV1IdLock$Params = {
        id: this.idCompany
      };
      this.administrativeService.postApiAdministrativeV1IdLock$Response(params).subscribe({
        next: (response) => {
          if (response.status === 204) {
            UtilityRouting.navigateToSocietyEditById(idCompany);
          } else {
            this.genericService.openErrorModal('generic.error.generic', 'concurrency.lockedCompany');
          }
        },
        error: (err: HttpErrorResponse) => {
          this.genericService.manageError(err);
        }
      });
    }
  }

  /**
   * Locks the Company by its ID.
   * This method sends a request to lock the Company, preventing further modifications.
   *
   * @param idCompany - The ID of the Company to lock.
   * @returns An observable of the locked Company details.
   */
  lockCompany(idCompany: number): Observable<StrictHttpResponse<void>> {
    const param = {
      id: idCompany
    };

    return this.administrativeService.postApiAdministrativeV1IdLock$Response(param);
  }

  /**
   * Unlocks the Company by its ID.
   * This method sends a request to unlock the Company, allowing further modifications.
   *
   * @param idCompany - The ID of the Company to unlock.
   * @returns An observable of the unlocked Company details.
   */
  unlockCompany(idCompany: number): Observable<StrictHttpResponse<void>> {
    const param = {
      id: idCompany
    };

    return this.administrativeService.postApiAdministrativeV1IdUnlock$Response(param);
  }

  ngOnDestroy(): void {
    this.messageStatusService.setWarningMessage(null);
    if (!this.isWrite()) {
      this.messageStatusService.hide();
    }
    this.genericService.resizeMainPage.update(() => this.genericService.defaultValue());
    if (!!this.idCompany && this.isWrite() && this.intervalId !== null) {
      this.unlockCompany(this.idCompany!).subscribe({
        next: () => {
          clearInterval(this.intervalId!);
        },
        error: (err: HttpErrorResponse) => {
          Utility.logErrorForDevEnvironment(err);
        }
      });
    }
  }

  /**
   * Deletes the company by its ID.
   * @param idCompany {number} - The ID of the company to delete.
   */
  deleteCompany(idCompany: number): void {
    this.administrativeService.deleteApiAdministrativeV1Id$Response({ id: idCompany }).subscribe({
      next: () => {
        this.messageStatusService.show(COMPANY_MESSAGES.DELETE_SUCCESS);
        this.goBack();
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  onClickGetHistoricalInfo(): void {
    const params: PostApiAdministrativeV1IdHistory$Json$Params = {
      id: this.idCompany!,
      body: {}
    };
    this.administrativeService.postApiAdministrativeV1IdHistory$Json(params).subscribe({
      next: (res: AdministrativeFieldsHistoryResponse) => {
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
    // List of field keys as in AdministrativeFieldsHistoryResponse
    const exportData: HistoryFields[] = ['FieldName', 'Value', 'ReferenceDate'];

    // Map to export fields with translated labels (like in exportClientsData)
    const exportFields: HistoryFieldToExport[] = exportData.map((key) => ({
      field: key,
      label: Utility.translate(prefixTranslated + key, this.translateService)
    }));

    const body: HistoryExportRequest = {
      languageTranslate: (languageUsed.toUpperCase() as 'EN' | 'IT') ?? 'IT',
      fieldsToExport: exportFields
      // fieldName: filters?.searchField && filters.searchField !== '' ? filters?.searchField : undefined,
      // fieldValue: filters?.searchTerm && filters.searchTerm !== '' ? filters?.searchTerm : undefined
    };

    const exportPayload: PostApiAdministrativeV1IdHistoryExport$Json$Params = {
      id: this.idCompany!,
      body
    };

    this.administrativeService.postApiAdministrativeV1IdHistoryExport$Json$Response(exportPayload).subscribe({
      next: (res: StrictHttpResponse<Blob>) => {
        Utility.handleExportDataResponse(res, 'Company_history');
        this.spinnerService.hide();
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
        this.spinnerService.hide();
      }
    });
  }

  /**
   * Loads the company details based on the company ID.
   * It retrieves the company data from the service and initializes the form with the retrieved data.
   */
  private loadCompanyDetails(): void {
    this.getCompanyById().subscribe({
      next: (res: CompanyDetailResponse) => {
        this.adminDataResponse = res;
        const newForm = this.companyService.setCompanySocietyForm(this.logedUser, this.adminDataResponse);
        this.companySocietyForm.patchValue(newForm.getRawValue());
        this.companySocietyForm?.controls['administrativeRelations']?.get('referenceCorporateGroup')?.disable();
        this.companySocietyForm?.updateValueAndValidity();
        if (res.status === STATUS.COMPLETED && res.companyEndDate && !this.isWrite()) {
          const dateExp = Utility.convertFromGenericDataToString(res.companyEndDate);
          const titleMsg = Utility.translate(COMPANY_MESSAGES.COMPANY_DEACTIVATED, this.translateService, { date: dateExp });
          const today = new Date().toDateString();
          const expDateCompare = new Date(res.companyEndDate).toDateString();
          if (expDateCompare >= today) {
            this.messageStatusService.setWarningMessage({
              title: titleMsg
            });
          }
        }
        this.setNextBtnLabel();
        this.companySocietyForm.statusChanges.subscribe(() => {
          this.lastInteractionTime = new Date().getTime();
        });
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   *  Retrieves the company details by ID from the administrative service.
   * @param idCompany - The ID of the company to retrieve.
   * @returns Observable that emits the company details response.
   * This function retrieves the company details by ID from the administrative service.
   */
  private getCompanyById(): Observable<CompanyDetailResponse> {
    const param: GetApiAdministrativeV1Id$Json$Params = {
      id: this.idCompany ?? DEFAULT_COMPANY_ID
    };

    // Create HTTP context with custom headers
    const context = Utility.setPermissionHeaders(
      FUNCTIONALITY.networkAdministrativeCompany,
      this.isWrite() ? PERMISSION.write : PERMISSION.read
    );

    return this.administrativeService
      .getApiAdministrativeV1Id$Json$Response(param, context)
      ?.pipe(map((res) => res.body as CompanyDetailResponse));
  }

  /**
   *  Updates the company society with the provided payload.
   * This function updates the company society with the provided payload.
   * @param payload - The payload containing the updated company data.
   * @returns
   */
  private putComapnySociety(payload: UpdateCompanyRequest): Observable<CompanyDetailResponse> {
    const param: PutApiAdministrativeV1Id$Json$Params = {
      id: Number(this.idCompany),
      body: payload
    };

    return this.administrativeService.putApiAdministrativeV1Id$Json(param).pipe(
      map((r: CompanyDetailResponse) => {
        return r;
      })
    );
  }

  private handleCompanySuccess(response: CompanyDetailResponse, isEdit: boolean): void {
    if (response) {
      const messageKey =
        response.status === STATUS.DRAFT
          ? COMPANY_MESSAGES.DRAFT_SUCCESS
          : isEdit
            ? COMPANY_MESSAGES.UPDATE_SUCCESS
            : COMPANY_MESSAGES.CREATE_SUCCESS;
      this.messageStatusService.show(messageKey);
      if (isEdit && response.id !== undefined && response.id !== null && response.status === STATUS.COMPLETED) {
        UtilityRouting.navigateToSocietyDetailById(response.id);
      } else if (isEdit && response.status === STATUS.DRAFT) {
        UtilityRouting.navigateToCompanyList();
      } else if (isEdit && response.status === STATUS.DISABLED) {
        UtilityRouting.navigateToCompanyList();
      } else if (!isEdit) {
        UtilityRouting.navigateToCompanyList();
      }
    }
  }

  /**
   * Activates the lock mechanism for the company.
   * @private
   */
  private lockUnlock(): void {
    if (this.isWrite()) {
      this.intervalId = setInterval(() => {
        UtilityConcurrency.handleInterval(
          Number(this.idCompany),
          this.lastInteractionTime,
          (entityId: number) => this.lockCompany(entityId),
          (title: string, message: string) => this.genericService.openErrorModal(title, message),
          () => UtilityRouting.navigateToCompanyList()
        );
      }, CONCURRENCY.sessionMaxTimeMs);
    }
  }

  /**
   *
   * @private
   */
  private setNextBtnLabel(): void {
    if (!this.idCompany && this.adminDataResponse?.status !== STATUS.COMPLETED) {
      this.labelBtnNext.set('administrative.companyCreate.companyreation');
    } else {
      this.labelBtnNext.set('administrative.companyCreate.companyEdit');
    }
  }

  private lunchHistoryModal(list: HistoryModalModel[]): void {
    const modalRef = this.modalService.open(AdministrativeHistoryModalComponent, MODAL_LG);
    modalRef.componentInstance.historyList = list;

    modalRef.result.then((toExport) => {
      if (toExport) {
        this.spinnerService.show();
        this.exportDataHystory(toExport.filters);
      }
    });
  }

  /**
   * Configura la modalità di visualizzazione.
   */
  private setupViewMode(): void {
    this.typeViewMode = this.genericService.viewMode();
    this.isSmallMobile.set(this.typeViewMode === VIEW_MODE.MOBILE);
  }
}
