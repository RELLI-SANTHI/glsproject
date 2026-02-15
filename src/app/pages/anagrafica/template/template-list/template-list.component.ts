import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ICONS } from '../../../../common/utilities/constants/icon';
import { map, Observable } from 'rxjs';
import { TemplateService } from '../../../../api/glsNetworkApi/services';
import { TemplateModel } from '../../../../api/glsNetworkApi/models';
import { HttpErrorResponse } from '@angular/common/http';
import { GlsMessagesComponent } from '../../../../common/components/gls-messages/gls-messages.component';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { GlsCardComponent } from '../../../../common/components/gls-card/gls-card.component';
import { ConfirmationDialogData } from '../../../../common/models/confirmation-dialog-interface';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { GetApiTemplateV1$Json$Params } from '../../../../api/glsNetworkApi/fn/template/get-api-template-v-1-json';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../common/utilities/constants/profile';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { UtilityProfile } from '../../../../common/utilities/utility-profile';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { Utility } from '../../../../common/utilities/utility';
import { VIEW_MODE } from '../../../../common/app.constants';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, GlsMessagesComponent, GlsCardComponent],
  templateUrl: './template-list.component.html',
  styleUrl: './template-list.component.scss'
})
export class TemplateListComponent implements OnInit, OnDestroy {
  templateResponseList?: TemplateModel[];
  dialogData!: ConfirmationDialogData;
  modalRef!: NgbModalRef;
  PROFILE = PROFILE;
  FUNCTIONALITY = FUNCTIONALITY;
  PERMISSION = PERMISSION;
  visibility = false;
  typeViewMode: VIEW_MODE | undefined;
  isSmallMobile = signal(false);
  private readonly templateService = inject(TemplateService);
  private readonly userProfileService = inject(UserProfileService);

  constructor(
    protected messageStatusService: MessageStatusService,
    private genericService: GenericService // Assuming this is a service for managing generic messages
  ) {
  }

  // Lifecycle hook that is called after data-bound properties of a directive are initialized.
  ngOnInit() {
    this.retrieveTemplates().subscribe({
      next: (res: TemplateModel[]) => {
        this.templateResponseList = res;
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });

    this.setupViewMode();
    this.visibility = this.hasAccess(PROFILE.any, FUNCTIONALITY.networkTemplate, PERMISSION.write);
  }

  ngOnDestroy(): void {
    this.messageStatusService.hide();
  }

  // Navigates to the template creation page.
  newTemplate() {
    UtilityRouting.navigateToTemplateCreate();
  }

  /**
   * Navigates to the template detail page for the specified template ID.
   * @param templateId The unique identifier for the template.
   */
  goToTemplateDetail(templateId: number): void {
    UtilityRouting.navigateToTemplateDetailByTemplateId(templateId.toString());
  }

  /**
   * Retrieves the icon associated with the specified template icon name.
   * @param templateIcon The name of the template icon.
   * @returns The icon associated with the specified template icon name.
   */
  getTemplateIcon(templateIcon: string): string {
    // retrieve icon from list
    return ICONS[templateIcon];
  }

  // function that wraps the function I declared in utilities/utility.ts
  hasAccess(profile: string, functionality: string, permission: string): boolean {
    const visible: boolean = UtilityProfile.checkAccessProfile(this.userProfileService, profile, functionality, permission);

    return visible;
  }

  /**
   * Retrieves the list of templates from the API.
   * @returns The list of templates.
   */
  private retrieveTemplates(): Observable<TemplateModel[]> {
    const param: GetApiTemplateV1$Json$Params = {};

    // Create HTTP context with custom headers
    const context = Utility.setPermissionHeaders(FUNCTIONALITY.networkTemplate, PERMISSION.read);

    // Call the API to get the list of templates
    return this.templateService.getApiTemplateV1$Json(param, context).pipe(
      map((r: TemplateModel[]) => {
        return r;
      })
    );
  }

  /**
   * Configura la modalità di visualizzazione.
   */
  private setupViewMode(): void {
    this.typeViewMode = this.genericService.viewMode();
    this.isSmallMobile.set(this.typeViewMode === VIEW_MODE.MOBILE);
  }
}
