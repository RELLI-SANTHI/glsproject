/* eslint-disable max-lines-per-function */
import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NgbCarouselModule, NgbModalRef, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { isObject, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { forkJoin, map, Observable } from 'rxjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { GlsInputCheckboxComponent } from '../../../../common/form/gls-input-checkbox/gls-input-checkbox.component';
import { ReferenceDataService, StructureService, TemplateService } from '../../../../api/glsNetworkApi/services';
import {
  AreaModel,
  ExportField,
  FieldModel,
  FieldResponse,
  GetStructuresRequestPayload,
  GetStructuresRequestPayloadExportCsv,
  GetStructuresResponse,
  ProvinceModel,
  RegionModel,
  StructureResponse,
  TemplateModel
} from '../../../../api/glsNetworkApi/models';
import { ExportService } from '../../../../api/glsNetworkApi/services/export.service';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { DEFAULT_COLUMNS, STRUCTURE_CONSTANTS } from '../../constants/structure-constant';
import { CarouselComponent } from '../../../../common/components/carousel/carousel.component';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { GlsMessagesComponent } from '../../../../common/components/gls-messages/gls-messages.component';
import { ConfirmationDialogData } from '../../../../common/models/confirmation-dialog-interface';
import { Utility } from '../../../../common/utilities/utility';
import { VIEW_MODE } from '../../../../common/app.constants';
import { ColTableInterface } from '../../../../common/models/col-table-interface';
import { StructureListTableComponent } from './structure-list-table/structure-list-table.component';
import { ContentHeaderComponent } from '../../../../common/components/content-header/content-header.component';
import { ResetFilterStructureList } from '../../../../common/models/reset-filter-structure-list';
import { SortFiledStructureList } from '../../../../common/models/sort-filed-structure-list';
import { PostApiStructureV1$Json$Params } from '../../../../api/glsNetworkApi/fn/structure/post-api-structure-v-1-json';
import { PostApiExportV1Export$Json$Params } from '../../../../api/glsNetworkApi/fn/export/post-api-export-v-1-export-json';
import { GetApiTemplateV1Fields$Json$Params } from '../../../../api/glsNetworkApi/fn/template/get-api-template-v-1-fields-json';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../common/utilities/constants/profile';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { Carousel } from '../../../../common/models/carousel';
import { DraftCardDataPipe } from '../pipes/draft-card-data.pipe';
import { StructureInfoPipe } from '../pipes/structure-info.pipe';
import { UtilityProfile } from '../../../../common/utilities/utility-profile';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';

@Component({
  selector: 'app-structure-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgbPaginationModule,
    NgbCarouselModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    GlsInputCheckboxComponent,
    NgxDatatableModule,
    CarouselComponent,
    GlsMessagesComponent,
    StructureListTableComponent,
    ContentHeaderComponent,
    DraftCardDataPipe,
    DraftCardDataPipe,
    StructureInfoPipe
  ],
  templateUrl: './structure-list.component.html',
  styleUrl: './structure-list.component.scss'
})
export class StructureListComponent implements OnInit, OnDestroy {
  PROFILE = PROFILE;
  FUNCTIONALITY = FUNCTIONALITY;
  PERMISSION = PERMISSION;

  // MODAL
  dialogData!: ConfirmationDialogData;
  modalRef!: NgbModalRef;
  showWarning = signal(false);
  // start draft section
  draftStructures: StructureResponse[][] = [];
  totalDraftItem = 0;
  totalItems = signal(0);
  // start table section
  structuresList = signal<StructureResponse[]>([]);
  currentPage = signal<number>(1);
  totalPages = signal(1);
  pageSize = signal(10);
  sortSelected: SortFiledStructureList = {
    field: 'Warning',
    direction: 'desc'
  };
  columnModalIsOpen = false;
  columns = signal<ColTableInterface[]>(DEFAULT_COLUMNS);
  rows?: FieldResponse[] | null;
  columnsFG!: FormGroup;
  // filter
  isOpenedFilter = signal(false);
  structureFilterFg!: FormGroup;
  statusField: string[] = ['COMPLETED', 'ACTIVE', 'DISABLED']; // DRAFT
  filterStepper: FilterStep[] = [
    {
      id: 0,
      step: 'start',
      fields: [
        { name: 'BuildingType', value: undefined },
        // { name: 'Province', value: undefined },
        // { name: 'Name', value: undefined },
        { name: 'Region', value: undefined },
        { name: 'Area', value: undefined },
        { name: 'status', value: undefined },
        { name: 'Warning', value: undefined }
      ]
    }
  ];
  selectedHeaderArray: string[] = [];
  isTablet = signal(false);
  currenFilterStep = 'start';

