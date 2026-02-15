/* eslint-disable no-extra-boolean-cast */
import { Component, inject, OnDestroy, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { NgbModal, NgbModalRef, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { map, Observable } from 'rxjs';
import { NgClass, NgForOf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { GlsInputComponent } from '../../../../common/form/gls-input/gls-input.component';
import { ICONS } from '../../../../common/utilities/constants/icon';
import { ConfirmationDialogData } from '../../../../common/models/confirmation-dialog-interface';
import { ConfirmationDialogComponent } from '../../../../common/components/confirmation-dialog/confirmation-dialog/confirmation-dialog.component';
import { ISetpperInterface } from '../../../../common/models/stepper-interface';
import { GlsStepperComponent } from '../../../../common/components/gls-stepper/gls-stepper.component';
import { TemplateService } from '../../../../api/glsNetworkApi/services/template.service';
import {
  FieldModel,
  TemplateDetailsModel,
  TemplateFieldCreateModel,
  TemplateFieldModel,
  TemplateFieldUpdateModel,
  TemplateModel
} from '../../../../api/glsNetworkApi/models';
import { ViewDetailsComponent } from '../../../../common/components/view-details/view-details.component';
import { GenericService } from '../../../../common/utilities/services/generic.service';

import { HttpErrorResponse } from '@angular/common/http';
import { GetTemplateById$Json$Params } from '../../../../api/glsNetworkApi/fn/template/get-template-by-id-json';
import { TitleBudgeComponent } from '../../../../common/components/title-budge/title-budge.component';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { Utility } from '../../../../common/utilities/utility';
import { PutApiTemplateV1$Json$Params } from '../../../../api/glsNetworkApi/fn/template/put-api-template-v-1-json';
import { PostApiTemplateV1$Json$Params } from '../../../../api/glsNetworkApi/fn/template/post-api-template-v-1-json';
import { BreadcrumbService } from '../../../../common/utilities/services/breadcrumb/breadcrumb.service';
import { numericValidator } from '../../../../common/utilities/validators/numeric.validator';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { GetApiTemplateV1Fields$Json$Params } from '../../../../api/glsNetworkApi/fn/template/get-api-template-v-1-fields-json';
import { FUNCTIONALITY, PERMISSION } from '../../../../common/utilities/constants/profile';
import { CONCURRENCY } from '../../../../common/utilities/constants/concurrency';
import { UtilityConcurrency } from '../../../../common/utilities/utility-concurrency';
import { StrictHttpResponse } from '../../../../api/glsUserApi/strict-http-response';
import { MODAL_MD } from '../../../../common/utilities/constants/modal-options';

@Component({
  selector: 'app-template-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GlsInputComponent,
    TranslateModule,
    NgbNavModule,
    GlsStepperComponent,
    ViewDetailsComponent,
    NgClass,
    NgForOf,
    TitleBudgeComponent
  ],
  providers: [TranslatePipe],
  templateUrl: './template-edit.component.html',
  styleUrls: ['./template-edit.component.scss']
})
export class TemplateEditComponent implements OnInit, OnDestroy {
  createTemplateFormGroup!: FormGroup;
  step1FormGroup!: FormGroup;
  step2FormGroup!: FormGroup;
  active = 'anagrafica';
  activeStep = 0;
  dialogData!: ConfirmationDialogData;
  modalRef!: NgbModalRef;
  steps: ISetpperInterface[] = [];
  @ViewChild('nomeedicona', { static: true }) nomeedicona!: TemplateRef<unknown>;
  @ViewChild('compiladat', { static: true }) compiladat!: TemplateRef<unknown>;
  @ViewChild('controlladati', { static: true }) controlladati!: TemplateRef<unknown>;
  @ViewChild('stepper') stepper!: GlsStepperComponent;
  type = 'create';
  fieldsList = signal<TemplateFieldModel[] | FieldModel[]>([]);
  title = 'anagrafica.template.texts.createTemplate';
  titleIcon = 'assets/img/Document_blue/GLS_Icon_Send_Receive_Documents_GLSBlue_RGB_77068_0.png';
  lastInteractionTime = new Date().getTime(); // Initialize with the current time

  protected showPage = false;

  private templateDetailsModel?: TemplateDetailsModel;

  private readonly route = inject(ActivatedRoute);
  private readonly genericService = inject(GenericService);
  private readonly breadcrumbService = inject(BreadcrumbService);

  private idTemplate?: number | null;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private fb: FormBuilder,
    public modalService: NgbModal,
    private templateService: TemplateService,
    private messageStatusService: MessageStatusService
  ) {
    this.genericService.resizePage();
  }

  // eslint-disable-next-line max-lines-per-function
  ngOnInit(): void {
    const idTemplateParam = this.route.snapshot.paramMap.get('idTemplate');
    this.idTemplate = idTemplateParam ? Number(idTemplateParam) : null;
    if (this.idTemplate) {
      this.lockUnlock();
      this.retrieveTemplateById(this.idTemplate).subscribe({
        next: (response: TemplateDetailsModel) => {
          response.fields.unshift(this.createBuildingAcronymTemplate());

          this.setInitialPageData(response.fields, response.templateName, 'edit');

          this.templateDetailsModel = response;
          this.titleIcon = response.icon;
          this.buildForms();
          this.activeStep = 1;
          this.showPage = true;
          this.step1FormGroup?.statusChanges.subscribe(() => {
            this.lastInteractionTime = new Date().getTime();
          });
          this.step2FormGroup?.statusChanges.subscribe(() => {
            this.lastInteractionTime = new Date().getTime();
          });
        },
        error: (err: HttpErrorResponse) => {
          this.manageError(err, true);
        }
      });
    } else {
      this.retrieveTemplateFields().subscribe({
        next: (response: FieldModel[]) => {
          response.unshift(this.createBuildingAcronymFieldModel());

          this.setInitialPageData(response, 'anagrafica.template.texts.createTamplete', 'create');

          this.buildForms();
          this.activeStep = 0;
          this.showPage = true;
        },
        error: (err: HttpErrorResponse) => {
          this.manageError(err, true);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.genericService.resizeMainPage.set(this.genericService.defaultValue());
    if (!!this.idTemplate && this.intervalId !== null) {
      this.unlockTemplate(this.idTemplate!).subscribe({
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
   * Go to specific step
   * @param ev
   */
  getStepperValue(ev: { index: number }) {
    this.activeStep = ev.index;
  }

  /**
   * Retrieves all available icons and their corresponding paths.
   *
   * @returns An array of objects, each containing the `code` (icon identifier) and `path` (icon file path).
   */
  getAllIcons(): { code: string; path: string }[] {
    const icons: { code: string; path: string }[] = [];
    Object.keys(ICONS).forEach((key) => {
      icons.push({ code: key, path: ICONS[key] });
    });

    return icons;
  }

  /**
   * Handles the selection of an icon.
   *
   * @param icon - The identifier of the selected icon.
   * @param event - The event triggered by the icon selection.
   */
  onIconSelect(icon: string, event: Event): void {
    event.preventDefault(); // Prevent default behavior
    if (this.step1FormGroup.get('icon')) {
      this.step1FormGroup.get('icon')?.setValue(icon);
    }
  }

  /**
   * Opens a confirmation dialog to save the template.
   * Depending on the user's confirmation, it either updates an existing template or creates a new one.
   */
  onSaveTemplate(): void {
    this.dialogData = {
      title: this.type === 'create' ? 'anagrafica.template.dialog.createTemplateTitle' : 'anagrafica.template.dialog.saveTemplateTitle',
      content: this.type === 'create' ? 'anagrafica.template.dialog.createTemplateText' : 'anagrafica.template.dialog.saveTemplateText',
      showCancel: true,
      cancelText: 'generic.cancel',
      confirmText: 'generic.save'
    };
    this.modalRef = this.modalService.open(ConfirmationDialogComponent, MODAL_MD);
    this.modalRef.componentInstance.data = this.dialogData;
    this.modalRef.result.then((result: string) => {
      if (result) {
        if (this.idTemplate) {
          this.updateTemplate();
        } else {
          this.createTemplate();
        }
      }
    });
  }

  /**
   * Retrieves the form fields to be sent to the API.
   * Filters out fields with an ID less than 0 and maps the remaining fields to include their ID, visibility, and requirement status.
   *
   * @returns An array of `TemplateFieldUpdateModel` or `TemplateFieldCreateModel` objects representing the form fields.
   */
  getFormFields(): TemplateFieldUpdateModel[] | TemplateFieldCreateModel[] {
    return this.fieldsList()
      .filter((field) => field.id >= 0) // Escludi gli elementi con id minore di 0
      .map((field) => {
        return {
          fieldId: field.id,
          isRequired: this.step2FormGroup.value[field.fieldName + '_toggle'] === true || field.isRequired,
          isVisible: this.step2FormGroup.value[field.fieldName ?? ''] === true || field.isVisible
        };
      });
  }

  /**
   * get template Icon method
   * @param icon
   * @returns
   */
  getTemplateIcon(icon: string) {
    return icon ? ICONS[icon] || this.titleIcon : this.titleIcon;
  }

  /**
   * Navigates to the appropriate page based on the current template state.
   * If a template ID exists, navigates to the template edit page.
   * Otherwise, navigates to the template list page.
   */
  goToExit() {
    if (this.idTemplate) {
      this.breadcrumbService.removeLastBreadcrumb();
      UtilityRouting.navigateToTemplateDetailByTemplateId(this.idTemplate.toString());
    }
    UtilityRouting.navigateToTemplateList();
  }

  /**
   * Sets the initial data for the page, including the list of fields, the title, and the type of operation.
   *
   * @param fields - An array of fields to be displayed on the page. Can be of type `TemplateFieldModel[]` or `FieldModel[]`.
   * @param title - The title of the page, typically representing the template name.
   * @param type - The type of operation being performed, either 'edit' or 'create'.
   */
  private setInitialPageData(fields: TemplateFieldModel[] | FieldModel[], title: string, type: 'edit' | 'create'): void {
    this.fieldsList.update(() => fields);
    this.title = title;
    this.type = type;
  }

  /**
   * Creates a default `TemplateFieldModel` object for the "Building Acronym" field.
   * This field is pre-configured with specific properties such as visibility, requirement, and mandatory status.
   *
   * @returns A `TemplateFieldModel` object representing the "Building Acronym" field.
   */
  private createBuildingAcronymTemplate(): TemplateFieldModel {
    const buildingAcromym: TemplateFieldModel = {
      id: -1,
      fieldName: 'BuildingAcronym',
      section: 'anagrafica',
      subSection: 'general',
      isVisible: true,
      isRequired: true,
      mandatory: true
    };

    return buildingAcromym;
  }

  /**
   * Creates a default `FieldModel` object for the "Building Acronym" field.
   * This field is pre-configured with specific properties such as visibility, requirement, mandatory status, and field type.
   *
   * @returns A `FieldModel` object representing the "Building Acronym" field.
   */
  private createBuildingAcronymFieldModel(): FieldModel {
    const buildingAcromym: FieldModel = {
      id: -1,
      fieldName: 'BuildingAcronym',
      section: 'anagrafica',
      subSection: 'general',
      isVisible: true,
      isRequired: true,
      mandatory: true,
      fieldType: 'string'
    };

    return buildingAcromym;
  }

  /**
   * Updates an existing template by sending the updated data to the API.
   * The updated template includes the template ID, selected icon, and form fields.
   * On success, navigates to the updated template's edit page and hides the spinner.
   * On error, displays an error modal and hides the spinner.
   */
  private updateTemplate() {
    if (this.idTemplate) {
      const param: PutApiTemplateV1$Json$Params = {
        body: {
          id: this.idTemplate,
          templateName: this.step1FormGroup.value.name,
          icon: this.step1FormGroup.value.icon,
          fields: this.getFormFields(),
          buildingAcronymMinLength: this.step2FormGroup.value.buildingAcronymMin,
          buildingAcronymMaxLength: this.step2FormGroup.value.buildingAcronymMax
        }
      };

      this.templateService.putApiTemplateV1$Json(param).subscribe({
        next: (res: TemplateDetailsModel) => {
          this.messageStatusService.show('message.template.edit.success');
          this.breadcrumbService.removeLastBreadcrumb();
          UtilityRouting.navigateToTemplateDetailByTemplateId(res.id.toString());
        },
        error: (err: HttpErrorResponse) => {
          this.manageError(err, false);
        }
      });
    }
  }

  /**
   * Creates a new template by sending the provided data to the API.
   * The new template includes the building acronym constraints, selected icon, form fields, and template name.
   * On success, navigates to the newly created template's edit page and hides the spinner.
   * On error, displays an error modal and hides the spinner.
   */
  private createTemplate(): void {
    const param: PostApiTemplateV1$Json$Params = {
      body: {
        buildingAcronymMaxLength: this.step2FormGroup.value.buildingAcronymMax,
        buildingAcronymMinLength: this.step2FormGroup.value.buildingAcronymMin,
        fields: this.getFormFields() as TemplateFieldCreateModel[],
        icon: this.step1FormGroup.value.icon,
        templateName: this.step1FormGroup.value.name
      }
    };

    this.templateService.postApiTemplateV1$Json(param).subscribe({
      next: (res: TemplateModel) => {
        this.messageStatusService.show('message.template.create.success');
        this.breadcrumbService.removeLastBreadcrumb();
        UtilityRouting.navigateToTemplateDetailByTemplateId(res.id.toString());
      },
      error: (err: HttpErrorResponse) => {
        this.manageError(err, false);
      }
    });
  }

  private manageError(err: HttpErrorResponse, goToPrevPage: boolean): void {
    try {
      Utility.logErrorForDevEnvironment(err);
      const errorMessage = 'serviceMessage.' + (err.error.innerException?.internalCode || 'genericError');
      const additionalData = err.error?.innerException?.additionalData;
      this.openErrorModal('attention', errorMessage, goToPrevPage, additionalData);
    } catch (e) {
      console.error('Catch error:', e);
      this.openErrorModal('attention', 'serviceMessage.genericError', goToPrevPage);
    }
  }

  /**
   * Opens an error modal with the provided title and content.
   * If `goToPrevPage` is true, navigates to the previous page after the modal is closed.
   *
   * @param title - The title of the error modal.
   * @param content - The content/message to display in the error modal.
   * @param goToPrevPage - Optional. If true, navigates to the previous page after closing the modal.
   */
  private openErrorModal(
    title: string,
    content: string,
    goToPrevPage: boolean,
    additionalData?: { placeHolder: string; value: string | number }[]
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
      if (goToPrevPage) {
        this.goToExit();
      }
    });
  }

  /**
   * Retrieves the list of templates from the API.
   * @returns The list of templates.
   */
  private retrieveTemplateById(idTemplate: number): Observable<TemplateDetailsModel> {
    const param: GetTemplateById$Json$Params = {
      id: idTemplate
    };

    // Create HTTP context with custom headers
    const context = Utility.setPermissionHeaders(FUNCTIONALITY.networkTemplate, PERMISSION.write);

    return this.templateService.getTemplateById$Json(param, context).pipe(
      map((r: TemplateDetailsModel) => {
        return r;
      })
    );
  }

  /**
   * Retrieves the list of templates from the API.
   * @returns The list of templates.
   */
  private retrieveTemplateFields(): Observable<FieldModel[]> {
    const params: GetApiTemplateV1Fields$Json$Params = {};

    // Create HTTP context with custom headers
    const context = Utility.setPermissionHeaders(FUNCTIONALITY.networkTemplate, PERMISSION.write);

    return this.templateService.getApiTemplateV1Fields$Json(params, context).pipe(
      map((r: FieldModel[]) => {
        return r;
      })
    );
  }

  /**
   * Builds the forms for the template creation/editing process.
   * It initializes the form groups and sets up the steps for the stepper component.
   * This includes the template name, icon selection, and data compilation steps.
   */
  private buildForms(): void {
    this.createTemplateFormGroup = this.fb.group({
      templateName: ['', Validators.required]
    });

    this.buildStep1();
    this.buildStep2();

    this.steps = [
      { title: 'chooseIconName', template: this.nomeedicona, formGroup: this.step1FormGroup },
      { title: 'compileData', template: this.compiladat, formGroup: this.step2FormGroup },
      { title: 'controlData', template: this.controlladati, formGroup: this.fb.group({}) }
    ];
  }

  /**
   * Builds the first step of the form, which includes the template name and icon selection.
   * It initializes the form controls and sets default values if editing an existing template.
   * The form is validated to ensure that both fields are filled before proceeding.
   */

  private buildStep1(): void {
    this.step1FormGroup = this.fb.group({
      name: ['', Validators.required],
      icon: ['', Validators.required]
    });

    if (this.type === 'edit') {
      this.step1FormGroup.get('name')?.setValue(this.title);
      this.step1FormGroup.get('icon')?.setValue(this.titleIcon);
    }
  }

  /**
   * Builds the second step of the form, which includes the building acronym constraints and field visibility/requirement settings.
   * It initializes the form controls and sets default values if editing an existing template.
   */
  private buildStep2(): void {
    // Initialize the building acronym constraint controls
    this.step2FormGroup = this.fb.group({
      buildingAcronymMin: [
        this.templateDetailsModel?.buildingAcronymMinLength ? this.templateDetailsModel.buildingAcronymMinLength : '',
        [Validators.required, Validators.min(1), numericValidator()]
      ],
      buildingAcronymMax: [
        this.templateDetailsModel?.buildingAcronymMaxLength ? this.templateDetailsModel.buildingAcronymMaxLength : '',
        [Validators.required, Validators.min(1), numericValidator()]
      ]
    });

    // Adds dynamic controls for each field in the list
    this.fieldsList().forEach((field: TemplateFieldModel | FieldModel) => {
      this.createFormControlFromField(field);
    });

    // Observe changes in fields to update associated controls
    this.observeFieldChanges();
  }

  /**
   * Creates a form control for each field in the template.
   * The control is initialized with its visibility and requirement status.
   * @param field - The field model containing the properties for the form control.
   * @returns void
   */
  private createFormControlFromField(field: TemplateFieldModel | FieldModel): void {
    const isVisible = field.isVisible;
    const isRequired = field.isRequired;
    const isMandatory = field.mandatory;

    this.step2FormGroup.addControl(
      field.fieldName,
      new FormControl({
        value: `${isVisible}`,
        disabled: isMandatory || false
      })
    );

    this.step2FormGroup.addControl(
      field.fieldName + '_toggle',
      new FormControl({
        value: `${isRequired}`,
        disabled: (isMandatory && isRequired) || this.step2FormGroup.get(field.fieldName)?.value !== 'true'
      })
    );
  }

  /**
   * Observes changes in the form fields and enables/disables the corresponding toggle fields based on the field's visibility status.
   * If the field is visible, the toggle field is enabled; otherwise, it is disabled.
   */
  private observeFieldChanges(): void {
    this.fieldsList().forEach((field: TemplateFieldModel | FieldModel) => {
      const fieldName = field.fieldName;
      const toggleFieldName = fieldName + '_toggle';

      const fieldControl = this.step2FormGroup.get(fieldName);
      const toggleFieldControl = this.step2FormGroup.get(toggleFieldName);

      if (fieldControl && toggleFieldControl) {
        fieldControl.valueChanges.subscribe((newValue) => {
          const isDisabled = newValue === 'false';
          toggleFieldControl.disable({ emitEvent: false });
          if (!isDisabled) {
            toggleFieldControl.enable({ emitEvent: false });
          }
        });
      }
    });
  }

  /**
   * Locks the Template by its ID.
   * This method sends a request to lock the Template, preventing further modifications.
   *
   * @param idTemplate - The ID of the Template to lock.
   * @returns An observable of the locked Template details.
   */
  lockTemplate(idTemplate: number): Observable<StrictHttpResponse<void>> {
    const param = {
      id: idTemplate
    };

    return this.templateService.postApiTemplateV1IdLock$Response(param);
  }

  /**
   * Unlocks the Template by its ID.
   * This method sends a request to unlock the Template, allowing further modifications.
   *
   * @param idTemplate - The ID of the Template to unlock.
   * @returns An observable of the unlocked Template details.
   */
  unlockTemplate(idTemplate: number): Observable<StrictHttpResponse<void>> {
    const param = {
      id: idTemplate
    };

    return this.templateService.postApiTemplateV1IdUnlock$Response(param);
  }

  private lockUnlock(): void {
    if (!!this.idTemplate) {
      this.intervalId = setInterval(() => {
        UtilityConcurrency.handleInterval(
          this.idTemplate!,
          this.lastInteractionTime,
          (entityId: number) => this.lockTemplate(entityId),
          (title: string, message: string) => this.genericService.openErrorModal(title, message),
          () => UtilityRouting.navigateToTemplateList()
        );
      }, CONCURRENCY.sessionMaxTimeMs);
    }
  }
}
