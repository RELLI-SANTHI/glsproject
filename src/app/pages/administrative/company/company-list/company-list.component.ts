import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ContentHeaderComponent } from '../../../../common/components/content-header/content-header.component';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../common/utilities/constants/profile';
import { UtilityProfile } from '../../../../common/utilities/utility-profile';
import {
  AdministrativeFields,
  AdministrativeOrderBy,
  CompanyDetailResponse,
  ExportFieldAdministrative,
  GetAdministrativesRequestPayload,
  GetAdministrativesRequestPayloadExportCsv,
  GetAdministrativesResponse
} from '../../../../api/glsAdministrativeApi/models';
import { ColTableInterface } from '../../../../common/models/col-table-interface';
import {
  ADMINISTRATIVE_COMPANY_BUTTONS,
  ADMINISTRATIVE_COMPANY_LIST_COLUMNS,
  EXPORT_FILE_NAME
} from '../../constants/administrative-constant';
import { CompanyListTableComponent } from './company-list-table/company-list-table.component';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { GlsMessagesComponent } from '../../../../common/components/gls-messages/gls-messages.component';
import { VIEW_MODE } from '../../../../common/app.constants';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PostApiAdministrativeV1$Json$Params } from '../../../../api/glsAdministrativeApi/fn/administrative/post-api-administrative-v-1-json';
import { AdministrativeService } from '../../../../api/glsAdministrativeApi/services';
import { forkJoin, map, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CarouselComponent } from '../../../../common/components/carousel/carousel.component';
import { Carousel } from '../../../../common/models/carousel';
import { DraftCardDataPipe } from '../../../anagrafica/structure/pipes/draft-card-data.pipe'; // Ensure this pipe is imported if used in the template
import { Utility } from '../../../../common/utilities/utility';
import { NgbModal, NgbModalRef, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResetCommonFilterList } from '../../../../common/models/reset-filter-list';
import { PostApiAdministrativeV1Export$Json$Params } from '../../../../api/glsAdministrativeApi/fn/administrative/post-api-administrative-v-1-export-json';
import { CompanyGroupListTableComponent } from './company-group-list-table/company-group-list-table.component';
import { CorporateGroupService, ExportService, UsersService } from '../../../../api/glsUserApi/services';
import { CorporateGroupModel, CorporateGroupWithAdministrativeModel } from '../../../../api/glsUserApi/models';
import { GetApiCorporategroupV1Id$Json$Params } from '../../../../api/glsUserApi/fn/corporate-group/get-api-corporategroup-v-1-id-json';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { PostApiAdministrativeV1IdLock$Params } from '../../../../api/glsAdministrativeApi/fn/administrative/post-api-administrative-v-1-id-lock';
import { StructureInfoPipe } from '../../../anagrafica/structure/pipes/structure-info.pipe';
import { GlsInputComponent } from '../../../../common/form/gls-input/gls-input.component';
import { PutApiCorporategroupV1Id$Json$Params } from '../../../../api/glsUserApi/fn/corporate-group/put-api-corporategroup-v-1-id-json';
import { StrictHttpResponse } from '../../../../api/glsUserApi/strict-http-response';
import { PostApiExportV1ExportCorporates$Params } from '../../../../api/glsUserApi/fn/export/post-api-export-v-1-export-corporates';
import { SpinnerStatusService } from '../../../../common/utilities/services/spinner/spinner.service';
import { GetApiCorporategroupV1$Json$Params } from '../../../../api/glsUserApi/fn/corporate-group/get-api-corporategroup-v-1-json';
import { ConfirmationDialogData } from '../../../../common/models/confirmation-dialog-interface';
import { ConfirmationDialogComponent } from '../../../../common/components/confirmation-dialog/confirmation-dialog/confirmation-dialog.component';
import { MODAL_MD } from '../../../../common/utilities/constants/modal-options';
import { DeleteApiCorporategroupV1Id$Params } from '../../../../api/glsUserApi/fn/corporate-group/delete-api-corporategroup-v-1-id';
import { TitleBudgeComponent } from '../../../../common/components/title-budge/title-budge.component';
import { LIST_COL_EXPORT_LIST_COMPANY } from '../constants/company-constants';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule, // <-- Ensure forRoot() is used for root providers
    NgbTooltipModule,
    ContentHeaderComponent,
    CompanyListTableComponent,
    GlsMessagesComponent,
    CarouselComponent,
    DraftCardDataPipe,
    CompanyGroupListTableComponent,
    StructureInfoPipe,
    GlsInputComponent,
    TitleBudgeComponent
  ],
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.scss'
})
export class CompanyListComponent implements OnInit, OnDestroy {
  PROFILE = PROFILE;
  FUNCTIONALITY = FUNCTIONALITY;
  PERMISSION = PERMISSION;
  showWarning = signal(false);
  totalItems = signal(0);
  administrativeCompanyList = signal<CompanyDetailResponse[]>([]);
  corporateGroupList = signal<CorporateGroupWithAdministrativeModel[]>([]);
  currentPage = signal<number>(1);
  totalPages = signal(1);
  pageSize = signal(10);
  sortSelected: AdministrativeOrderBy = {
    field: '' as AdministrativeFields,
    direction: ''
  };
  typeViewMode: VIEW_MODE | undefined;
  columns = signal<ColTableInterface[]>(ADMINISTRATIVE_COMPANY_LIST_COLUMNS);
  rows?: AdministrativeOrderBy[] | null;
  isSmallMobile = signal(false);
  showRotateCard = signal(false);
  isTablet = signal(false);
  companyType = signal<string>('');
  groupTitle = signal<string>('');
  groupId: number | undefined;
  administrativeRequest: GetAdministrativesRequestPayload = {
    status: ['COMPLETED', 'DISABLED']
  };
  societyFilterFg!: FormGroup;
  GroupNameEditFg!: FormGroup;
  // carousel configuration
  draftSociety: Carousel<CompanyDetailResponse>[][] = [];
  totalDraftItem = 0;
  tableEnabled = ADMINISTRATIVE_COMPANY_BUTTONS.GROUP_SOCIETY;
  groupEditFlag = false;
  modalRef!: NgbModalRef;
  dialogData!: ConfirmationDialogData;
  lastUpdatedGroup = signal<string | null>(null);

