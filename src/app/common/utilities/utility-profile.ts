/* eslint-disable max-lines-per-function */
import { UserProfileService } from './services/profile/user-profile.service';
import { UserDetailsModel, RoleModel, PermissionAssignmentModel } from '../../api/glsUserApi/models';
import { PROFILE, FUNCTIONALITY, PERMISSION } from './constants/profile';
import { Subscription } from 'rxjs';

export class UtilityProfile {
  /**
   * Controls visibility of buttons and other components based on user profile.
   * @param userProfileService The UserProfileService instance.
   * @param profile The profile(s) to check.
   * @param functionality The functionality to check.
   * @param permission The permission to check.
   * @returns True if access is granted, false otherwise.
   */
  static checkAccessProfile(
    userProfileService: UserProfileService,
    profile: string | string[],
    functionality: string | string[],
    permission: string
  ): boolean {
    let hasPermission = false;
    let loggedUser!: UserDetailsModel;

    const subscriptionList: Subscription[] = [];
    subscriptionList.push(
      userProfileService.profile$.subscribe((user: UserDetailsModel | null) => {
        if (user) {
          loggedUser = user;
        }
      })
    );

    subscriptionList.push(
      userProfileService.impersonatedUser$.subscribe((user: UserDetailsModel | null) => {
        if (user) {
          loggedUser = user;
        }
      })
    );

    // casting the loggedUser to the expected type
    if (loggedUser) {
      const roles: RoleModel[] = loggedUser?.roles || [];

      hasPermission =
        loggedUser?.profile === PROFILE.EVA_ADMIN ||
        ((profile === PROFILE.any || profile.includes(loggedUser?.profile || 'no_profile')) &&
          (functionality === FUNCTIONALITY.any ||
            roles.some((role: RoleModel) => {
              return role.permissions?.some(
                (perm: PermissionAssignmentModel) =>
                  (perm.name === functionality || functionality.includes(perm.name)) &&
                  (permission === PERMISSION.any || perm.accessType === permission)
              );
            })));
      if (!hasPermission && functionality) {
        if (Array.isArray(functionality)) {
          functionality.forEach((func: string) => {
            if (!hasPermission) {
              hasPermission = UtilityProfile.checkBreakAccessProfile(userProfileService, profile, func, permission);
            }
          });
        } else if (typeof functionality === 'string') {
          hasPermission = UtilityProfile.checkBreakAccessProfile(userProfileService, profile, functionality, permission);
        }
      }
    }
    subscriptionList.forEach((sub: Subscription) => sub.unsubscribe());

    // If no user is logged in or no roles are assigned, return false
    return hasPermission;
  }

  static checkBreakAccessProfile(
    userProfileService: UserProfileService,
    profile: string | string[],
    functionality: string,
    permission: string
  ): boolean {
    let breakFunctionality = '';
    switch (functionality) {
      case FUNCTIONALITY.networkAdministrativeCompany:
        breakFunctionality = FUNCTIONALITY.networkAdministrativeBreak;
        break;
      case FUNCTIONALITY.networkStructure:
        breakFunctionality = FUNCTIONALITY.networkStructureBreak;
        break;
    }

    return UtilityProfile.checkAccessProfile(userProfileService, profile, breakFunctionality, permission);
  }
}