  // export data
  openExportDataModal = false;
  exportDataFG!: FormGroup;
  exportFieldsData: FieldModel[] = [];
  structureActiveRequest!: GetStructuresRequestPayload;
  filterFields: Pick<
    GetStructuresRequestPayload,
    'status' | 'warning' | 'province' | 'area' | 'region' | 'buildingAcronym' | 'buildingType' | 'name'
  > = {};
  regions: RegionModel[] = [];
  areas: AreaModel[] = [];
  // provinces: ProvinceModel[] = [];
  ragioneSocialeList = [
    { id: '10', value: 'Societa 1' },
    { id: '11', value: 'Societa 2' },
    { id: '12', value: 'Societa 3' }
  ];
  buildingTypes: TemplateModel[] = [];
  showButtonExport = false;
  showButtonFilter = false;
  typeViewMode: VIEW_MODE | undefined;
  isSmallMobile = signal(false);
  showRotateCard = signal(false);
  showCrateBtn = signal(false);
  isAppliedFilter = false;
  protected readonly messageStatusService = inject(MessageStatusService);
  protected readonly http = inject(HttpClient);
  protected numColFrozen = signal(3);
  private readonly translateService = inject(TranslateService);
  private readonly userProfileService = inject(UserProfileService);

  constructor(
    private readonly fb: FormBuilder,
    private structureService: StructureService,
    private filterService: ReferenceDataService,
    private templateService: TemplateService,
    private apiExportService: ExportService,
    private genericService: GenericService
  ) {
    this.structureFilterFg = this.fb.group({
      filterType: ['', Validators.required],
      filterValue: ['']
    });

    this.resetStructureActiveRequest();
    effect(
      () => {
        this.showRotateCard.set(this.isSmallMobile() && !this.genericService.isLandscape());
      },
      {
        allowSignalWrites: true
      }
    );
  }

  /**
   * Initializes the component and sets up the necessary data and forms.
   */
  ngOnInit(): void {
    this.initializeForms();
    this.loadInitialData();
    this.setupViewMode();
    this.showCrateBtn.set(
      UtilityProfile.checkAccessProfile(this.userProfileService, PROFILE.any, FUNCTIONALITY.networkStructure, PERMISSION.write)
    );
  }

  /**
   * Cleans up resources when the component is destroyed.
   * - Disconnects the `ResizeObserver`.
   * - Hides any active messages and spinners.
   */
  ngOnDestroy(): void {
    this.messageStatusService.hide();
  }

  /**
   * Handles the sort event from the ngx-datatable and updates the API request accordingly.
   * @param event The sort event containing column and direction information.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSort(event: any): void {
    const fieldMapping: Record<string, string> = {
      warning: 'Warning',
      status: 'status',
      BuildingAcronym: 'BuildingAcronym',
      BuildingName: 'BuildingName',
      Region: 'Region',
      Area: 'Area'
    };

    const mappedField = fieldMapping[event.column.prop] || event.column.prop || '';

    this.structureActiveRequest.orderBy = {
      field: mappedField || '',
      direction: event.newValue || ''
    };
    this.retrieveStructures(this.structureActiveRequest).subscribe({
      next: (res: GetStructuresResponse) => {
        this.reloadStructureList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Retrieves the list of regions from the API or mock data.
   * @returns An observable of the list of regions.
   */
  retrieveRegions(): Observable<RegionModel[]> {
    return this.filterService.getApiReferencedataV1Regions$Json().pipe(map((res: RegionModel[]) => res));
  }

  /**
   * Retrieves the list of provinces from the API or mock data.
   * @returns An observable of the list of provinces.
   */
  retrieveProvince(): Observable<ProvinceModel[]> {
    return this.filterService.getApiReferencedataV1Provinces$Json().pipe(map((res: ProvinceModel[]) => res));
  }

  /**
   * Retrieves the list of areas from the API or mock data.
   * @returns An observable of the list of areas.
   */
  retrieveAreas(): Observable<AreaModel[]> {
    return this.filterService.getApiReferencedataV1Areas$Json().pipe(map((res: AreaModel[]) => res));
  }

