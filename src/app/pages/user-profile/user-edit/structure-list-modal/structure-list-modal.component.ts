import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnDestroy, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GlsInputComponent } from '../../../../common/form/gls-input/gls-input.component';
import { GlsInputDropdownComponent } from '../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { GlsInputCheckboxComponent } from '../../../../common/form/gls-input-checkbox/gls-input-checkbox.component';
import {
  FieldResponse,
  GetStructuresRequestPayload,
  GetStructuresResponse,
  StructureResponse,
  TemplateModel
} from '../../../../api/glsNetworkApi/models';
import { PostApiStructureV1$Json$Params } from '../../../../api/glsNetworkApi/fn/structure/post-api-structure-v-1-json';
import { StructureService, TemplateService } from '../../../../api/glsNetworkApi/services';
import { map, Observable } from 'rxjs';
import { ICONS } from '../../../../common/utilities/constants/icon';
import { ConfirmationDialogData } from '../../../../common/models/confirmation-dialog-interface';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { UserStructureModel } from '../../../../api/glsUserApi/models';
import { GlsTitleBudgeTemplateComponent } from '../../../../common/components/gls-title-budge-template/gls-title-budge-template.component';
import { VIEW_MODE } from '../../../../common/app.constants';

@Component({
  selector: 'app-structure-list-modal',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    GlsInputComponent,
    GlsInputDropdownComponent,
    GlsInputCheckboxComponent,
    GlsTitleBudgeTemplateComponent
  ],
  templateUrl: './structure-list-modal.component.html',
  styleUrl: './structure-list-modal.component.scss'
})
export class StructureListModalComponent implements OnInit, OnDestroy {
  modalRef!: NgbModalRef;
  structureModalFormGroup: FormGroup;
  buildingTypeOptionArray: { id: number; value: string }[] = []; // Explicitly define the type of associateOption
  structureList: StructureResponse[] = []; // Explicitly define the type of structureList
  allStructureList: StructureResponse[] = [];
  selectedStructureList: StructureResponse[] = []; // Adjust the type to match the pushed objects
  selectedStructure: StructureResponse[] = [];
  structurePayload!: GetStructuresRequestPayload;
  templateList: TemplateModel[] = [];
  structureListWithCheckbox: (StructureResponse & {
    isChecked: boolean;
  })[] = [];
  hasSearched = true;
  dialogData!: ConfirmationDialogData;
  selectedStructureIds: number[] = []; // <-- Add this line
  typeViewMode: VIEW_MODE | undefined;
  isSmallMobile = signal(false);
  isTablet = signal(false);
  private readonly modalService = inject(NgbModal);
  private readonly templateService = inject(TemplateService);
  private readonly genericService = inject(GenericService);

  constructor(
    private activeModal: NgbActiveModal,
    public fb: FormBuilder,
    private http: HttpClient,
    private structureModalService: StructureService,
    private userProfileService: UserProfileService,
    @Inject(NgbModal) public modalData: structureListModalObject,
    private translate: TranslateService
  ) {
    this.structureModalFormGroup = this.fb.group({
      searchStructureControlName: [null], // Ensure validation is applied
      buildingTypeName: [0] // Default to 'All' (id: 0)
    });
  }

  /**
   * Returns true if the search button should be disabled.
   */
  get isSearchDisabled(): boolean {
    // Disable only if input is empty AND last action was a reset
    const value = this.structureModalFormGroup.get('searchStructureControlName')?.value;

    return (!value || value.trim() === '' || value === null) && this.hasSearched;
  }

  /**
   * Getter for the `searchStructureControlName` form control.
   * @returns The form control for `searchStructureControlName`.
   */
  get searchStructureControlName() {
    return this.structureModalFormGroup.get('searchStructureControlName');
  }

  /**
   * Getter for the `buildingTypeName` form control.
   * @returns The form control for `buildingTypeName`.
   */
  get buildingTypeName() {
    return this.structureModalFormGroup.get('buildingTypeName');
  }

  /**
   * Angular lifecycle hook that is called after the component is initialized.
   * It loads the initial structure data and sets up listeners for input changes.
   */
  ngOnInit(): void {
    this.templateList = this.modalData.template;
    if (this.modalData.exitingStructures?.length > 0) {
      this.selectedStructure = Array.isArray(this.modalData.exitingStructures)
        ? JSON.parse(JSON.stringify(this.modalData.exitingStructures))
        : [];
      // Initialize selectedStructureIds with existing structure IDs
      this.selectedStructureIds = this.selectedStructure.map((item) => item.id);
    }
    this.getStructureList();
    this.setupSearchListener();
    this.setupViewMode();
  }

