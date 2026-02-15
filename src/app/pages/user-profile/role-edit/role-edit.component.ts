/* eslint-disable no-extra-boolean-cast */

import { Component, effect, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RoleEditTableComponent } from '../role-edit-table/role-edit-table.component';
import { ActivatedRoute } from '@angular/router';
import { MessageStatusService } from '../../../common/utilities/services/message/message.service';
import { RoleService } from '../../../api/glsUserApi/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationDialogData } from '../../../common/models/confirmation-dialog-interface';
import { GenericService } from '../../../common/utilities/services/generic.service';
import { VIEW_MODE } from '../../../common/app.constants';
import { PutApiRoleV1Id$Json$Params } from '../../../api/glsUserApi/fn/role/put-api-role-v-1-id-json';
import { RoleModel } from '../../../api/glsUserApi/models';
import { USER_PROFILE_CONSTANTS } from '../constants/user-constants';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlsInputComponent } from '../../../common/form/gls-input/gls-input.component';
import { PostApiRoleV1$Json$Params } from '../../../api/glsUserApi/fn/role/post-api-role-v-1-json';
import { Observable } from 'rxjs';
import { StrictHttpResponse } from '../../../api/glsAdministrativeApi/strict-http-response';
import { UtilityRouting } from '../../../common/utilities/utility-routing';
import { UtilityConcurrency } from '../../../common/utilities/utility-concurrency';
import { CONCURRENCY } from '../../../common/utilities/constants/concurrency';
import { Utility } from '../../../common/utilities/utility';
import { ConfirmationDialogComponent } from '../../../common/components/confirmation-dialog/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-role-edit',
  standalone: true,
  imports: [TranslateModule, RoleEditTableComponent, CommonModule, GlsInputComponent],
  templateUrl: './role-edit.component.html',
  styleUrl: './role-edit.component.scss'
})
export class RoleEditComponent implements OnInit, OnDestroy {
  dataSaved = false;
  modalRef!: NgbModalRef;
  dialogData!: ConfirmationDialogData;
  isSmallMobile = signal(false);
  isTablet = signal(false);
  idUser!: number;
  @ViewChild(RoleEditTableComponent) roleEditTable!: RoleEditTableComponent;
  updatedRoleData!: RoleModel;
  type = USER_PROFILE_CONSTANTS.CREATE;
  roleNameFormGroup!: FormGroup;
  hasPermissions = false;
  lastInteractionTime: number = new Date().getTime(); // Initialize last interaction time
  originalRoleName!: string;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly genericService = inject(GenericService);

  constructor(
    protected messageStatusService: MessageStatusService,
    private roleService: RoleService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    effect(
      () => {
        const typeView = this.genericService.viewModeValue;
        const sidebarOpened = this.genericService.sidebarOpenedValue;
        this.isSmallMobile.set(typeView === VIEW_MODE.MOBILE);
        this.isTablet.set(typeView === VIEW_MODE.TABLET);
        if (typeView === VIEW_MODE.DESKTOP) {
          if (sidebarOpened) {
            this.setDynamicStepperWidth('15.60rem');
          } else {
            this.setDynamicStepperWidth('4.25rem');
          }
        } else {
          switch (typeView) {
            case VIEW_MODE.MOBILE:
              this.setDynamicStepperWidth('0rem');
              break;
            default:
              this.setDynamicStepperWidth('4.25rem');
              break;
          }
        }
      },
      {
        allowSignalWrites: true
      }
    );
  }

  /**
   * Indicates whether the role name in the form has been changed from its original value.
   * @returns True if the current role name is different from the original; otherwise, false.
   */
  get roleNameChanged(): boolean {
    return this.roleNameFormGroup.get('name')?.value !== this.originalRoleName;
  }

