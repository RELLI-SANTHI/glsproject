import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';

import { SubjectEditBodyComponent } from '../../../../subject/subject-edit/subject-edit-body/subject-edit-body.component';
import { MessageStatusService } from '../../../../../../common/utilities/services/message/message.service';
import { SubjectResponseShort } from '../../../../../../api/glsAdministrativeApi/models/subject-response-short';
import { SubjectService } from '../../../../../../api/glsAdministrativeApi/services/subject.service';
import { AdministrativeCommonService } from '../../../../services/administrative.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubjectModalComponent } from './subject-modal/subject-modal.component';
import { SUBJECT_CONSTANTS } from '../../../../subject/constants/subject-constants';
import { UserProfileService } from '../../../../../../common/utilities/services/profile/user-profile.service';
import { UserDetailsModel } from '../../../../../../api/glsUserApi/models';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { MODAL_XL } from '../../../../../../common/utilities/constants/modal-options';
import { SubjectCreateModel, SubjectResponse } from '../../../../../../api/glsAdministrativeApi/models';
import { GlsPaginatorComponent } from '../../../../../../common/components/gls-paginator/gls-paginator.component';
import { Utility } from '../../../../../../common/utilities/utility';
import { PatchApiSubjectV1Id$Json$Params } from '../../../../../../api/glsAdministrativeApi/fn/subject/patch-api-subject-v-1-id-json';
import { UtilityProfile } from '../../../../../../common/utilities/utility-profile';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../../../common/utilities/constants/profile';
import { GenericDropdown } from '../../../../../../common/models/generic-dropdown';

@Component({
  selector: 'app-subject-accordions',
  standalone: true,
  imports: [NgxDatatableModule, TranslatePipe, SubjectEditBodyComponent, CommonModule, GlsPaginatorComponent],
  templateUrl: './subject-accordions.component.html',
  styleUrl: './subject-accordions.component.scss'
})
export class SubjectAccordionsComponent implements OnInit {
  roleData = input<SubjectResponseShort[]>([]);
  pageSize = input<number>(0);
  currentPage = input<number>(0);
  totalItems = input<number>(0);
  totalPages = input<number>(0);
  isDraft = input.required<boolean>();
  showEditSuccessMessage = input<boolean>();
  showSelectionWarningMessage = input<boolean>();
  nationDefault = input<GenericDropdown | null>(null);
  nationList = input<GenericDropdown[] | null>(null);
  idAccordWarning = signal<number | null>(null);
  idAccordSuccess = signal<number | null>(null);
  selectedId = signal<number | null>(null);
  formParent!: FormGroup;
  pageChange = output<number>();
  subjectIdChange = output<SubjectResponseShort>();
  reloadSearch = output<void>();
  accordingSubjectDetail: SubjectResponse | null = null;
  type = SUBJECT_CONSTANTS.CREATE;
  protected readonly PROFILE = PROFILE;
  protected readonly FUNCTIONALITY = FUNCTIONALITY;
  protected readonly PERMISSION = PERMISSION;
  protected readonly messageStatusService = inject(MessageStatusService);
  protected readonly userProfileService = inject(UserProfileService);
  private readonly subjectService = inject(SubjectService);
  private readonly administrativeService = inject(AdministrativeCommonService);
  private readonly modalService = inject(NgbModal);
  private readonly translateService = inject(TranslateService);
  private readonly genericService = inject(GenericService);
  private user!: UserDetailsModel | null;

  constructor() {
    this.userProfileService.profile$.subscribe((profileValue) => {
      this.user = profileValue;
    });
  }

  ngOnInit() {
    this.formParent = this.administrativeService.setSubjectForm(this.user!);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  toggleExpandRow(row: SubjectResponseShort) {
    this.loadDetailSubject(row);
  }

  selectSubject(row: SubjectResponseShort): void {
    this.selectedId.set(row.id);
    this.subjectIdChange.emit(row);
  }

  getFirstResult(): number {
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  getLastResult(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  }

  hasAccess(profile: string, functionality: string, permission: string): boolean {
    return UtilityProfile.checkAccessProfile(this.userProfileService, profile, functionality, permission);
  }

  /**
   * Open the modal for editing subject details.
   * This method initializes the modal with the current subject form and sets up the necessary
   */
  openSubjectCodeModal(): void {
    const modalRef = this.modalService.open(SubjectModalComponent, MODAL_XL);
    const formClone = this.administrativeService.setSubjectForm(this.user!, this.formParent.getRawValue());

    modalRef.componentInstance.title = this.translateService.instant('administrative.generalData.modalValues.titleEditSubject');
    modalRef.componentInstance.cancelText = this.translateService.instant('administrative.generalData.modalValues.btnCancel');
    modalRef.componentInstance.confirmText = this.translateService.instant('administrative.subjectList.confirmEditSubject');
    modalRef.componentInstance.nationList = this.nationList();
    modalRef.componentInstance.nationDefault = this.nationDefault();
    modalRef.componentInstance.formParent = formClone;

    modalRef.result
      .then((subjFormGrp) => {
        this.formParent = subjFormGrp;
        this.saveSubject();
      })
      .catch((err) => {
        console.error('Modal dismissed without selection', err);
      });
  }

  /**
   * Load detailed information about a subject.
   * @param subject {SubjectResponseShort} - The subject for which to load details.
   * @private
   */
  private loadDetailSubject(subject: SubjectResponseShort): void {
    this.subjectService.getApiSubjectV1Id$Json({ id: subject.id }).subscribe({
      next: (response) => {
        this.formParent = this.administrativeService.setSubjectForm(this.user!, response);
        this.accordingSubjectDetail = response;
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Save the subject details.
   * @param force {boolean} - Whether to force the save operation.
   * @private
   */
  private saveSubject(force = false): void {
    const editForm: FormGroup = new FormGroup({ ...this.formParent.controls });
    this.removeEmptyFields(editForm);
    const subjectForm: SubjectCreateModel = { ...editForm.getRawValue() };
    subjectForm.dateAdded = Utility.convertFromGenericDataToIsoString(editForm.get('dateAdded')?.value);
    subjectForm.force = force;
    const isVatGroup = subjectForm.vatGroup;
    const payload: PatchApiSubjectV1Id$Json$Params = {
      id: this.formParent!.get('id')!.value,
      body: {
        ...Utility.preparePayloadForPatch(editForm),
        force: force ?? false,
        status: {
          isModified: true
        }
      }
    };
    this.subjectService.patchApiSubjectV1Id$Json$Response(payload).subscribe({
      next: (response) => {
        if (response.status == 200 || response.status == 201) {
          this.reloadSearch.emit();
        } else if (response.status == 412 && !isVatGroup) {
          this.genericService.openErrorModal(
            'attention',
            'administrative.subject.confirmVatNumber',
            undefined,
            'modal.confirmText',
            () => this.saveSubject(true),
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
      subjectForm.removeControl('permanentEstablishmentDetail');
    } else if (permEstControl instanceof FormGroup) {
      permEstControl.removeControl('subjectType');
    }

    if (!taxRepresent && taxRepresentControl) {
      subjectForm.removeControl('taxRepresentativeDetail');
    } else if (taxRepresentControl instanceof FormGroup) {
      taxRepresentControl.removeControl('selectRadioFiscalRapp');
    }
  }
}