  /**
   * Retrieves the list of structures from the API and assigns it to the `structureList` property.
   * The list is filtered based on the selected building type.
   */
  getStructureList(): void {
    this.structurePayload = {
      name: this.modalData.selectSocietyId,
      fieldsToReturn: ['BuildingAcronym', 'BuildingName', 'BuildingType'],
      status: ['ACTIVE', 'COMPLETED'],
      orderBy: {
        field: 'BuildingAcronym',
        direction: 'asc'
      }
    };
    this.loadInitialStructureData(this.structurePayload).subscribe({
      next: (res: GetStructuresResponse) => {
        this.allStructureList = res?.structures || [];
        this.structureList = res?.structures || [];
        this.initailStructureCheckboxFromGroup();
        this.populateStructureCheckboxArray();
        this.applyFilters(); // Ensure filters are applied on initial load
      },
      error: (error) => {
        this.genericService.manageError(error);
      }
    });
  }

  /**
   *  * Retrieves the structure name based on the provided structure response.
   * @param items
   * @returns
   */
  getStructureName(items: StructureResponse): string {
    let acronym = '';
    let name = '';
    items.fields.forEach((item: FieldResponse) => {
      switch (item.fieldName?.toLowerCase()) {
        case 'buildingacronym':
          acronym = item.value || '';
          break;
        case 'buildingname':
          name = item.value || '';
          break;
        default:
          break;
      }
    });

    return `${acronym} - ${name}`;
  }

  /**
   * Loads the initial structure data from a mock JSON file.
   * The data is assigned to the `structureList` property.
   */
  loadInitialStructureData(body: GetStructuresRequestPayload): Observable<GetStructuresResponse> {
    const param: PostApiStructureV1$Json$Params = {
      body
    };

    return this.structureModalService.postApiStructureV1$Json(param).pipe(map((res: GetStructuresResponse) => res));
  }

  /**
   *  * Retrieves the icon for a given structure item based on its building type.
   * @param item
   * @returns
   */
  getIcon(item: StructureResponse): string {
    return this.getBuildingTypeIconAndName(item, 'icon');
  }

  /**
   *  * Retrieves the name for a given structure item based on its building type.
   * @param temp
   * @returns
   */
  gettemplateName(temp: StructureResponse): string {
    return this.getBuildingTypeIconAndName(temp, 'name');
  }

  /**
   *  * Retrieves the icon and name for a given structure item based on its building type.
   * @param item
   * @param type
   * @returns
   */
  getBuildingTypeIconAndName(item: StructureResponse, type: string): string {
    for (const field of item.fields) {
      if (field.fieldName?.toLowerCase() === 'buildingtype') {
        for (const template of this.templateList) {
          if (template.id === field.value && type === 'icon') {
            return ICONS[template.icon] as string;
          } else if (template.id === field.value && type === 'name') {
            return template.templateName as string;
          }
        }

        return '';
      }
    }

    return '';
  }

  /**
   * Sets up a listener for changes to the `searchStructureControlName` form control.
   * Only disables/enables the search button, does not filter on input.
   */
  setupSearchListener(): void {
    this.structureModalFormGroup.get('searchStructureControlName')?.valueChanges.subscribe(() => {
      // Only update the disabled state of the search button
      // (No action needed here, as isSearchDisabled is a getter)
    });
  }

  /**
   * Called when the search button is clicked.
   * Applies search filter and building type filter together.
   * Handles the search functionality for Structures.
   * Logs the entered search value to the console.
   */
  searchStructure(): void {
    const searchValue = (this.structureModalFormGroup.get('searchStructureControlName')?.value ?? '').trim();
    if (!searchValue) {
      // If input is empty, reset to dropdown filter only
      this.hasSearched = true;
      this.applyFilters();

      return;
    }
    this.hasSearched = false;
    this.applyFilters();
  }

  /**
   * Unified filter method for both building type and search input.
   * Only applies search filter if hasSearched is false.
   */
  applyFilters(): void {
    const searchValue = (this.structureModalFormGroup.get('searchStructureControlName')?.value ?? '').toLowerCase().trim();
    const selectedBuildingTypeId = this.structureModalFormGroup.get('buildingTypeName')?.value;
    let filteredList = [...this.allStructureList];

    // Always filter by building type if not "all"
    if (selectedBuildingTypeId !== null && Number(selectedBuildingTypeId) !== 0) {
      filteredList = filteredList.filter((item: StructureResponse) =>
        item.fields.some(
          (field: FieldResponse) => field.fieldName?.toLowerCase() === 'buildingtype' && field.value === Number(selectedBuildingTypeId)
        )
      );
    }

    // If search has been triggered and input is not empty, filter by search value as well
    if (!this.hasSearched && searchValue) {
      filteredList = filteredList.filter((item: StructureResponse) =>
        item.fields.some(
          (field: FieldResponse) =>
            (field.fieldName?.toLowerCase() === 'buildingname' && field.value?.toLowerCase().includes(searchValue)) ||
            (field.fieldName?.toLowerCase() === 'buildingacronym' && field.value?.toLowerCase().includes(searchValue))
        )
      );
    }

    this.structureList = filteredList;
    this.populateStructureCheckboxArray();
  }

