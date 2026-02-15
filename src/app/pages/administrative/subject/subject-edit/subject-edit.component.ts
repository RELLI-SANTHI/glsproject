/* eslint-disable max-lines-per-function */
/* eslint-disable no-extra-boolean-cast */
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { SUBJECT_CONSTANTS, SUBJECT_MESSAGES } from '../constants/subject-constants';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { FormFooterComponent } from '../../../../common/components/form-footer/form-footer.component';
import { ContentHeaderComponent } from '../../../../common/components/content-header/content-header.component';
import { SubjectEditBodyComponent } from './subject-edit-body/subject-edit-body.component';
import { CONCURRENCY } from '../../../../common/utilities/constants/concurrency';
import { UtilityConcurrency } from '../../../../common/utilities/utility-concurrency';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { GlsMessagesComponent } from '../../../../common/components/gls-messages/gls-messages.component';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { AdministrativeCommonService } from '../../services/administrative.service';
import { SubjectService } from '../../../../api/glsAdministrativeApi/services/subject.service';
import { RelationshipType } from '../../relationship/enum/relationship-type';
import { PostApiSubjectCreate$Json$Params } from '../../../../api/glsAdministrativeApi/fn/subject/post-api-subject-create-json';
import { StrictHttpResponse } from '../../../../api/glsAdministrativeApi/strict-http-response';
import { BreadcrumbService } from '../../../../common/utilities/services/breadcrumb/breadcrumb.service';
import { Utility } from '../../../../common/utilities/utility';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { UserDetailsModel } from '../../../../api/glsUserApi/models';
import { TitleBudgeComponent } from '../../../../common/components/title-budge/title-budge.component';
import { SubjectCreateModel } from '../../../../api/glsAdministrativeApi/models/subject-create-model';
import { PatchApiSubjectV1Id$Json$Params } from '../../../../api/glsAdministrativeApi/fn/subject/patch-api-subject-v-1-id-json';
import { FUNCTIONALITY, PERMISSION } from '../../../../common/utilities/constants/profile';
import { TranslatePipe } from '@ngx-translate/core';
import { SUBJECT_STATUS } from '../enum/subject-enum';
import { VIEW_MODE } from '../../../../common/app.constants';
import { NationsCodeService } from '../../../../api/glsAdministrativeApi/services';
import { GenericDropdown } from '../../../../common/models/generic-dropdown';
import { NationsCodeModel } from '../../../../api/glsAdministrativeApi/models';

@Component({
  selector: 'app-subject-edit',
  standalone: true,
  imports: [
    FormFooterComponent,
    ContentHeaderComponent,
    SubjectEditBodyComponent,
    GlsMessagesComponent,
    AsyncPipe,
    TitleBudgeComponent,
    DatePipe,
    TranslatePipe
  ],
  providers: [AdministrativeCommonService],
  templateUrl: './subject-edit.component.html',
  styleUrl: './subject-edit.component.scss'
})
export class SubjectEditComponent implements OnInit, OnDestroy {
  lastUpdated: Date | undefined;
  showTabs = signal<boolean>(true);
  warningOrError = signal<boolean>(false);
  singleSubject = false;
  titles = [];
  subtitle = 'administrative.subjectEdit.subtitle';
  title = 'administrative.subjectEdit.title';
  type = SUBJECT_CONSTANTS.CREATE;
  lastInteractionTime: number = new Date().getTime();
  modalRef!: NgbModalRef;
  isFromDetailSubject = false;
  status = '';
  isSmallMobile = signal(false);

  protected nationList = signal<GenericDropdown[]>([]);
  protected nationDefault = signal<GenericDropdown | null>(null);

