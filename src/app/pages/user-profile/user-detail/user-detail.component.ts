import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TitleBudgeComponent } from '../../../common/components/title-budge/title-budge.component';

import { UsersService } from '../../../api/glsUserApi/services/users.service';
import { UserDetailsModel } from '../../../api/glsUserApi/models/user-details-model';
import { map, Observable } from 'rxjs';
import { MessageStatusService } from '../../../common/utilities/services/message/message.service';
import { GlsMessagesComponent } from '../../../common/components/gls-messages/gls-messages.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogData } from '../../../common/models/confirmation-dialog-interface';
import { ImpersonificateUserModalComponent } from './impersonificate-user-modal/impersonificate-user-modal.component';
import { GetApiUsersV1Id$Json$Params } from '../../../api/glsUserApi/fn/users/get-api-users-v-1-id-json';
import { PermissionModel, RoleModel, UserAdministrativeModel } from '../../../api/glsUserApi/models';
import { PROFILE } from '../../../common/utilities/constants/profile';
import { GenericService } from '../../../common/utilities/services/generic.service';
import { MsalService } from '@azure/msal-angular';
import { UserProfileService } from '../../../common/utilities/services/profile/user-profile.service';
import { VIEW_MODE } from '../../../common/app.constants';
import { UtilityRouting } from '../../../common/utilities/utility-routing';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AppSpecialBadgeComponent } from '../../../common/components/app-special-badge/app-special-badge.component';
import { MODAL_MD } from '../../../common/utilities/constants/modal-options';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, TranslateModule, TitleBudgeComponent, GlsMessagesComponent, AppSpecialBadgeComponent],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit, OnDestroy {
  idUser: number | null = null;
  showPage = false;
  userDetailsModelResponse: UserDetailsModel | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  administrativeList?: any[];
  modalRef!: NgbModalRef;
  dialogData!: ConfirmationDialogData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  typeViewMode: VIEW_MODE | undefined;
  isSmallMobile = signal(false);
  isTablet = signal(false);
  showManageBtn = signal(false);
  // private readonly genericService = Inject(GenericService);
  protected readonly authService = inject(MsalService);
  protected readonly userProfileService = inject(UserProfileService);

  /**
   * Constructor for the UserDetailComponent.
   * @param route - The activated route for accessing route parameters.
   * @param router - The Angular router for navigation.
   * @param spinnerService - Service for managing the spinner's visibility.
   * @param usersService - Service for fetching user details.
   * @param http - The HTTP client for making API requests.
   * @param messageStatusService - Service for displaying status messages.
   * @param modalService - Service for managing modals.
   */
  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService,
    private genericService: GenericService,
    protected messageStatusService: MessageStatusService,
    private modalService: NgbModal
  ) {}

  /**
   * Initializes the component by fetching the user details based on the route parameter.
   */
  ngOnInit() {
    this.idUser = Number(this.route.snapshot.paramMap.get('id'));
    this.getUserById().subscribe({
      next: (res: UserDetailsModel) => {
        this.userDetailsModelResponse = res;
        this.administrativeList = (res.administratives || []).map((administrative) => ({
          ...administrative,
          showAllStructures: false
        }));
        this.setShowManageBtn();
        this.showPage = true;
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
    this.userProfileService.profile$.subscribe((user: UserDetailsModel | null) => {
      if (user) {
        this.user = user;
      }
    });
    this.userProfileService.impersonatedUser$.subscribe((impersonatedUser: UserDetailsModel | null) => {
      if (impersonatedUser) {
        this.user = impersonatedUser;
      }
    });
    this.setupViewMode();
  }

  /**
   * Opens a modal for impersonating a user.
   */
  public impersonificateUserModal(): void {
    const modalRef = this.modalService.open(ImpersonificateUserModalComponent, MODAL_MD);
    modalRef.componentInstance.data = this.userDetailsModelResponse; // Pass any data to the modal if needed
    modalRef.componentInstance.idUser = this.idUser; // Pass the user ID to the modal
    modalRef.result.then((result: string) => {
      if (result) {
        //
      }
    });
  }

  /**
   * Navigates to the user edit page.
   */
  goToUserEdit(): void {
    this.usersService.postApiUsersV1IdLock$Response({ id: this.idUser! }).subscribe({
      next: (response) => {
        if (response.status === 204) {
          UtilityRouting.navigateTo('user-profile/user-edit', this.idUser?.toString());
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
   * Cleans up resources when the component is destroyed.
   */
  ngOnDestroy() {
    this.messageStatusService.hide();
  }

  /**
   * Determines whether the structure is enabled automatically or manually.
   * @param administratives - The administrative data of the user.
   * @returns A string indicating whether the structure is enabled automatically or manually.
   */
  getStructureEnabled(administratives: UserAdministrativeModel): string {
    const structureEnabledValue = administratives.associateAllStructures ? 'userProfile.userEdit.automatic' : 'userProfile.userEdit.manual';

    return structureEnabledValue;
  }

  /**
   * Tracks items in a list by their unique administrative ID.
   * Used for optimizing rendering in Angular's *ngFor directive.
   * @param index - The index of the item in the list.
   * @param item - The item being tracked, containing an `id` property.
   * @returns The unique ID of the item.
   */
  trackByAdministrativeId(index: number, item: { id: number }): number {
    return item.id;
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
   * Configura la modalità di visualizzazione.
   */
  private setupViewMode(): void {
    this.typeViewMode = this.genericService.viewMode();
    this.isSmallMobile.set(this.typeViewMode === VIEW_MODE.MOBILE);
    this.isTablet.set(this.typeViewMode === VIEW_MODE.TABLET);
  }

  /**
   * Fetches user details by ID.
   * @returns An observable of the user details.
   */
  private getUserById(): Observable<UserDetailsModel> {
    const param: GetApiUsersV1Id$Json$Params = {
      id: this.idUser ?? 0
    };

    return this.usersService.getApiUsersV1Id$Json(param)?.pipe(map((res: UserDetailsModel) => res));
  }
  /**
   * Checks if the role has any special permissions.
   * @param role - The role model containing permissions.
   * @returns A boolean indicating if the role has special permissions.
   */
  checkIsSpecial(role: RoleModel): boolean {
    return role.permissions?.some((permission: PermissionModel) => permission.isSpecial) ?? false;
  }

  /**
   * Sets the visibility of the manage button based on user status and profile.
   * @private
   */
  private setShowManageBtn(): void {
    this.showManageBtn.set(
      this.userDetailsModelResponse?.status !== 'DISABLED' && this.userDetailsModelResponse?.profile !== PROFILE.EVA_ADMIN
    );
  }
}
