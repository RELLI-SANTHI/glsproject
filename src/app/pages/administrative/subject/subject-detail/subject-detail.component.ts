import { Component, inject, OnInit, signal } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';

import { ContentHeaderComponent } from '../../../../common/components/content-header/content-header.component';
import { GlsMessagesComponent } from '../../../../common/components/gls-messages/gls-messages.component';
import { SubjectEditBodyComponent } from '../subject-edit/subject-edit-body/subject-edit-body.component';
import { SubjectService } from '../../../../api/glsAdministrativeApi/services/subject.service';
import { AdministrativeCommonService } from '../../services/administrative.service';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { UserDetailsModel } from '../../../../api/glsUserApi/models';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { TitleBudgeComponent } from '../../../../common/components/title-budge/title-budge.component';
import {
  HistoryExportRequest,
  HistoryFields,
  HistoryFieldToExport,
  NationsCodeModel,
  SubjectFieldHistoryResponse,
  SubjectResponse
} from '../../../../api/glsAdministrativeApi/models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MODAL_LG } from '../../../../common/utilities/constants/modal-options';
import { AdministrativeHistoryModalComponent } from '../../administrative-history-modal/administrative-history-modal.component';
import { UtilityProfile } from '../../../../common/utilities/utility-profile';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../common/utilities/constants/profile';
import { BadgeLinkComponent } from '../../../../common/components/badge-link/badge-link.component';
import { Utility } from '../../../../common/utilities/utility';
import { PostApiSubjectV1IdHistory$Json$Params } from '../../../../api/glsAdministrativeApi/fn/subject/post-api-subject-v-1-id-history-json';
import { HistoryModalModel } from '../../models/history-modal-model';
import { SpinnerStatusService } from '../../../../common/utilities/services/spinner/spinner.service';
import { PostApiSubjectV1IdHistoryExport$Json$Params } from '../../../../api/glsAdministrativeApi/fn/subject/post-api-subject-v-1-id-history-export-json';
import { VIEW_MODE } from '../../../../common/app.constants';
import { GenericDropdown } from '../../../../common/models/generic-dropdown';
import { forkJoin } from 'rxjs';
import { NationsCodeService } from '../../../../api/glsAdministrativeApi/services';

@Component({
  selector: 'app-subject-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    ContentHeaderComponent,
    GlsMessagesComponent,
    SubjectEditBodyComponent,
    TranslatePipe,
    TitleBudgeComponent,
    DatePipe,
    BadgeLinkComponent,
    NgClass
  ],
  providers: [AdministrativeCommonService],
  templateUrl: './subject-detail.component.html',
  styleUrl: './subject-detail.component.scss'
})
export class SubjectDetailComponent implements OnInit {
  subtitle = '';
  title = '';
  lastUpdate = new Date();
  subjectViewData: SubjectResponse | null = null;
  isSmallMobile = signal(false);
  isTablet = signal(false);
  typeViewMode: VIEW_MODE | undefined;
  warningOrError = signal<boolean>(false);
  PROFILE = PROFILE;
  FUNCTIONALITY = FUNCTIONALITY;
  PERMISSION = PERMISSION;

  protected nationList = signal<GenericDropdown[]>([]);
  protected nationDefault = signal<GenericDropdown | null>(null);

  protected subjectForm!: FormGroup;
  protected idSubject = 0;
  protected readonly messageStatusService = inject(MessageStatusService);
  protected readonly userProfileService = inject(UserProfileService);
  private user!: UserDetailsModel | null;
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subjectService = inject(SubjectService);
  private readonly administrativeService = inject(AdministrativeCommonService);
  private readonly genericService = inject(GenericService);
  private readonly modalService = inject(NgbModal);
  private readonly spinnerService = inject(SpinnerStatusService);
  private readonly translateService = inject(TranslateService);
  private readonly nationsCodeService = inject(NationsCodeService);

  constructor() {
    this.userProfileService.profile$.subscribe((profileValue) => {
      this.user = profileValue;
    });
  }

  ngOnInit(): void {
    this.idSubject = Number(this.activatedRoute.snapshot.paramMap.get('idSubject'));

    this.loadSubjectDetail();
    this.setupViewMode();
  }

  editSubject(): void {
    if (this.idSubject) {
      this.subjectService.postApiSubjectV1IdLock$Response({ id: this.idSubject! }).subscribe({
        next: (response) => {
          if (response.status === 204) {
            UtilityRouting.navigateToSubjectEdit(this.idSubject.toString(), true);
          } else {
            this.genericService.openErrorModal('generic.error.generic', 'concurrency.lockedSubject');
          }
        },
        error: (err: HttpErrorResponse) => {
          this.genericService.manageError(err);
        }
      });
    }
  }