  protected subjectEditForm!: FormGroup;
  protected idSubject: number | undefined;
  protected readonly labelDelete = 'formFooter.delete';
  protected readonly messageStatusService = inject(MessageStatusService);
  protected readonly modalService = inject(NgbModal);
  protected readonly breadcrumbService = inject(BreadcrumbService);
  protected readonly userProfileService = inject(UserProfileService);
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly genericService = inject(GenericService);
  private readonly administrativeService = inject(AdministrativeCommonService);
  private readonly subjectService = inject(SubjectService);
  private readonly nationsCodeService = inject(NationsCodeService);
  private user!: UserDetailsModel | null;

  constructor() {
    this.userProfileService.profile$.subscribe((profileValue) => {
      this.user = profileValue;
    });
  }

  /**
   * Determines if the current view mode is small mobile.
   * @returns {boolean} - True if the view mode is small mobile, false otherwise.
   */
  get labelNext(): string {
    if (this.isSmallMobile()) {
      return 'administrative.subjectList.confirm';
    } else {
      return this.isFromDetailSubject ? 'administrative.subjectList.confirmEditSubject' : 'administrative.subjectList.confirmCreateSubject';
    }
  }

  /**
   * Checks if the draft exit button should be disabled.
   * The button is disabled if any of the required fields are empty or invalid.
   * @returns {boolean} - True if the draft exit is disabled, false otherwise.
   */
  get isDraftExitDisabled(): boolean {
    const companyName = this.subjectEditForm.get('companyName');
    const corporateGroupId = this.subjectEditForm.get('corporateGroupId');
    const taxCode = this.subjectEditForm.get('taxCode');
    const vatNumber = this.subjectEditForm.get('vatNumber');

    return (
      !companyName ||
      companyName.invalid ||
      !corporateGroupId ||
      corporateGroupId.invalid ||
      !taxCode ||
      taxCode.invalid ||
      !vatNumber ||
      vatNumber.invalid
    );
  }

  get isDraft(): boolean {
    return this.type === SUBJECT_CONSTANTS.CREATE || this.status === SUBJECT_STATUS.DRAFT;
  }

  ngOnInit(): void {
    this.idSubject = this.activatedRoute.snapshot.paramMap.get('idSubject')
      ? Number(this.activatedRoute.snapshot.paramMap.get('idSubject'))
      : undefined;
    this.isFromDetailSubject = this.activatedRoute.snapshot.paramMap.get('fromDetail') === 'true';
    this.type = this.idSubject ? SUBJECT_CONSTANTS.EDIT : SUBJECT_CONSTANTS.CREATE;
    this.loadSubjectPage(this.idSubject);
    this.loadDropdownValues();
    this.lockUnlock();
    this.isSmallMobile.set(this.genericService.viewMode() === VIEW_MODE.MOBILE);
    this.genericService.resizeMainPage.set(this.isSmallMobile() ? '10rem' : '8.75rem');
  }

