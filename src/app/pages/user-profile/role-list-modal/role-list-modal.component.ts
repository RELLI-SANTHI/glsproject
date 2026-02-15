import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { GlsInputComponent } from '../../../common/form/gls-input/gls-input.component';
import { GlsInputCheckboxComponent } from '../../../common/form/gls-input-checkbox/gls-input-checkbox.component';
import { map, Observable } from 'rxjs';
import { PagedRoleSearchResponse, PermissionAssignmentModel, RoleModel } from '../../../api/glsUserApi/models';
import { RoleService } from '../../../api/glsUserApi/services';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationDialogData } from '../../../common/models/confirmation-dialog-interface';
import { PostApiRoleV1Search$Json$Params } from '../../../api/glsUserApi/fn/role/post-api-role-v-1-search-json';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../common/utilities/constants/profile';
import { GenericService } from '../../../common/utilities/services/generic.service';
import { VIEW_MODE } from '../../../common/app.constants';
import { AppSpecialBadgeComponent } from '../../../common/components/app-special-badge/app-special-badge.component';
import { UserProfileService } from '../../../common/utilities/services/profile/user-profile.service';
import { UtilityProfile } from '../../../common/utilities/utility-profile';

@Component({
  selector: 'app-role-list-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule, GlsInputComponent, GlsInputCheckboxComponent, AppSpecialBadgeComponent],
  templateUrl: './role-list-modal.component.html',
  styleUrl: './role-list-modal.component.scss'
})
export class RoleListModalComponent implements OnInit {
  @Inject(NgbModal) public data!: RoleModel[];
  roleFormGroup: FormGroup;
  roleData: RoleModel[] = [];
  allRoles: RoleModel[] = [];
  dialogData!: ConfirmationDialogData;
  modalRef!: NgbModalRef;
  selectedRole: RoleModel[] = [];
  existingRoleList: RoleModel[] = []; // Track initial roles passed to modal

  roleCheckboxArray: (RoleModel & {
    isChecked: boolean;
    isDisabled: boolean;
  })[] = [];
  hasSearched = true;
  typeViewMode: VIEW_MODE | undefined;
  isSmallMobile = signal(false);
  isTablet = signal(false);

  private readonly modalService = inject(NgbModal);
  private readonly userProfileService = inject(UserProfileService);

  /**
   *  * The constructor initializes the component with the necessary services and form group.
   * @param activeModal
   * @param fb
   * @param roleService
   */
  constructor(
    private activeModal: NgbActiveModal,
    public fb: FormBuilder,
    private roleService: RoleService,
    private genericService: GenericService
  ) {
    this.roleFormGroup = this.fb.group({
      searchRoleControlName: [null],
      roleName: [null]
    });
  }

  /**
   * * This method is used to get the form control for the search input field.
   * * It returns the form control for the searchRoleControlName field in the roleFormGroup.
   */
  get searchRoleControlName() {
    return this.roleFormGroup.get('searchRoleControlName');
  }

  /**
   * * This method is used to get the form control for the role name input field.
   * * It returns the form control for the roleName field in the roleFormGroup.
   */
  get roleName() {
    return this.roleFormGroup.get('roleName');
  }

  /**
   * Returns true if the search button should be disabled.
   */
  get isSearchDisabled(): boolean {
    // Disable only if input is empty AND last action was a reset
    const value = this.roleFormGroup.get('searchRoleControlName')?.value;

    return (!value || value.trim() === '' || value === null) && this.hasSearched;
  }

  /**
   * * The ngOnInit lifecycle hook is called after the component has been initialized.
   */
  ngOnInit(): void {
    // Store the initial roles for reference (for user-edit to show both lists)
    this.existingRoleList = Array.isArray(this.data) ? JSON.parse(JSON.stringify(this.data)) : [];
    // Initialize selectedRole with the checked roles (deep copy)
    this.selectedRole = Array.isArray(this.data) ? JSON.parse(JSON.stringify(this.data)) : [];
    this.loadInitialRoleData();
    this.setupViewMode();
  }

  /**
   * * This method is used to close the modal without saving any changes.
   * * It will close the modal and return false to indicate that no changes were made.
   */
  closeModal(): void {
    this.activeModal.close(false);
  }

