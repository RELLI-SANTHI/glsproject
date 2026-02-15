import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  input,
  model,
  OnDestroy,
  Output,
  output,
  viewChild
} from '@angular/core';
import { ColTableInterface } from '../../../../../common/models/col-table-interface';
import { DataTableColumnCellDirective, DatatableComponent, NgxDatatableModule, SortEvent } from '@swimlane/ngx-datatable';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AdministrativeOrderBy, CompanyDetailResponse } from '../../../../../api/glsAdministrativeApi/models';
import { Utility } from '../../../../../common/utilities/utility';
import { CommonModule, NgClass, SlicePipe } from '@angular/common';
import { GlsPaginatorComponent } from '../../../../../common/components/gls-paginator/gls-paginator.component';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../../common/utilities/constants/profile';
import { UtilityProfile } from '../../../../../common/utilities/utility-profile';
import { UserProfileService } from '../../../../../common/utilities/services/profile/user-profile.service';
import { Router } from '@angular/router';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ADMINISTRATIVE_COMPANY_BUTTONS, SOCIETY_FILTER_TYPE_LIST } from '../../../constants/administrative-constant';
import { AppliedFilterComponent } from '../../../../../common/components/applied-filter/applied-filter.component';
import { ResetCommonFilterList } from '../../../../../common/models/reset-filter-list';
import { GlsInputDropdownComponent } from '../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { UtilityRouting } from '../../../../../common/utilities/utility-routing';

