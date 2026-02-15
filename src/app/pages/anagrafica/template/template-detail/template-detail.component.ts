import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ViewDetailsComponent } from '../../../../common/components/view-details/view-details.component';
import { TemplateDetailsModel, TemplateFieldModel } from '../../../../api/glsNetworkApi/models';
import { ICONS } from '../../../../common/utilities/constants/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateService } from '../../../../api/glsNetworkApi/services';
import { GetTemplateById$Json$Params } from '../../../../api/glsNetworkApi/fn/template/get-template-by-id-json';
import { ConfirmationDialogComponent } from '../../../../common/components/confirmation-dialog/confirmation-dialog/confirmation-dialog.component';
import { TitleBudgeComponent } from '../../../../common/components/title-budge/title-budge.component';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { CommonModule } from '@angular/common';
import { GlsMessagesComponent } from '../../../../common/components/gls-messages/gls-messages.component';

import { GenericService } from '../../../../common/utilities/services/generic.service';
import { VIEW_MODE } from '../../../../common/app.constants';
import { InfoMobileComponent } from '../../../../common/components/info-mobile/info-mobile.component';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../common/utilities/constants/profile';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { UtilityProfile } from '../../../../common/utilities/utility-profile';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { Utility } from '../../../../common/utilities/utility';
import { MODAL_MD } from '../../../../common/utilities/constants/modal-options';

@Component({
  selector: 'app-template-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgbNavModule,
    ViewDetailsComponent,
    TitleBudgeComponent,
    GlsMessagesComponent,
    InfoMobileComponent
  ],
  templateUrl: './template-detail.component.html',
  styleUrl: './template-detail.component.scss'
})
export class TemplateDetailComponent implements OnInit, OnDestroy {
  active = 'anagrafica';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formGroup: FormGroup | any;
  fieldsList = signal<TemplateFieldModel[]>([]);
  loadPage = false;
  title = '';
  icon = '';
  isSmallMobile = false;
  showRotateCard = signal(false);
  PROFILE = PROFILE;
  FUNCTIONALITY = FUNCTIONALITY;
  PERMISSION = PERMISSION;
  protected idTemplate!: number;
  private templateDetailsModel?: TemplateDetailsModel;
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly genericService = inject(GenericService);
  private readonly userProfileService = inject(UserProfileService);

  constructor(
    private templateService: TemplateService,
    public modalService: NgbModal,
    protected messageStatusService: MessageStatusService
  ) {
    effect(
      () => {
        this.showRotateCard.set(this.isSmallMobile && !this.genericService.isLandscape());
      },
      {
        allowSignalWrites: true
      }
    );
  }

  get idTemplateString(): string {
    return String(this.idTemplate);
  }

  ngOnInit() {
    this.idTemplate = Number(this.route.snapshot.paramMap.get('idTemplate'));
    this.retrieveTemplateById(this.idTemplate).subscribe({
      next: (response: TemplateDetailsModel) => {
        const buildingAcromym: TemplateFieldModel = {
          id: -1,
          fieldName: 'BuildingAcronym',
          section: 'anagrafica',
          subSection: 'general',
          isVisible: true,
          isRequired: true,
          mandatory: true
        };
        response.fields.unshift(buildingAcromym);

        this.fieldsList.update(() => response.fields);
        this.templateDetailsModel = response;
        this.buildForm();
        this.title = response.templateName;
        this.icon = response.icon;
        this.loadPage = true;
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
    this.isSmallMobile = this.genericService.viewMode() === VIEW_MODE.MOBILE;
  }

  ngOnDestroy(): void {
    this.messageStatusService.hide();
  }

  /**
   * * Retrieves the list of fields from the template details model.
   * @returns The list of fields.
   * @param title
   * @param content
   * @param additionalData
   */
  openErrorModal(
    title: string,
    content: string,
    additionalData?: {
      placeHolder: string;
      value: string | number;
    }[]
  ): void {
    const dialogData = {
      title,
      content,
      additionalData,
      showCancel: false,
      // cancelText: 'cancelText',
      confirmText: 'ok'
    };
    const modalRef = this.modalService.open(ConfirmationDialogComponent, MODAL_MD);
    modalRef.componentInstance.data = dialogData;
    modalRef.result.then(() => {
      // if OK close the modal `Closed with: ${result}`
      UtilityRouting.navigateToTemplateList();
    });
  }

  /**
   * Navigates to the template edit page
   */
  editTemplate() {
   this.templateService.postApiTemplateV1IdLock$Response({ id: this.idTemplate }).subscribe({
      next: (response) => {
        if (response.status === 204) {
          UtilityRouting.navigateToTemplateEditByTemplateId(this.idTemplateString);
        } else {
          this.genericService.openErrorModal('generic.error.generic', response.statusText);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * get template Icon method
   * @param icon
   * @returns
   */
  getTemplateIcon(icon: string): string {
    return ICONS[icon] || '';
  }

  /**
   * Retrieves the list of templates from the API.
   * @returns The list of templates.
   */
  retrieveTemplateById(idTemplate: number): Observable<TemplateDetailsModel> {
    const param: GetTemplateById$Json$Params = {
      id: idTemplate
    };

    // Create HTTP context with custom headers
    const context = Utility.setPermissionHeaders(FUNCTIONALITY.networkTemplate, PERMISSION.read);

    return this.templateService.getTemplateById$Json(param, context).pipe(
      map((r: TemplateDetailsModel) => {
        return r;
      })
    );
  }

  // function that wraps the function I declared in utilities/utility.ts
  hasAccess(profile: string, functionality: string, permission: string): boolean {
    const visible: boolean = UtilityProfile.checkAccessProfile(this.userProfileService, profile, functionality, permission);

    return visible;
  }

  /**
   * * Retrieves the list of fields from the template details model.
   * @returns The list of fields.
   */
  private buildForm(): void {
    this.formGroup = this.fb.group({
      buildingAcronymMin: [
        this.templateDetailsModel?.buildingAcronymMinLength ? this.templateDetailsModel.buildingAcronymMinLength : '',
        Validators.required
      ],
      buildingAcronymMax: [
        this.templateDetailsModel?.buildingAcronymMaxLength ? this.templateDetailsModel.buildingAcronymMaxLength : '',
        Validators.required
      ]
    });

    this.fieldsList().forEach((field) => {
      const isVisible = field.isVisible;
      this.formGroup.addControl(
        field.fieldName,
        new FormControl({
          value: `${isVisible}`,
          disabled: isVisible || false
        })
      );
      this.formGroup.addControl(
        field.fieldName + '_toggle',
        new FormControl({
          value: `${isVisible}`,
          disabled: isVisible || this.formGroup.get(field.fieldName)?.value === 'false'
        })
      );
    });
  }
}