  /**
   * Retrieves the list of templates from the API or mock data.
   * @returns An observable of the list of templates.
   */
  retrieveTemplates(): Observable<TemplateModel[]> {
    return this.templateService.getApiTemplateV1$Json().pipe(map((res: TemplateModel[]) => res));
  }

  /**
   * Prepares the draft structures for display in a carousel format.
   * @param structureList The list of draft structures.
   */
  loadDraftCard(structureList: StructureResponse[]): void {
    let itemForPages = 0;

    switch (this.typeViewMode) {
      case VIEW_MODE.DESKTOP:
        itemForPages = 3;
        break;
      case VIEW_MODE.TABLET:
        itemForPages = 2;
        break;
      case VIEW_MODE.MOBILE:
        itemForPages = 1;
        break;
    }
    const slides: StructureResponse[][] = [];

    for (let i = 0; i < structureList.length; i += itemForPages) {
      slides.push(structureList.slice(i, i + itemForPages));
    }

    this.draftStructures = slides;
    this.totalDraftItem = structureList.length;
  }

  /**
   * Reloads the active structure list with the provided data.
   * @param structureActive The response containing active structures.
   */
  reloadStructureList(structureActive: GetStructuresResponse): void {
    this.structuresList.set([]);
    if (structureActive) {
      this.currentPage.set(structureActive.currentPage || 1);
      this.totalPages.set(structureActive.totalPages || 1);
      this.pageSize.set(structureActive.pageSize || 0);
      this.totalItems.set(structureActive.totalItems);
      const structures: StructureResponse[] = [];
      structures.push(...structureActive.structures);
      this.structuresList.set(structures);
      this.updateShowWarning();
    }
  }

  /**
   * Retrieves the list of structures based on the provided request payload.
   * @param body The request payload for retrieving structures.
   * @returns An observable of the structure response.
   */
  retrieveStructures(body: GetStructuresRequestPayload): Observable<GetStructuresResponse> {
    const param: PostApiStructureV1$Json$Params = {
      body
    };

    // Create HTTP context with custom headers
    const context = Utility.setPermissionHeaders(FUNCTIONALITY.networkStructure, PERMISSION.read);

    return this.structureService.postApiStructureV1$Json(param, context).pipe(map((res: GetStructuresResponse) => res));
  }

  /**
   * Resets the structureActiveRequest object to its default state.
   */
  resetStructureActiveRequest(): void {
    this.structureActiveRequest = {
      status: ['COMPLETED', 'ACTIVE', 'DISABLED'],
      page: this.currentPage(),
      pageSize: this.pageSize(),
      fieldsToReturn: [
        'Warning',
        'BuildingType',
        'BuildingAcronym',
        'BuildingName',
        'Name',
        'Region',
        'Area',
        'StartOfOperationalActivity',
        'EndOfOperationalActivity'
      ]
    };
  }

  /**
   * Loads the filter steps with the provided filter data.
   * @param filters The filter data to load into the filter steps.
   */
  loadFilterSteps(filters: Record<string, string[]>) {
    this.filterFields = filters;
    Object.entries(filters).forEach((x, i) => {
      if (x[0] === 'buildingAcronym') {
        return;
      }
      const step: FilterStep = {
        id: i + 1,
        step: x[0],
        fields: isObject(x[1]) ? x[1].map((field: string) => ({ name: field, value: field })) : []
      };
      this.filterStepper.push(step);
    });
  }