  protected readonly messageStatusService = inject(MessageStatusService);
  protected readonly viewButtonConstants = ADMINISTRATIVE_COMPANY_BUTTONS;
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly userProfileService = inject(UserProfileService);
  private readonly administrativeService = inject(AdministrativeService);
  private readonly translateService = inject(TranslateService);
  private readonly corporateGroupService = inject(CorporateGroupService);
  private readonly exportService = inject(ExportService);
  private readonly userServices = inject(UsersService);

  /**
   *  Constructor for the CompanyListComponent.
   *  Initializes the component with the provided GenericService.
   * @param genericService
   * @param fb
   * @param spinnerService
   * @param modalService
   */
  constructor(
    private genericService: GenericService,
    private readonly fb: FormBuilder,
    protected spinnerService: SpinnerStatusService,
    public modalService: NgbModal
  ) {
    effect(
      () => {
        this.showRotateCard.set(this.isSmallMobile() && !this.genericService.isLandscape());
      },
      {
        allowSignalWrites: true
      }
    );
  }

  /**
   * ngOnInit lifecycle hook for the CompanyListComponent.
   * This method is called after the component has been initialized.
   */
  ngOnInit(): void {
    this.tableEnabled = this.hasAccess(PROFILE.EVA_ADMIN, FUNCTIONALITY.networkAdministrativeCompany, PERMISSION.any)
      ? ADMINISTRATIVE_COMPANY_BUTTONS.GROUP_SOCIETY
      : ADMINISTRATIVE_COMPANY_BUTTONS.SOCIETY;
    this.societyFilterFg = this.fb.group({
      filterType: ['', Validators.required],
      filterValue: ['']
    });
    this.GroupNameEditFg = this.fb.group({
      groupName: ['', Validators.required]
    });

    this.groupId = this.activatedRoute.snapshot.paramMap.get('groupId')
      ? Number(this.activatedRoute.snapshot.paramMap.get('groupId'))
      : undefined;

    if (this.groupId) {
      this.tableEnabled = ADMINISTRATIVE_COMPANY_BUTTONS.SOCIETY;
      this.companyType.set('viewCorporateGroup');
    }

    this.columns().forEach((column: ColTableInterface) => {
      if (column.field === 'GroupName' && !this.hasAccess(PROFILE.EVA_ADMIN, FUNCTIONALITY.networkAdministrativeCompany, PERMISSION.any)) {
        column.columnVisible = false;
      }
    });
    this.loadInitialCorporateGroupData();
    this.setupViewMode();
    this.loadInitialCompanyData();
  }

