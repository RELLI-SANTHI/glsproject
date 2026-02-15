/* eslint-disable space-before-blocks */
import { NgClass, SlicePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  output,
  viewChild
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DataTableColumnCellDirective, DatatableComponent, NgxDatatableModule, SortEvent } from '@swimlane/ngx-datatable';
import { GlsPaginatorComponent } from '../../../../common/components/gls-paginator/gls-paginator.component';
import { InfoMobileComponent } from '../../../../common/components/info-mobile/info-mobile.component';
import { GlsInputDropdownComponent } from '../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { GlsInputComponent } from '../../../../common/form/gls-input/gls-input.component';
import { ColTableInterface } from '../../../../common/models/col-table-interface';
import { ResetFilterStructureList } from '../../../../common/models/reset-filter-structure-list';
import { UserSearchResponseModel } from '../../../../api/glsUserApi/models';
import { SortFiledUserList } from '../../../../common/models/sort-filed-user-list';
import { USER_FILTER_TYPE_LIST } from '../../constants/user-constants';
import { PROFILE } from '../../../../common/utilities/constants/profile';
import { Utility } from '../../../../common/utilities/utility';
import { UsersService } from '../../../../api/glsUserApi/services';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user-list-table',
  standalone: true,
  imports: [
    DataTableColumnCellDirective,
    TranslatePipe,
    ReactiveFormsModule,
    NgClass,
    NgxDatatableModule,
    InfoMobileComponent,
    GlsPaginatorComponent,
    SlicePipe,
    GlsInputDropdownComponent,
    GlsInputComponent
  ],
  templateUrl: './user-list-table.component.html',
  styleUrl: './user-list-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListTableComponent implements AfterViewInit, OnDestroy, OnInit {
  showButtonFilter = input(false);
  isSmallMobile = input();
  isTablet = input();
  showFiltersApplied = input<ResetFilterStructureList[]>();
  showRotateCard = input();
  pageSize = input<number>(0);
  userList = input.required<UserSearchResponseModel[]>();
  columns = input.required<ColTableInterface[]>();
  numColFrozen = input(6);
  sortSelected = input<SortFiledUserList>();
  currentPage = input<number>(0);
  totalItems = input<number>(0);
  totalPages = input<number>(0);
  showWarning = input<boolean>(false);
  isOpenedFilter = model();
  userFilterFg = model.required<FormGroup>();
  filterByAcronym = output();
  resetFilter = output<ResetFilterStructureList>();
  resetFilters = output();
  sort = output<SortEvent>();
  pageChange = output<number>();
  profileList = PROFILE;
  protected readonly filterTypeList = USER_FILTER_TYPE_LIST;
  private table = viewChild<DatatableComponent>('table');
  private datatableWrapper = viewChild<ElementRef>('datatableWrapper');
  private resizeObserver!: ResizeObserver;
  private readonly translateService = inject(TranslateService);
  private readonly userService = inject(UsersService);
  private readonly genericService = inject(GenericService);

  ngOnInit() {
    const defaultFilterType = this.filterTypeList[0]?.id;
    this.userFilterFg().get('filterType')?.setValue(defaultFilterType);
  }

  /**
   * Lifecycle hook that is called after the component's view has been initialized.
   * Sets up a `ResizeObserver` to monitor changes in the size of the datatable wrapper
   * and recalculates the table layout when a resize is detected.
   */
  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.table()?.recalculate();
    });

    this.resizeObserver.observe(this.datatableWrapper()?.nativeElement);
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   */
  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
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

  /**
   * Retrieves the translation code for a status field only.
   * @param field The field to translate.
   * @returns The translation
   * */
  getStatusTranslationCode(field: string) {
    if (['ACTIVE', 'WIP', 'DISABLED'].includes(field)) {
      return 'userProfile.userList.state.' + field.toLowerCase();
    }

    return field;
  }

  /**
   * Translates a label and truncates it if it exceeds 30 characters.
   * @param label The label to translate.
   * @returns The translated and truncated label.
   */
  getTranslatedLabel(label: string): string {
    const translated = Utility.translate(label, this.translateService);

    return Utility.sliceOverX(translated, 30);
  }

  /**
   * Determines the row type based on the field name.
   * @param field The field name.
   * @returns The row type (e.g., 'status', 'date', 'link', or 'string').
   */
  showRowType(field: string): string {
    return field === 'State'
      ? 'State'
      : field === 'NameSurname'
        ? 'link'
        : field === 'Email'
          ? 'Email'
          : field === 'Action'
            ? 'Action'
            : field === 'corporateGroupName'
              ? 'CorporateGroup'
              : field === 'incomingCorporateGroup'
                ? 'CorporateGroupAD'
                : field === 'Profile'
                  ? 'Profile'
                  : 'string';
  }

  /**
   *  Retrieves the translation code for a given field.
   * @param userListData The userListData to evaluate.
   * @returns The translated profile label.
   */
  isUserProfile(userListData: UserSearchResponseModel): string {
    const userProfileValue = userListData.profile ?? null;
    if (userProfileValue === PROFILE.EVA_ADMIN) {
      return 'Admin';
    } else if (userProfileValue === PROFILE.EVA_FIELD) {
      return 'Field';
    } else if (userProfileValue === PROFILE.EVA_USER) {
      return 'User';
    } else {
      return '--';
    }
  }

  /**
   * Retrieves the profile value for a given userListData.
   * @param value The userListData to evaluate.
   * @returns The profile value of the userListData.
   */
  getProfileValue(value: UserSearchResponseModel): 'EVA_ADMIN' | 'EVA_FIELD' | 'EVA_USER' | null {
    return value?.profile ?? null;
  }

  /**
   * Retrieves the status icon for a given user based on its warning and status fields.
   * @param userData The userData to evaluate.
   * @returns The CSS class for the status icon.
   */
  getStatusIcon(userData: UserSearchResponseModel): string {
    const status: 'ACTIVE' | 'WIP' | 'DISABLED' = this.getStatus(userData);
    if (status === 'ACTIVE') {
      return '../../../../assets/img/user-profile/active.svg';
    } else if (status === 'DISABLED') {
      return '../../../../assets/img/user-profile/inactive.svg';
    } else if (status === 'WIP') {
      return '../../../../assets/img/user-profile/wip.svg';
    } else {
      return '';
    }
  }

  /**
   * @param userStatus The userStatus to evaluate.
   * @returns The status of the user as 'ACTIVE', 'DISABLED', or 'WIP'.
   */
  getStatus(userStatus: UserSearchResponseModel): 'ACTIVE' | 'WIP' | 'DISABLED' {
    return userStatus.status as 'ACTIVE' | 'WIP' | 'DISABLED';
  }

  /**
   *  get the status of the user as 'ACTIVE', 'DISABLED', or 'WIP'.
   * @param userData The userData to evaluate.
   * @returns The CSS class for the status.
   */
  getStateClass(userData: UserSearchResponseModel): string {
    const status: 'ACTIVE' | 'WIP' | 'DISABLED' = this.getStatus(userData);
    if (status === 'ACTIVE') {
      return 'text-success';
    } else if (status === 'DISABLED') {
      return 'text-disabled';
    } else if (status === 'WIP') {
      return 'disabled';
    } else {
      return '';
    }
  }

  /**
   *  Retrieves the translation key for the status label based on the user's status.
   * @param userData The userData to evaluate.
   * @returns The translation key for the status label.
   */
  getStatesLabel(userData: UserSearchResponseModel): string {
    const status: 'ACTIVE' | 'WIP' | 'DISABLED' = this.getStatus(userData);

    return 'userProfile.userList.state.' + status.toLowerCase();
  }

  /**
   *  Retrieves the name of the userListData or '--' if not available.
   * @param userListData The userListData to evaluate.
   * @returns The name of the userListData or '--' if not available.
   */
  getLinkValue(userListData: UserSearchResponseModel): string {
    return userListData?.name || userListData?.surname ? `${userListData?.name ?? ''} ${userListData?.surname ?? ''}`.trim() : '--';
  }

  /**
   *  Retrieves the translation key for the action label based on the user's status.
   * @param actionData The actionData to evaluate.
   * @returns The translation key for the action label based on the user's status.
   */
  getActionLabel(actionData: UserSearchResponseModel): string {
    const status: 'ACTIVE' | 'WIP' | 'DISABLED' = this.getStatus(actionData);
    if (status === 'ACTIVE') {
      return '-';
    } else if (status === 'DISABLED') {
      return '-';
    } else if (status === 'WIP') {
      return 'userProfile.userList.action.wip';
    } else {
      return '';
    }
  }

  /**
   *  Retrieves the icon class for the action based on the user's status.
   * @param userData The userData to evaluate.
   * @returns The icon class for the action based on the user's status.
   */
  getActionIcon(userData: UserSearchResponseModel): string {
    const status: 'ACTIVE' | 'WIP' | 'DISABLED' = this.getStatus(userData);
    if (status === 'ACTIVE') {
      return 'bi-person-badge';
    } else if (status === 'DISABLED') {
      return 'bi-power';
    } else if (status === 'WIP') {
      return 'bi-person-badge';
    } else {
      return '';
    }
  }

  /**
   *  Retrieves the email value for a given userListData or '--' if not available.
   * @param userListData The userListData to evaluate.
   * @returns The email value of the userListData or '--' if not available.
   */
  getEmailValue(userListData: UserSearchResponseModel): string {
    return userListData.email || '--';
  }

  /**
   * Determines whether a column should be visible based on its key.
   * @param key The key of the column.
   * @returns True if the column is visible, false otherwise.
   */
  showColumn(key: string) {
    const col = this.columns().find((x: ColTableInterface) => x.field === key);

    return col ? col.columnVisible : false;
  }

  /**
   *  Retrieves the corporate group name for a given userListData or '--' if not available.
   * @param userListData The userListData to evaluate.
   * @returns The corporate group name of the userListData or '--' if not available.
   */
  getCorporateGroup(userListData: UserSearchResponseModel): string {
    return userListData.corporateGroupName || '--';
  }

  /**
   *  Retrieves the incoming corporate group for a given userListData or '--' if not available.
   * @param userListData The userListData to evaluate.
   * @returns The incormingCorporateGroup of the userListData or '--' if not available.
   */

  getCorporateGroupAD(userListData: UserSearchResponseModel): string {
    return userListData.incomingCorporateGroup || '--';
  }

  /**
   * Navigates to the user detail page for a specific user.
   * @param userId The ID of the user.
   */
  goToUserDetail(userId: number): void {
    UtilityRouting.navigateToUserDetailByUserId(userId.toString());
  }

  /**
   * Calculates the first result index for the current page.
   * @returns The first result index.
   */
  getFirstResult(): number {
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  /**
   * Calculates the last result index for the current page.
   * @returns The last result index.
   */
  getLastResult(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  }

  /**
   * Navigates to the user edit page for a specific user.
   */
  goToUserEdit(userId: number): void {
    this.userService.postApiUsersV1IdLock$Response({ id: userId! }).subscribe({
      next: (response) => {
        if (response.status === 204) {
          UtilityRouting.navigateToUserEditByUserId(userId.toString());
        } else {
          this.genericService.openErrorModal('generic.error.generic', 'concurrency.lockedUser');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Emits the `filterByAcronym` event to notify listeners that the filter action based on acronym has been triggered.
   */
  filterByAcronymEmit(): void {
    this.filterByAcronym.emit();
  }
}
