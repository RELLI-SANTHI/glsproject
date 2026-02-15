/* eslint-disable max-lines-per-function */
import { Component, EventEmitter, Input, input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableColumnCellDirective, DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PermissionAssignmentModel, PermissionModel, RoleModel } from '../../../api/glsUserApi/models';
import { forkJoin, map, Observable } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RoleService } from '../../../api/glsUserApi/services';
import { GlsInputCheckboxComponent } from '../../../common/form/gls-input-checkbox/gls-input-checkbox.component';
import { GetApiRoleV1Id$Json$Params } from '../../../api/glsUserApi/fn/role/get-api-role-v-1-id-json';
import { PERMISSION } from '../../../common/utilities/constants/profile';
import { USER_PROFILE_CONSTANTS } from '../constants/user-constants';
import { AppSpecialBadgeComponent } from '../../../common/components/app-special-badge/app-special-badge.component';

@Component({
  selector: 'app-role-edit-table',
  standalone: true,
  imports: [
    NgxDatatableModule,
    DataTableColumnCellDirective,
    DatatableComponent,
    TranslateModule,
    GlsInputCheckboxComponent,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    AppSpecialBadgeComponent
  ],
  templateUrl: './role-edit-table.component.html',
  styleUrl: './role-edit-table.component.scss'
})
export class RoleEditTableComponent implements OnInit {
  featureFormGroup!: FormGroup;

  featureList: (PermissionAssignmentModel & {
    isChecked: boolean;
  })[] = [];
  currentRoleData: RoleModel | null = null;
  checkedCount = 0; // Add a property to store the count
  idUser = input<number>(0);
  @Output() roleListUpdated = new EventEmitter<RoleModel>();
  @Output() getRoleName = new EventEmitter<string>(); // Output event to emit updated featureList
  @Input() type!: string; // Input property to receive the type
  permissionList: PermissionModel[] = [];
  createdRoleData: RoleModel | null = null; // Property to hold the updated role data
  selectedCheckboxId: number | null = null; // Property to hold the selected checkbox ID
  @Input() isSmallMobile = false;
  @Input() isTablet = false;

  /**
   * Constructor for the RoleEditTableComponent.
   * @param roleService - Service for managing role-related API calls.
   * @param fb - FormBuilder for creating reactive forms.
   */
  constructor(
    private roleService: RoleService,
    private fb: FormBuilder
  ) {
    //
  }

  /**
   * Lifecycle hook that initializes the component.
   * Fetches the list of permissions and role details for the role.
   */
  ngOnInit() {
    if (this.idUser()) {
      // Fetch role details and permissions
      forkJoin({
        roleDetails: this.getFeatures(),
        allPermissions: this.getPermissions()
      }).subscribe(({ roleDetails, allPermissions }) => {
        // Match permissions by name and merge details
        this.featureList = allPermissions.map((permission) => {
          const matchedPermission = roleDetails.find((rolePermission) => rolePermission.name === permission.name);

          return {
            id: permission.id,
            name: permission.name,
            description: permission.description,
            accessType: matchedPermission ? matchedPermission.accessType : null,
            isChecked: matchedPermission ? true : false, // Set isChecked based on whether the permission exists in roleDetails
            isSpecial: permission.isSpecial || false
          } as PermissionAssignmentModel & { isChecked: boolean };
        });
        this.initializeFormGroup();
        this.getCheckedCount(); // Initialize the count
      });
    } else {
      this.getPermissions().subscribe((res) => {
        this.permissionList = res;
        this.featureList = this.permissionList.map((permission) => ({
          id: permission.id,
          name: permission.name,
          description: permission.description,
          accessType: PERMISSION.read, // Default accessType to 0
          isChecked: false, // Initialize isChecked to false
          isSpecial: permission.isSpecial || false
        }));
        this.initializeFormGroup();
        this.getCheckedCount(); // Initialize the count
      });
    }
    this.initializeCreatedRoleData(); // Initialize updatedRoleData
  }

