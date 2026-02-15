import { CommonModule, DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModal, NgbModalRef, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';

import { ICONS } from '../../../../common/utilities/constants/icon';
import { AttachmentService, StructureService } from '../../../../api/glsNetworkApi/services';
import { AttachmentResponse, FieldDetailResponse, StructureDetailResponse } from '../../../../api/glsNetworkApi/models';
import { Utility } from '../../../../common/utilities/utility';
import { GetStructureById$Json$Params } from '../../../../api/glsNetworkApi/fn/structure/get-structure-by-id-json';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { STRUCTURE_CONSTANTS } from '../../constants/structure-constant';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { TitleBudgeComponent } from '../../../../common/components/title-budge/title-budge.component';
import { GlsMessagesComponent } from '../../../../common/components/gls-messages/gls-messages.component';
import { ConfirmationDialogData } from '../../../../common/models/confirmation-dialog-interface';
import { GetApiAttachmentV1Id$Json$Params } from '../../../../api/glsNetworkApi/fn/attachment/get-api-attachment-v-1-id-json';
import { StructureDisableService } from '../../../../common/utilities/services/structure-disable/structure-disable.service';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../common/utilities/constants/profile';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { UtilityProfile } from '../../../../common/utilities/utility-profile';
import { HttpErrorResponse } from '@angular/common/http';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { VIEW_MODE } from '../../../../common/app.constants';

@Component({
  selector: 'app-structure-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgbNavModule, DatePipe, NgTemplateOutlet, TitleBudgeComponent, GlsMessagesComponent],
  templateUrl: './structure-detail.component.html',
  styleUrl: './structure-detail.component.scss'
})
export class StructureDetailComponent implements OnInit, OnDestroy {
  apiResponse?: StructureDetailResponse;
  active = 1;
  displayStatus!: string;
  modalRef!: NgbModalRef;
  dialogData!: ConfirmationDialogData;
  /**
   * Indicates whether the page should be displayed.
   */
  showPage = false;
  PROFILE = PROFILE;
  FUNCTIONALITY = FUNCTIONALITY;
  PERMISSION = PERMISSION;
  visibility = false; // To avoid change detection
  isSmallMobile = signal(false);
  typeViewMode: VIEW_MODE | undefined;
  private idStructure: number | null = null;
  private readonly modalService = inject(NgbModal);
  private readonly structureDisableService = inject(StructureDisableService);
  private readonly structureService = inject(StructureService);
  private readonly userProfileService = inject(UserProfileService);

  /**
   * Constructor to initialize services and dependencies.
   * @param route - Activated route for accessing route parameters.
   * @param attachmentService - Service for handling attachments.
   * @param genericService - Generic service for utility functions.
   * @param messageStatusService - Service for managing message statuses.
   */
  constructor(
    private route: ActivatedRoute,
    private attachmentService: AttachmentService,
    private genericService: GenericService,
    protected messageStatusService: MessageStatusService
  ) {}

  /**
   * Retrieves the list of visible fields from the API response.
   * Filters fields based on their visibility status.
   */
  get fieldVisibleList(): FieldDetailResponse[] {
    return this.apiResponse?.fields?.filter((field) => field.isVisible) ?? [];
  }

  /**
   * Initializes the component and fetches structure details by ID
   * This is triggered when the component is loaded.
   */
  ngOnInit(): void {
    this.idStructure = Number(this.route.snapshot.paramMap.get('idStructure'));
    this.getStructureById().subscribe({
      next: (res: StructureDetailResponse) => {
        this.apiResponse = res;
        this.apiResponse.fields.forEach((items) => {
          if (items.fieldType === 'combo') {
            items.value = items.options?.[0]?.value ?? null;
          }
        });
        this.getStatus();
        this.showPage = true;
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
    this.setupViewMode();
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   *
   * This method performs cleanup tasks such as:
   * - Resetting the main page size to its default value using the `genericService`.
   * - Hiding any active status messages via the `messageStatusService`.
   * - Stopping and hiding the spinner via the `spinnerService`.
   */
  ngOnDestroy(): void {
    this.genericService.resizeMainPage.update(() => this.genericService.defaultValue());
    this.messageStatusService.hide();
  }

  /**
   * Returns the icon for a given template icon name.
   * @param {string | null | undefined} icon - The icon name to retrieve.
   * @returns {string} The icon path or empty string if no icon is found.
   */
  getTemplateIcon(icon: string | null | undefined): string {
    return icon ? ICONS[icon] : '';
  }

  /**
   * Navigates to the structure edit page and enables editing mode.
   */
  editStructure(): void {
    this.structureDisableService.toDisable(false);
    this.genericService.getPageType(STRUCTURE_CONSTANTS.EDIT);
    this.structureService.postApiStructureV1IdLock$Response({ id: this.idStructure! }).subscribe({
      next: (response) => {
        if (response.status === 204) {
          UtilityRouting.navigateToStructureEditByStructureId(this.idStructure!.toString());
        } else {
          this.genericService.openErrorModal('generic.error.generic', 'concurrency.lockedStructure');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Activates the structure by enabling it, setting the page type to edit,
   * and navigating to the structure edit page.
   */
  activateStructure(): void {
    if (this.idStructure) {
      this.structureDisableService.toDisable(false);
      this.genericService.getPageType(STRUCTURE_CONSTANTS.EDIT);
      UtilityRouting.navigateToStructureEditByStructureId(this.idStructure.toString());
    }
  }

  /**
   * Disables the structure and navigates to the edit page with the active tab set to 3.
   */
  disableStructure() {
    if (this.idStructure) {
      this.structureDisableService.toDisable(true);
      UtilityRouting.navigateToStructureEditByStructureId(this.idStructure.toString());
    }
  }

  /**
   * Retrieves the value of a field by its name from the API response.
   *
   * @param fieldName - The name of the field to search for.
   * @returns The value of the field if found, otherwise an empty string.
   */
  getFieldDescription(fieldName: string): string {
    const field: FieldDetailResponse | undefined = this.apiResponse?.fields?.find(
      (field: FieldDetailResponse) => field.fieldName === fieldName
    );

    return field?.value ?? '';
  }

  /**
   * Checks if a section should be displayed based on its fields.
   * @param {string} section - The section name to check.
   * @returns {boolean} True if the section should be displayed, false otherwise.
   */
  checkToShowSection(section: string): boolean {
    return this.fieldVisibleList?.some((field) => field.section === section) ?? false;
  }

  /**
   * Checks if attachments should be displayed based on the API response.
   * @returns {boolean} True if attachments are available, false otherwise.
   */
  checkToShowAttachments(): boolean {
    return this.apiResponse?.attachments?.length !== 0;
  }

  /**
   * Checks if a subsection within a section should be displayed based on its fields.
   * @param {string} section - The section name.
   * @param {string} subSection - The subsection name to check.
   * @returns {boolean} True if the subsection should be displayed, false otherwise.
   */
  checkToShowSubSection(section: string, subSection: string): boolean {
    return this.fieldVisibleList?.some((field) => field.section === section && field.subSection === subSection) ?? false;
  }

  /**
   * Determines if a warning should be displayed for a section based on required fields with missing values.
   * @param {string} section - The section to check for warnings.
   * @returns {boolean} True if a warning should be displayed, false otherwise.
   */
  showWarningForSection(section: string): boolean {
    return this.fieldVisibleList?.some((field) => field.section === section && field.isRequired && !field.value) ?? false;
  }

  /**
   * Downloads an attachment by its ID and opens the file.
   * @param {number} attachmentId - The ID of the attachment to download.
   * @param {string} fileName - The name of the file to display.
   */
  downloadAttachment(attachmentId: number, fileName: string): void {
    const param: GetApiAttachmentV1Id$Json$Params = {
      id: attachmentId
    };
    this.attachmentService.getApiAttachmentV1Id$Json(param).subscribe({
      next: (fileBlob: Blob) => {
        Utility.openFile(fileBlob, 'CSV', fileName);
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Retrieves an attachment by its ID from the API response.
   *
   * @param id - The unique identifier of the attachment.
   * @returns The attachment if found, otherwise undefined.
   */
  retrieveAttachById(id: number): AttachmentResponse | undefined {
    return this.apiResponse?.attachments?.find((attachment: AttachmentResponse) => attachment.id === id);
  }

  // function that wraps the function I declared in utilities/utility.ts
  hasAccess(profile: string, functionality: string, permission: string): boolean {
    const visible: boolean = UtilityProfile.checkAccessProfile(this.userProfileService, profile, functionality, permission);

    return visible;
  }

  /**
   * Determines and sets the display status based on structure's operational dates and current status.
   */
  private getStatus(): void {
    // Retrieve the 'StartOfOperationalActivity' field value from the API response
    const startOfOperation = this.apiResponse?.fields?.find((field) => field.fieldName === 'StartOfOperationalActivity')?.value;
    // Retrieve the 'EndOfOperationalActivity' field value from the API response
    // const endOfOperation = this.apiResponse?.fields?.find((field) => field.fieldName === 'EndOfOperationalActivity')?.value;
    // Get today's date
    const today = new Date();
    // Convert the retrieved dates to JavaScript Date objects
    const startDate = startOfOperation ? new Date(startOfOperation) : null;
    // const endDate = endOfOperation ? new Date(endOfOperation) : null;
    // Check if the structure is active based on the operational dates and API response status
    if (startDate && startDate <= today && this.apiResponse?.status === 'COMPLETED') {
      this.displayStatus = 'ACTIVE';
    } else {
      // Otherwise, set the display status to the current status from the API response or an empty string if undefined
      this.displayStatus = this.apiResponse?.status ?? '';
    }
  }

  /**
   * Fetches the structure details by its ID from the API or mock data.
   * @returns {Observable<StructureDetailResponse>} Observable containing the structure details.
   */
  private getStructureById(): Observable<StructureDetailResponse> {
    const param: GetStructureById$Json$Params = {
      id: this.idStructure ?? 0,
      refreadonly: true
    };

    // Create HTTP context with custom headers
    const context = Utility.setPermissionHeaders(FUNCTIONALITY.networkStructure, PERMISSION.read);

    return this.structureService.getStructureById$Json(param, context)?.pipe(map((res: StructureDetailResponse) => res));
  }

  /**
   * Configura la modalità di visualizzazione.
   */
  private setupViewMode(): void {
    this.typeViewMode = this.genericService.viewMode();
    this.isSmallMobile.set(this.typeViewMode === VIEW_MODE.MOBILE);
  }
}
