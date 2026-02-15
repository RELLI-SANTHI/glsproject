/* eslint-disable no-extra-boolean-cast */
/* eslint-disable max-lines-per-function */
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { GlsInputComponent } from '../../../../common/form/gls-input/gls-input.component';
import { TranslateModule } from '@ngx-translate/core';
import { GlsInputFileComponent } from '../../../../common/form/gls-input-file/gls-input-file.component';
import { GlsInputCheckboxComponent } from '../../../../common/form/gls-input-checkbox/gls-input-checkbox.component';
import { GlsInputToggleComponent } from '../../../../common/form/gls-input-toggle/gls-input-toggle.component';
import { GlsInputDropdownComponent } from '../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { NgbModal, NgbModalRef, NgbNavModule, NgbProgressbarModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { GlsInputDataComponent } from '../../../../common/form/gls-input-data/gls-input-date.component';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogData } from '../../../../common/models/confirmation-dialog-interface';
import {
  AttachmentModel,
  AttachmentResponse,
  FieldDetailResponse,
  FieldModel,
  StructureCreateModel,
  StructureDetailResponse,
  StructureFieldUpdateModel,
  StructureModel,
  StructureUpdateModel,
  TemplateModel
} from '../../../../api/glsNetworkApi/models';
import { TemplateService } from '../../../../api/glsNetworkApi/services/template.service';
import { StructureService } from '../../../../api/glsNetworkApi/services/structure.service';
import { ICONS } from '../../../../common/utilities/constants/icon';
import { IstructureCreateTemplateField } from '../../../../common/models/structure-detail-interface';
import { GlsStepperComponent } from '../../../../common/components/gls-stepper/gls-stepper.component';
import { ISetpperInterface } from '../../../../common/models/stepper-interface';
import { AttachmentService } from '../../../../api/glsNetworkApi/services';
import { ConfirmationDialogComponent } from '../../../../common/components/confirmation-dialog/confirmation-dialog/confirmation-dialog.component';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { forkJoin, map, Observable } from 'rxjs';
import { GetStructureById$Json$Params } from '../../../../api/glsNetworkApi/fn/structure/get-structure-by-id-json';
import { STRUCTURE_CONSTANTS } from '../../constants/structure-constant';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { TitleBudgeComponent } from '../../../../common/components/title-budge/title-budge.component';
import { Utility } from '../../../../common/utilities/utility';
import { PostApiAttachmentV1$Json$Params } from '../../../../api/glsNetworkApi/fn/attachment/post-api-attachment-v-1-json';
import { PostApiStructureV1Create$Json$Params } from '../../../../api/glsNetworkApi/fn/structure/post-api-structure-v-1-create-json';
import { PutApiStructureV1Id$Json$Params } from '../../../../api/glsNetworkApi/fn/structure/put-api-structure-v-1-id-json';
import { GetApiTemplateV1$Json$Params } from '../../../../api/glsNetworkApi/fn/template/get-api-template-v-1-json';
import { GetApiTemplateV1Fields$Json$Params } from '../../../../api/glsNetworkApi/fn/template/get-api-template-v-1-fields-json';
import { BreadcrumbService } from '../../../../common/utilities/services/breadcrumb/breadcrumb.service';
import { StructureDisableService } from '../../../../common/utilities/services/structure-disable/structure-disable.service';
import { TruncateTextPipe } from '../../../../common/utilities/pipes/truncate-text.pipe';
import { UtilityConcurrency } from '../../../../common/utilities/utility-concurrency';
import { CONCURRENCY } from '../../../../common/utilities/constants/concurrency';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { StrictHttpResponse } from '../../../../api/glsAdministrativeApi/strict-http-response';
import { FUNCTIONALITY, PERMISSION } from '../../../../common/utilities/constants/profile';
import { MODAL_MD } from '../../../../common/utilities/constants/modal-options';
import { STATUS } from '../../../../common/utilities/constants/generic-constants';

@Component({
  selector: 'app-structure-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GlsInputComponent,
    TranslateModule,
    GlsInputFileComponent,
    GlsInputCheckboxComponent,
    GlsInputToggleComponent,
    GlsInputDropdownComponent,
    GlsInputDataComponent,
    FormsModule,
    NgbNavModule,
    GlsStepperComponent,
    NgbProgressbarModule,
    TitleBudgeComponent,
    NgbTooltipModule,
    TruncateTextPipe
  ],
  templateUrl: './structure-edit.component.html',
  styleUrl: './structure-edit.component.scss'
})
export class StructureEditComponent implements OnInit, OnDestroy {
  @ViewChild('step1', { static: true }) step1!: TemplateRef<unknown>;
  @ViewChild('step2', { static: true }) step2!: TemplateRef<unknown>;
  @ViewChild(GlsStepperComponent) stepperComponent!: GlsStepperComponent;
  templateResponseList?: TemplateModel[];

  steps: ISetpperInterface[] = [];
  currentStep = 0;
  structureFg: FormGroup;
  type = STRUCTURE_CONSTANTS.CREATE;