  /**
   * * This method is used to save the selected roles and close the modal.
   * * It will close the modal and return true to indicate that changes were made.
   */
  save(): void {
    this.activeModal.close(this.selectedRole);
  }

  /**
   * * This method is used to search the role based on the input value.
   * * It will filter the roleData array and update the filteredRoleData array.
   */
  setupSearchListener(): void {
    this.roleFormGroup.get('searchRoleControlName')?.valueChanges.subscribe((searchValue: string) => {
      this.filterRoles(searchValue);
    });
  }

  /**
   * * This method is used to search the role based on the input value.
   * * It will filter the roleData array and update the filteredRoleData array.
   */
  searchRole(): void {
    const searchValue = this.roleFormGroup.get('searchRoleControlName')?.value || '';
    if (!searchValue || searchValue.trim() === '') {
      // Reset list if input is empty
      this.roleData = [...this.allRoles];
      this.roleCheckboxFormGroup();
      this.populateRoleCheckboxArray();
      this.hasSearched = true; // Only disable after reset

      return;
    }
    this.filterRoles(searchValue);
    this.hasSearched = false; // Enable after search
  }

  /**
   * * This method is used to load the initial role data from the API.
   * * It retrieves the role data and populates the roleCheckboxArray with the retrieved data.
   */
  public loadInitialRoleData(): void {
    this.retrieveRole().subscribe({
      next: (res: PagedRoleSearchResponse) => {
        this.roleData = res.roles ?? [];
        this.allRoles = [...this.roleData]; // Cache the original data
        this.roleCheckboxFormGroup();
        this.populateRoleCheckboxArray();
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Initializes form controls for each role in the `roleData` array.
   * - Creates a unique control for each role using its ID.
   * - Disables the control if the role's `permissions` array is empty.
   * - Enables the control if the role's `permissions` array is not empty.
   */
  roleCheckboxFormGroup(): void {
    this.roleData.forEach((role) => {
      const controlName = `role_${role.id}`; // Unique control name for each role
      this.roleFormGroup.addControl(controlName, this.fb.control(false)); // Add a control for each role
      if (role.permissions?.length === 0) {
        this.roleFormGroup.get(controlName)?.disable(); // Disable the control if permissions array is empty
      } else {
        // verify if there is at last one permission with isSpecial true
        const hasSpecialPermission = role.permissions?.some((perm) => perm.isSpecial) ?? false;
        // check if user profile is ADMIN
        const isAdmin = UtilityProfile.checkAccessProfile(this.userProfileService, PROFILE.EVA_ADMIN, FUNCTIONALITY.any, PERMISSION.any);
        if (!isAdmin && hasSpecialPermission) {
          this.roleFormGroup.get(controlName)?.disable(); // Enable the control if permissions array is not empty
        } else {
          this.roleFormGroup.get(controlName)?.enable(); // Disable the control if no special permission is found
        }
      }
    });
  }

  /**
   * * Populates the roleCheckboxArray with the role data.
   * * This method maps the roleData array to create an array of objects with id, name, isChecked, and isDisabled properties.
   */
  populateRoleCheckboxArray(): void {
    const selectedData = this.selectedRole ?? [];
    this.roleCheckboxArray = this.roleData.map((role) => {
      // verify if there is at last one permission with isSpecial true
      const hasSpecialPermission = role.permissions?.some((perm) => perm.isSpecial) ?? false;
      // check if user profile is ADMIN
      const isAdmin = UtilityProfile.checkAccessProfile(this.userProfileService, PROFILE.EVA_ADMIN, FUNCTIONALITY.any, PERMISSION.any);

      const roleCheckboxObject = {
        isChecked: false,
        isDisabled: !isAdmin && hasSpecialPermission
      } as RoleModel & {
        isChecked: boolean;
        isDisabled: boolean;
      };
      if (this.selectedRole.length > 0) {
        roleCheckboxObject.isChecked = (role.permissions?.length ?? 0) > 0 ? selectedData.some((item) => item.id === role.id) : false;
        // verify if there is at last one permission with isSpecial true
        const hasSpecialPermission = role.permissions?.some((perm) => perm.isSpecial) ?? false;
        // check if user profile is ADMIN
        const isAdmin = UtilityProfile.checkAccessProfile(this.userProfileService, PROFILE.EVA_ADMIN, FUNCTIONALITY.any, PERMISSION.any);
        roleCheckboxObject.isDisabled = ((role.permissions ?? []).length === 0 || (!isAdmin && hasSpecialPermission)) ?? false;
      }
      const controlName = `role_${role.id}`;
      this.roleFormGroup.get(controlName)?.setValue(roleCheckboxObject.isChecked);
      if (roleCheckboxObject.isDisabled) {
        this.roleFormGroup.get(controlName)?.disable();
      } else {
        this.roleFormGroup.get(controlName)?.enable();
      }

      return {
        ...role,
        ...roleCheckboxObject
      };
    });
    this.enableSaveButton(); // Ensure button state is updated after filtering
  }

  /**
   *  * This method is used to handle the checkbox change event.
   *  * It updates the isChecked property of the corresponding role in the roleCheckboxArray.
   * @param roleId
   * @param checkboxEvent
   */
  onCheckboxChange(roleId: number, checkboxEvent: Event): void {
    const target = checkboxEvent.target as HTMLInputElement;
    const role = this.roleCheckboxArray.find((r) => r.id === roleId);

    // Allow user to check/uncheck any role, including existing ones
    if (role) {
      role.isChecked = target.checked;
      if (target.checked) {
        if (!this.selectedRole.every((r) => r.id === role.id) || this.selectedRole.length === 0) {
          this.selectedRole.push(role);
        }
      } else {
        this.selectedRole = this.selectedRole.filter((r) => r.id !== role.id);
      }
      this.enableSaveButton();
    }
  }

  /**
   *  * This method is used to enable or disable the save button based on the checkbox state.
   *  * It checks if any of the checkboxes in the roleCheckboxArray are checked.
   * @returns boolean
   */
  enableSaveButton(): boolean {
    const enabled = this.selectedRole.length > 0 || this.roleCheckboxArray.find((role) => role.isChecked);

    return !!enabled;
  }

  /**
   *  * This method is used to retrieve the role data from the API.
   *  * It returns an observable of RoleModel array.
   * @returns Observable<RoleModel[]>
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
   *  * This method is used to track the role by its ID.
   *  * It returns the ID of the role to be used as a unique identifier in ngFor loops.
   * @param index
   * @param role
   * @returns
   */
  trackByRoleId(index: number, role: RoleModel): number {
    return role.id;
  }

  /**
   * * This method is used to track the permission by its ID.
   * @param index
   * @param permission
   * @returns
   */
  trackByPermissionsId(index: number, permission: PermissionAssignmentModel): number {
    return permission.id;
  }

  /**
   *  * This method is used to get the permission name for a specific role.
   * * It returns a string indicating the permission name for the role.
   * @param role
   * @returns
   */
  getRolePermissionName(role: PermissionAssignmentModel): string {
    const permissionNames = role.name ? 'userProfile.roleEdit.' + role.name : '';

    return permissionNames;
  }

  /**
   *  * This method is used to get the permission value for a specific role.
   *  * It returns a string indicating whether the role has read-only or read-write access.
   * @param role
   * @returns
   */
  getpermissionValue(role: PermissionAssignmentModel): string {
    const value = role.accessType === PERMISSION.read ? 'userProfile.roleEdit.readonly' : 'userProfile.roleEdit.readingAndWriting';

    return value;
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
   *  * Filters the role data based on the search value.
   *  * This method updates the roleData array to only include roles that match the search value.
   * @param searchValue - The value to search for in the role data.
   */
  private filterRoles(searchValue: string): void {
    const lowerCaseSearchValue = searchValue?.toLowerCase() || '';
    if (!lowerCaseSearchValue) {
      // If search is empty, reset to all roles
      this.roleData = [...this.allRoles];
    } else {
      this.roleData = this.allRoles.filter((role) => (role.name ?? '').toLowerCase().includes(lowerCaseSearchValue));
    }
    // Do not reset the form group, just update checkboxes and array
    this.roleCheckboxFormGroup();
    this.populateRoleCheckboxArray();
  }

  /**
   * * This method checks if the role is special based on its permissions.
   * * It returns true if any permission in the role has isSpecial set to true, otherwise false.
   * @param role - The role to check for special permissions.
   * @returns boolean
   */
  checkIsSpecial(role: RoleModel): boolean {
    return role.permissions?.some((permission) => permission.isSpecial === true) || false;
  }
}
