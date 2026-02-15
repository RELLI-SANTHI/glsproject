import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { UserDetailsModel } from '../../../../api/glsUserApi/models/user-details-model';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { UsersService } from '../../../../api/glsUserApi/services';
import { map, Observable } from 'rxjs';
import { ImpersonationResult } from '../../../../api/glsUserApi/models';
import { PostApiUsersV1ImpersonateTargetuserid$Json$Params } from '../../../../api/glsUserApi/fn/users/post-api-users-v-1-impersonate-targetuserid-json';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
@Component({
  selector: 'app-impersonificate-user-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './impersonificate-user-modal.component.html',
  styleUrl: './impersonificate-user-modal.component.scss'
})
export class ImpersonificateUserModalComponent implements OnInit {
  @Input() data!: UserDetailsModel | null;
  apiResponse: UserDetailsModel | null = null;
  @Input() idUser: number | null = null;

  /**
   * Constructor for the ImpersonificateUserModalComponent.
   * @param activeModal - The active modal instance for managing modal actions.
   * @param profileService - Service for managing user profile operations.
   */
  constructor(
    private activeModal: NgbActiveModal,
    private userProfileService: UserProfileService,
    private usersService: UsersService
  ) {}

  /**
   * Initializes the component by setting the API response to the input data.
   */
  ngOnInit(): void {
    this.apiResponse = this.data;
  }

  /**
   * Closes the modal without proceeding with impersonification.
   */
  closeModal(): void {
    this.activeModal.close(false);
  }

  /**
   * Sends a request to impersonate a user based on the provided user ID.
   *
   * This method constructs the necessary parameters using the `idUser` property
   * and calls the `postApiUsersV1ImpersonateTargetuserid$Json` API endpoint.
   * The response is mapped to an `ImpersonationResult` object.
   *
   * @returns Observable<ImpersonationResult> - An observable containing the result of the impersonation request.
   */
  private impersonateUser(): Observable<ImpersonationResult> {
    const param: PostApiUsersV1ImpersonateTargetuserid$Json$Params = {
      targetUserId: this.idUser as number
    };

    return this.usersService.postApiUsersV1ImpersonateTargetuserid$Json(param)?.pipe(map((res: ImpersonationResult) => res));
  }

  /**
   * Proceeds with impersonifying the user by setting the impersonated user in the profile service.
   * Closes the modal after the operation.
   */
  proceed(): void {
    this.impersonateUser().subscribe({
      next: (impersonateUser: ImpersonationResult) => {
        if (impersonateUser.isSuccess && impersonateUser.user) {
          const userDetails: UserDetailsModel = impersonateUser.user;
          this.userProfileService.setImpersonatedUser(userDetails);
          UtilityRouting.navigateToHome();
        }
      }
    });
    this.activeModal.close(true);
  }
}
