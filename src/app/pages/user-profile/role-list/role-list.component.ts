import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ContentHeaderComponent } from '../../../common/components/content-header/content-header.component';
import { GenericService } from '../../../common/utilities/services/generic.service';
import { USER_PROFILE_CONSTANTS } from '../constants/user-constants';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleListTableComponent } from './role-list-table/role-list-table.component';
import { map, Observable } from 'rxjs';
import {
  ExportFieldRoleDefinition,
  PagedRoleSearchResponse,
  RoleModel,
  RoleRequestModel
} from '../../../api/glsUserApi/models';
import { ExportService, RoleService } from '../../../api/glsUserApi/services';
import { HttpErrorResponse } from '@angular/common/http';
import { Utility } from '../../../common/utilities/utility';
import { ConfirmationDialogData } from '../../../common/models/confirmation-dialog-interface';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { GlsMessagesComponent } from '../../../common/components/gls-messages/gls-messages.component';
import { MessageStatusService } from '../../../common/utilities/services/message/message.service';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../common/utilities/constants/profile';
import { UserProfileService } from '../../../common/utilities/services/profile/user-profile.service';
import { ResetFilterRoleList } from '../../../common/models/reset-filter-role-list';
import { PostApiRoleV1Search$Json$Params } from '../../../api/glsUserApi/fn/role/post-api-role-v-1-search-json';
import { PostApiExportV1Roles$Params } from '../../../api/glsUserApi/fn/export/post-api-export-v-1-roles';
import { UtilityProfile } from '../../../common/utilities/utility-profile';
import { VIEW_MODE } from '../../../common/app.constants';
import { UtilityRouting } from '../../../common/utilities/utility-routing';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [ContentHeaderComponent, TranslateModule, RoleListTableComponent, CommonModule, GlsMessagesComponent],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss'
})
export class RoleListComponent implements OnInit, OnDestroy {
  roleFilterFg!: FormGroup;
  dialogData!: ConfirmationDialogData;
  modalRef!: NgbModalRef;
  filterTypeList: { value: string }[] = [];
  roleData: RoleModel[] = [];
  totalItems = signal(0);
  currentPage = signal<number>(1);
  totalPages = signal(1);
  pageSize = signal(10);
  roleActiveRequest: RoleRequestModel = {} as RoleRequestModel;
  roleCount!: number;
  isSmallMobile = signal(false);
  typeViewMode: VIEW_MODE | undefined;
  isTablet = signal(false);
  showCrateBtn = signal(false);
  showRotateCard = signal(false);
  private readonly translateService = inject(TranslateService);
  private readonly uerProfileService = inject(UserProfileService);