  /**
   * Angular lifecycle hook that is called when the component is initialized.
   * It sets up the main page resize value and retrieves the user ID from the route parameters.
   */
  ngOnInit(): void {
    this.genericService.resizePage();
    this.idUser = this.route.snapshot.params['id'];
    this.roleNameFormGroup = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]]
    });
    if (this.idUser) {
      this.type = USER_PROFILE_CONSTANTS.EDIT;
      this.lockUnlock();
    }
  }

  /**
   * Update resize main page height
   */
  ngOnDestroy(): void {
    this.genericService.resizeMainPage.update(() => this.genericService.defaultValue());
    if (!!this.idUser && this.intervalId !== null) {
      this.unlockRole(this.idUser!).subscribe({
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
   * Locks the Role by its ID.
   * This method sends a request to lock the Role, preventing further modifications.
   *
   * @param idRole - The ID of the Role to lock.
   * @returns An observable of the locked Role details.
   */
  lockRole(idRole: number): Observable<StrictHttpResponse<void>> {
    const param = {
      id: idRole
    };

    return this.roleService.postApiRoleV1IdLock$Response(param);
  }

  /**
   * Unlocks the Role by its ID.
   * This method sends a request to unlock the Role, allowing further modifications.
   *
   * @param idRole - The ID of the Role to unlock.
   * @returns An observable of the unlocked Role details.
   */
  unlockRole(idRole: number): Observable<StrictHttpResponse<void>> {
    const param = {
      id: idRole
    };

    return this.roleService.postApiRoleV1IdUnlock$Response(param);
  }

  /**
   * Saves the role data to the server based on the type create or edit.
   * Displays a spinner during the save operation and navigates back to the role list on success.
   * Handles errors by showing an error modal.
   */
  save() {
    this.updatedRoleData = {
      ...this.updatedRoleData, // Include all fields
      name: this.roleNameFormGroup.get('name')?.value
    };

    if (this.type === USER_PROFILE_CONSTANTS.EDIT) {
      if (this.checkIsSpecial()) {
        this.openSaveConfirmationModal(); // Open confirmation dialog
      } else {
        this.editRole(); // Directly call the API
      }
    } else if (this.type === USER_PROFILE_CONSTANTS.CREATE && this.roleNameFormGroup.valid && this.hasPermissions) {
      if (this.checkIsSpecial()) {
        this.openSaveConfirmationModal(); // Open confirmation dialog
      } else {
        this.createNewRole(); // Directly call the API
      }
    }
  }

  openSaveConfirmationModal(): void {
    this.dialogData = {
      title: 'attention',
      content: 'extraConeMessage',
      showCancel: true,
      cancelText: 'modal.cancelText',
      confirmText: 'modal.confirmText',
      additionalData: [{ placeHolder: 'roleName', value: this.updatedRoleData.name }]
    };
    this.modalRef = this.modalService.open(ConfirmationDialogComponent, {
      backdrop: 'static',
      size: 'md'
    });
    this.modalRef.componentInstance.data = this.dialogData;
    this.modalRef.result.then((result: string) => {
      if (result) {
        if (this.type === USER_PROFILE_CONSTANTS.EDIT) {
          this.editRole();
        } else if (this.type === USER_PROFILE_CONSTANTS.CREATE && this.roleNameFormGroup.valid && this.hasPermissions) {
          this.createNewRole();
        }
      }
    });
  }

  /**
   * Sends a request to update an existing role.
   * Displays a success message and navigates to the role list on success.
   * Handles errors by calling the manageError method.
   */
  editRole() {
    // Initialize params for edit mode
    const params: PutApiRoleV1Id$Json$Params = {
      id: this.idUser,
      body: this.updatedRoleData
    };
    this.roleService.putApiRoleV1Id$Json(params).subscribe({
      next: () => {
        this.messageStatusService.show('message.role-list.enable.successEdit');
        UtilityRouting.navigateToRoleList();
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Sends a request to create a new role.
   * Displays a success message and navigates to the role list on success.
   * Handles errors by calling the manageError method.
   */
  createNewRole() {
    // Initialize params for create mode
    const params: PostApiRoleV1$Json$Params = {
      body: this.updatedRoleData // Use the form group value for create mode
    };

    this.roleService.postApiRoleV1$Json(params).subscribe({
      next: () => {
        this.messageStatusService.show('message.role-list.enable.successCreate');
        UtilityRouting.navigateToRoleList();
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Navigates to the role list page.
   */
  goToExit() {
    UtilityRouting.navigateToRoleList();
  }

  /**
   * Updates the role data in the parent component when the role list is updated.
   * @param updatedRoleModel The updated RoleModel object.
   */
  onRoleListUpdated(updatedRoleModel: RoleModel): void {
    this.updatedRoleData = updatedRoleModel;
    this.hasPermissions = (this.updatedRoleData?.permissions ?? []).length > 0;
  }

  /**
   * Updates the role name form control and stores the original role name.
   * This should be called when the role name is loaded or changed externally (e.g., from a child component).
   * @param roleName - The new role name to set in the form and as the original value.
   */
  updateRoleNameControl(roleName: string): void {
    if (this.roleNameFormGroup) {
      this.roleNameFormGroup.get('name')?.setValue(roleName);
      this.originalRoleName = roleName;
    }
  }

  /**
   * * @description This method is called when the user clicks on the previous button.
   * * It checks if the current step is valid and if the previous step is enabled.
   * @param width
   */
  private setDynamicStepperWidth(width: string): void {
    document.documentElement.style.setProperty('--dynamic-stepper-width', width);
  }

  /**
   * Checks if any selected permissions have `isSpecial` set to true.
   * @returns `true` if at least one selected permission has `isSpecial` set to true, otherwise `false`.
   */
  checkIsSpecial(): boolean {
    return (this.updatedRoleData?.permissions ?? []).some((permission) => permission.isSpecial === true);
  }

  private lockUnlock(): void {
    if (!!this.idUser) {
      this.intervalId = setInterval(() => {
        UtilityConcurrency.handleInterval(
          this.idUser,
          this.lastInteractionTime,
          (entityId: number) => this.lockRole(entityId),
          (title: string, message: string) => this.genericService.openErrorModal(title, message),
          () => UtilityRouting.navigateToRoleList()
        );
      }, CONCURRENCY.sessionMaxTimeMs);
      this.roleNameFormGroup?.statusChanges.subscribe(() => {
        this.lastInteractionTime = new Date().getTime();
      });
    }
  }
}
