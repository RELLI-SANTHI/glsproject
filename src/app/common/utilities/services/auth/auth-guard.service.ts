import { inject, Injectable, OnDestroy } from '@angular/core';
// import { AuthUserService } from './auth-user.service';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync } from '@angular/router';
import { Subscription } from 'rxjs';

import { UserProfileService } from '../profile/user-profile.service';

import { UtilityProfile } from '../../utility-profile';
import { UtilityRouting } from '../../utility-routing';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate, OnDestroy {
  private subscriptionList: Subscription[] = [];

  private userToken?: string;

  private readonly userProfileService = inject(UserProfileService);

  // Guard method called when Angular evaluates whether it can activate a route. Gets:
  // route: information about the requested route (e.g., data, parameters).
  canActivate(route: ActivatedRouteSnapshot): MaybeAsync<GuardResult> {
    // const profile: string = route.data['profile'];
    const profile = route.data['profile'] as string | string[];
    const functionality = route.data['functionality'] as string | string[];
    const permission: string = route.data['permission'];

    const hasPermission = UtilityProfile.checkAccessProfile(this.userProfileService, profile, functionality, permission);

    if (hasPermission) {
      return true;
    }

    UtilityRouting.navigateToHome();

    return false;
  }

  ngOnDestroy(): void {
    this.subscriptionList.forEach((sub: Subscription) => sub.unsubscribe());
  }
}