  /**
   * Initializes the form group with controls for each feature.
   * Adds controls for read and write permissions and enables them based on the access type.
   */
  initializeFormGroup() {
    this.featureFormGroup = this.fb.group({});
    this.featureList.forEach((feature) => {
      // Add checkbox control for the feature
      if (feature?.description) {
        this.featureFormGroup.addControl(feature.description, this.fb.control(false));
      }
      // Add controls for read and write permissions
      this.featureFormGroup.addControl(`read_${feature.id}`, this.fb.control({ value: false, disabled: true })); // Read permission
      this.featureFormGroup.addControl(`write_${feature.id}`, this.fb.control({ value: false, disabled: true })); // Write permission

      if ((feature.accessType === PERMISSION.read || feature.accessType === PERMISSION.write) && this.idUser() !== undefined) {
        const readControl = this.featureFormGroup.get(`read_${feature.id}`);
        const writeControl = this.featureFormGroup.get(`write_${feature.id}`);
        readControl?.enable();
        writeControl?.enable();

        if (feature.accessType === PERMISSION.read && readControl) {
          readControl?.setValue(PERMISSION.read);
        }
        if (feature.accessType === PERMISSION.write && writeControl) {
          writeControl?.setValue(PERMISSION.write);
        }
      }
    });
  }

  /**
   * Returns the column configuration for the datatable.
   * @returns An array of column configurations.
   */
  columns() {
    return [{ prop: 'description', name: 'Funzionalità da includere', flexGrow: 1 }];
  }

  /**
   * Fetches the list of permissions for the role.
   * @returns An observable of the list of permissions.
   */
  getFeatures(): Observable<PermissionAssignmentModel[]> {
    const param: GetApiRoleV1Id$Json$Params = {
      id: this.idUser()
    };

    return this.roleService.getApiRoleV1Id$Json(param).pipe(
      map((res: RoleModel) => {
        this.getRoleName.emit(res.name); // Emit the role name to the parent component
        this.currentRoleData = res;
        if (this.type === USER_PROFILE_CONSTANTS.CREATE) {
          this.createdRoleData = res; // Initialize createdRoleData with the fetched role data
          this.createdRoleData.permissions = [];
        } else {
          this.roleListUpdated.emit(res); // Emit the role data to the parent component
        }

        return (res.permissions ?? []).map((permission: PermissionAssignmentModel) => {
          return {
            id: permission.id,
            name: permission.name,
            description: permission.description,
            accessType: permission.accessType,
            isSpecial: permission.isSpecial || false
          } as PermissionAssignmentModel;
        });
      })
    );
  }

  /**
   * Handles changes to the checkbox for a feature.
   * Updates the permission controls and the current role data based on the checkbox state.
   * @param data The role model data for the feature.
   */
  onCheckboxChange(data: RoleModel): void {
    const control = data.description ? this.featureFormGroup.get(data.description) : null;
    this.selectedCheckboxId = data.id; // Store the selected checkbox ID
    if (control) {
      const isChecked = control.value;
      this.featureList.forEach((feature) => {
        if (feature.id === data.id) {
          feature.isChecked = isChecked; // Update the isChecked property of the feature
        }
      });
      control.setValue(isChecked);
      if (!isChecked) {
        this.updatePermissionControls(data.id, '', '', false);
        this.checkedCount = this.checkedCount - 1; // Decrement the count if unchecked
      } else {
        this.updatePermissionControls(data.id, 'Read', '', true);
        this.checkedCount = this.checkedCount + 1; // Increment the count if checked
      }
    }
  }

  /**
   * Updates the current role data based on the state of the form controls.
   * Emits the updated role data to the parent component.
   */
  updateCurrentRoleData(): void {
    const selectedFeature = this.featureList.find((f) => f.id === this.selectedCheckboxId);
    if (!selectedFeature) {
      return;
    }

    const writeControl = this.featureFormGroup.get(`write_${selectedFeature.id}`);
    const accessType = writeControl?.value === PERMISSION.write ? PERMISSION.write : PERMISSION.read;

    selectedFeature.accessType = accessType;

    if (selectedFeature.isChecked) {
      const permission = {
        id: selectedFeature.id,
        name: selectedFeature.name,
        description: selectedFeature.description,
        accessType: accessType,
        isSpecial: selectedFeature.isSpecial || false
      } as PermissionAssignmentModel;

      if (this.type === USER_PROFILE_CONSTANTS.EDIT && !this.currentRoleData?.permissions?.some((p) => p.id === selectedFeature.id)) {
        this.currentRoleData?.permissions?.push(permission);
      } else if (
        this.type === USER_PROFILE_CONSTANTS.CREATE &&
        !this.createdRoleData?.permissions?.some((p) => p.id === selectedFeature.id)
      ) {
        this.createdRoleData?.permissions?.push(permission);
      }
    } else {
      if (this.type === USER_PROFILE_CONSTANTS.EDIT) {
        this.currentRoleData!.permissions = this.currentRoleData?.permissions?.filter((p) => p.id !== selectedFeature.id);
      } else if (this.type === USER_PROFILE_CONSTANTS.CREATE) {
        this.createdRoleData!.permissions = this.createdRoleData!.permissions!.filter((p) => p.id !== selectedFeature.id);
      }
    }

    const roleDataPayload = this.type === USER_PROFILE_CONSTANTS.CREATE ? this.createdRoleData : this.currentRoleData;
    if (this.currentRoleData) {
      delete (this.currentRoleData as { id?: number }).id;
    }
    this.roleListUpdated.emit(roleDataPayload ?? undefined);
  }

