import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { GenericService } from '../../utilities/services/generic.service';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { UserProfileService } from '../../utilities/services/profile/user-profile.service';
import { UserDetailsModel } from '../../../api/glsUserApi/models';
import { PROFILE } from '../../utilities/constants/profile';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent {
  protected readonly genericService = inject(GenericService);
  protected readonly authService = inject(MsalService);
  protected readonly userProfileService = inject(UserProfileService);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected user?: any;

  constructor() {
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
  }

  // Log the user out
  logout() {
    this.authService.logoutRedirect();
  }

  /**
   * Determines the profile type of a user and returns a corresponding string representation.
   *
   * @param user - The user object containing profile information.
   * @returns A string representing the user's profile type ('Admin', 'Field', 'User')
   *          or '--' if the profile is not defined or unrecognized.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getProfileValue(user: any): string {
    if (!user || !user.profile) {
      return '--';
    }
    const profileValue = user.profile;
    if (profileValue === PROFILE.EVA_ADMIN) {
      return 'Admin';
    } else if (profileValue === PROFILE.EVA_FIELD) {
      return 'Field';
    } else if (profileValue === PROFILE.EVA_USER) {
      return 'User';
    } else {
      return '--';
    }
  }
}
