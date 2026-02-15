import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UserDetailsModel } from '../../../api/glsUserApi/models/user-details-model';
import { UserProfileService } from '../../utilities/services/profile/user-profile.service';
import { HttpClient } from '@angular/common/http';
import { UtilityRouting } from '../../utilities/utility-routing';

@Component({
  selector: 'gls-top-banner',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './gls-top-banner.component.html',
  styleUrl: './gls-top-banner.component.scss'
})
export class GlsTopBannerComponent implements OnInit {
  impersonatedUser: UserDetailsModel | null = null;
  private readonly userProfileService = inject(UserProfileService);
  private readonly http = inject(HttpClient);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected logedUser?: any;

  constructor() {
    this.userProfileService.profile$.subscribe((loguser: UserDetailsModel | null) => {
      if (loguser) {
        this.logedUser = loguser;
      }
    });
  }
  ngOnInit() {
    // Subscribe to the impersonatedUser$ observable from userProfileService
    // and assign the received user to the impersonatedUser property
    this.userProfileService.impersonatedUser$.subscribe((user) => {
      this.impersonatedUser = user;
    });
  }

  stopImpersonating(): void {
    // this.http.get('/api/Users/v1/jwt').subscribe(() => {
    // Clear the impersonation state using userProfileService
    this.userProfileService.clearImpersonation();
    // Navigate to the 'home' route
    UtilityRouting.relocateToHome();

    // });
  }
}