  /**
   * Handles the page change event and updates the current page.
   * @param page The new page number.
   */
  pageChange(page: number): void {
    this.currentPage.set(page);
    this.structureActiveRequest.page = page;
    this.retrieveStructures(this.structureActiveRequest).subscribe({
      next: (res: GetStructuresResponse) => {
        this.reloadStructureList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Opens the column editor modal.
   */
  openColumnEditor() {
    this.columnModalIsOpen = true;
  }

  /**
   * Retrieves the list of columns that are not blocked.
   * @returns The list of unblocked columns.
   */
  getColumsNotBlocked() {
    return this.columns().filter((x) => !x.block);
  }

  /**
   * Updates the visibility of columns based on the form group values.
   */
  filterColumns() {
    const values = this.columnsFG.value;
    Object.entries(values).forEach((value) => {
      const index = this.columns().findIndex((x) => x.field === value[0]);
      if (index >= 0) {
        this.columns()[index].columnVisible = value[1] as boolean;
      }
    });

    this.columnModalIsOpen = false;
  }

  /**
   * Filters the structure list by the building acronym.
   */
  filterByText(): void {
    const filterType = this.structureFilterFg.value.filterType;
    const filterValue = this.structureFilterFg.value.filterValue;

    if (filterType === 'BuildingAcronym') {
      this.structureActiveRequest.buildingAcronym = filterValue;
    } else if (filterType === 'Name') {
      this.structureActiveRequest.name = filterValue;
    } else if (filterType === 'BuildingName') {
      this.structureActiveRequest.buildingName = filterValue;
    } else if (filterType === 'companyName') {
      this.structureActiveRequest.companyName = filterValue;
    }

    this.currentPage.set(1);
    this.structureActiveRequest.page = 1;

    this.retrieveStructures(this.structureActiveRequest).subscribe({
      next: (res) => {
        this.reloadStructureList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
    // }
  }

  /**
   * Opens the export data modal.
   */
  openExportModal() {
    this.openExportDataModal = true;
  }

  /**
   * Closes the export data modal.
   */
  closeExportDataModal() {
    this.openExportDataModal = false;
    this.resetExportFormData();
  }

  resetExportFormData() {
    this.exportDataFG.reset();
    Object.keys(this.exportDataFG.controls).forEach((key) => {
      this.exportDataFG.get(key)?.setValue(false, { emitEvent: false });
      const input = document.getElementById(key) as HTMLInputElement;
      if (input) {
        input.checked = false;
      }
    });
  }

  /**
   * Adds a header to the selected export headers array.
   * @param name The name of the header to add.
   */
  onGetExportHeader() {
    const allChecked = Object.keys(this.exportDataFG.controls)
      .filter((key) => key !== 'all')
      .every((key) => this.exportDataFG.get(key)?.value);

    this.exportDataFG.get('all')?.setValue(allChecked, { emitEvent: false });
  }

  /**
   * Exports the data based on the selected fields and downloads it as a CSV file.
   */
  exportData() {
    const selectedFields: ExportField[] = Object.keys(this.exportDataFG.controls)
      .filter((key) => key !== 'all' && this.exportDataFG.get(key)?.value === true)
      .map(
        (key) =>
          ({
            field: key,
            label: Utility.translate('anagrafica.structure.field.' + key, this.translateService)
          }) as ExportField
      );

    const body: GetStructuresRequestPayloadExportCsv = {
      fieldsToReturn: selectedFields,
      status: this.structureActiveRequest.status,
      warning: this.structureActiveRequest.warning,
      province: this.structureActiveRequest.province,
      area: this.structureActiveRequest.area,
      region: this.structureActiveRequest.region,
      buildingAcronym: this.structureActiveRequest.buildingAcronym,
      buildingType: this.structureActiveRequest.buildingType,
      name: this.structureActiveRequest.name,
      startOfOperationalActivity: this.structureActiveRequest.startOfOperationalActivity,
      orderBy: {
        field: this.sortSelected.field,
        direction: this.sortSelected.direction
      }
    };

    const request: PostApiExportV1Export$Json$Params = {
      body
    };
    this.apiExportService.postApiExportV1Export$Json$Response(request).subscribe({
      next: (response) => {
        Utility.handleExportDataResponse(response, STRUCTURE_CONSTANTS.EXPORT_FILE_NAME);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
    this.openExportDataModal = false;
    this.resetExportFormData();
    this.selectedHeaderArray = [];
  }

  /**
   * Navigates to the structure creation page.
   */
  createStructure(): void {
    this.genericService.getPageType('');
    UtilityRouting.navigateToStructureCreate();
  }

  /**
   * Navigates to the structure edit page for a specific draft structure.
   * @param draftStructureId - The ID of the draft structure.
   */
  goToStructureEdit(draftStructureId: number): void {
    this.genericService.getPageType(STRUCTURE_CONSTANTS.EDIT);
    this.structureService.postApiStructureV1IdLock$Response({ id: draftStructureId }).subscribe({
      next: (response) => {
        if (response.status === 204) {
          UtilityRouting.navigateToStructureEditByStructureId(draftStructureId.toString());
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
   * Retrieves the translation code for a column based on its field.
   * @param field The field of the column.
   * @returns The translation code.
   */
  getColumnTranslationCode(field: unknown | undefined) {
    if (field) {
      return 'structureList.columnList.' + field;
    } else {
      return 'structureList.columnList.all';
    }
  }

  /**
   * Retrieves the translation code for a status field only.
   * @param field The field to translate.
   * @returns The translation
   * */
  getStatusTranslationCode(field: string) {
    if (['COMPLETED', 'ACTIVE', 'DISABLED', 'WARNING'].includes(field)) {
      return 'structureList.status.' + field.toLowerCase();
    }

    return field;
  }

  /**
   * Selects a filter step or navigates to a specific filter step.
   * @param toStep The step to navigate to.
   */
  selectStep(toStep: string) {
    const fromStep = this.currenFilterStep;
    if (fromStep !== 'start') {
      const initialStepIndex = this.filterStepper.findIndex((x) => x.step === 'start');
      const fieldSelectedIndex = this.filterStepper[initialStepIndex].fields.findIndex((x) => x.name === fromStep);
      this.filterStepper[initialStepIndex].fields[fieldSelectedIndex].value = toStep;
      this.currenFilterStep = 'start';
    } else {
      this.currenFilterStep = toStep;
    }
  }

  /**
   * Applies the selected filters to the structure list.
   */
  applyFilter() {
    let filters = {};
    this.filterStepper[0].fields.forEach((item) => {
      switch (item.name) {
        case 'status':
          if (item.value) {
            filters = { ...filters, status: [item.value] };
          }
          break;
        case 'BuildingType':
          if (item.value) {
            const buildingTypeId = this.buildingTypes.find((x) => x.templateName === item.value)?.id;
            filters = { ...filters, buildingType: buildingTypeId };
          }
          break;
        case 'Name':
          if (item.value) {
            const nameId = this.ragioneSocialeList.find((x) => x.value === item.value)?.id;
            filters = { ...filters, name: nameId };
          }
          break;
        case 'Region':
          if (item.value) {
            const regionId = this.regions.find((x) => x.description === item.value)?.id;
            filters = { ...filters, region: regionId };
          }
          break;
        case 'Area':
          if (item.value) {
            const areaId = this.areas.find((x) => x.name === item.value)?.id;
            filters = { ...filters, area: areaId };
          }
          break;
        case 'Warning':
          if (item.value) {
            filters = { ...filters, warning: item.value === 'generic.yes' };
          }
          break;
        default:
          break;
      }
    });

    this.structureActiveRequest = {
      ...this.structureActiveRequest,
      ...filters
    };
    this.currentPage.set(1);
    this.structureActiveRequest.page = 1;
    this.retrieveStructures(this.structureActiveRequest).subscribe({
      next: (res) => {
        this.reloadStructureList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
    this.isOpenedFilter.set(false);
  }

  /**
   * Resets the current filter step to the initial state.
   */
  back() {
    this.currenFilterStep = 'start';
  }

  /**
   * Retrieves the list of filters that have been applied.
   * @returns The list of applied filters.
   */
  showFiltersApplied(): ResetFilterStructureList[] {
    const filter = this.filterStepper[0].fields.filter((x) => x.value !== undefined);
    if (this.structureActiveRequest.buildingAcronym && this.structureActiveRequest.buildingAcronym !== '') {
      filter.push({ name: 'BuildingAcronym', value: this.structureActiveRequest.buildingAcronym });
    }

    if (this.structureActiveRequest.name && this.structureActiveRequest.name !== undefined) {
      const existingFilter = filter.find((x) => x.name === 'Name');
      if (!existingFilter) {
        filter.push({ name: 'Name', value: String(this.structureActiveRequest.name) });
      }
    }

    if (this.structureActiveRequest.buildingName && this.structureActiveRequest.buildingName !== '') {
      filter.push({ name: 'BuildingName', value: this.structureActiveRequest.buildingName });
    }

    if (this.structureActiveRequest.companyName && this.structureActiveRequest.companyName !== '') {
      filter.push({ name: 'companyName', value: this.structureActiveRequest.companyName });
    }

    return filter;
  }

  /**
   * Retrieves the export fields data from the API or mock data.
   * @returns An observable of the export fields data.
   */
  getTemplateFields(): Observable<FieldModel[]> {
    const param: GetApiTemplateV1Fields$Json$Params = {};

    // Create HTTP context with custom headers
    const context = Utility.setPermissionHeaders(FUNCTIONALITY.networkStructure, PERMISSION.read);

    return this.templateService.getApiTemplateV1Fields$Json(param, context).pipe(
      map((r: FieldModel[]) => {
        return r;
      })
    );
  }

  /**
   * Configures the export fields form group with the provided fields.
   * @param fields The fields to configure in the form group.
   */
  configureExportFieldsFG(fields: FieldModel[]) {
    fields.forEach((field: FieldModel) => {
      this.exportDataFG.addControl(field.fieldName, this.fb.control(''));
    });
  }

  /**
   * Resets a specific filter field and updates the structureActiveRequest.
   * @param field The filter field to reset.
   */
  resetFilter(field: ResetFilterStructureList) {
    switch (field.name) {
      case 'status':
        this.structureActiveRequest.status = undefined;
        field.value = undefined;
        break;
      case 'BuildingAcronym':
        this.structureFilterFg.get('filterValue')?.setValue(null);
        this.structureFilterFg.get('filterType')?.setValue('');
        this.structureActiveRequest.buildingAcronym = undefined;
        break;
      case 'BuildingName':
        this.structureFilterFg.get('filterValue')?.setValue(null);
        this.structureFilterFg.get('filterType')?.setValue('');
        this.structureActiveRequest.buildingName = undefined;
        break;
      case 'Name':
        this.structureFilterFg.get('filterValue')?.setValue(null);
        this.structureFilterFg.get('filterType')?.setValue('');
        field.value = undefined;
        this.structureActiveRequest.name = undefined;
        break;
      case 'BuildingType':
        field.value = undefined;
        this.structureActiveRequest.buildingType = undefined;
        break;
      case 'Region':
        field.value = undefined;
        this.structureActiveRequest.region = undefined;
        break;
      case 'Area':
        field.value = undefined;
        this.structureActiveRequest.area = undefined;
        break;
      case 'Warning':
        field.value = undefined;
        this.structureActiveRequest.warning = null;
        break;
      case 'companyName':
        this.structureFilterFg.get('filterValue')?.setValue(null);
        this.structureFilterFg.get('filterType')?.setValue('');
        this.structureActiveRequest.companyName = undefined;
        break;
      default:
        break;
    }
    this.applyFilter();
  }

  /**
   * Resets all filters to their default state and updates the structureActiveRequest.
   */
  resetFilters() {
    this.resetStructureActiveRequest();
    this.filterStepper[0].fields.forEach((x) => (x.value = undefined));
    this.structureFilterFg.get('filterValue')?.setValue(null);
    this.structureFilterFg.get('filterType')?.setValue('');

    this.retrieveStructures(this.structureActiveRequest).subscribe({
      next: (res) => {
        this.reloadStructureList(res);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * get Icon associate at this value
   * @param carousel {Carousel<T>}
   */
  getDraftCardIcon<T>(carousel: Carousel<T>): string | undefined {
    return Utility.getDraftCardIcon(carousel);
  }

  /**
   * Inizializza i form group necessari.
   */
  private initializeForms(): void {
    this.exportDataFG = this.fb.group({});
    this.exportDataFG.addControl(
      'all',
      this.fb.control({
        fieldName: 'all',
        fieldType: 'varchar'
      })
    );

    this.columnsFG = this.fb.group({
      BuildingType: this.fb.control({ value: true, disabled: false }),
      Name: this.fb.control({ value: true, disabled: false }),
      Region: this.fb.control({ value: true, disabled: false }),
      Area: this.fb.control({ value: true, disabled: false }),
      StartOfOperationalActivity: this.fb.control({ value: true, disabled: false }),
      EndOfOperationalActivity: this.fb.control({ value: true, disabled: false })
    });
  }

  /**
   * Carica i dati iniziali necessari per la pagina.
   */
  private loadInitialData(): void {
    const structureDraftRequest: GetStructuresRequestPayload = this.prepareRequestForDraft();

    forkJoin({
      structureActive: this.retrieveStructures(this.structureActiveRequest),
      structureDraft: this.retrieveStructures(structureDraftRequest)
    }).subscribe({
      next: (res) => {
        this.reloadStructureList(res.structureActive);
        if (res.structureDraft?.structures) {
          this.loadDraftCard(res.structureDraft.structures);
        }
        this.setColFrozen();
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });

    this.retrieveDataForExport();
    this.retrieveFilter();
  }

  /**
   * Configura la modalità di visualizzazione.
   */
  private setupViewMode(): void {
    this.typeViewMode = this.genericService.viewMode();
    this.isSmallMobile.set(this.typeViewMode === VIEW_MODE.MOBILE);
    this.isTablet.set(this.typeViewMode === VIEW_MODE.TABLET);
  }

  /**
   * Prepares the request payload for retrieving draft structures.
   * @returns The request payload for draft structures.
   */
  private prepareRequestForDraft(): GetStructuresRequestPayload {
    return {
      status: ['DRAFT'],
      orderBy: {
        field: 'BuildingAcronym',
        direction: 'asc'
      },
      fieldsToReturn: [
        'Warning',
        'BuildingType',
        'BuildingAcronym',
        'BuildingName',
        'Name',
        'Region',
        'Area',
        'StartOfOperationalActivity',
        'EndOfOperationalActivity'
      ]
    } as GetStructuresRequestPayload;
  }

  /**
   * Retrieves the export data fields and configures the export form group.
   */
  private retrieveDataForExport(): void {
    this.getTemplateFields().subscribe({
      next: (res: FieldModel[]) => {
        // Ensure exportFieldsData is an array
        this.exportFieldsData = Array.isArray(this.exportFieldsData) ? this.exportFieldsData : [];

        // Additional fields to be included in the export
        const additionalFields: FieldModel[] = [
          {
            fieldName: 'Status',
            fieldType: 'string',
            id: -1,
            section: 'anagrafica',
            subSection: 'general'
          },
          {
            fieldName: 'Warning',
            fieldType: 'boolean',
            id: -1,
            section: 'anagrafica',
            subSection: 'general'
          },
          {
            fieldName: 'BuildingAcronym',
            fieldType: 'string',
            id: -1,
            section: 'anagrafica',
            subSection: 'general'
          },
          {
            fieldName: 'BuildingType',
            fieldType: 'string',
            id: -1,
            section: 'anagrafica',
            subSection: 'general'
          }
        ];

        // Combine additional fields with the retrieved fields
        this.exportFieldsData = [...additionalFields, ...res].filter((x) => x.fieldType !== 'file');

        // Configure the export form group with the retrieved fields
        this.configureExportFieldsFG(this.exportFieldsData);

        // Set the default value for the "all" checkbox
        this.showButtonExport = true;
      },
      error: (err: HttpErrorResponse) => {
        Utility.logErrorForDevEnvironment(err);
      }
    });
  }

  /**
   * Retrieves the filter data (regions, provinces, areas, templates) and loads the filter steps.
   */
  private retrieveFilter(): void {
    // TODO: loader on button
    forkJoin({
      regions: this.retrieveRegions(),
      areas: this.retrieveAreas(),
      templates: this.retrieveTemplates()
    }).subscribe({
      next: (res) => {
        // response for filters
        this.regions = res.regions;
        this.areas = res.areas;
        this.buildingTypes = res.templates;
        const filters = {
          Region: res.regions.map((region: RegionModel) => region.description),
          Area: res.areas.map((area: AreaModel) => area.name),
          Name: this.ragioneSocialeList.map((name: { id: string; value: string }) => name.value),
          status: this.statusField,
          BuildingType: res.templates.map((template: TemplateModel) => template.templateName),
          Warning: ['generic.yes', 'generic.no']
        };
        this.loadFilterSteps(filters);
        this.showButtonFilter = true;
      },
      error: (err: HttpErrorResponse) => {
        Utility.logErrorForDevEnvironment(err);
      }
    });
  }

  /**
   * Updates the warning show.
   */
  private updateShowWarning(): void {
    const warningStructures = this.structuresList().filter((structure: StructureResponse) =>
      structure.fields.some((field: FieldResponse) => field.fieldName === 'Warning' && field.value === true)
    );

    this.showWarning.set(warningStructures.length > 0);
  }

  private setColFrozen(): void {
    if (this.typeViewMode === VIEW_MODE.TABLET) {
      this.numColFrozen.set(0);

      return;
    }
    this.numColFrozen.set(this.typeViewMode === VIEW_MODE.MOBILE ? 0 : 4);
  }

  /**
   * Closes the filter modal and resets filter values if filters have not been applied.
   */
  filterClose() {
    this.isOpenedFilter.set(false);
    if (!this.isAppliedFilter) {
      this.filterStepper[0].fields.forEach((x) => {
        x.value = undefined;
      });
      this.currenFilterStep = 'start';
    }
  }
}

export interface FilterStep {
  id: number;
  step: string;
  fields: { name: string; value: string | undefined }[];
}