  /**
   * Handles changes to the permission for a specific feature.
   * Updates the permission controls and the current role data based on the selected permission.
   * @param rowId The ID of the feature.
   * @param permission The selected permission (e.g., 'Read' or 'Write').
   */
  onPermissionChange(rowId: number, permission: string): void {
    const readControl = this.featureFormGroup.get(`read_${rowId}`);
    const writeControl = this.featureFormGroup.get(`write_${rowId}`);

    if (permission === 'Read') {
      readControl?.setValue(PERMISSION.read);
      writeControl?.setValue('');
      readControl?.enable();
      writeControl?.enable();
    } else if (permission === 'Write') {
      readControl?.setValue('');
      writeControl?.setValue(PERMISSION.write as string);
      writeControl?.enable();
      readControl?.enable();
    }
    const row = this.featureList.find((item) => item.id === rowId);
    if (
      row?.isChecked &&
      ((this.currentRoleData && Array.isArray(this.currentRoleData.permissions)) ||
        (this.createdRoleData && Array.isArray(this.createdRoleData.permissions)))
    ) {
      const perm =
        this.type === USER_PROFILE_CONSTANTS.EDIT
          ? this.currentRoleData?.permissions?.find((p) => p.id === rowId)
          : this.createdRoleData?.permissions?.find((p) => p.id === rowId);
      if (perm) {
        perm.accessType = permission === 'Read' ? PERMISSION.read : PERMISSION.write;
      }
    }
    if (this.currentRoleData || this.createdRoleData) {
      const roleDataPayload = this.type === USER_PROFILE_CONSTANTS.CREATE ? this.createdRoleData : this.currentRoleData;
      if (this.currentRoleData) {
        delete (this.currentRoleData as { id?: number }).id;
      }
      this.roleListUpdated.emit(roleDataPayload ?? undefined);
    }
  }

  /**
   * Calculates the count of features with non-zero access types.
   * Updates the `checkedCount` property with the calculated value.
   */
  getCheckedCount(): void {
    this.featureList.forEach((feature) => {
      if (feature.accessType === PERMISSION.read || feature.accessType === PERMISSION.write) {
        this.checkedCount++;
      }
    });
  }

  /**
   * Fetches the list of permissions for a new role.
   * @returns An observable of the list of permissions.
   */
  getPermissions(): Observable<PermissionModel[]> {
    return this.roleService.getApiRoleV1Permissions$Json().pipe(
      map((res: PermissionModel[]) => {
        return res as PermissionModel[];
      })
    );
  }

  /**
   * Updates the read and write permission controls for a specific feature.
   * @param id The ID of the feature.
   * @param readValue The value to set for the read control.
   * @param writeValue The value to set for the write control.
   * @param enable Whether to enable or disable the controls.
   */
  private updatePermissionControls(id: number, readValue: string, writeValue: string, enable: boolean): void {
    const readControl = this.featureFormGroup.get(`read_${id}`);
    const writeControl = this.featureFormGroup.get(`write_${id}`);

    if (readControl) {
      readControl.setValue(readValue);
      if (enable) {
        readControl.enable();
      } else {
        readControl.disable();
      }
    }

    if (writeControl) {
      writeControl.setValue(writeValue);
      if (enable) {
        writeControl.enable();
      } else {
        writeControl.disable();
      }
    }

    this.updateCurrentRoleData();
  }

  /**
   * Initializes the `updatedRoleData` property with default values.
   * This method sets up a new `RoleModel` object to hold the updated role data.
   * It ensures that the `updatedRoleData` starts with an empty permissions array*/
  initializeCreatedRoleData(): void {
    this.createdRoleData = {
      id: 0, // Provide a default ID
      name: '', // Provide a default name
      permissions: [] // Initialize permissions as an empty array
    } as RoleModel; // Initialize updatedRoleData
  }

  /**
   * Checks if a feature has special permission.
   * @param feature The permission assignment model to check.
   * @returns True if the feature has special permission, false otherwise.
   */
  hasSpecialPermission(feature: PermissionAssignmentModel): boolean {
    return feature.isSpecial === true;
  }
}