  showForm = false;
  PartitaIVAInput = '';
  RagioneSocialeInput = '';
  isSearchEnabled = false;
  isModalOpen = false;
  fileName = '';
  progress = 0;
  uploadComplete = false;
  showError = false;
  showAttach = true;
  ragSocFg!: FormGroup;
  active = 1;
  modalRef!: NgbModalRef;
  dialogData!: ConfirmationDialogData;
  selectTemplateName = '';
  structureCreateFgControl: FormGroup;
  structureCreateObject = {
    fieldName: 'acronym',
    fieldType: 'varchar',
    isVisible: true,
    isRequired: true,
    buildingType: 0,
    buildingAcronym: 'Test',
    buildingName: '',
    constraint: {
      min: 0,
      max: 0
    }
  };
  stuctureButtonType = false;
  selectedFile: File | null = null;
  structureDetailResponse?: StructureDetailResponse;
  structureId: number | null = null;
  isPrevioursValue = false;
  attachmentModel: AttachmentModel[] = [];
  decimalErrorMap: Record<string, boolean> = {};
  rangeErrorMap: Record<string, boolean> = {};
  lastInteractionTime: number = new Date().getTime();

  private readonly genericService = inject(GenericService);
  private readonly route = inject(ActivatedRoute);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly structureDisableService = inject(StructureDisableService);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    public fb: FormBuilder,
    public modalService: NgbModal,
    private attachmentService: AttachmentService,
    private structureService: StructureService,
    private templateService: TemplateService,
    private messageStatusService: MessageStatusService
  ) {
    this.structureFg = this.fb.group({});
    this.structureCreateFgControl = this.fb.group({});
  }

  /**
   * Retrieves the list of visible fields from the structure detail response.
   * Only fields marked as `isVisible` are included in the list.
   *
   * @returns An array of visible fields.
   */
  get fieldVisibleList(): FieldDetailResponse[] {
    return this.structureDetailResponse?.fields?.filter((field) => field.isVisible || !!field.value) ?? [];
  }

  /**
   * Lifecycle hook that is called after the component is initialized.
   *
   * - Determines whether the component is in "create" or "edit" mode based on the `idStructure` route parameter.
   * - Loads the structure details if in "edit" mode or initializes the template and fields if in "create" mode.
   * - Configures the form groups and sets up the steps for the stepper component.
   * - Updates the main page height for proper layout rendering.
   */
  ngOnInit(): void {
    const idStructure = this.route.snapshot.paramMap.get('idStructure')
      ? Number(this.route.snapshot.paramMap.get('idStructure'))
      : undefined;
    this.type = idStructure ? STRUCTURE_CONSTANTS.EDIT : STRUCTURE_CONSTANTS.CREATE;
    this.structureId = idStructure ?? null;
    this.getStructureButtonType();
    this.loadStructurePage(idStructure);
    this.lockUnlock();
    this.genericService.resizePage();

    this.configurationTemplateFg(this.structureCreateObject);
    this.steps = [
      { title: 'choosetemplate', template: this.step1, formGroup: this.structureCreateFgControl },
      { title: 'fillindata', template: this.step2, formGroup: this.structureFg }
    ];
    this.ragSocFg = this.fb.group(
      {
        PartitaIVA: ['', [Validators.minLength(11), Validators.maxLength(11)]],
        RagioneSociale: ['', [Validators.minLength(3), Validators.maxLength(50)]]
      },
      {
        validators: (formGroup: FormGroup) => {
          const partitaIVA = formGroup.get('PartitaIVA')?.value;
          const ragioneSociale = formGroup.get('RagioneSociale')?.value;

          return partitaIVA || ragioneSociale ? null : { atLeastOneRequired: true };
        }
      }
    );

    this.showForm = true;
  }

  /**
   * Retrieves the button type for the structure (e.g., disableStructure).
   * Subscribes to the button type from the generic service.
   */
  getStructureButtonType() {
    this.structureDisableService.disableStructure$.subscribe((toDisable: boolean) => {
      this.stuctureButtonType = toDisable;
    });
  }

  /**
   * Loads the structure page based on the structure ID.
   * If the structure ID is provided, it retrieves the structure details.
   * Otherwise, it retrieves the template and field data for creating a new structure.
   *
   * @param idStructure - The ID of the structure to load (optional).
   */
  loadStructurePage(idStructure?: number) {
    if (idStructure != undefined) {
      this.retrieveStructureById(idStructure).subscribe({
        next: (res: StructureDetailResponse) => {
          this.structureDetailResponse = res;
          const endOfOperationField = res.fields?.find((field) => field.fieldName === 'EndOfOperationalActivity');
          if (endOfOperationField && res.status === 'DISABLED') {
            endOfOperationField.value = null; // Set the field value to blank
          }
          if (this.stuctureButtonType && this.structureDetailResponse?.status === 'COMPLETED') {
            this.structureDetailResponse.status = 'ACTIVE';
            this.disabledFieldObject();
          }
          this.currentStep = 1;
          this.initializeFormStructureFields();
          this.loadAtachment(res.attachments ?? []);
          this.structureFg?.statusChanges.subscribe(() => {
            this.lastInteractionTime = new Date().getTime();
          });
          this.structureCreateFgControl?.statusChanges.subscribe(() => {
            this.lastInteractionTime = new Date().getTime();
          });
        },
        error: (err: HttpErrorResponse) => {
          this.genericService.manageError(err);
        }
      });
    } else {
      forkJoin({
        templates: this.retrieveTemplateModel(),
        fields: this.retrieveTemplateFields()
      }).subscribe({
        next: (res: { templates: TemplateModel[]; fields: FieldModel[] }) => {
          this.templateResponseList = res.templates;
          this.type = STRUCTURE_CONSTANTS.CREATE;
          // load page by template details
          // this.initializeFormGroupFromFields(res.fields);
        },
        error: (err: HttpErrorResponse) => {
          this.genericService.manageError(err);
        }
      });
    }
  }

  /**
   * Disables specific fields in the structure object.
   * Sets the value of the 'EndOfOperationalActivity' field to null and marks it as required.
   */
  disabledFieldObject() {
    this.structureDetailResponse?.fields.map((field: FieldDetailResponse) => {
      if (field.fieldName === 'EndOfOperationalActivity') {
        field.value = null;
        field.isRequired = true;
      }
    });
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   *
   * This method performs cleanup tasks such as:
   * - Resetting the main page resize behavior to its default value.
   * - Disabling the structure disable service.
   */
  ngOnDestroy(): void {
    this.genericService.resizeMainPage.update(() => this.genericService.defaultValue());
    this.structureDisableService.toDisable(false);
    if (!!this.structureId && this.intervalId !== null) {
      this.unlockStructure(this.structureId!).subscribe({
        next: () => {
          clearInterval(this.intervalId!);
        },
        error: (err: HttpErrorResponse) => {
          Utility.logErrorForDevEnvironment(err);
        }
      });
    }
  }

  /**
   * configuration template form group
   * @param fields
   */
  configurationTemplateFg(fields: IstructureCreateTemplateField) {
    const validators = [];
    if (fields.isRequired) {
      validators.push(Validators.required);
    }
    if (fields.constraint) {
      if (fields.constraint.min !== undefined) {
        validators.push(Validators.min(fields.constraint.min));
      }
      if (fields.constraint.max !== undefined) {
        validators.push(Validators.max(fields.constraint.max));
      }
    }
    if (fields?.fieldName) {
      this.structureCreateFgControl.addControl(fields.fieldName, this.fb.control(fields.value || '', validators));
    }
    this.structureCreateFgControl.controls[this.structureCreateObject.fieldName].disable();
  }

  /**
   * Go to specific step
   * @param ev
   */
  getStepperValue(ev: { index: number; data: { acronym: string } }) {
    if (this.type === 'create') {
      this.currentStep = ev.index;
    }
  }

  /**
   * Get the icon for the template
   * @param templateIcon
   * @returns
   */
  getTemplateIcon(templateIcon: string): string {
    return ICONS[templateIcon] ?? '';
  }

  /**
   * Retrieves the description or value of a specific field based on its name.
   *
   * @param fieldName - The name of the field to retrieve the description for.
   * @returns The value of the field if found, otherwise an empty string.
   */
  getFieldDescription(fieldName: string): string {
    const field: FieldDetailResponse | undefined = this.structureDetailResponse?.fields?.find(
      (field: FieldDetailResponse) => field.fieldName === fieldName
    );

    return field?.value ?? '';
  }

  /**
   * Go to template Detail
   * @param templateId
   */
  selectTemplate(templateObj: TemplateModel) {
    this.selectTemplateName = templateObj.templateName;
    this.structureCreateFgControl.controls[this.structureCreateObject.fieldName].enable();
    this.structureCreateObject.buildingType = templateObj.id;
    const structureControl = this.structureCreateFgControl.controls[this.structureCreateObject.fieldName];
    if (structureControl) {
      structureControl.setValidators([
        Validators.required,
        Validators.minLength(templateObj.buildingAcronymMinLength),
        Validators.maxLength(templateObj.buildingAcronymMaxLength)
      ]);
    }
    structureControl.updateValueAndValidity();
  }

  /**
   * Saves the compilation data for the structure creation process.
   *
   * This method gathers the necessary data from the form controls, constructs
   * a payload object, and sends it to the server to create a new structure.
   * It also handles the response by loading the structure page and marking
   * the step as complete. In case of an error, it manages the error appropriately.
   *
   * @remarks
   * The method shows a spinner while the operation is in progress and hides it
   * once the operation is complete or an error occurs.
   *
   * @throws {HttpErrorResponse} If an error occurs during the structure creation process.
   */
  saveCompilationData() {
    const payload: StructureCreateModel = {
      buildingType: this.structureCreateObject.buildingType,
      buildingAcronym: this.structureCreateFgControl.controls[this.structureCreateObject.fieldName].value
    };

    this.createStructure(payload).subscribe({
      next: (res: StructureModel) => {
        this.loadStructurePage(res.id);
        this.onStepComplete();
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Marks the current step in the stepper component as complete.
   */
  onStepComplete() {
    const stepperComponent = this.stepperComponent as GlsStepperComponent;
    stepperComponent.onStepComplete();
  }

  /**
   * Opens an error modal with the specified title and error message.
   *
   * @param title - The title of the modal.
   * @param errorMessage - The error message to display.
   */
  openErrorModal(
    title: string,
    errorMessage: string,
    additionalData?: {
      placeHolder: string;
      value: string | number;
    }[]
  ) {
    this.dialogData = {
      title: title,
      content: errorMessage,
      additionalData,
      showCancel: false,
      confirmText: 'ok'
    };
    this.modalRef = this.modalService.open(ConfirmationDialogComponent, MODAL_MD);
    this.modalRef.componentInstance.data = this.dialogData;
    this.modalRef.result.then((result: string) => {
      if (result) {
        // console.log(`Closed with: ${result}`);
      }
    });
  }

  /**
   * Checks if a specific form control is invalid.
   * A control is considered invalid if it fails validation and has been interacted with (dirty or touched).
   *
   * @param formGroup - The form group containing the control.
   * @param controlName - The name of the control to check.
   * @returns `true` if the control is invalid and has been interacted with, otherwise `false`.
   */
  invalid(formGroup: FormGroup, controlName: string): boolean {
    const control = formGroup.controls[controlName];

    return control?.invalid && (control?.dirty || control?.touched);
  }

  /**
   * Checks if a field in the structure matches a specific type.
   *
   * @param key - The name of the field to check.
   * @param type - The type to match (e.g., 'varchar', 'int', 'decimal', etc.).
   * @returns `true` if the field exists and matches the specified type, otherwise `false`.
   */
  matchType(key: string, type: string): boolean {
    return !!this.structureDetailResponse!.fields?.find(
      (field: FieldDetailResponse) => field.fieldName === key && field.fieldType === type
    );
  }

  /**
   * return control
   */
  structureFgControl(controlName: string): FormControl {
    const control = this.structureFg.controls[controlName] as FormControl;

    return control;
  }

  // Save structure in COMPLETED mode
  save() {
    this.isModalOpen = false;
    const payload: StructureUpdateModel = {
      status: 'COMPLETED',
      fields: []
    };
    this.structureDetailResponse!.fields.forEach((field: FieldDetailResponse) => {
      let value = this.structureFg.value[field.fieldName];
      value = this.returnValueToSaveStructure(value, field.fieldType); // 'varchar' | 'int' | 'decimal' | 'timestamp' | 'combo' | 'bool'

      const fieldPayload: StructureFieldUpdateModel = {
        id: field.id,
        value
      };
      payload.fields.push(fieldPayload);
    });

    this.structurePutApi(payload).subscribe({
      next: (res) => {
        this.messageStatusService.show('message.structure.edit.success');
        this.breadcrumbService.removeLastBreadcrumb();
        UtilityRouting.navigateToStructureDetailByStructureId(res.id.toString());
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Handles the file selection event for uploading an attachment.
   * Validates the file type and size before starting the upload process.
   *
   * @param event - The file selection event triggered by the input element.
   */
  onFileSelected(event: Event): void {
    this.uploadComplete = false;
    this.showError = false;
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) {
      this.openErrorModal('attention', 'anagrafica.structure.dialog.attachErrorNoFile');

      return;
    }
    const file = target.files[0];
    // const allowedTypes = [
    //   'application/pdf', // PDF
    //   // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    //   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX (Excel)
    //   'application/vnd.ms-excel' // XLS (Older Excel format)
    // ];
    // if (!allowedTypes.includes(file.type)) {
    //   this.openErrorModal('attention', 'anagrafica.structure.dialog.attachErrorFormat');
    //   target.value = '';

    //   return;
    // } else if (file.size > 5 * 1024 * 1024) {
    //   this.openErrorModal('attention', 'anagrafica.structure.dialog.attachErrorSize');
    //   target.value = '';

    //   return;
    // }
    this.selectedFile = file;
    this.fileName = file.name;
    this.uploadComplete = false;
    this.startUpload(this.selectedFile);
  }

  /**
   * Handles the file selection event for specific fields.
   *
   * @param fileName - The name of the file field being processed.
   *                   If the value is 'Map', it triggers a specific upload behavior.
   * @param event - The selected file to be uploaded.
   *
   * @returns void
   */
  onFileSelectedonFields(fileName: string, event: File): void {
    this.startUpload(event, fileName === 'Map');
  }

  /**
   * Retrieves an attachment by its unique identifier.
   *
   * @param id - The unique identifier of the attachment to retrieve.
   * @returns The attachment model if found, otherwise `undefined`.
   */
  retrieveAttachById(id: number): AttachmentModel | undefined {
    return this.attachmentModel.find((attachment: AttachmentModel) => attachment.id === id);
  }

  /**
   * Starts the upload process for the selected file.
   * Displays a progress bar and handles success or error responses from the API.
   *
   * @param file - The file to be uploaded.
   */
  startUpload(file: File, isMap?: boolean): void {
    this.progress = 0;
    this.uploadComplete = false;
    const uploadFileObject = {
      File: file,
      Name: file.name.replace(/\.[^/.]+$/, ''),
      isMap
    };
    const filePayload: PostApiAttachmentV1$Json$Params = {
      structureId: this.structureDetailResponse?.id ?? 0,
      body: uploadFileObject
    };
    const interval = setInterval(() => {
      if (this.progress < 99) {
        this.progress += 1;
      }
    }, 150);
    this.attachmentService.postApiAttachmentV1$Json(filePayload).subscribe({
      next: (response: AttachmentModel) => {
        clearInterval(interval);
        this.progress = 100;
        this.uploadComplete = true;
        // aggiungi l'allegato alla lista degli allegati della sruttura
        if (response?.id) {
          this.attachmentModel.push(response);
          if (isMap) {
            this.fieldVisibleList.find((field: FieldDetailResponse) => field.fieldName === 'Map')!.value = response.id;
            this.uploadComplete = false;
          }
        } else if (isMap && !this.fieldVisibleList.find((field: FieldDetailResponse) => field.fieldName === 'Map')!.value) {
          this.resetMapFc(isMap!);
        }
        this.reloadAttach();
      },
      error: (err: HttpErrorResponse) => {
        Utility.logErrorForDevEnvironment(err);
        this.uploadComplete = true;
        this.showError = true;
        clearInterval(interval);
        this.resetMapFc(isMap!);
        this.reloadAttach();
        console.log(err);
        const errorMessage = 'serviceMessage.' + (err.error.innerException?.internalCode || 'genericError');
        const additionalData:
          | {
              placeHolder: string;
              value: string | number;
            }[]
          | undefined = err.error?.innerException?.additionalData;
        // { placeHolder: string; value: string | number }[]
        additionalData?.forEach((data: { placeHolder: string; value: string | number }) => {
          if (data.placeHolder === '_maxFileSize') {
            try {
              data.value = Math.round(Number(data.value) / 1024 / 1024);
            } catch (err) {
              Utility.logErrorForDevEnvironment(err);
            }
          }
        });
        this.openErrorModal('attention', errorMessage, additionalData);
      }
    });
  }

  /**
   * Loads the attachments for the structure and sets the attachment model.
   *
   * @param attachments - The array of attachments to load.
   */
  public resetMapFc(isMap: boolean): void {
    if (isMap) {
      this.structureFg.get('Map')?.reset();
    }
  }

  /**
   * Reloads the attachment section by resetting the file input and progress bar.
   */
  public reloadAttach(): void {
    this.fileName = '';
    this.progress = 0;
    this.selectedFile = null;
    // this.uploadComplete = false;
    this.showAttach = false;
    setTimeout(() => {
      this.showAttach = true;
    }, 0);
  }

  /**
   * Closes the success message for file upload and resets the progress bar.
   */
  closeSuccessMessage(): void {
    this.uploadComplete = false;
    this.fileName = '';
    this.progress = 0;
  }

  /**
   * Navigates to the structure list page.
   */
  exit() {
    UtilityRouting.navigateToStructureList();
  }

  /**
   * Opens a confirmation dialog to save a draft.
   *
   * This method initializes the dialog data with a title, content, and button labels,
   * then opens a modal dialog using the `ConfirmationDialogComponent`. If the user
   * confirms the action in the dialog, the `saveDraft` method is invoked.
   *
   * @returns {void} This method does not return a value.
   */
  onSaveDraft() {
    this.dialogData = {
      title: 'ConfirmActionTtile',
      content: 'confirmMessage',
      showCancel: true,
      cancelText: 'modal.cancelText',
      confirmText: 'modal.confirmText'
    };
    this.modalRef = this.modalService.open(ConfirmationDialogComponent, MODAL_MD);
    this.modalRef.componentInstance.data = this.dialogData;
    this.modalRef.result.then((result: string) => {
      if (result) {
        this.saveDraft();
      }
    });
  }

  /**
   * Deletes an attachment by its ID.
   * Removes the attachment from the list and updates the UI.
   *
   * @param id - The ID of the attachment to delete.
   */
  deleteAttachment(id: number, isMap?: boolean): void {
    this.attachmentService.deleteApiAttachmentV1Id({ id }).subscribe({
      next: () => {
        this.attachmentModel = this.attachmentModel.filter((attachment: AttachmentModel) => attachment.id !== id);
        this.resetMapFc(isMap!);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Downloads an attachment by its ID and saves it to the user's device.
   *
   * @param attachmentId - The ID of the attachment to download.
   * @param fileName - The name of the file to save.
   */
  downloadAttachment(attachmentId: number, fileName: string) {
    this.attachmentService.getApiAttachmentV1Id$Json({ id: attachmentId }).subscribe({
      next: (fileBlob: Blob) => {
        this.saveFile(fileBlob, fileName);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Navigates to the structure list page.
   * This method is used to exit the current structure edit view and return to the structure list.
   */
  goToExit() {
    UtilityRouting.navigateToStructureList();
  }

  /**
   * Checks if a section in the form is invalid.
   * A section is considered invalid if any of its fields are invalid.
   *
   * @param section - The name of the section to check.
   * @returns `true` if the section has invalid fields, otherwise `false`.
   */
  isSectionInvalid(section: string): boolean {
    if (!this.structureFg) {
      return false;
    }
    const fields = this.fieldVisibleList.filter((field: FieldDetailResponse) => field.section === section);

    return fields ? fields.some((field: FieldDetailResponse) => field.fieldName && this.structureFg.get(field.fieldName)?.invalid) : false;
  }

  /**
   * Checks if a section should be displayed.
   * A section is displayed if it contains at least one visible field.
   *
   * @param section - The name of the section to check.
   * @returns `true` if the section should be displayed, otherwise `false`.
   */
  checkToShowSection(section: string): boolean {
    return this.fieldVisibleList.some((field) => field.section === section) ?? false;
  }

  /**
   * Checks if a subsection within a section should be displayed.
   * A subsection is displayed if it contains at least one visible field.
   *
   * @param section - The name of the section to check.
   * @param subSection - The name of the subsection to check.
   * @returns `true` if the subsection should be displayed, otherwise `false`.
   */
  checkToShowSubSection(section: string, subSection: string): boolean {
    return this.fieldVisibleList.some((field) => field.section === section && field.subSection === subSection) ?? false;
  }

  /**
   * Structure create API
   * @param payload
   * @returns
   */
  createStructure(payload: StructureCreateModel): Observable<StructureModel> {
    const param: PostApiStructureV1Create$Json$Params = {
      body: payload
    };

    return this.structureService.postApiStructureV1Create$Json(param).pipe(
      map((r: StructureModel) => {
        return r;
      })
    );
  }

  /**
   * Structure put API call to Save Draft the structure
   * @param structureObject
   * @returns
   */
  structurePutApi(structureObject: StructureUpdateModel): Observable<StructureDetailResponse> {
    const param: PutApiStructureV1Id$Json$Params = {
      body: structureObject,
      id: this.structureDetailResponse!.id
    };

    return this.structureService.putApiStructureV1Id$Json(param).pipe(
      map((r: StructureDetailResponse) => {
        return r as StructureDetailResponse;
      })
    );
  }

  /**
   * Locks the structure by its ID.
   * This method sends a request to lock the structure, preventing further modifications.
   *
   * @param idStructure - The ID of the structure to lock.
   * @returns An observable of the locked structure details.
   */
  lockStructure(idStructure: number): Observable<StrictHttpResponse<void>> {
    const param = {
      id: idStructure
    };

    return this.structureService.postApiStructureV1IdLock$Response(param);
  }

  /**
   * Unlocks the structure by its ID.
   * This method sends a request to unlock the structure, allowing further modifications.
   *
   * @param idStructure - The ID of the structure to unlock.
   * @returns An observable of the unlocked structure details.
   */
  unlockStructure(idStructure: number): Observable<StrictHttpResponse<void>> {
    const param = {
      id: idStructure
    };

    return this.structureService.postApiStructureV1IdUnlock$Response(param);
  }

  /**
   * Get structure by id API
   * @param idStructure
   * @returns
   */
  retrieveStructureById(idStructure: number): Observable<StructureDetailResponse> {
    const param: GetStructureById$Json$Params = {
      id: idStructure
    };

    // Create HTTP context with custom headers
    const context = Utility.setPermissionHeaders(FUNCTIONALITY.networkStructure, PERMISSION.write);

    return this.structureService.getStructureById$Json(param, context).pipe(
      map((r: StructureDetailResponse) => {
        return r;
      })
    );
  }

  /**
   * Get the template for the structure
   * @returns
   */
  retrieveTemplateModel(): Observable<TemplateModel[]> {
    const param: GetApiTemplateV1$Json$Params = {};

    return this.templateService.getApiTemplateV1$Json(param).pipe(
      map((res: TemplateModel[]) => {
        return res;
      })
    );
  }

  /**
   * Retrieves the template fields for the structure.
   *
   * @returns An observable of the template fields.
   */
  retrieveTemplateFields(): Observable<FieldModel[]> {
    const params: GetApiTemplateV1Fields$Json$Params = {};

    // Create HTTP context with custom headers
    const context = Utility.setPermissionHeaders(FUNCTIONALITY.networkStructure, PERMISSION.write);

    return this.templateService.getApiTemplateV1Fields$Json(params, context).pipe(
      map((res: FieldModel[]) => {
        return res;
      })
    );
  }

  /**
   * Saves the current structure as a draft.
   *
   * This method performs the following steps:
   * 1. Displays a loading spinner.
   * 2. Checks if the current structure's status is 'COMPLETED'. If so, it opens an error modal,
   *    hides the spinner, and exits the method.
   * 3. Constructs a payload object with the status set to 'DRAFT' and iterates over the structure's fields
   *    to populate the payload with updated field values.
   * 4. Sends the payload to the API using the `structurePutApi` method.
   * 5. On a successful API response, displays a success message, navigates to the structure list page,
   *    and hides the spinner.
   * 6. Handles any API errors by invoking the `manageError` method.
   *
   * @throws Will handle any HTTP errors encountered during the API call.
   */
  public saveDraft(): void {
    if (this.structureDetailResponse!.status === STATUS.COMPLETED) {
      this.openErrorModal('attention', 'anagrafica.structure.structure.dialog.draftError');

      return;
    }

    const payload: StructureUpdateModel = {
      status: 'DRAFT',
      fields: []
    };
    this.structureDetailResponse!.fields.forEach((field: FieldDetailResponse) => {
      let value = this.structureFg.value[field.fieldName] || field.value;
      value = this.returnValueToSaveStructure(value, field.fieldType); // 'varchar' | 'int' | 'decimal' | 'timestamp' | 'combo' | 'bool'
      const fieldPayload: StructureFieldUpdateModel = {
        id: Number(field.id),
        value
      };

      payload.fields!.push(fieldPayload);
    });
    this.structurePutApi(payload).subscribe({
      next: () => {
        this.messageStatusService.show('message.structure.draft.success');
        UtilityRouting.navigateToStructureList();
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Deactivates the current structure by saving any changes made.
   * This method triggers the save operation to persist the current state.
   */
  deactivate() {
    this.save();
  }

  /**
   * Validates a number input field for decimal precision and range.
   *
   * @param event - The input event triggered by the user.
   * @param fieldName - The name of the form field being validated.
   * @param decimalPlaces - The allowed number of decimal places.
   * @param min - The minimum allowed value.
   * @param max - The maximum allowed value.
   */
  validateDecimalInput(event: Event, fieldName: string, decimalPlaces: number, min: number, max: number): void {
    // Get the input element and its current value
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // If the input is empty, reset error flags for this field and exit early
    if (value === '') {
      this.decimalErrorMap[fieldName] = false;
      this.rangeErrorMap[fieldName] = false;

      return;
    }

    // Build a regex to validate the number of allowed decimal places
    const regex = new RegExp(`^\\d+(\\.\\d{0,${decimalPlaces}})?$`);

    // Set decimal error flag based on regex test result
    this.decimalErrorMap[fieldName] = !regex.test(value);

    // Convert the input string to a floating-point number
    const numValue = parseFloat(value);

    // If the value is a valid number, check whether it's within the allowed range
    if (!isNaN(numValue)) {
      const outOfRange = numValue < min || numValue > max;

      // Set range error flag (but do not modify input value)
      this.rangeErrorMap[fieldName] = outOfRange;
    } else {
      // If not a number, set the range error to true
      this.rangeErrorMap[fieldName] = true;
    }
  }

  /**
   * Retrieves an array of validators for a given field based on its metadata.
   * The validators are dynamically determined based on the field's properties,
   * such as `isRequired`, `minLength`, `maxLength`, and `pattern`.
   *
   * @param field - The `FieldDetailResponse` object containing metadata for the field.
   * @returns An array of `ValidatorFn` objects to be applied to the field.
   */
  private retrieveValidatorFromField(field: FieldDetailResponse): ValidatorFn[] {
    const validators = []; // Initialize an empty array to hold validators for the current field

    // Check if the field is required and add the 'Validators.required' validator if true
    if (field.isRequired) {
      validators.push(Validators.required);
    }

    // Check the field type to determine the appropriate validators
    if (field.fieldType === 'number') {
      // If the field type is 'number', add min and max validators if minLength and maxLength are defined
      if (typeof field.minLength === 'number') {
        validators.push(Validators.min(field.minLength));
      }
      if (typeof field.maxLength === 'number') {
        validators.push(Validators.max(field.maxLength));
      }
    } else {
      // For non-number fields, add minLength and maxLength validators if defined
      if (typeof field.minLength === 'number') {
        validators.push(Validators.minLength(field.minLength));
      }
      if (typeof field.maxLength === 'number') {
        validators.push(Validators.maxLength(field.maxLength));
      }
    }

    // If the field has a pattern defined, add the 'Validators.pattern' validator
    if (field.pattern) {
      validators.push(Validators.pattern(field.pattern));
    }

    return validators;
  }

  /**
   * Binds data from the `structureDetailResponse` to the `structureFg` FormGroup.
   * Dynamically adds controls to the FormGroup for each field in the response, applying appropriate validators.
   * Also updates specific properties like `ragioneSociale` based on the field type and current operation type.
   */
  private initializeFormStructureFields(): void {
    const formValues: Record<string, unknown> = {}; // Object to hold form values for patching

    // Iterate over each field in the `structureDetailResponse.fields` array
    this.fieldVisibleList.forEach((field: FieldDetailResponse) => {
      // Add the field's value to the `formValues` object
      let fieldValue = field.value;
      if (field.fieldType === 'timestamp' && field.value) {
        const date = new Date(field.value);
        fieldValue = {
          day: date.getUTCDate(),
          month: date.getUTCMonth() + 1,
          year: date.getUTCFullYear()
        };
      }
      formValues[field.fieldName] = fieldValue;

      // If the FormGroup does not already contain a control for this field, add it
      // if (!this.structureFg.contains(field.fieldName) || this.type === STRUCTURE_CONSTANTS.CREATE) {
      // Retrieve validators for the field based on its metadata
      const validators = this.retrieveValidatorFromField(field);

      // Add a new control to the FormGroup with the field's value and validators
      this.structureFg.addControl(
        field.fieldName,
        new FormControl(
          {
            value: field.value,
            disabled: !field.isVisible
          },
          validators
        )
      );
      // }
    });

    // Patch the FormGroup with the collected form values
    if (this.type === STRUCTURE_CONSTANTS.EDIT) {
      this.structureFg.patchValue(formValues);
    }
  }

  /**
   * Dynamically initializes the FormGroup `structureFg` by adding controls for each field in the provided array.
   * Each control is configured with its initial value and a set of validators derived from the field's metadata.
   *
   * Validators are applied based on the field's properties, such as `isRequired`, `minLength`, `maxLength`, and `pattern`.
   * If a field does not have a value, it is initialized with an empty string by default.
   *
   * @param fields - An array of `FieldDetailResponse` objects containing metadata for each field (e.g., name, type, constraints).
   */
  private initializeFormGroupFromFields(fields: FieldModel[]): void {
    // Iterate over each field in the provided array of FieldDetailResponse
    fields.forEach((field: FieldModel) => {
      const validators = this.retrieveValidatorFromField(field);

      // Add a new control to the FormGroup (structureFg) for the current field
      // The control is initialized with the field's value (or an empty string if no value is provided)
      // and the array of validators determined above
      this.structureFg.addControl(field.fieldName, this.fb.control('', validators));
    });
  }

  /**
   * Retrieves the value to save for a structure field based on its type.
   * Converts the value to the appropriate type (e.g., number, boolean, date) before saving.
   *
   * @param value - The value to be saved.
   * @param type - The type of the field (e.g., 'int', 'decimal', 'timestamp', 'bool').
   * @returns The converted value in the appropriate type.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private returnValueToSaveStructure(value: any, type: string): string | number | boolean | null {
    const castedValue = value;
    switch (type) {
      case 'int':
        return castedValue ? parseInt(castedValue) : null;
      case 'combo':
        return castedValue ? parseInt(castedValue, 10) : castedValue;
      case 'decimal':
        return castedValue ? parseFloat(castedValue) : null;
      case 'timestamp':
        return Utility.convertFromGenericDataToIsoString(castedValue);
      case 'bool':
        if (typeof castedValue === 'string') {
          return castedValue?.toLowerCase() === 'true';
        }

        return castedValue;
      default:
        return castedValue;
    }
  }

  /**
   * Saves a file to the user's device using a Blob object.
   *
   * @param blob - The Blob object representing the file.
   * @param fileName - The name of the file to save.
   */
  private saveFile(blob: Blob, fileName: string) {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(objectUrl);
    document.body.removeChild(a);
  }

  /**
   * Loads a list of attachments into the `attachmentModel` array by mapping the provided
   * `AttachmentResponse` objects to the required structure.
   *
   * @param attachmentResponse - An array of `AttachmentResponse` objects containing
   * the attachment data to be loaded.
   *
   * Each attachment is processed and added to the `attachmentModel` array with the following properties:
   * - `id`: The unique identifier of the attachment.
   * - `fileName`: The name of the file associated with the attachment.
   * - `structureId`: The ID of the structure, defaulting to -1 if `structureId` is not defined.
   * - `name`: The name of the attachment.
   * - `fileSize`: The size of the file in bytes.
   * - `blobUrl`: A placeholder for the blob URL, initialized as an empty string.
   * - `updatedAt`: The timestamp of the last update to the attachment.
   * - `isMap`: A boolean indicating whether the attachment is a map, defaulting to `false`.
   */
  private loadAtachment(attachmentResponse: AttachmentResponse[]): void {
    attachmentResponse.forEach((attachment: AttachmentResponse) => {
      this.attachmentModel.push({
        id: attachment.id,
        fileName: attachment.fileName,
        structureId: this.structureId ?? -1,
        name: attachment.name,
        fileSize: attachment.fileSize,
        blobUrl: '',
        updatedAt: attachment.updatedAt,
        isMap: attachment.isMap || false
      });
    });
  }

  private lockUnlock(): void {
    if (!!this.structureId) {
      this.intervalId = setInterval(() => {
        UtilityConcurrency.handleInterval(
          this.structureId,
          this.lastInteractionTime,
          (entityId: number) => this.lockStructure(entityId),
          (title: string, message: string) => this.genericService.openErrorModal(title, message),
          () => UtilityRouting.navigateToStructureList()
        );
      }, CONCURRENCY.sessionMaxTimeMs);
    }
  }
}
