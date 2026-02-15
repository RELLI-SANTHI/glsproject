/* eslint-disable newline-before-return */
import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ContentHeaderComponent } from '../../../common/components/content-header/content-header.component';
import { CommonModule } from '@angular/common';
import { isObject, TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal, NgbModalRef, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { GlsMessagesComponent } from '../../../common/components/gls-messages/gls-messages.component';
import { MessageStatusService } from '../../../common/utilities/services/message/message.service';
import { UserListTableComponent } from './user-list-table/user-list-table.component';
import { ColTableInterface } from '../../../common/models/col-table-interface';
import { ConfirmationDialogData } from '../../../common/models/confirmation-dialog-interface';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { FieldResponse, TemplateModel } from '../../../api/glsNetworkApi/models';
import { TemplateService } from '../../../api/glsNetworkApi/services';
import { VIEW_MODE } from '../../../common/app.constants';
import { ConfirmationDialogComponent } from '../../../common/components/confirmation-dialog/confirmation-dialog/confirmation-dialog.component';
import { GenericService } from '../../../common/utilities/services/generic.service';
import { Utility } from '../../../common/utilities/utility';
import { USER_LIST_COLUMNS, USER_PROFILE_CONSTANTS } from '../constants/user-constants';
import {
  CorporateGroupModel,
  ExportFieldRoleDefinition,
  PagedRoleSearchResponse,
  PagedUserSearchResponse,
  RoleModel,
  UserRequestCsvModel,
  UserRequestModel,
  UserSearchResponseModel
} from '../../../api/glsUserApi/models';
import { SortFiledUserList } from '../../../common/models/sort-filed-user-list';
import { CorporateGroupService, ExportService, RoleService, UsersService } from '../../../api/glsUserApi/services';
import { ResetFilterStructureList } from '../../../common/models/reset-filter-structure-list';
import { PostApiUsersV1$Json$Params } from '../../../api/glsUserApi/fn/users/post-api-users-v-1-json';
import { FUNCTIONALITY, PERMISSION, PROFILE, USER_STATUS } from '../../../common/utilities/constants/profile';
import { PostApiExportV1Export$Params } from '../../../api/glsUserApi/fn/export/post-api-export-v-1-export';
import { PostApiRoleV1Search$Json$Params } from '../../../api/glsUserApi/fn/role/post-api-role-v-1-search-json';
import { MODAL_MD } from '../../../common/utilities/constants/modal-options';
import { UtilityProfile } from '../../../common/utilities/utility-profile';
import { UserProfileService } from '../../../common/utilities/services/profile/user-profile.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgbPaginationModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    GlsMessagesComponent,
    ContentHeaderComponent,
    UserListTableComponent
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit, OnDestroy {
  // MODAL
  dialogData!: ConfirmationDialogData;
  modalRef!: NgbModalRef;
  showWarning = signal(false);
  totalItems = signal(0);
  // start table section
  userList = signal<UserSearchResponseModel[]>([]);
  filterData?: PagedUserSearchResponse;
  currentPage = signal<number>(1);
  totalPages = signal(1);
  pageSize = signal(10);
  filterFields: Record<string, string[]> = {};
  sortSelected: SortFiledUserList = {
    field: 'Profile',
    direction: 'asc'
  };
  columns = signal<ColTableInterface[]>(USER_LIST_COLUMNS);
  rows?: FieldResponse[] | null;
  // filter
  isOpenedFilter = signal(false);
  filterStepper: FilterStep[] = [
    {
      id: 0,
      step: 'start',
      fields: [
        { name: 'Profile', value: undefined },
        { name: 'State', value: undefined },
        { name: 'Buildingtype', value: undefined }
      ]
    }
  ];
  currentFilterStep = 'start';
  userFilterFg!: FormGroup; // Ensure this is accessed as a property
  // export data
  openExportDataModal = false;
  showButtonExport = true;
  showButtonFilter = false;
  typeViewMode: VIEW_MODE | undefined;
  isSmallMobile = signal(false);
  isTablet = signal(false);
  showRotateCard = signal(false);
  stateList = [
    { id: '10', value: 'ACTIVE' },
    { id: '11', value: 'DISABLED' },
    { id: '12', value: 'WIP' }
  ];
  profileList = [
    { id: 'EVA_FIELD', value: 'Field' },
    { id: 'EVA_USER', value: 'User' }
  ];
  buildingTypes: TemplateModel[] = [];
  corporateGroupList!: CorporateGroupModel[];
  roleArray!: RoleModel[];
  userActiveRequest: UserRequestModel & { profileDescription?: string } = {};
  protected readonly messageStatusService = inject(MessageStatusService);
  protected readonly http = inject(HttpClient);
  protected numColFrozen = signal(6);
  private isFilterApplied = false; // Flag to track if filters have been applied
  private readonly translateService = inject(TranslateService);
  private readonly modalService = inject(NgbModal);
  private readonly roleService = inject(RoleService);
  protected readonly userProfileService = inject(UserProfileService);

  constructor(
    private readonly fb: FormBuilder,
    private apiExportService: ExportService,
    private templateService: TemplateService,
    private corporateGroupService: CorporateGroupService,
    private genericService: GenericService,
    private usersService: UsersService
  ) {
    this.userFilterFg = this.fb.group({
      filterType: ['', Validators.required],
      filterValue: ['']
    });
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
   * Initializes the component and sets up the necessary data and forms.
   */
  ngOnInit(): void {
    const isAdmin = UtilityProfile.checkAccessProfile(this.userProfileService, PROFILE.EVA_ADMIN, FUNCTIONALITY.any, PERMISSION.any);
    if (isAdmin) {
      this.profileList.push({ id: '0', value: 'Admin' });
    }
    this.loadInitialData();
    this.setupViewMode();
  }

  /**
   * Cleans up resources when the component is destroyed.
   * - Disconnects the `ResizeObserver`.
   * - Hides any active messages and spinners.
   */
  ngOnDestroy(): void {
    this.messageStatusService.hide();
  }

  /**
   * Reloads the active User list with the provided data.
   * @param userListData  The data to reload the user list with.
   */
  reloadUserList(userListData: PagedUserSearchResponse): void {
    this.userList.set([]);
    if (userListData) {
      this.currentPage.set(userListData.currentPage || 1);
      this.totalPages.set(userListData.totalPages || 1);
      this.pageSize.set(userListData.pageSize || 0);
      this.totalItems.set(userListData.totalItems || 0);
      const userData: UserSearchResponseModel[] = [];
      userData.push(...userListData.users);
      this.userList.set(userData);
      this.filterData = userListData;
    }
  }

  /**
   * Retrieves the list of users based on the provided request payload.
   * @param body The request payload for retrieving users.
   * @returns An observable of the users response.
   */
  retrieveUsers(body: UserRequestModel): Observable<PagedUserSearchResponse> {
    const param: PostApiUsersV1$Json$Params = {
      body
    };

    return this.usersService.postApiUsersV1$Json(param).pipe(
      map((r: PagedUserSearchResponse) => {
        return r; // Return the first element of the array
      })
    );
  }

  /**
   * Handles the page change event and updates the current page.
   * @param page The new page number.
   */
  pageChange(page: number): void {
    this.currentPage.set(page);
    this.userActiveRequest.currentPage = page;
    this.retrieveUsers(this.userActiveRequest).subscribe({
      next: (res: PagedUserSearchResponse) => {
        this.reloadUserList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Filters the user list by the building acronym.
   */
  // eslint-disable-next-line max-lines-per-function
  filterByText(): void {
    const filterType = this.userFilterFg.value.filterType;
    const filterValue = this.userFilterFg.value.filterValue;
    switch (filterType) {
      case 'Name':
        this.userActiveRequest.name = filterValue;
        break;
      case 'Surname':
        this.userActiveRequest.surname = filterValue;
        break;
      case 'State':
        this.userActiveRequest.status = filterValue;
        break;
      case 'NameSurname':
        this.userActiveRequest.name = filterValue;
        break;
      case 'BuildingAcronym':
        this.userActiveRequest.buildingAcronym = filterValue;
        break;
      case 'Username':
        this.userActiveRequest.userName = filterValue;
        break;
      case 'BuildingName':
        this.userActiveRequest.buildingName = filterValue;
        break;
      case 'corporateGroupName':
        this.userActiveRequest.corporateName = filterValue;
        break;
      case 'Role':
        this.userActiveRequest.roleName = filterValue;
        break;
      case 'Profile':
        this.userActiveRequest.profile = filterValue;
        break;
      case 'Email':
        this.userActiveRequest.email = filterValue;
        break;
      default:
        break;
    }
    this.userActiveRequest.currentPage = 1;
    this.retrieveUsers(this.userActiveRequest).subscribe({
      next: (res: PagedUserSearchResponse) => {
        this.reloadUserList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Selects a filter step or navigates to a specific filter step.
   * @param toStep The step to navigate to.
   */
  selectStep(toStep: string) {
    const fromStep = this.currentFilterStep;
    if (fromStep !== 'start') {
      const initialStepIndex = this.filterStepper.findIndex((x) => x.step === 'start');
      const fieldSelectedIndex = this.filterStepper[initialStepIndex]?.fields.findIndex((x) => x.name === fromStep);
      if (fieldSelectedIndex !== undefined && fieldSelectedIndex >= 0) {
        this.filterStepper[initialStepIndex].fields[fieldSelectedIndex].value = toStep;
      }
      this.currentFilterStep = 'start';
    } else {
      this.currentFilterStep = toStep;
    }
  }

  /**
   * Applies the selected filters to the user list.
   */
  // eslint-disable-next-line max-lines-per-function
  applyFilter() {
    this.isFilterApplied = true;
    this.filterStepper[0].fields.forEach((item) => {
      switch (item.name) {
        case 'Profile':
          if (item.value) {
            const profileId = this.profileList.find((x) => x.value.toLowerCase() === (item.value ?? '').toLowerCase())?.id;
            const profileDescription = this.profileList.find((x) => x.id === profileId)?.value;
            if (profileId !== undefined) {
              this.userActiveRequest.profile = profileId as ('EVA_ADMIN' | 'EVA_FIELD' | 'EVA_USER') | null;
              this.userActiveRequest.profileDescription = profileDescription;
            } else {
              this.userActiveRequest.profile = undefined;
            }
          } else {
            this.userActiveRequest.profile = undefined;
          }
          break;
        case 'Buildingtype':
          if (item.value) {
            const buildingTypeId = this.buildingTypes.find((x) => x.templateName === item.value)?.id;
            this.userActiveRequest.buildingType =
              buildingTypeId !== null && buildingTypeId !== undefined ? Number(buildingTypeId) : undefined;
          }
          break;
        case 'State':
          if (item.value) {
            this.userActiveRequest.status = item.value !== null ? String(item.value) : null;
          }
          break;
        default:
          break;
      }
    });

    this.userActiveRequest.currentPage = 1;

    this.retrieveUsers(this.userActiveRequest).subscribe({
      next: (res: PagedUserSearchResponse) => {
        this.reloadUserList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
    this.isOpenedFilter.set(false);
  }

  /**
   * Resets the current filter step to the initial state.
   */
  back() {
    this.currentFilterStep = 'start';
  }

  /**
   * Retrieves the list of filters that have been applied.
   * @returns The list of applied filters.
   */
  showFiltersApplied(): ResetFilterStructureList[] {
    const filter = this.filterStepper[0].fields.filter((x) => x.value !== undefined);

    const addFilter = (name: string, value: string | number | undefined, description?: string) => {
      if ((value !== undefined && value !== null && value !== '') || (description && description !== '')) {
        const existingFilter = filter.find((x) => x.name === name);
        if (!existingFilter) {
          filter.push({ name, value: String(description || value) });
        }
      }
    };

    const p = filter.find((x) => x.name === 'Profile')?.value;

    if (p) {
      this.userActiveRequest.profileDescription = p;
    }

    addFilter(
      'Profile',
      this.userActiveRequest?.profile ? this.profileList.find((x) => x.id === this.userActiveRequest.profile?.toString())?.value : ''
    );
    addFilter('State', this.userActiveRequest?.status ?? '');
    addFilter('BuildingName', this.userActiveRequest?.buildingName ?? '');
    addFilter('BuildingAcronym', this.userActiveRequest?.buildingAcronym ?? '');
    addFilter('Username', this.userActiveRequest?.userName ?? '');
    addFilter('Name', this.userActiveRequest?.name ?? '');
    addFilter('Surname', this.userActiveRequest?.surname ?? '');
    addFilter('CompanyGroup', this.userActiveRequest?.corporateName ?? '');
    addFilter('Role', this.userActiveRequest?.roleName?.toString() ?? '');
    addFilter('Email', this.userActiveRequest?.email ?? '');
    addFilter(
      'Buildingtype',
      this.userActiveRequest?.buildingType ? this.buildingTypes.find((x) => x.id === this.userActiveRequest.buildingType)?.templateName : ''
    );

    return filter;
  }

  /**
   * Opens the export data modal.
   */
  openExportModal() {
    this.openExportDataModal = true;
  }

  /**
   * Closes the export data modal.
   */
  closeExportDataModal() {
    this.openExportDataModal = false;
  }

  /**
   * Opens an error modal with the specified title and error message.
   * @param title - The title of the modal.
   * @param errorMessage - The error message to display.
   */
  openErrorModal(
    title: string,
    errorMessage: string,
    additionalData?: {
      placeHolder: string;
      value: string | number;
    }[]
  ) {
    this.dialogData = {
      title: title,
      content: errorMessage,
      additionalData,
      showCancel: false,
      confirmText: 'ok'
    };
    this.modalRef = this.modalService.open(ConfirmationDialogComponent, MODAL_MD);
    this.modalRef.componentInstance.data = this.dialogData;
    this.modalRef.result.then((result: string) => {
      if (result) {
        //
      }
    });
  }

  /**
   * Retrieves the translation code for a column based on its field.
   * @param field The field of the column.
   * @returns The translation code.
   */
  getColumnTranslationCode(field: unknown | undefined) {
    if (field) {
      return 'userProfile.userList.columnList.' + field;
    } else {
      return 'userProfile.userList.columnList.all';
    }
  }

  // eslint-disable-next-line max-lines-per-function
  exportData() {
    const prefixTranslate = 'userProfile.userList.columnList.';
    const exportData: string[] = [
      'Id',
      'Username',
      'Status',
      'Name',
      'Surname',
      'Email',
      'Profile',
      'CorporateGroupName',
      'RoleName',
      'Structures',
      'Companies'
    ];
    const exportFields: ExportFieldRoleDefinition[] = exportData.map(
      (key) =>
        ({
          field: key,
          label: Utility.translate(prefixTranslate + key, this.translateService)
        }) as ExportFieldRoleDefinition
    );
    const languageUsed = this.translateService.currentLang;
    let orderBy: { field: string; direction: string } | undefined;
    if (this.userActiveRequest.orderBy?.field && this.userActiveRequest.orderBy?.direction) {
      orderBy = {
        field: this.userActiveRequest.orderBy?.field,
        direction: this.userActiveRequest.orderBy?.direction
      };
    }

    const body = {
      ...this.userActiveRequest,
      orderBy,
      exportFields,
      languageTranslate: languageUsed
    } as UserRequestCsvModel;
    delete body.currentPage;
    delete body.pageSize;
    const exportPayload: PostApiExportV1Export$Params = {
      body
    };
    this.apiExportService.postApiExportV1Export$Response(exportPayload).subscribe({
      next: (res) => {
        Utility.handleExportDataResponse(res, USER_PROFILE_CONSTANTS.EXPORT_FILE_NAME_USER);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   *  * Retrieves the list of corporate groups from the API.
   * @returns An observable of the corporate groups.
   * @param field The field to retrieve the translation code for.
   * @returns The translation code for the field.
   */
  getStatusTranslationCode(field: string) {
    if (Object.values(USER_STATUS).includes(field as USER_STATUS)) {
      return 'userProfile.userList.state.' + field.toLowerCase();
    }
    return field;
  }

  /**
   * Retrieves the translation code for a user profile field.
   * @param field The field to retrieve the translation code for.
   * @returns The translation code for the field.
   */
  getTranslationForProfile(field: string) {
    const profile = this.profileList.find((x) => x.value.toLowerCase() === field.toLowerCase());
    if (profile) {
      return 'userProfile.userList.profile.' + profile.value.toLowerCase();
    }
    return field;
  }

  /**
   * Retrieves the filter data (regions, provinces, areas, templates) and loads the filter steps.
   */
  public retrieveFilter(): void {
    // TODO: loader on button
    this.retrieveTemplates().subscribe({
      next: (res) => {
        // response for filters
        this.buildingTypes = res;
        const filters = {
          Profile: this.profileList.map((profile) => profile.value.toLowerCase()),
          State: this.stateList.map((state) => state.value),
          Buildingtype: res.map((template: TemplateModel) => template.templateName)
        };
        this.loadFilterSteps(filters);
        this.showButtonFilter = true;
      },
      error: (err: HttpErrorResponse) => {
        Utility.logErrorForDevEnvironment(err);
        // this.openErrorModal('attention', err.error.error);
      }
    });
  }

  /**
   * Loads the filter steps with the provided filter data.
   * @param filters The filter data to load into the filter steps.
   */
  loadFilterSteps(filters: Record<string, string[]>) {
    this.filterFields = filters;
    Object.entries(filters).forEach((x, i) => {
      const step: FilterStep = {
        id: i + 1,
        step: x[0],
        fields: isObject(x[1]) ? x[1].map((field: string) => ({ name: field, value: field })) : []
      };
      this.filterStepper.push(step);
    });
  }

  /**
   * Retrieves the list of templates from the API or mock data.
   * @returns An observable of the list of templates.
   */
  retrieveTemplates(): Observable<TemplateModel[]> {
    return this.templateService.getApiTemplateV1$Json().pipe(map((res: TemplateModel[]) => res));
  }

  /**
   * Resets a specific filter field and updates the userActiveRequest.
   * @param field The filter field to reset.
   */
  // eslint-disable-next-line max-lines-per-function
  resetFilter(field: ResetFilterStructureList): void {
    switch (field.name) {
      case 'State':
        this.userFilterFg.get('filterValue')?.setValue(null);
        this.userFilterFg.get('filterType')?.setValue('');
        this.userActiveRequest.status = null;
        field.value = undefined;
        break;
      case 'Buildingtype':
        this.userFilterFg.get('filterValue')?.setValue(null);
        this.userFilterFg.get('filterType')?.setValue('');
        this.userActiveRequest.buildingType = null;
        field.value = undefined;
        break;
      case 'Profile':
        this.userFilterFg.get('filterValue')?.setValue(null);
        this.userFilterFg.get('filterType')?.setValue('');
        this.userActiveRequest.profile = null;
        field.value = undefined;
        break;
      case 'CompanyGroup':
        this.userFilterFg.get('filterValue')?.setValue(null);
        this.userFilterFg.get('filterType')?.setValue('');
        this.userActiveRequest.corporateName = null;
        field.value = undefined;
        break;
      case 'NameSurname':
        this.userFilterFg.get('filterValue')?.setValue(null);
        this.userFilterFg.get('filterType')?.setValue('');
        this.userActiveRequest.name = null;
        field.value = undefined;
        break;
      case 'BuildingName':
        this.userFilterFg.get('filterValue')?.setValue(null);
        this.userFilterFg.get('filterType')?.setValue('');
        this.userActiveRequest.buildingName = null;
        field.value = undefined;
        break;
      case 'BuildingAcronym':
        this.userFilterFg.get('filterValue')?.setValue(null);
        this.userFilterFg.get('filterType')?.setValue('');
        this.userActiveRequest.buildingAcronym = null;
        field.value = undefined;
        break;
      case 'Username':
        this.userFilterFg.get('filterValue')?.setValue(null);
        this.userFilterFg.get('filterType')?.setValue('');
        this.userActiveRequest.userName = null;
        field.value = undefined;
        break;
      case 'Role':
        this.userFilterFg.get('filterValue')?.setValue(null);
        this.userFilterFg.get('filterType')?.setValue('');
        this.userActiveRequest.roleName = null;
        field.value = undefined;
        break;
      case 'Name':
        this.userFilterFg.get('filterValue')?.setValue(null);
        this.userFilterFg.get('filterType')?.setValue('');
        this.userActiveRequest.name = null;
        field.value = undefined;
        break;
      case 'Surname':
        this.userFilterFg.get('filterValue')?.setValue(null);
        this.userFilterFg.get('filterType')?.setValue('');
        this.userActiveRequest.surname = null;
        field.value = undefined;
        break;
      case 'Email':
        this.userFilterFg.get('filterValue')?.setValue(null);
        this.userFilterFg.get('filterType')?.setValue('');
        this.userActiveRequest.email = null;
        field.value = undefined;
        break;
      default:
        break;
    }
    this.applyFilter();
  }

  /**
   * Resets the userActiveRequest to its initial state.
   */
  resetUserActiveRequest(): void {
    this.userActiveRequest = {
      currentPage: this.currentPage(),
      pageSize: this.pageSize()
    };
  }

  /**
   * Resets all filters to their default state and updates the userActiveRequest.
   */
  resetFilters() {
    this.currentPage.set(1);
    this.resetUserActiveRequest();

    this.filterStepper[0].fields.forEach((x) => (x.value = undefined));
    this.userFilterFg.get('filterValue')?.setValue(null);
    this.userFilterFg.get('filterType')?.setValue('');
    this.retrieveUsers(this.userActiveRequest).subscribe({
      next: (res: PagedUserSearchResponse) => {
        this.reloadUserList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Retrieves the list of corporate groups from the API.
   * @returns An observable of the corporate groups.
   */
  public getCorporateGroup(): void {
    this.retrieveCorporateGroup().subscribe({
      next: (res: CorporateGroupModel[]) => {
        this.corporateGroupList = res;
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   *  * Retrieves the list of corporate groups from the API.
   * @returns An observable of the corporate groups.
   */
  retrieveCorporateGroup(): Observable<CorporateGroupModel[]> {
    return this.corporateGroupService.getApiCorporategroupV1$Json().pipe(
      map((res: CorporateGroupModel[]) => res) // Extract the first CorporateGroupModel from the array
    );
  }

  /**
   * Retrieves the list of roles from the API.
   * @returns An observable of the roles.
   */
  public getRole(): void {
    this.retrieveRole().subscribe({
      next: (res: PagedRoleSearchResponse) => {
        this.roleArray = res.roles || [];
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   *  * Retrieves the list of roles from the API.
   * @returns An observable of the roles.
   */
  retrieveRole(): Observable<PagedRoleSearchResponse> {
    const param: PostApiRoleV1Search$Json$Params = {
      body: {}
    };

    return this.roleService.postApiRoleV1Search$Json(param).pipe(
      map((res: PagedRoleSearchResponse) => res) // Extract the first RoleModel from the array
    );
  }

  /**
   * Closes the filter modal and resets filter values if filters have not been applied.
   */
  closeFilter() {
    this.isOpenedFilter.set(false);
    if (!this.isFilterApplied) {
      this.filterStepper[0].fields.forEach((x) => {
        x.value = undefined;
      });
      this.currentFilterStep = 'start';
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSort(event: any): void {
    const fieldMapping: Record<string, string> = {
      Profile: 'Profile',
      Username: 'UserName',
      Name: 'Name',
      Surname: 'Surname',
      Role: 'Role',
      Status: 'Status',
      BuildingAcronym: 'BuildingAcronym',
      BuildingName: 'BuildingName',
      Buildingtype: 'BuildingType',
      CorporateGroup: 'CorporateGroup',
      Email: 'Bmail',
      Action: 'Action'
    };

    const prop = event.column.prop as keyof typeof fieldMapping;
    const mappedField = prop === 'NameSurname' ? 'Name' : prop === 'State' ? 'Status' : fieldMapping[prop] || event.column.prop || '';

    this.userActiveRequest.orderBy = {
      field: mappedField || '',
      direction: event.newValue || ''
    };
    this.retrieveUsers(this.userActiveRequest).subscribe({
      next: (res: PagedUserSearchResponse) => {
        this.reloadUserList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Retrieves the list of corporate groups from the API.
   * * @returns An observable of the corporate groups.
   */
  private loadInitialData(): void {
    this.userActiveRequest = {};
    this.userActiveRequest.pageSize = this.pageSize();
    this.userActiveRequest.currentPage = this.currentPage();
    // this.userActiveRequest.orderBy = {
    //   field: 'Name',
    //   direction: 'asc'
    // };
    this.retrieveUsers(this.userActiveRequest).subscribe({
      next: (res: PagedUserSearchResponse) => {
        this.userList.set(res.users || []);
        this.totalItems.set(res.totalItems || 0);
        this.currentPage.set(res.currentPage || 1);
        this.pageSize.set(res.pageSize || 10);
        this.totalPages.set(Math.ceil(this.totalItems() / this.pageSize()));
        this.filterData = res;
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
    this.retrieveFilter();
    this.getCorporateGroup();
    this.getRole();
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

export interface FilterStep {
  id: number;
  step: string;
  fields: { name: string; value: string | undefined }[];
}
