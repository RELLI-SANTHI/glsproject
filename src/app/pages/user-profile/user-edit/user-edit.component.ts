/* eslint-disable no-extra-boolean-cast */
/* eslint-disable max-lines-per-function */
import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../../api/glsUserApi/services';
import {
  PermissionModel,
  RoleModel,
  UserAdministrativeAssignmentModel,
  UserAssociationUpdateModel,
  UserDetailsModel,
  UserStructureModel
} from '../../../api/glsUserApi/models';
import { map, Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TitleBudgeComponent } from '../../../common/components/title-budge/title-budge.component';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogData } from '../../../common/models/confirmation-dialog-interface';
import { MessageStatusService } from '../../../common/utilities/services/message/message.service';
import { RoleListModalComponent } from '../role-list-modal/role-list-modal.component';
import { GlsInputDropdownComponent } from '../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { InputStatusSectionComponent } from '../../../common/form/input-status-section/input-status-section.component';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { StructureListModalComponent } from './structure-list-modal/structure-list-modal.component';
import { GetApiUsersV1Id$Json$Params } from '../../../api/glsUserApi/fn/users/get-api-users-v-1-id-json';
import { PatchApiUsersV1IdStatus$Params } from '../../../api/glsUserApi/fn/users/patch-api-users-v-1-id-status';
import { GenericService } from '../../../common/utilities/services/generic.service';
import { GlsInputCheckboxComponent } from '../../../common/form/gls-input-checkbox/gls-input-checkbox.component';
import { PatchApiUsersV1IdAssociations$Json$Params } from '../../../api/glsUserApi/fn/users/patch-api-users-v-1-id-associations-json';
import { BreadcrumbService } from '../../../common/utilities/services/breadcrumb/breadcrumb.service';
import { AdministrativeService } from '../../../api/glsAdministrativeApi/services';
import { PostApiAdministrativeV1$Json$Params } from '../../../api/glsAdministrativeApi/fn/administrative/post-api-administrative-v-1-json';
import {
  CompanyDetailResponse,
  GetAdministrativesRequestPayload,
  GetAdministrativesResponse
} from '../../../api/glsAdministrativeApi/models';
import { StructureResponse, TemplateModel } from '../../../api/glsNetworkApi/models';
import { ICONS } from '../../../common/utilities/constants/icon';
import { GetApiTemplateV1$Json$Params } from '../../../api/glsNetworkApi/fn/template/get-api-template-v-1-json';
import { TemplateService } from '../../../api/glsNetworkApi/services';
import { PROFILE, USER_STATUS } from '../../../common/utilities/constants/profile';
import { ConfirmationDialogComponent } from '../../../common/components/confirmation-dialog/confirmation-dialog/confirmation-dialog.component';
import { PostApiUsersV1IdLock$Params } from '../../../api/glsUserApi/fn/users/post-api-users-v-1-id-lock';
import { StrictHttpResponse } from '../../../api/glsAdministrativeApi/strict-http-response';
import { PostApiUsersV1IdUnlock$Params } from '../../../api/glsUserApi/fn/users/post-api-users-v-1-id-unlock';
import { GlsTitleBudgeTemplateComponent } from '../../../common/components/gls-title-budge-template/gls-title-budge-template.component';
import { UtilityRouting } from '../../../common/utilities/utility-routing';
import { FormFooterComponent } from '../../../common/components/form-footer/form-footer.component';
import { CONCURRENCY } from '../../../common/utilities/constants/concurrency';
import { UtilityConcurrency } from '../../../common/utilities/utility-concurrency';
import { Utility } from '../../../common/utilities/utility';
import { AppSpecialBadgeComponent } from '../../../common/components/app-special-badge/app-special-badge.component';
import { MODAL_LG, MODAL_MD } from '../../../common/utilities/constants/modal-options';
import { VIEW_MODE } from '../../../common/app.constants';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Import ReactiveFormsModule
    DatePipe,
    TranslateModule,
    TitleBudgeComponent,
    GlsInputDropdownComponent,
    InputStatusSectionComponent,
    GlsInputCheckboxComponent,
    FormsModule,
    GlsTitleBudgeTemplateComponent,
    FormFooterComponent,
    AppSpecialBadgeComponent
  ],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.scss'
})
export class UserEditComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cardTemplate', { read: TemplateRef }) cardTemplateRef!: TemplateRef<unknown>;
  @ViewChild('cardContainer', { read: ViewContainerRef }) cardContainerRef!: ViewContainerRef;
  idUser: number | null = null;
  showPage = false;
  userEditResponse: UserDetailsModel | null = null;
  rolePermissionsArray: RoleModel[] = [];
  existingRoleList: RoleModel[] = []; // Store original roles
  societyDropdownArray: CompanyDetailResponse[] = [];
  modalRef!: NgbModalRef;
  dialogData!: ConfirmationDialogData;
  cardFormArray: FormArray; // Manage multiple cards dynamically
  cardStructureLists: Record<number, UserStructureModel[]> = {}; // Object to store structure lists for each card
  isSmallMobile = signal(false);
  typeViewMode: VIEW_MODE | undefined;
  templateList: TemplateModel[] = [];
  roleForm = new FormGroup({
    roles: new FormControl<RoleModel[]>([], Validators.required)
  });
  lastInteractionTime = new Date().getTime(); // Track last interaction time for concurrency control
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly administrativeService = inject(AdministrativeService);
  private readonly templateService = inject(TemplateService);

  /**
   * Constructor for the UserEditComponent.
   * @param route - The activated route for accessing route parameters.
   * @param usersService - Service for fetching user details.
   * @param genericService
   * @param messageStatusService - Service for displaying status messages.
   * @param modalService - Service for managing modals.
   * @param fb - FormBuilder for creating reactive forms.
   */
  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService,
    private genericService: GenericService,
    protected messageStatusService: MessageStatusService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    this.cardFormArray = this.fb.array([]); // Initialize the FormArray
  }

  /**
   * Initializes the component by fetching user details and setting up the card form.
   */
  ngOnInit() {
    this.genericService.resizePage();
    this.idUser = Number(this.route.snapshot.paramMap.get('id'));
    this.getTemplateList();
    this.getUserById().subscribe({
      next: (res: UserDetailsModel) => {
        this.showPage = true;
        this.userEditResponse = res;
        // Deep clone roles to avoid reference sharing
        this.rolePermissionsArray = res.roles ? JSON.parse(JSON.stringify(res.roles)) : [];
        this.roleForm.get('roles')?.setValue(this.rolePermissionsArray);
        this.roleForm.get('roles')?.markAsTouched();
        this.retrieveCompanyGroups();
        this.roleForm?.statusChanges.subscribe(() => {
          this.lastInteractionTime = new Date().getTime();
        });
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
    this.lockUnlock();
    this.addCard(); // Add the first card on initialization
    this.existingRoleList = []; // Initialize existingRoleList
    this.setupViewMode();
  }

  /**
   * Update resize main page height
   */
  ngOnDestroy(): void {
    this.genericService.resizeMainPage.update(() => this.genericService.defaultValue());
    if (!!this.idUser && this.intervalId !== null) {
      this.unlockUser(this.idUser!).subscribe({
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
   * Dynamically adds the card template to the view container.
   */
  ngAfterViewInit(): void {
    if (this.cardTemplateRef && this.cardContainerRef) {
      this.cardContainerRef.createEmbeddedView(this.cardTemplateRef); // Dynamically create views from the template
    }
  }

  /**
   * Adds a new card with empty values.
   */
  addCard(): void {
    const cardIndex = this.cardFormArray.length; // Get the current index for the new card
    const newCardFormGroup = this.fb.group({
      societyDropdown: [null, Validators.required], // Dropdown field
      automatic: [{ value: null, disabled: true }], // Initially disabled
      manual: [{ value: null, disabled: true }], // Initially disabled
      controlName: [`card_${cardIndex}`] // Unique control name for each card
    });
    this.cardFormArray.push(newCardFormGroup); // Add the new FormGroup to the FormArray
    this.cardStructureLists[cardIndex] = []; // Initialize an empty structure list for the new card
  }

  /**
   * Retrieves the FormGroup for a specific card.
   */
  getCardFormGroup(index: number): FormGroup {
    return this.cardFormArray.at(index) as FormGroup;
  }

  removeCard(index: number): void {
    this.cardFormArray.removeAt(index); // Remove the card at the specified index
  }

  /**
   * Handles changes in the dropdown or radio button.
   */
  onCardChange(index: number, field: string, value: Event | string): void {
    const target = typeof value === 'string' ? value : (value.target as HTMLInputElement)?.value;
    const cardFormGroup = this.getCardFormGroup(index);

    // Set the value for the specified field
    // cardFormGroup.get(field)?.setValue(target);

    // Ensure only one radio is selected at a time
    if (field === 'automatic' && target === 'automatic') {
      cardFormGroup.get('manual')?.setValue(false);
      cardFormGroup.get('automatic')?.setValue(true);
    }
    if (field === 'manual' && target === 'manual') {
      cardFormGroup.get('automatic')?.setValue(false);
      cardFormGroup.get('manual')?.setValue(true);
    }

    // Enable radio buttons if the dropdown value is selected
    if (field === 'societyDropdown' && target) {
      cardFormGroup.get('manual')?.enable();
      cardFormGroup.get('automatic')?.enable();
      this.cardStructureLists[index].splice(0);

      // If both radios are unselected, select 'automatic' by default
      if (!cardFormGroup.get('automatic')?.value && !cardFormGroup.get('manual')?.value) {
        cardFormGroup.get('automatic')?.setValue(true);
        cardFormGroup.get('manual')?.setValue(false);
      }
    } else {
      // cardFormGroup.get(field)?.setValue(target); // Set the selected option in the form control
    }
  }

  /**
   * Locks the User by its ID.
   * This method sends a request to lock the User, preventing further modifications.
   *
   * @param idUser - The ID of the User to lock.
   * @returns An observable of the locked User details.
   */
  lockUser(idUser: number): Observable<StrictHttpResponse<void>> {
    const param: PostApiUsersV1IdLock$Params = {
      id: idUser
    };

    return this.usersService.postApiUsersV1IdLock$Response(param);
  }

  /**
   * Unlocks the User by its ID.
   * This method sends a request to unlock the User, allowing further modifications.
   *
   * @param idUser - The ID of the User to unlock.
   * @returns An observable of the unlocked User details.
   */
  unlockUser(idUser: number): Observable<StrictHttpResponse<void>> {
    const param: PostApiUsersV1IdUnlock$Params = {
      id: idUser
    };

    return this.usersService.postApiUsersV1IdUnlock$Response(param);
  }

  /**
   * Opens a confirmation modal to disable the user profile.
   * - Sets up the dialog data with title, content, and user name.
   * - Opens the ConfirmationDialogComponent as a modal.
   * - Passes the dialog data to the modal instance.
   * - If the modal is confirmed, calls the disableUser() method.
   */
  openDisableUserModal() {
    this.dialogData = {
      title: 'disableProfile',
      content: 'disableProfileMessage1',
      content2: 'disableProfileMessage2',
      userName: this.userEditResponse?.name + ' ' + this.userEditResponse?.surname,
      confirmText: 'modal.proceedDisabling',
      cancelText: 'modal.close',
      showCancel: true
    };
    this.modalRef = this.modalService.open(ConfirmationDialogComponent, MODAL_MD);
    this.modalRef.componentInstance.data = this.dialogData;
    this.modalRef.result.then((result: string) => {
      if (result) {
        // console.log(`Closed with: ${result}`);
        this.disableUser();
      }
    });
  }

  /**
   * Disables the user by updating their status.
   */
  disableUser(): void {
    const param: PatchApiUsersV1IdStatus$Params = {
      id: this.idUser ?? 0,
      body: {
        status: USER_STATUS.wip
      }
    };
    this.usersService.patchApiUsersV1IdStatus(param).subscribe({
      next: () => {
        this.messageStatusService.show('message.user.disable.success');
        if (this.idUser) {
          this.breadcrumbService.removeLastBreadcrumb();
          UtilityRouting.navigateToUserDetailByUserId(this.idUser.toString());
        } else {
          UtilityRouting.navigateToUserList();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Opens a modal for managing user roles.
   */
  public openRoleModal(): void {
    const modalRef = this.modalService.open(RoleListModalComponent, MODAL_LG);
    modalRef.componentInstance.data = JSON.parse(JSON.stringify(this.rolePermissionsArray)); // Always use the latest selectedRole
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modalRef.result.then((result: any) => {
      if (result) {
        this.rolePermissionsArray = JSON.parse(JSON.stringify(result));
        this.roleForm.get('roles')?.setValue(this.rolePermissionsArray);
        this.roleForm.get('roles')?.markAsTouched(); // Update rolePermissionsArray with the latest roles
      }
    });
  }

  /**
   * Opens a modal for managing user societies.
   */
  openStructureModal(cardIndex: number): void {
    const filterObject = this.societyDropdownArray.filter(
      (item) => item.id === Number(this.cardFormArray.controls[cardIndex].get('societyDropdown')?.value)
    );
    const dataObject = {
      selectSocietyName: filterObject[0]?.name,
      selectSocietyId: filterObject[0]?.id,
      template: this.templateList,
      exitingStructures: this.cardStructureLists[cardIndex] || []
    };
    const modalRef = this.modalService.open(StructureListModalComponent, MODAL_LG);
    modalRef.componentInstance.modalData = dataObject; // Pass any data to the modal if needed
    modalRef.result.then((result: StructureResponse[]) => {
      if (result) {
        this.cardStructureLists[cardIndex] = result; // Update the structure list for the specific card
      }
    });
  }

  /**
   * * Removes a card from the form array.
   * * @param index - The index of the card to remove.
   */
  UserSave(): void {
    const object: UserAssociationUpdateModel = {
      roles: this.rolePermissionsArray,
      administratives: []
    };
    // Collect all structure ids from all cards with structures
    const allStructureIds: number[] = [];
    this.cardFormArray.controls.forEach((card, idx) => {
      const structures = this.cardStructureLists[idx] || [];
      if (structures.length > 0) {
        allStructureIds.push(...structures.map((structure) => structure.id));
      }
      const administrativeAssignment: UserAdministrativeAssignmentModel = {
        administrativeId: Number(card.get('societyDropdown')?.value),
        associateAllStructures: !!card.get('automatic')?.value,
        structureIds: structures.length > 0 ? structures.map((structure) => structure.id) : []
      };
      object.administratives!.push(administrativeAssignment);
    });
    const payload: PatchApiUsersV1IdAssociations$Json$Params = {
      id: Number(this.idUser),
      body: object
    };

    const newRolesWithSpecialPermissions = this.rolePermissionsArray.filter((role) => {
      const isNewRole = !this.existingRoleList.some((existingRole) => existingRole.id === role.id);

      return isNewRole && this.checkIsSpecial(role);
    });

    if (newRolesWithSpecialPermissions.length > 0) {
      this.openSaveConfirmationModal(payload);
    } else {
      this.saveUser(payload);
    }
  }

  openSaveConfirmationModal(payload: PatchApiUsersV1IdAssociations$Json$Params): void {
    this.dialogData = {
      title: 'attention',
      content: 'extraConeMessage',
      showCancel: true,
      cancelText: 'modal.cancelText',
      confirmText: 'modal.confirmText'
    };
    this.modalRef = this.modalService.open(ConfirmationDialogComponent, {
      backdrop: 'static',
      size: 'md'
    });
    this.modalRef.componentInstance.data = this.dialogData;
    this.modalRef.result.then((result: string) => {
      if (result) {
        this.saveUser(payload);
      }
    });
  }

  saveUser(payload: PatchApiUsersV1IdAssociations$Json$Params) {
    this.updateUser(payload).subscribe({
      next: (res: UserDetailsModel) => {
        if (res) {
          this.updateUserStatus('ACTIVE');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   *  * Retrieves the selected dropdown value from the first card.
   * @description This method is used to get the selected dropdown value from the first card.
   * @returns The selected dropdown value as a number.
   */
  getSocietyValue(): number {
    const selectedSocietyId = this.cardFormArray.controls[0]?.get('societyDropdown')?.value;

    return Number(selectedSocietyId); // Return the selected dropdown value as a number
  }

  /**
   * * Updates the user status to the current status.
   * * @description This method is called when the user clicks on the save button.
   */
  updateUserStatus(status: 'WIP' | 'ACTIVE' | 'DISABLED'): void {
    const param: PatchApiUsersV1IdStatus$Params = {
      id: this.idUser ?? 0,
      body: {
        status: status
      }
    };
    this.usersService.patchApiUsersV1IdStatus(param).subscribe({
      next: () => {
        const messageKey = this.userEditResponse?.status === 'ACTIVE' ? 'message.user.update.success' : 'message.user.enable.success';
        this.messageStatusService.show(messageKey);
        // this.messageStatusService.show('message.user.enable.success');
        if (this.idUser) {
          this.breadcrumbService.removeLastBreadcrumb();
          UtilityRouting.navigateToUserDetailByUserId(this.idUser.toString());
        } else {
          UtilityRouting.navigateToUserList();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * * Updates the user with the provided payload.
   * @param payload - The payload containing user details to update.
   * @returns An observable of the updated user details.
   */
  updateUser(payload: PatchApiUsersV1IdAssociations$Json$Params): Observable<UserDetailsModel> {
    const param: PatchApiUsersV1IdAssociations$Json$Params = {
      id: payload.id,
      body: payload.body,
      'X-Impersonated-User': payload['X-Impersonated-User']
    };

    return this.usersService.patchApiUsersV1IdAssociations$Json(param).pipe(
      map((r: UserDetailsModel) => {
        return r;
      })
    );
  }

  /**
   *  * Removes a card from the form array.
   * @param index - The index of the card to remove.
   * @returns true if all dropdowns are selected, false otherwise.
   */
  areAllDropdownsSelected(): boolean {
    return this.cardFormArray.length > 0 && this.cardFormArray.controls.every((card) => card.get('societyDropdown')?.valid);
  }

  /**
   * * Removes a card from the form array.
   * @param index - The index of the card to remove.
   */
  goToExit() {
    UtilityRouting.navigateToUserList();
  }

  /**
   * * Retrieves the company groups for the user.
   * @description This method is called to fetch the company groups for the user.
   */
  retrieveCompanyGroups(): void {
    const payload: GetAdministrativesRequestPayload = {
      corporateGroupName: this.userEditResponse?.corporateGroup?.corporateName
    };
    const param: PostApiAdministrativeV1$Json$Params = {
      body: payload
    };
    this.administrativeService.postApiAdministrativeV1$Json(param).subscribe({
      next: (res: GetAdministrativesResponse) => {
        this.societyDropdownArray = res?.companies || [];
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   *  * Retrieves the icon for a given structure item based on its building type.
   * @param item
   * @returns
   */
  getIcon(item: UserStructureModel): string {
    return this.getBuildingTypeIconAndName(item, 'icon');
  }

  /**
   *  * Retrieves the name for a given structure item based on its building type.
   * @param temp
   * @returns
   */
  gettemplateName(temp: UserStructureModel): string {
    return this.getBuildingTypeIconAndName(temp, 'name');
  }

  /**
   *  * Retrieves the icon and name for a given structure item based on its building type.
   * @param item
   * @param type
   * @returns
   */
  getBuildingTypeIconAndName(item: UserStructureModel, type: string): string {
    if (type === 'icon') {
      return item.icon ? (ICONS[item.icon] as string) : '';
    } else if (type === 'name') {
      return item.buildingTypeName as string;
    }

    return '';
  }

  /**
   * Retrieves the list of templates from the API and assigns it to the `templateList` property.
   * The list is filtered based on the selected building type.
   */
  getTemplateList(): void {
    this.retrieveTemplates().subscribe({
      next: (res: TemplateModel[]) => {
        this.templateList = res;
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   *  * Retrieves the structure name based on the provided structure response.
   * @param items
   * @returns
   */
  getStructureName(items: UserStructureModel & { buildingType?: string }): string {
    const acronym = items.buildingAcronym ?? '';
    const name = items.buildingName ?? '';

    return `${acronym} - ${name}`;
  }

  /**
   * Gets the profile value of the user based on their profile type.
   * @param userDetails - The user details model containing the profile information.
   * @returns A string representing the user's profile type ('Admin', 'Field', 'User') or '--' if the profile is not recognized.
   */
  getProfileValue(userDetails: UserDetailsModel): string {
    const userProfileValue = userDetails.profile ?? null;
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
   * Fetches user details by ID.
   * @returns An observable of the user details.
   */

  private getUserById(): Observable<UserDetailsModel> {
    const param: GetApiUsersV1Id$Json$Params = {
      id: this.idUser ?? 0
    };

    return this.usersService.getApiUsersV1Id$Json(param)?.pipe(
      map((res: UserDetailsModel) => {
        this.rolePermissionsArray = res.roles ? JSON.parse(JSON.stringify(res.roles)) : [];
        this.roleForm.get('roles')?.setValue(this.rolePermissionsArray);
        this.roleForm.get('roles')?.markAsTouched();
        this.existingRoleList = res.roles ? JSON.parse(JSON.stringify(res.roles)) : [];

        // Bind administratives to cardFormArray for edit mode
        if (res.administratives && Array.isArray(res.administratives) && res.administratives.length > 0) {
          // Clear existing cards
          this.cardFormArray.clear();
          this.cardStructureLists = {};
          res.administratives.forEach((admin, idx) => {
            const hasStructures = Array.isArray(admin.structures) && admin.structures.length > 0;
            const cardFormGroup = this.fb.group({
              societyDropdown: [admin.id, Validators.required],
              automatic: [{ value: admin.associateAllStructures, disabled: false }],
              manual: [{ value: !admin.associateAllStructures, disabled: false }],
              controlName: [`card_${idx}`]
            });
            this.cardFormArray.push(cardFormGroup);
            this.cardStructureLists[idx] = hasStructures
              ? (admin.structures ?? []).map((structure: UserStructureModel) => ({
                  ...structure,
                  buildingAcronym: typeof structure.buildingAcronym === 'string' ? structure.buildingAcronym : '',
                  buildingName: typeof structure.buildingName === 'string' ? structure.buildingName : '',
                  icon: structure.icon ?? ''
                }))
              : [];
          });
        }

        return res;
      })
    );
  }

  /**
   * Retrieves the list of templates from the API.
   * @returns The list of templates.
   */
  private retrieveTemplates(): Observable<TemplateModel[]> {
    const param: GetApiTemplateV1$Json$Params = {};

    // Call the API to get the list of templates
    return this.templateService.getApiTemplateV1$Json(param).pipe(
      map((r: TemplateModel[]) => {
        return r;
      })
    );
  }

  /**
   * Checks if the role has any special permissions.
   * @param role - The role model containing permissions.
   * @returns A boolean indicating if the role has special permissions.
   */
  checkIsSpecial(role: RoleModel): boolean {
    return role.permissions?.some((permission: PermissionModel) => permission.isSpecial) ?? false;
  }

  private lockUnlock(): void {
    if (!!this.idUser) {
      this.intervalId = setInterval(() => {
        UtilityConcurrency.handleInterval(
          this.idUser,
          this.lastInteractionTime,
          (entityId: number) => this.lockUser(entityId),
          (title: string, message: string) => this.genericService.openErrorModal(title, message),
          () => UtilityRouting.navigateToUserList()
        );
      }, CONCURRENCY.sessionMaxTimeMs);
    }
  }

  /**
   * Configura la modalità di visualizzazione.
   */
  private setupViewMode(): void {
    this.typeViewMode = this.genericService.viewMode();
    this.isSmallMobile.set(this.typeViewMode === VIEW_MODE.MOBILE);
  }
}
