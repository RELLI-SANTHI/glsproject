import { AfterViewInit, Component, ElementRef, inject, input, model, OnDestroy, OnInit, output, ViewChild, viewChild } from '@angular/core';
import { GlsInputDropdownComponent } from '../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { GlsInputComponent } from '../../../../common/form/gls-input/gls-input.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PermissionAssignmentModel, PermissionModel, RoleModel } from '../../../../api/glsUserApi/models';
import { CommonModule } from '@angular/common';
import { DataTableColumnCellDirective, DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { GlsPaginatorComponent } from '../../../../common/components/gls-paginator/gls-paginator.component';
import { ROLE_FILTER_TYPE_LIST } from '../../constants/user-constants';
import { ResetFilterRoleList } from '../../../../common/models/reset-filter-role-list';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../common/utilities/constants/profile';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { UtilityProfile } from '../../../../common/utilities/utility-profile';
import { GenericService } from '../../../../common/utilities/services/generic.service';

import { map, Observable } from 'rxjs';
import { RoleService } from '../../../../api/glsUserApi/services';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { HttpErrorResponse } from '@angular/common/http';
import { AppSpecialBadgeComponent } from '../../../../common/components/app-special-badge/app-special-badge.component';
import { InfoMobileComponent } from '../../../../common/components/info-mobile/info-mobile.component';

@Component({
  selector: 'app-role-list-table',
  standalone: true,
  imports: [
    CommonModule,
    GlsInputDropdownComponent,
    GlsInputComponent,
    TranslateModule,
    GlsPaginatorComponent,
    NgxDatatableModule,
    DatatableComponent,
    DataTableColumnCellDirective,
    ReactiveFormsModule,
    AppSpecialBadgeComponent,
    CommonModule,
    InfoMobileComponent
  ],
  templateUrl: './role-list-table.component.html',
  styleUrl: './role-list-table.component.scss'
})
export class RoleListTableComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('myTable') table!: DatatableComponent;
  roleFilterFg = model.required<FormGroup>();
  roleData = input<RoleModel[]>();
  searchRole = output();
  pageSize = input<number>(0);
  currentPage = input<number>(0);
  totalItems = input<number>(0);
  totalPages = input<number>(0);
  pageChange = output<number>();
  roleCount = input<number>(0); // Initialize roleCount with a default value
  searchByFilter = output();
  resetFilter = output<ResetFilterRoleList>();
  resetFilters = output();
  showFiltersApplied = input<ResetFilterRoleList[]>();
  isSmallMobile = input(); // Input to determine if the view is on a small mobile device
  isTablet = input(); // Input to determine if the view is on a tablet device
  PROFILE = PROFILE;
  FUNCTIONALITY = FUNCTIONALITY;
  PERMISSION = PERMISSION;
  permissonsList: PermissionModel[] = [];
  permissionsOptionsList: {
    id: string;
    value: string;
  }[] = [];
  showRotateCard = input();
  protected readonly filterTypeList = ROLE_FILTER_TYPE_LIST;
  private datatableWrapper = viewChild<ElementRef>('datatableWrapper');
  private resizeObserver!: ResizeObserver;
  private readonly userProfileService = inject(UserProfileService);
  private readonly genericService = inject(GenericService);

  /**
   *  * Constructor for the RoleListTableComponent.
   *  * It initializes the component with the provided router and change detector reference.
   * @param router
   * @param cd
   */
  constructor(private roleService: RoleService) {
    //
  }

  /**
   * Lifecycle hook that is called after the component is initialized.
   * Fetches the list of permissions and populates `permissionsList` and `permissionsOptionsList`.
   */
  ngOnInit(): void {
    const defaultFilterType = this.filterTypeList[0]?.id;
    this.roleFilterFg().get('filterType')?.setValue(defaultFilterType);
    this.getPermissions().subscribe((permissions: PermissionModel[]) => {
      this.permissonsList = permissions;
      this.permissionsOptionsList = permissions.map((permission) => ({
        id: permission.name,
        value: 'userProfile.roleEdit.' + permission.name
      }));
    });
    this.roleFilterFg()
      .get('filterType')
      ?.valueChanges.subscribe(() => {
        this.roleFilterFg().get('filterValue')?.setValue('');
        this.roleFilterFg().get('permissionValue')?.setValue('');
      });
  }

  /**
   * * This method is called after the view has been initialized.
   * * It sets up a ResizeObserver to recalculate the table layout when the wrapper element is resized.
   */
  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.table?.recalculate();
    });

    this.resizeObserver.observe(this.datatableWrapper()?.nativeElement);
  }

  /**
   * * This method is called when the component is destroyed.
   * * It disconnects the ResizeObserver to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  /**
   * TrackBy function for permissions in *ngFor to optimize rendering.
   * Tracks permissions by their unique 'id' property.
   */
  trackByPermissionsId(index: number, item: { id: number }): number {
    return item.id;
  }

  /**
   *  * This method is called when the user clicks on the search button.
   *  * It emits the searchRole event with the current value of the roleFilterFg form group.
   * @param roleId
   */
  goToPermissionEdit(roleId: number) {
    this.roleService.postApiRoleV1IdLock$Response({ id: roleId! }).subscribe({
      next: (response) => {
        if (response.status === 204) {
          UtilityRouting.navigateToRoleEditByRoleId(roleId.toString());
        } else {
          this.genericService.openErrorModal('generic.error.geneic', 'concurrency.lockedRole');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   *  * This method is called when the user clicks on the group tab.
   * * It navigates to the group tab of the role edit page.
   *  * It uses the router to navigate to the specified route with the roleId as a parameter.
   * @param roleId
   */
  goToGroupTab(roleId: number) {
    UtilityRouting.navigateToRoleEditByRoleId(roleId.toString());
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
   *  * This method is called when the user clicks on the search button.
   *  * It emits the searchRole event with the current value of the roleFilterFg form group.
   * @param event
   */
  onDetailToggle(event: Event) {
  }

  /**
   *  * * This method is called when the user clicks on the search button.
   *  * It emits the searchRole event with the current value of the roleFilterFg form group.
   * @param row
   */
  toggleExpandRow(row: RoleModel) {
    this.table.rowDetail.toggleExpandRow(row);
  }

  // function that wraps the function I declared in utilities/utility.ts
  hasAccess(profile: string, functionality: string, permission: string): boolean {
    const visible: boolean = UtilityProfile.checkAccessProfile(this.userProfileService, profile, functionality, permission);

    return visible;
  }

  /**
   *  * This method is used to get the permission name for a specific role.
   *  * It constructs the permission name based on the role's name property.
   * @param role
   * @returns
   */
  getRolePermissionName(role: PermissionAssignmentModel): string {
    const permissionNames = role.name ? 'userProfile.roleEdit.' + role.name : '';

    return permissionNames;
  }

  /**
   *  * This method is used to get the permission value for a specific role.
   *  * It constructs the permission value based on the role's accessType property.
   * @param role
   * @returns
   */
  getpermissionValue(role: PermissionAssignmentModel): string {
    const value = role.accessType === PERMISSION.read ? 'userProfile.roleEdit.readonly' : 'userProfile.roleEdit.readingAndWriting';

    return value;
  }

  /**
   * Fetches the list of permissions from the RoleService and maps them to a simplified format.
   *
   * @returns An observable that emits an array of mapped PermissionModel objects.
   * Each permission object contains:
   * - `id`: The unique identifier of the permission.
   * - `name`: The name of the permission.
   */
  getPermissions(): Observable<PermissionModel[]> {
    return this.roleService.getApiRoleV1Permissions$Json().pipe(
      map((response: PermissionModel[]) => {
        return response.map((permission) => ({
          id: permission.id,
          name: permission.name
        }));
      })
    );
  }

  /**
   * Emits the `searchFilter` event to notify listeners that the filter action based on text has been triggered.
   */
  searchByFilterEmit() {
    this.searchByFilter.emit();
  }

  /**
   * Checks if the given role has any permissions marked as "special".
   *
   * This method iterates over the `permissions` array of the provided `role` object
   * and checks if any permission has the `isSpecial` property set to `true`.
   *
   * @param role - The role object containing a list of permissions.
   * @returns `true` if at least one permission has `isSpecial` set to `true`, otherwise `false`.
   */
  checkIsSpecial(role: RoleModel): boolean {
    return role.permissions?.some((permission) => permission.isSpecial === true) || false;
  }

  /**
   * Determines the row height based on the device type.
   *
   * - For small mobile devices, the row height is set to 90.
   * - For tablet devices, the row height is also set to 90.
   * - For larger screens, the default row height is set to 50.
   *
   * @returns {number} The calculated row height based on the device type.
   */
  getRowHeight() {
    if (this.isSmallMobile()) {
      return 90; // Height for small mobile view
    } else if (this.isTablet()) {
      return 90; // Height for tablet view
    } else {
      return 50; // Default height for larger screens
    }
  }
}
