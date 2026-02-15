import { Component, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { UserDetailsModel } from '../../api/glsUserApi/models/user-details-model';
import { UserProfileService } from '../../common/utilities/services/profile/user-profile.service';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../common/utilities/constants/profile';
import { UtilityProfile } from '../../common/utilities/utility-profile';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  userEnabled = signal(false);
  userName = signal<string>('');
  imageUrl = signal<string>('assets/img/transparent/PNG-GLS_user.png');
  private readonly userProfileService = inject(UserProfileService);

  constructor() {
    const hasAccess = UtilityProfile.checkAccessProfile(this.userProfileService, PROFILE.any, FUNCTIONALITY.any, PERMISSION.any);
    if (hasAccess) {
      this.userProfileService.profile$.subscribe((user: UserDetailsModel | null) => {
        if (user) {
          this.userName.set(`${user.name ?? ''} ${user.surname ?? ''}`);
        }
      });
      this.userProfileService.impersonatedUser$.subscribe((impersonatedUser: UserDetailsModel | null) => {
        if (impersonatedUser) {
          this.userName.set(`${impersonatedUser.name ?? ''} ${impersonatedUser.surname ?? ''}`);
        }
      });
    } else {
      this.imageUrl.set('assets/img/transparent/PNG-GLS_AccessDenied.png');
    }
    this.userEnabled.set(hasAccess);
  }
}