  private loadDropdownValues(): void {
    const payload = { body: {} };

    const nationsCall = this.nationsCodeService.postApiNationscodeV1$Json(payload);

    forkJoin({ nationsRes: nationsCall }).subscribe({
      next: (result: { nationsRes: NationsCodeModel[] }) => {
        this.nationList.set(
          result.nationsRes.map((item: NationsCodeModel) => ({
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

  /**
   * Locks the Subject by its ID.
   * This method sends a request to lock the Subject, preventing further modifications.
   *
   * @param idSubject - The ID of the Subject to lock.
   * @returns An observable of the locked Subject details.
   */
  lockSubject(idSubject: number): Observable<StrictHttpResponse<void>> {
    const param = {
      id: idSubject
    };

    return this.subjectService.postApiSubjectV1IdLock$Response(param);
  }

  /**
   * Unlocks the Subject by its ID.
   * This method sends a request to unlock the Subject, allowing further modifications.
   *
   * @param idSubject - The ID of the Subject to unlock.
   * @returns An observable of the unlocked Subject details.
   */
  unlockSubject(idSubject: number): Observable<StrictHttpResponse<void>> {
    const param = {
      id: idSubject
    };

    return this.subjectService.postApiSubjectV1IdUnlock$Response(param);
  }

  ngOnDestroy(): void {
    this.genericService.resizeMainPage.set(this.genericService.defaultValue());
    if (!!this.idSubject && this.intervalId !== null) {
      this.unlockSubject(this.idSubject!).subscribe({
        next: () => {
          clearInterval(this.intervalId!);
        },
        error: (err: HttpErrorResponse) => {
          Utility.logErrorForDevEnvironment(err);
        }
      });
    }
  }

  goBack(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.isFromDetailSubject ? UtilityRouting.navigateToSubjectDetailById(this.idSubject) : UtilityRouting.navigateToSubjectList();
  }

  addRelation(): void {
    this.router.navigate(['administrative/relationship-new', 0, RelationshipType.Subject]);
  }

  isPermanentEstablishmentDetail(subjectForm: FormGroup): boolean {
    const permEstControl = subjectForm?.get('permanentEstablishmentDetail');
    let permEst = false;
    if (permEstControl instanceof FormGroup) {
      permEst = permEstControl.get('subjectType')?.value;
    }

    return permEst;
  }

  isTaxRepresentativeDetail(subjectForm: FormGroup): boolean {
    const taxRepControl = subjectForm?.get('taxRepresentativeDetail');
    let taxRep = false;
    if (taxRepControl instanceof FormGroup) {
      taxRep = taxRepControl.get('selectRadioFiscalRapp')?.value;
    }

    return taxRep;
  }

  saveSubject(isDraft: boolean, force?: boolean): void {
    const editForm: FormGroup = new FormGroup({ ...this.subjectEditForm.controls });
    this.removeEmptyFields(editForm);
    const subjectForm: SubjectCreateModel = { ...editForm.getRawValue() };
    subjectForm.status = isDraft ? SUBJECT_STATUS.DRAFT : SUBJECT_STATUS.COMPLETED;
    const isVatGroup = subjectForm.vatGroup;
    let callApi;
    let msgSuccess = '';

    if (!!this.idSubject) {
      msgSuccess = SUBJECT_MESSAGES.SUCCESS_EDIT;
      const payload: PatchApiSubjectV1Id$Json$Params = {
        id: this.idSubject,
        body: {
          ...Utility.preparePayloadForPatch(editForm),
          force: force ?? false,
          status: {
            isModified: true,
            value: isDraft ? SUBJECT_STATUS.DRAFT : SUBJECT_STATUS.COMPLETED
          }
        }
      };

      const permEst = this.isPermanentEstablishmentDetail(editForm);
      const taxRepresent = this.isTaxRepresentativeDetail(editForm);

      if (!permEst && payload.body?.permanentEstablishmentDetail) {
        payload.body.permanentEstablishmentDetail = undefined;
      }

      if (!taxRepresent && payload.body?.taxRepresentativeDetail) {
        payload.body.taxRepresentativeDetail = undefined;
      }

      callApi = this.subjectService.patchApiSubjectV1Id$Json$Response(payload);
    } else {
      msgSuccess = SUBJECT_MESSAGES.SUCCESS_CREATE;
      subjectForm.dateAdded = Utility.convertFromGenericDataToIsoString(this.subjectEditForm.get('dateAdded')?.value);
      subjectForm.force = force ?? false;
      const payload: PostApiSubjectCreate$Json$Params = {
        body: subjectForm
      };
      const permEst = this.isPermanentEstablishmentDetail(editForm);
      const taxRepresent = this.isTaxRepresentativeDetail(editForm);

      if (!permEst && payload.body?.permanentEstablishmentDetail) {
        payload.body.permanentEstablishmentDetail = undefined;
      }

      if (!taxRepresent && payload.body?.taxRepresentativeDetail) {
        payload.body.taxRepresentativeDetail = undefined;
      }
      callApi = this.subjectService.postApiSubjectCreate$Json$Response(payload);
    }

    callApi.subscribe({
      next: (response) => {
        if (response.status == 200 || response.status == 201) {
          let msg = 'administrative.subjectEdit.messages.';
          msg = msg + (isDraft ? SUBJECT_MESSAGES.DRAFT : msgSuccess);
          this.messageStatusService.show(msg);
          UtilityRouting.navigateToSubjectList();
        } else if (response.status == 412 && !isVatGroup) {
          this.genericService.openErrorModal(
            'attention',
            'administrative.subject.confirmVatNumber',
            undefined,
            'modal.confirmText',
            () => this.saveSubject(isDraft, true),
            true
          );
        }
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Deletes a subject by its ID.
   * @param idSubject {number} - The ID of the subject to delete.
   */
  deleteSubject(idSubject: number): void {
    this.subjectService.deleteApiSubjectV1Id$Response({ id: idSubject }).subscribe({
      next: () => {
        this.messageStatusService.show(SUBJECT_CONSTANTS.DELETE_SUCCESS);
        UtilityRouting.navigateToSubjectList();
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Remove empty fields from the subject form.
   * This method checks for specific fields in the subject form and removes them if they are empty.
   * It specifically handles the 'permanentEstablishmentDetail' and 'taxRepresentativeDetail'
   * @param subjectForm
   */
  private removeEmptyFields(subjectForm: FormGroup): void {
    const permEstControl = subjectForm?.get('permanentEstablishmentDetail');
    const taxRepresentControl = subjectForm?.get('taxRepresentativeDetail');

    let permEst = false;
    let taxRepresent = false;

    if (permEstControl instanceof FormGroup) {
      permEst = permEstControl.get('subjectType')?.value;
    }
    if (taxRepresentControl instanceof FormGroup) {
      taxRepresent = taxRepresentControl.get('selectRadioFiscalRapp')?.value;
    }

    if (!permEst && permEstControl) {
      permEstControl?.reset();
    }

    if (!taxRepresent && taxRepresentControl) {
      taxRepresentControl?.reset();
    }
  }

  private loadSubjectPage(idSubject?: number): void {
    if (idSubject) {
      this.singleSubject = true;
      // Create HTTP context with custom headers
      const context = Utility.setPermissionHeaders(FUNCTIONALITY.networkAdministrativeSubject, PERMISSION.write);
      this.subjectService.getApiSubjectV1Id$Json({ id: idSubject }, context).subscribe({
        next: (result) => {
          this.subjectEditForm = this.administrativeService.setSubjectForm(this.user!, result);
          this.title = result.surnameNameCompanyName ?? '';
          this.subtitle = '';
          this.lastUpdated = result.lastUpdated ? new Date(result.lastUpdated) : undefined;
          this.status = result.status ?? '';
          const dateFormatted = Utility.convertFromGenericDataToDatepicker(result?.dateAdded ?? null);
          this.subjectEditForm.get('dateAdded')?.setValue(dateFormatted);
          this.warningOrError.set(!!result.warningOrError);
          this.subjectEditForm.statusChanges.subscribe(() => {
            this.lastInteractionTime = new Date().getTime();
          });
        },
        error: (err) => {
          Utility.logErrorForDevEnvironment(err);
        }
      });
    } else {
      this.subjectEditForm = this.administrativeService.setSubjectForm(this.user!);
      const dateFormatted = Utility.convertFromGenericDataToDatepicker(new Date());
      this.subjectEditForm.get('dateAdded')?.setValue(dateFormatted);
    }
  }

  /**
   * Locks the relationship and sets up an interval to check for concurrency issues.
   * @private
   */
  private lockUnlock(): void {
    if (!!this.idSubject) {
      this.intervalId = setInterval(() => {
        UtilityConcurrency.handleInterval(
          this.idSubject!,
          this.lastInteractionTime,
          (entityId: number) => this.lockSubject(entityId),
          (title: string, message: string) => this.genericService.openErrorModal(title, message),
          () => UtilityRouting.navigateTo('administrative/subject-list')
        );
      }, CONCURRENCY.sessionMaxTimeMs);
    }
  }
}
