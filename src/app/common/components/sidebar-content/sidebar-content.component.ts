import { ChangeDetectionStrategy, Component, EventEmitter, inject, input, model, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgClass, NgIf } from '@angular/common';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';

import { BreadcrumbService } from '../../utilities/services/breadcrumb/breadcrumb.service';
import { UserProfileService } from '../../utilities/services/profile/user-profile.service';
import { PROFILE, FUNCTIONALITY, PERMISSION } from '../../utilities/constants/profile';
import { UtilityProfile } from '../../utilities/utility-profile';
import { UtilityRouting } from '../../utilities/utility-routing';

@Component({
  selector: 'app-sidebar-content',
  standalone: true,
  imports: [TranslatePipe, NgClass, NgbCollapse, NgIf],
  templateUrl: './sidebar-content.component.html',
  styleUrl: './sidebar-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarContentComponent {
  onlyIcons = input<boolean>(false);
  activePage = model();
  isCollapsed = true;
  isUserCollapsed = true;
  isAdministrativeCollapsed = true;
  activePageValue?: string;
  PROFILE = PROFILE;
  FUNCTIONALITY = FUNCTIONALITY;
  PERMISSION = PERMISSION;

  @Output() toggleSidebar = new EventEmitter<boolean>();

  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly userProfileService = inject(UserProfileService);

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.activePage.subscribe((res: any) => {
      this.activePageValue = res;
    });
  }

  // function that wraps the function I declared in utilities/utility.ts
  hasAccess(profile: string, functionality: string, permission: string): boolean {
    const visible: boolean = UtilityProfile.checkAccessProfile(this.userProfileService, profile, functionality, permission);

    return visible;
  }

  goToPage(page: string): void {
    this.breadcrumbService.resetBreadcrumbs();
    const pageSelected = page.split('/');
    this.activePage.set(pageSelected[pageSelected.length - 1]);
    UtilityRouting.navigateTo('/' + page);
  }

  pageActive(page: string): boolean {
    return this.activePageValue === page;
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit(true);
  }
}