  /**
   * Function to retrieve company data based on the provided request payload.
   * This function uses the AdministrativeService to make a POST request to the API.
   * @param body The request payload containing the parameters for retrieving company data.
   * This function retrieves the company data based on the provided request payload.
   * @returns An observable that emits the response containing the company data.
   */
  retrieveAdministrativesCompany(body: GetAdministrativesRequestPayload): Observable<GetAdministrativesResponse> {
    const param: PostApiAdministrativeV1$Json$Params = {
      body
    };

    return this.administrativeService.postApiAdministrativeV1$Json(param).pipe(
      map((r: GetAdministrativesResponse) => {
        return r; // Return the first element of the array
      })
    );
  }

  /**
   * Function to export company data.
   * This function is a placeholder and needs to be implemented.
   */
  exportData() {
    const callApi = this.tableEnabled === ADMINISTRATIVE_COMPANY_BUTTONS.SOCIETY ? this.exportSociety() : this.exportCorporate();

    callApi.subscribe({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: (res: any) => {
        Utility.handleExportDataResponse(
          res,
          this.tableEnabled === ADMINISTRATIVE_COMPANY_BUTTONS.SOCIETY ? EXPORT_FILE_NAME.COMPANY_SOCIETY : EXPORT_FILE_NAME.GROUP_SOCIETY
        );
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Function to create a new company.
   * This function is a placeholder and needs to be implemented.
   */
  corporateGroup() {
    UtilityRouting.navigateToCompanyGroupCreate();
  }

  /**
   * Function to create a new company.
   * This function is a placeholder and needs to be implemented.
   */
  society() {
    UtilityRouting.navigateToComapnySocietyCreate();
  }

  // funzione che wrappa la funzione che ho dichiarato in utilities/utility.ts
  hasAccess(profile: string, functionality: string, permission: string): boolean {
    const visible: boolean = UtilityProfile.checkAccessProfile(this.userProfileService, profile, functionality, permission);

    return visible;
  }

  /**
   * Handles the page change event and updates the current page.
   * @param page The new page number.
   */
  pageChange(page: number): void {
    this.currentPage.set(page);
    this.administrativeRequest.page = page;
    this.retrieveAdministrativesCompany(this.administrativeRequest).subscribe({
      next: (res: GetAdministrativesResponse) => {
        this.reloadAdministrativeTableList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   *  Reloads the user list with the provided company data.
   * This function updates the administrativeCompanyList signal with the new company data.
   * @param companyData The company data to reload the user list.
   * This function updates the administrativeCompanyList signal with the new company data.
   */
  reloadAdministrativeTableList(companyData: GetAdministrativesResponse): void {
    this.administrativeCompanyList.set([]);
    if (companyData.companies && companyData.companies.length > 0) {
      this.currentPage.set(companyData.currentPage || 1);
      this.totalPages.set(companyData.totalPages || 1);
      this.pageSize.set(companyData.pageSize || 0);
      this.totalItems.set(companyData.totalItems || 0);
      const userData: CompanyDetailResponse[] = [];
      userData.push(...(companyData.companies || []));
      this.administrativeCompanyList.set(userData);
    }
  }

  /**
   *  Handles the sorting of the company list.
   * This function is triggered when the user selects a column to sort by.
   * @param event The event object containing the column and new value for sorting.
   * This function handles the sorting of the company list based on the selected column and direction.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSort(event: any): void {
    const fieldMapping: Record<string, AdministrativeFields> = {
      state: 'Status',
      Name: 'Name',
      GroupName: 'GroupName',
      VatNumber: 'VatNumber',
      TaxCode: 'TaxCode'
    };
    const prop = event.column.prop as keyof typeof fieldMapping;
    const mappedField = fieldMapping[prop] || event.column.prop || '';

    this.administrativeRequest.orderBy = {
      field: mappedField as AdministrativeFields,
      direction: event.newValue || ''
    };
    this.sortSelected = this.administrativeRequest.orderBy;

    this.retrieveAdministrativesCompany(this.administrativeRequest).subscribe({
      next: (res: GetAdministrativesResponse) => {
        this.reloadAdministrativeTableList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Filters the company list based on the selected filter type and value.
   * This function retrieves the company data based on the filter criteria and updates the administrativeCompanyList signal.
   */
  filterByText(): void {
    const filterType = this.societyFilterFg.value.filterType;
    const filterValue = this.societyFilterFg.value.filterValue;
    switch (filterType.toLowerCase()) {
      case 'buildingacronym':
        this.administrativeRequest.buildingAcronym = filterValue;
        break;
      case 'name':
        this.administrativeRequest.name = filterValue;
        break;
      case 'vatnumber':
        this.administrativeRequest.vatNumber = filterValue;
        break;
      case 'taxcode':
        this.administrativeRequest.taxCode = filterValue;
        break;
      case 'carporategroup':
        this.administrativeRequest.corporateGroupName = filterValue;
        break;
      default:
        break;
    }
    this.administrativeRequest.page = 1;
    this.retrieveAdministrativesCompany(this.administrativeRequest).subscribe({
      next: (res: GetAdministrativesResponse) => {
        this.reloadAdministrativeTableList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * get Icon associate at this value
   * @param carousel {Carousel<T>}
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getDraftCardIcon<T>(carousel: Carousel<T>): string | undefined {
    // console.log('getDraftCardIcon', carousel);

    return '../../../../../assets/img/administrative/GLS_icon.svg';
    // return Utility.getDraftCardIcon(carousel);
  }

  /**
   *  Load draft card
   * @param societyList {CompanyDetailResponse[]}
   */
  loadDraftCard(societyList: CompanyDetailResponse[]): void {
    let itemForPages = 0;

    switch (this.typeViewMode) {
      case VIEW_MODE.DESKTOP:
        itemForPages = 3;
        break;
      case VIEW_MODE.TABLET:
        itemForPages = 2;
        break;
      case VIEW_MODE.MOBILE:
        itemForPages = 1;
        break;
    }
    const slides: Carousel<CompanyDetailResponse>[][] = [];

    // Map CompanyDetailResponse[] to Carousel<CompanyDetailResponse>[]
    const mappedSocietyList = societyList.map((item) => ({
      ...item,
      id: item.id ?? -1,
      corporateGroupId: item.corporateGroupId ?? -1,
      vatNumber: item.vatNumber ?? ''
    })) as Carousel<CompanyDetailResponse>[]; // Ensure correct type

    for (let i = 0; i < mappedSocietyList.length; i += itemForPages) {
      slides.push(mappedSocietyList.slice(i, i + itemForPages));
    }

    this.draftSociety = slides;
    this.totalDraftItem = societyList.length;
  }

  /**
   *  Navigates to the edit page for a society.
   * @param draftStructureId The ID of the draft structure to edit.
   * This function navigates to the edit page for a society with the given draft structure ID.
   */
  goToSocietyEdit(draftStructureId: number): void {
    const params: PostApiAdministrativeV1IdLock$Params = {
      id: draftStructureId
    };
    this.spinnerService.show();
    this.administrativeService.postApiAdministrativeV1IdLock$Response(params).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === 204) {
          UtilityRouting.navigateToSocietyEditById(draftStructureId);
        } else {
          this.genericService.openErrorModal('generic.error.generic', 'concurrency.lockedCompany');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.spinnerService.hide();
        this.genericService.manageError(err);
      }
    });
  }

  /**
   *  Resets the specified field in the filter.
   * This function clears the filter value and type for the specified field, updates the administrative request
   * @param field The field to reset in the filter.
   */
  // eslint-disable-next-line max-lines-per-function
  resetFilter(field: ResetCommonFilterList): void {
    switch (field.name.toLowerCase()) {
      case 'buildingacronym':
        this.societyFilterFg.get('filterValue')?.setValue(null);
        this.societyFilterFg.get('filterType')?.setValue('');
        this.administrativeRequest.buildingAcronym = null;
        field.value = undefined;
        break;
      case 'name':
        this.societyFilterFg.get('filterValue')?.setValue(null);
        this.societyFilterFg.get('filterType')?.setValue('');
        this.administrativeRequest.name = null;
        field.value = undefined;
        break;
      case 'vatnumber':
        this.societyFilterFg.get('filterValue')?.setValue(null);
        this.societyFilterFg.get('filterType')?.setValue('');
        this.administrativeRequest.vatNumber = null;
        field.value = undefined;
        break;
      case 'taxcode':
        this.societyFilterFg.get('filterValue')?.setValue(null);
        this.societyFilterFg.get('filterType')?.setValue('');
        this.administrativeRequest.taxCode = null;
        field.value = undefined;
        break;
      case 'corporategroup':
        this.societyFilterFg.get('filterValue')?.setValue(null);
        this.societyFilterFg.get('filterType')?.setValue('');
        this.administrativeRequest.corporateGroupName = null;
        field.value = undefined;
        break;
      default:
        break;
    }
    this.retrieveAdministrativesCompany(this.administrativeRequest).subscribe({
      next: (res: GetAdministrativesResponse) => {
        this.reloadAdministrativeTableList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Resets all filters applied to the company list.
   * This function resets the current page to 1, clears the filter values, and retrieves the initial company data.
   */
  resetFilters() {
    this.currentPage.set(1);
    this.administrativeRequest = {
      page: this.currentPage(),
      pageSize: this.pageSize()
    };
    if (this.groupId) {
      this.administrativeRequest.corporateGroupName = this.groupTitle();
    } else {
      this.societyFilterFg.get('filterValue')?.setValue(null);
      this.societyFilterFg.get('filterType')?.setValue('');
    }
    this.retrieveAdministrativesCompany(this.administrativeRequest).subscribe({
      next: (res: GetAdministrativesResponse) => {
        this.reloadAdministrativeTableList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   *  Shows the filters applied to the company list.
   * This function collects the applied filters and returns them as an array of ResetCommonFilterList.
   * @returns An array of filters applied to the company list.
   */
  showFiltersApplied(): ResetCommonFilterList[] {
    const filter = [] as ResetCommonFilterList[];
    const addFilter = (name: string, value: string | number) => {
      if (value !== undefined && value !== null && value !== '') {
        const existingFilter = filter.find((x) => x.name === name);
        if (!existingFilter) {
          filter.push({ name, value: String(value) });
        }
      }
    };

    addFilter('buildingAcronym', this.administrativeRequest?.buildingAcronym ?? '');
    addFilter('Name', this.administrativeRequest?.name ?? '');
    addFilter('VatNumber', this.administrativeRequest?.vatNumber ?? '');
    addFilter('TaxCode', this.administrativeRequest?.taxCode ?? '');
    if (!this.groupId) {
      addFilter('CorporateGroup', this.administrativeRequest?.corporateGroupName ?? '');
    }

    return filter;
  }

  /**
   *  Sets the enabled value based on the button type and company type.
   * This function updates the tableEnabled signal and sets the companyType signal based on the provided
   * @param ev {buttonType: string, companyType?: string}
   */
  getEnabledValue(ev: { buttonType: string; companyType?: string }): void {
    this.tableEnabled = ev.buttonType;
    this.companyType.set(ev.companyType || '');
  }

  /**
   *  Retrieves the corporate group data.
   * This function calls the corporateGroupService to get the corporate group data and maps the response
   * @returns An observable that emits an array of CorporateGroupWithAdministrativeModel.
   */
  retrieveCorporateGroup(): Observable<CorporateGroupWithAdministrativeModel[]> {
    const param: GetApiCorporategroupV1$Json$Params = {};
    // Create HTTP context with custom headers
    const context = Utility.setPermissionHeaders(FUNCTIONALITY.networkAdministrativeCompany, PERMISSION.read);

    return this.corporateGroupService.getApiCorporategroupV1$Json(param, context).pipe(
      map((r: CorporateGroupWithAdministrativeModel[]) => {
        return r; // Return the first element of the array
      })
    );
  }

  /**
   * Loads the initial corporate group data.
   * This function retrieves the corporate group data and sets it to the corporateGroupList signal.
   */
  loadInitialCorporateGroupData(): void {
    this.retrieveCorporateGroup().subscribe({
      next: (res: CorporateGroupWithAdministrativeModel[]) => {
        this.corporateGroupList.set(res);
        // FIXME: GET /users/private/api/CorporateGroup/v1/{id} do not provide the company list. (waith for BE fix)
        const matchedGroup = res.find((group) => group.id === this.groupId);
        if (matchedGroup) {
          this.groupTitle.set(matchedGroup.corporateName);
          this.GroupNameEditFg.get('groupName')?.patchValue(matchedGroup.corporateName);
          this.lastUpdatedGroup.set(matchedGroup.lastUpdated ?? null);
          this.loadCompanyDataWithGroup(); // FIXME: FE callback hell
        }
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   *  Retrieves the corporate group ID list based on the provided parameters.
   * This function calls the corporateGroupService to get the corporate group ID list and maps the response.
   * @param params { id: string }
   * @returns Observable<CorporateGroupModel>
   * Retrieves the corporate group ID list based on the provided parameters.
   */
  retrieveCorporateGroupIDList(params: GetApiCorporategroupV1Id$Json$Params): Observable<CorporateGroupModel> {
    return this.corporateGroupService.getApiCorporategroupV1Id$Json(params).pipe(
      map((response: CorporateGroupModel) => {
        return response;
      })
    );
  }

  /**
   * ngOnDestroy lifecycle hook for the CompanyListComponent.
   * This method is called when the component is about to be destroyed.
   */
  ngOnDestroy(): void {
    this.messageStatusService.hide();
  }

  /**
   *  Retrieves the title for the company list based on the company type.
   * This function returns a string representing the title for the company list.
   * @returns The title for the company list.
   */
  getTitle(): string {
    return this.companyType() === 'viewCorporateGroup' ? this.groupTitle() : 'administrative.companyList.title';
  }

  /**
   *  Loads the company data with the specified group ID.
   * This function retrieves the company data for the specified corporate group and updates the administrativeCompanyList signal.
   */
  loadCompanyDataWithGroup() {
    this.administrativeRequest.corporateGroupId = this.groupId;
    this.administrativeRequest.corporateGroupName = this.groupTitle();
    this.retrieveAdministrativesCompany(this.administrativeRequest).subscribe({
      next: (res: GetAdministrativesResponse) => {
        if (res?.companies?.length > 0) {
          this.reloadAdministrativeTableList(res);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Enables edit mode for the corporate group name.
   * This method sets the groupEditFlag to true, allowing the user to edit the group name.
   */
  editCompanyGroup() {
    this.GroupNameEditFg.get('groupName')?.patchValue(this.groupTitle());
    this.groupEditFlag = true;
  }

  /**
   * Cancels edit mode for the corporate group name.
   * This method sets the groupEditFlag to false, exiting the edit mode without saving changes.
   */
  cancelGroupNameEdit() {
    this.groupEditFlag = false;
  }

  /**
   * Saves the edited corporate group name.
   * This method is called when the user confirms editing the group name.
   * It sends a PUT request to update the corporate group's name on the server.
   * On success, it updates the local groupTitle signal, hides the spinner, and exits edit mode.
   * On error, it hides the spinner and displays an error message.
   */
  saveCorporateGroupName() {
    this.spinnerService.show();
    const param: PutApiCorporategroupV1Id$Json$Params = {
      id: Number(this.groupId),
      body: {
        corporateName: this.GroupNameEditFg.get('groupName')?.value
      }
    };

    this.corporateGroupService.putApiCorporategroupV1Id$Json(param).subscribe({
      next: (response: CorporateGroupModel) => {
        this.groupTitle.set(response.corporateName);
        this.groupEditFlag = false;
        this.spinnerService.hide();
      },
      error: (err: HttpErrorResponse) => {
        this.spinnerService.hide();
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Deletes the corporate group after user confirmation.
   * This function opens a confirmation dialog to confirm the deletion action.
   */
  deleteCompanyGroup(): void {
    this.dialogData = {
      title: 'ConfirmActionTtile',
      content: 'corporateGroupDelete',
      showCancel: true,
      cancelText: 'modal.cancelText',
      confirmText: 'modal.confirmText'
    };
    this.modalRef = this.modalService.open(ConfirmationDialogComponent, MODAL_MD);
    this.modalRef.componentInstance.data = this.dialogData;
    this.modalRef.result.then((result: string) => {
      if (result) {
        this.deleteCompanyGroupApi();
      }
    });
  }

  /**
   * Deletes the corporate group by calling the corporateGroupService.
   * This function sends a DELETE request to the API to remove the corporate group with the specified
   */
  deleteCompanyGroupApi(): void {
    const params: DeleteApiCorporategroupV1Id$Params = {
      id: Number(this.groupId)
    };
    this.corporateGroupService.deleteApiCorporategroupV1Id(params).subscribe({
      next: () => {
        this.messageStatusService.show('message.companyList.deleteGroup.success');
        UtilityRouting.navigateToCompanyList();
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Loads the initial company data.
   * This method retrieves the company data from the server and sets it to the administrativeCompanyList signal.
   */
  private loadInitialCompanyData(): void {
    const structureDraftRequest: GetAdministrativesRequestPayload = this.prepareRequestForDraft();
    this.administrativeRequest.pageSize = this.pageSize();
    this.administrativeRequest.page = this.currentPage();
    forkJoin({
      administrativeList: this.retrieveAdministrativesCompany(this.administrativeRequest),
      societyDraft: this.retrieveAdministrativesCompany(structureDraftRequest)
    }).subscribe({
      next: (res) => {
        if (!this.groupId) {
          this.reloadAdministrativeTableList(res.administrativeList);
        }
        if (res.societyDraft?.companies) {
          this.loadDraftCard(res.societyDraft?.companies);
        }
        this.totalPages.set(Math.ceil(this.totalItems() / this.pageSize()));
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Sets up the view mode for the component.
   * This function determines the current view mode (mobile, tablet, or desktop) and updates the isSmallMobile signal accordingly.
   */
  private setupViewMode(): void {
    this.typeViewMode = this.genericService.viewMode();
    this.isSmallMobile.set(this.typeViewMode === VIEW_MODE.MOBILE);
    this.isTablet.set(this.typeViewMode === VIEW_MODE.TABLET);
  }

  /**
   *  Prepares the request payload for retrieving draft structures.
   * This function sets the status to 'COMPLETED' and orders the results by status in ascending order.
   * @returns GetAdministrativesRequestPayload
   * This function prepares the request payload for retrieving draft structures.
   */
  private prepareRequestForDraft(): GetAdministrativesRequestPayload {
    return {
      status: ['DRAFT']
    } as unknown as GetAdministrativesRequestPayload;
  }

  /**
   * Exports the society data as a CSV file.
   * @private
   */
  private exportSociety(): Observable<StrictHttpResponse<Blob>> {
    const prefixTranslate = 'administrative.columnList.';
    const exportFields: ExportFieldAdministrative[] = LIST_COL_EXPORT_LIST_COMPANY.map(
      (key) =>
        ({
          field: key,
          label: Utility.translate(prefixTranslate + key, this.translateService)
        }) as ExportFieldAdministrative
    );
    const body: GetAdministrativesRequestPayloadExportCsv = {
      ...this.administrativeRequest,
      fieldsToReturn: exportFields,
      languageTranslate: (this.translateService.currentLang?.toUpperCase() ?? 'IT') as 'IT' | 'EN'
    };
    if (this.sortSelected.field !== ('' as AdministrativeFields) && this.sortSelected.direction !== '') {
      body.orderBy = this.sortSelected;
    }
    delete (body as GetAdministrativesRequestPayloadExportCsv).page;
    delete (body as GetAdministrativesRequestPayloadExportCsv).pageSize;
    const exportPayload: PostApiAdministrativeV1Export$Json$Params = {
      body
    };

    return this.administrativeService.postApiAdministrativeV1Export$Json$Response(exportPayload);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private exportCorporate(): Observable<any> {
    const exportPayload: PostApiExportV1ExportCorporates$Params = {
      body: {
        exportFields: [
          {
            field: 'CorporateName',
            label: Utility.translate('administrative.generalData.corporateGroup', this.translateService)
          }
        ]
      }
    };

    return this.exportService.postApiExportV1ExportCorporates$Response(exportPayload);
  }
}

export interface FilterStep {
  id: number;
  step: string;
  fields: { name: string; value: string | undefined }[];
}