  addRelation(): void {
    UtilityRouting.navigateToRelationshipCreate(this.idSubject);
  }

  onClickGetHistoricalInfo(): void {
    const params: PostApiSubjectV1IdHistory$Json$Params = {
      id: this.idSubject!,
      body: {}
    };
    this.subjectService.postApiSubjectV1IdHistory$Json(params).subscribe({
      next: (res: SubjectFieldHistoryResponse) => {
        // eslint-disable-next-line max-len
        const mapped: HistoryModalModel[] = res.item
          ? Utility.mapHistoryApiResponseToModel(res.item, 'administrative.fields.', this.translateService.currentLang)
          : [];

        this.lunchHistoryModal(mapped);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  exportDataHystory(filters: any): void {
    const languageUsed = this.translateService.currentLang;
    const prefixTranslated = 'administrative.fields.';
    // List of field keys as in AdministrativeFieldsHistoryResponse (aggiornata con i campi forniti)
    const exportData: HistoryFields[] = ['FieldName', 'Value', 'ReferenceDate'];

    // Map to export fields with translated labels (like in exportClientsData)
    const exportFields: HistoryFieldToExport[] = exportData.map((key) => ({
      field: key,
      label: Utility.translate(prefixTranslated + key, this.translateService)
    }));

    const body: HistoryExportRequest = {
      languageTranslate: (languageUsed.toUpperCase() as 'EN' | 'IT') ?? 'IT',
      fieldsToExport: exportFields
      // fieldName: filters?.searchField && filters.searchField !== '' ? filters.searchField : undefined,
      // fieldValue: filters?.searchTerm && filters.searchTerm !== '' ? filters.searchTerm : undefined
    };

    const exportPayload: PostApiSubjectV1IdHistoryExport$Json$Params = {
      id: this.idSubject,
      body
    };

    this.subjectService.postApiSubjectV1IdHistoryExport$Json$Response(exportPayload).subscribe({
      next: (res) => {
        Utility.handleExportDataResponse(res, 'Subjects_history');
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  hasAccess(profile: string, functionality: string, permission: string): boolean {
    const visible: boolean = UtilityProfile.checkAccessProfile(this.userProfileService, profile, functionality, permission);

    return visible;
  }

  private loadSubjectDetail(): void {
    const payload = { body: {} };
    const context = Utility.setPermissionHeaders(FUNCTIONALITY.networkAdministrativeSubject, PERMISSION.read);

    const subjectDetail = this.subjectService.getApiSubjectV1Id$Json({ id: this.idSubject }, context);
    const nationsCall = this.nationsCodeService.postApiNationscodeV1$Json(payload);

    forkJoin({ subject: subjectDetail, nations: nationsCall }).subscribe({
      next: (result: { subject: SubjectResponse; nations: NationsCodeModel[] }) => {
        this.subjectForm = this.administrativeService.setSubjectForm(this.user!, result.subject);
        this.title = result.subject.surnameNameCompanyName ?? '';
        this.subtitle = '';
        this.lastUpdate = result.subject.lastUpdated ? new Date(result.subject.lastUpdated) : new Date();
        this.warningOrError.set(!!result.subject.warningOrError);
        this.subjectViewData = result.subject;

        this.nationList.set(
          result.nations.map((item: NationsCodeModel) => ({
            id: item.id,
            value: `${item.isoCode} - ${item.description}`,
            isDefault: item.isDefault || false,
            code: item.isoCode
          }))
        );
        this.nationDefault.set(this.nationList().find((nation) => nation.isDefault) ?? null);
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  private lunchHistoryModal(list: HistoryModalModel[]): void {
    const modalRef = this.modalService.open(AdministrativeHistoryModalComponent, MODAL_LG);
    modalRef.componentInstance.historyList = list;

    modalRef.result.then((toExport) => {
      if (toExport) {
        this.spinnerService.show();
        this.exportDataHystory(toExport.filters);
        this.spinnerService.hide();
      }
    });
  }

  /**
   * Configura la modalità di visualizzazione.
   */
  private setupViewMode(): void {
    this.typeViewMode = this.genericService.viewMode();
    this.isSmallMobile.set(this.typeViewMode === VIEW_MODE.MOBILE);
    this.isTablet.set(this.typeViewMode === VIEW_MODE.TABLET);
  }
}