@Component({
  selector: 'app-company-list-table',
  standalone: true,
  imports: [
    CommonModule,
    DataTableColumnCellDirective,
    TranslatePipe,
    NgClass,
    NgxDatatableModule,
    GlsPaginatorComponent,
    GlsInputDropdownComponent,
    GlsInputComponent,
    SlicePipe,
    AppliedFilterComponent,
    ReactiveFormsModule
  ],
  templateUrl: './company-list-table.component.html',
  styleUrl: './company-list-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyListTableComponent implements AfterViewInit, OnDestroy {
  PROFILE = PROFILE;
  FUNCTIONALITY = FUNCTIONALITY;
  PERMISSION = PERMISSION;
  columns = input.required<ColTableInterface[]>();
  filteredColumns: ColTableInterface[] = [];
  showRotateCard = input();
  pageSize = input<number>(0);
  administrativeCompanyList = input.required<CompanyDetailResponse[]>();
  sortSelected = input<AdministrativeOrderBy>();
  showFiltersApplied = input<ResetCommonFilterList[]>();
  filterApplied = output();
  resetFilter = output<ResetCommonFilterList>();
  resetFilters = output();
  currentPage = input<number>(0);
  totalItems = input<number>(0);
  totalPages = input<number>(0);
  showWarning = input<boolean>(false);
  companyType = input<string>('');
  isSmallMobile = input();
  sort = output<SortEvent>();
  pageChange = output<number>();
  groupId = input<number | undefined>(undefined);
  @Output() enabled = new EventEmitter<{ buttonType: string; companyType: string }>();
  societyFilterFg = model.required<FormGroup>();
  selectedButton = ADMINISTRATIVE_COMPANY_BUTTONS.SOCIETY;
  protected readonly societyFilterTypeList = SOCIETY_FILTER_TYPE_LIST;
  protected readonly administrativeCompanyButtons = ADMINISTRATIVE_COMPANY_BUTTONS;
  private companyListTable = viewChild<DatatableComponent>('companyListTable');
  private companyDataTableWrapper = viewChild<ElementRef>('companyDataTableWrapper');
  private resizeObserver!: ResizeObserver;
  private readonly translateService = inject(TranslateService);
  private readonly userProfileService = inject(UserProfileService);
  private readonly router = inject(Router);

  constructor() {
    // Initialization logic can go here if needed
  }

  /**
   * Handles the sort event for the company list table.
   * @param sortEvent - The sort event containing the column and direction.
   * * This method updates the `sortSelected` input with the new sorting criteria.
   * * @returns void
   * */
  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.companyListTable()?.recalculate();
    });

    this.resizeObserver.observe(this.companyDataTableWrapper()?.nativeElement);
  }
  /**
   * Handles the sort event for the company list table.
   * @param sortEvent - The sort event containing the column and direction.
   * This method updates the `sortSelected` input with the new sorting criteria.
   * @returns void
   * */
  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
  /**
   * Handles the sort event for the company list table.
   * @param sortEvent - The sort event containing the column and direction.
   * This method updates the `sortSelected` input with the new sorting criteria.
   * @return void
   * */
  getTranslatedLabel(label: string): string {
    const translated = Utility.translate(label, this.translateService);

    return Utility.sliceOverX(translated, 30);
  }
  /**
   * Handles the sort event for the company list table.
   *  @param sortEvent - The sort event containing the column and direction.
   *  This method updates the `sortSelected` input with the new sorting criteria.
   * @return void
   * */
  goToCompanyDetail(id: number): void {
    UtilityRouting.navigateToSocietyDetailById(id);
  }
  /**
   * Handles the sort event for the company list table.
   * @param sortEvent - The sort event containing the column and direction.
   * This method updates the `sortSelected` input with the new sorting criteria.
   * @return void
   * */
  goToCoporateGroupView(id: string): void {
    UtilityRouting.navigateToCarporateGroupDetail(id);
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
   * Handles the sort event for the company list table.
   * @param sortEvent - The sort event containing the column and direction.
   *  This method updates the `sortSelected` input with the new sorting criteria.
   * @return void
   * */
  getStatusImg(data: CompanyDetailResponse): string {
    if (data.status?.toLowerCase() === 'completed') {
      return '../../../../assets/img/administrative/active.svg';
    } else {
      return '../../../../assets/img/administrative/disabled.svg';
    }
  }
  /**
   * Handles the sort event for the company list table.
   *  @param sortEvent - The sort event containing the column and direction.
   * This method updates the `sortSelected` input with the new sorting criteria.
   * @return void
   * */
  getCompanyName(data: CompanyDetailResponse): string {
    return data.name || '--';
  }
  /**
   * Handles the sort event for the company list table.
   * @param sortEvent - The sort event containing the column and direction.
   * This method updates the `sortSelected` input with the new sorting criteria.
   * @return void
   * */
  getGroupname(data: CompanyDetailResponse): string {
    return data?.corporateGroupName || '--';
  }
  /**
   * Retrieves the VAT number from the company detail response.
   * @param data - The company detail response object.
   * @return The VAT number if available, otherwise returns '--'.
   * */
  getVatNumber(data: CompanyDetailResponse): number | string {
    return data?.vatNumber || '--';
  }
  /**
   * Retrieves the tax ID code from the company detail response.
   * @param data - The company detail response object.
   * @return The tax ID code if available, otherwise returns '--'.
   * */
  getTaxIDCode(data: CompanyDetailResponse): number | string {
    return data?.taxCode || '--';
  }
  /**
   * Checks if the user has access to a specific profile, functionality, and permission.
   * @param profile - The profile to check access for.
   * @param functionality - The functionality to check access for.
   * @param permission - The permission to check access for.
   * @return {boolean} - Returns true if the user has access, otherwise false.
   * */
  hasAccess(profile: string, functionality: string, permission: string): boolean {
    const visible: boolean = UtilityProfile.checkAccessProfile(this.userProfileService, profile, functionality, permission);

    return visible;
  }
  /**
   * Handles the sort event for the company list table.
   * @param sortEvent - The sort event containing the column and direction.
   *  This method updates the `sortSelected` input with the new sorting criteria.
   * @return void
   * */
  selectButton(button: string): void {
    this.selectedButton = button;
    const object = {
      buttonType: button,
      companyType: ''
    };
    this.enabled.emit(object);
  }

  /**
   * Emits the `filterApplied` event to notify listeners that the filter action based on text has been triggered.
   */
  filterAppliedEmit(): void {
    this.filterApplied.emit();
  }
  /**
   * Retrieves the list of society filter types based on the user's access profile and group ID.
   * @returns {any[]} - An array of society filter types.
   * This method checks if the user has access to the EVA_ADMIN profile and the networkAdministrativeCompany functionality.
   * If the user has access and a group ID is provided, it excludes the "CarporateGroup" option from the list.
   * If no group ID is provided, it includes all options, including "CarporateGroup".
   * If the user does not have access, it excludes the "CarporateGroup" option from the list.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFilteredSocietyFilterTypeList(): any[] {
    // Check if the user has access to the EVA_ADMIN profile and the networkAdministrativeCompany functionality
    if (this.hasAccess(PROFILE.EVA_ADMIN, FUNCTIONALITY.networkAdministrativeCompany, PERMISSION.any)) {
      if (this.groupId() && this.groupId() !== undefined) {
        // If a group ID is provided, Exclude "CarporateGroup" in the list
        return SOCIETY_FILTER_TYPE_LIST.filter((option) => option.id !== 'CarporateGroup'); // Exclude "CarporateGroup"
      } else {
        return SOCIETY_FILTER_TYPE_LIST; // Include all options, including "CarporateGroup"
      }
    }

    return SOCIETY_FILTER_TYPE_LIST.filter((option) => option.id !== 'CarporateGroup'); // Exclude "CarporateGroup"
  }
}