  /**
   * * This method is used to close the modal without saving any changes.
   * * It will close the modal and return false to indicate that no changes were made.
   */
  closeModal(): void {
    this.activeModal.close(false);
  }

  /**
   * * This method is used to save the selected roles and close the modal.
   * * It will close the modal and return true to indicate that changes were made.
   */
  save(): void {
    const updateStructureList: UserStructureModel[] = [];
    let structureObj = {} as UserStructureModel & { buildingType?: string };
    // Only use selectedStructureIds to determine checked structures
    const checkedNewStructure = this.allStructureList.filter((item) => this.selectedStructureIds.includes(item.id));
    checkedNewStructure.forEach((item) => {
      if (!updateStructureList.some((s) => s.id === item.id)) {
        item.fields.forEach((field: FieldResponse) => {
          structureObj.id = item.id;
          structureObj.icon = item.icon;
          const fieldName = field.fieldName?.toLowerCase();
          if (fieldName === 'buildingacronym') {
            structureObj.buildingAcronym = field.value;
          } else if (fieldName === 'buildingname') {
            structureObj.buildingName = field.value;
          } else if (fieldName === 'buildingtype') {
            structureObj.buildingTypeName = field.description;
          }
        });
        updateStructureList.push(structureObj);
        structureObj = {} as UserStructureModel & { buildingType?: string };
      }
    });
    this.activeModal.close(updateStructureList);
  }

  /**
   * Handles changes to the checkbox for a structure.
   * Adds the selected structure to the `selectedStructureList` if checked.
   * Removes it if unchecked.
   * @param id The ID of the structure.
   * @param event The checkbox change event.
   */
  onCheckboxChange(id: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const selectedStructureObject = this.structureListWithCheckbox.find((item: StructureResponse) => item.id === id);
    if (selectedStructureObject) {
      selectedStructureObject.isChecked = isChecked;
      if (isChecked) {
        // Add to selectedStructureIds if not present
        if (!this.selectedStructureIds.includes(id)) {
          this.selectedStructureIds.push(id);
        }
        const selectedStructure = this.selectedStructureList.find((item) => item.id === id);
        if (!selectedStructure) {
          this.selectedStructureList.push(selectedStructureObject);
        }
      } else {
        // Remove from selectedStructureIds
        this.selectedStructureIds = this.selectedStructureIds.filter((itemId) => itemId !== id);
        this.selectedStructureList = this.selectedStructureList.filter((item) => item.id !== id);
      }
    }
  }

  onBuildingTypeChange(): void {
    // Do not reset hasSearched, just apply filters so both filters combine
    this.applyFilters();
  }

  initailStructureCheckboxFromGroup(): void {
    this.structureList.forEach((structure: StructureResponse) => {
      const controlName = `structure_${structure.id}`;
      this.structureModalFormGroup.addControl(controlName, this.fb.control(false));
      const structureCheckboxObject = {
        isChecked: this.selectedStructure.some((item) => item.id === structure.id)
      };
      this.structureModalFormGroup.get(controlName)?.setValue(structureCheckboxObject.isChecked);
    });
  }

  populateStructureCheckboxArray(): void {
    // Use selectedStructureIds to persist checked state
    this.structureListWithCheckbox = this.structureList.map((structure: StructureResponse) => {
      const structureCheckboxObject = {
        isChecked: this.selectedStructureIds.includes(structure.id)
      };
      const controlName = `structure_${structure.id}`;
      this.structureModalFormGroup.get(controlName)?.setValue(structureCheckboxObject.isChecked);

      return {
        ...structure,
        ...structureCheckboxObject
      };
    });
  }

  // Add this to help prevent "Injector has already been destroyed" errors in tests
  ngOnDestroy(): void {
    // Close modal if open to avoid injector errors
    if (this.modalRef) {
      try {
        this.modalRef.close();
      } catch {
        // ignore if already closed
      }
    }
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

export interface structureListModalObject {
  selectSocietyName: string;
  selectSocietyId: number;
  template: TemplateModel[];
  exitingStructures: StructureResponse[];
}