  /**
   * Constructor for the RoleListComponent.
   * @param genericService - Service for managing generic operations.
   * @param fb - FormBuilder for creating reactive forms.
   * @param roleService - Service for managing role-related API calls.
   * @param messageStatusService
   * @param apiExportService
   */
  constructor(
    private genericService: GenericService,
    private fb: FormBuilder,
    private roleService: RoleService,
    protected messageStatusService: MessageStatusService,
    private apiExportService: ExportService
  ) {
    this.roleFilterFg = this.fb.group({
      filterType: ['', Validators.required],
      filterValue: [''],
      permissionValue: ['']
    });

    this.resetRoleActiveRequest();

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
   * Lifecycle hook that initializes the component by loading initial data.
   */
  ngOnInit() {
    this.loadInitialData();
    this.showCrateBtn.set(UtilityProfile.checkAccessProfile(this.uerProfileService, PROFILE.EVA_ADMIN, FUNCTIONALITY.any, PERMISSION.any));
    this.setupViewMode();
  }

  ngOnDestroy(): void {
    this.messageStatusService.hide();
  }

  /**
   * Loads the initial data for the role list.
   */
  loadInitialData() {
    this.roleActiveRequest.currentPage = this.currentPage();
    this.roleActiveRequest.pageSize = this.pageSize();
    this.retrieveRole(this.roleActiveRequest).subscribe({
      next: (res: PagedRoleSearchResponse) => {
        this.roleData = res.roles || []; // Reset roleData to its original state
        this.roleCount = res.totalItems || 0; // Set roleCount to the total number of items
        this.totalPages.set(Math.ceil(this.totalItems() / this.pageSize()));
        this.currentPage.set(res.currentPage || 1);
        this.totalPages.set(res.totalPages || 1);
        this.pageSize.set(res.pageSize || 0);
        this.totalItems.set(res.totalItems || 0);
        this.populateRoleDropdown(); // Populate the roleCheckboxArray
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Populates the filter dropdown with role names.
   */
  populateRoleDropdown() {
    this.filterTypeList = this.roleData.map((role) => ({ value: role.name }));
  }

  /**
   * Navigates to the role edit page.
   */
  createRole() {
    this.genericService.getPageType(USER_PROFILE_CONSTANTS.EDIT);
    UtilityRouting.navigateToRoleCreate();
  }

  /**
   * Retrieves the list of roles from the API.
   * @returns An observable of the role list.
   */
  retrieveRole(param: RoleRequestModel): Observable<PagedRoleSearchResponse> {
    const payload: PostApiRoleV1Search$Json$Params = {
      body: param
    };

    return this.roleService.postApiRoleV1Search$Json(payload).pipe(map((res: PagedRoleSearchResponse) => res));
  }

  /**
   * Handles page changes for pagination.
   * @param page - The new page number.
   */
  pageChange(page: number): void {
    this.currentPage.set(page);
    // this.structureActiveRequest.page = page;
    this.roleActiveRequest.currentPage = page;
    this.retrieveRole(this.roleActiveRequest).subscribe({
      next: (res: PagedRoleSearchResponse) => {
        this.reloadRoleList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Reloads the role list with the provided data.
   * @param roleList - The new list of roles.
   */
  reloadRoleList(roleList: PagedRoleSearchResponse) {
    this.roleData = [];
    if (roleList) {
      this.totalPages.set(roleList.totalPages || 1);
      this.totalItems.set(roleList.totalItems || 0);
      this.currentPage.set(roleList.currentPage || 1);
      this.totalPages.set(roleList.totalPages || 1);
      this.pageSize.set(roleList.pageSize || 0);
      this.roleData = roleList.roles || [];
      this.roleCount = roleList.totalItems || 0;
    }
  }

  /**
   * Exports the data based on the selected fields and downloads it as a CSV file.
   */

  exportRoleData() {
    const prefixTranslate = 'userProfile.role.field.';
    const exportData: string[] = ['RoleName', 'RoleDescription', 'PermissionDescription', 'PermissionAccessType'];
    const exportFields: ExportFieldRoleDefinition[] = exportData.map(
      (key) =>
        ({
          field: key,
          label: Utility.translate(prefixTranslate + key, this.translateService)
        }) as ExportFieldRoleDefinition
    );
    const languageUsed = this.translateService.currentLang;

    const param: PostApiExportV1Roles$Params = {
      body: {
        roleFilter: {
          name: this.roleActiveRequest.roleFilter?.name
        },
        permissionFilter: {
          name: this.roleActiveRequest.permissionFilter?.name
        },
        exportFields,
        languageTranslate: (languageUsed.toUpperCase() ?? 'IT') as 'EN' | 'IT' | null | undefined
      }
    };
    this.apiExportService.postApiExportV1Roles$Response(param).subscribe({
      next: (res) => {
        Utility.handleExportDataResponse(res, USER_PROFILE_CONSTANTS.EXPORT_FILE_NAME_ROLE);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Filters the role list by the dropdown value and its corresponding text input value.
   */

  filterByText() {
    const filterType = this.roleFilterFg.value.filterType;
    const filterValue = this.roleFilterFg.value.filterValue;
    // const permissionValue = this.roleFilterFg.value.permissionValue;
    if (filterType === 'Role') {
      this.roleActiveRequest.roleFilter = { name: filterValue || '' };
    } else if (filterType === 'Permission') {
      this.roleActiveRequest.permissionFilter = { description: filterValue || '' };
    }
    this.currentPage.set(1);
    this.roleActiveRequest.currentPage = 1;
    this.retrieveRole(this.roleActiveRequest).subscribe({
      next: (res) => {
        this.reloadRoleList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Retrieves the list of filters that have been applied.
   * @returns The list of applied filters.
   */
  showFiltersApplied(): ResetFilterRoleList[] {
    const filter = [];
    if (this.roleActiveRequest.roleFilter?.name && this.roleActiveRequest.roleFilter?.name !== '') {
      filter.push({ name: 'role', value: this.roleActiveRequest.roleFilter.name });
    }

    if (this.roleActiveRequest.permissionFilter?.description && this.roleActiveRequest.permissionFilter?.description !== '') {
      filter.push({ name: 'permission', value: this.roleActiveRequest.permissionFilter.description });
    }
    if (this.roleActiveRequest.permissionFilter?.name && this.roleActiveRequest.permissionFilter?.name !== '') {
      filter.push({
        name: 'permission',
        value: 'userProfile.roleEdit.' + this.roleActiveRequest.permissionFilter.name
      });
    }

    return filter;
  }

  /**
   * Resets the roleActiveRequest object to its default state.
   */
  resetRoleActiveRequest(): void {
    this.roleActiveRequest = {
      currentPage: this.currentPage(),
      pageSize: this.pageSize()
    };
    this.roleActiveRequest.languageTranslate = this.getLanguageTranslate();
  }

  /**
   * Resets a specific filter field and updates the roleActiveRequest.
   * @param field The filter field to reset.
   */
  resetFilter(field: ResetFilterRoleList) {
    switch (field.name) {
      case 'role':
        this.roleFilterFg.get('filterValue')?.setValue(null);
        this.roleFilterFg.get('filterType')?.setValue('');
        this.roleActiveRequest.roleFilter = undefined;
        break;
      case 'permission':
        this.roleFilterFg.get('filterValue')?.setValue(null);
        this.roleFilterFg.get('filterType')?.setValue('');
        this.roleFilterFg.get('permissionValue')?.setValue('');
        this.roleActiveRequest.permissionFilter = undefined;
        break;

      default:
        break;
    }
    this.roleActiveRequest.languageTranslate = this.getLanguageTranslate();
    this.retrieveRole(this.roleActiveRequest).subscribe({
      next: (res) => {
        this.reloadRoleList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Resets all filters to their default state and updates the roleActiveRequest.
   */
  resetFilters() {
    this.resetRoleActiveRequest();
    this.roleFilterFg.get('filterValue')?.setValue(null);
    this.roleFilterFg.get('filterType')?.setValue('');
    this.roleFilterFg.get('permissionValue')?.setValue('');
    this.retrieveRole(this.roleActiveRequest).subscribe({
      next: (res) => {
        this.reloadRoleList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
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

  /**
   *  Helper to get the languageTranslate value based on the current language.
   *  This method checks the current language and returns 'EN' or 'IT' if
   * @returns Returns the languageTranslate value based on the current language.
   */
  private getLanguageTranslate(): 'EN' | 'IT' | null | undefined {
    const lang = this.translateService.currentLang?.toLocaleUpperCase();
    if (lang === 'EN' || lang === 'IT') {
      return lang as 'EN' | 'IT';
    }

    return undefined;
  }
}
