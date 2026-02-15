import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { AsyncPipe, DatePipe, NgClass, NgForOf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

import { ContentHeaderComponent } from '../../../../common/components/content-header/content-header.component';
import { GetSubjectsRequestPayload } from '../../../../api/glsAdministrativeApi/models/get-subjects-request-payload';
import { GetSubjectsResponse } from '../../../../api/glsAdministrativeApi/models/get-subjects-response';
import { TitleBudgeComponent } from '../../../../common/components/title-budge/title-budge.component';
import { GlsInputComponent } from '../../../../common/form/gls-input/gls-input.component';
import { GlsInputDropdownComponent } from '../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { SubjectListTableComponent } from './subject-list-table/subject-list-table.component';
import { Utilities } from './utilities/utilities';
import { BadgeFilters } from '../../../../common/models/badge-filters';
import { BadgeFiltersComponent } from '../../../../common/components/badge-filters/badge-filters.component';
import { GlsMessagesComponent } from '../../../../common/components/gls-messages/gls-messages.component';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { VIEW_MODE } from '../../../../common/app.constants';
import { SubjectService } from '../../../../api/glsAdministrativeApi/services/subject.service';
import { PostApiSubjectV1$Json$Params } from '../../../../api/glsAdministrativeApi/fn/subject/post-api-subject-v-1-json';
import { LIST_COL_EXPORT_SUBJECT, SUBJECT_CONSTANTS, SUBJECT_FILTER_TYPE_LIST } from '../constants/subject-constants';
import { PostApiSubjectV1Export$Json$Params } from '../../../../api/glsAdministrativeApi/fn/subject/post-api-subject-v-1-export-json';
import {
  GetSubjectsRequestPayloadExportCsv,
  SubjectExportField,
  SubjectField,
  SubjectOrderBy
} from '../../../../api/glsAdministrativeApi/models';
import { Utility } from '../../../../common/utilities/utility';
import { CarouselComponent } from '../../../../common/components/carousel/carousel.component';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { FilterSidebarComponent } from '../../../../common/components/filter-sidebar/filter-sidebar.component';
import { FilterSidebar } from '../../../../common/models/filter-sidebar';
import { FilterItem } from '../../../../common/models/filter-item';
import { UtilityProfile } from '../../../../common/utilities/utility-profile';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../common/utilities/constants/profile';

@Component({
  selector: 'app-subject-list',
  standalone: true,
  imports: [
    ContentHeaderComponent,
    TitleBudgeComponent,
    NgForOf,
    GlsInputComponent,
    GlsInputDropdownComponent,
    TranslatePipe,
    SubjectListTableComponent,
    BadgeFiltersComponent,
    GlsMessagesComponent,
    CarouselComponent,
    NgbTooltip,
    DatePipe,
    AsyncPipe,
    ReactiveFormsModule,
    FilterSidebarComponent,
    NgClass
  ],
  templateUrl: './subject-list.component.html',
  styleUrl: './subject-list.component.scss'
})
export class SubjectListComponent implements OnInit, OnDestroy {
  subjectList = signal<GetSubjectsResponse[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subjectListDraft = signal<any[][]>([]);
  currentPage = signal<number>(1);
  totalPages = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  showRotateSubject = signal(false);
  showSidebar = signal(false);
  isSmallMobile = signal(false);
  isTablet = signal(false);
  subjectFilterFg: FormGroup;
  typeViewMode: VIEW_MODE = VIEW_MODE.DESKTOP;
  titles = [];
  badgeFilters: Set<BadgeFilters> = new Set<BadgeFilters>();
  isLoaded = false;
  sortSelected: SubjectOrderBy = {
    field: '' as SubjectField,
    direction: ''
  };
  PROFILE = PROFILE;
  FUNCTIONALITY = FUNCTIONALITY;
  PERMISSION = PERMISSION;
  protected readonly filters: FilterSidebar[] = [
    {
      key: 'warningOrError',
      name: 'administrative.subjectList.subjectListTableColum.warning',
      options: ['generic.yes', 'generic.no']
    }
    // {
    //   key: 'status',
    //   name: 'administrative.subjectList.subjectListTableColum.state',
    //   options: ['userProfile.userList.state.completed', 'userProfile.userList.state.disabled']
    // }
  ];
  protected readonly filterTypeList = SUBJECT_FILTER_TYPE_LIST;
  protected readonly messageStatusService = inject(MessageStatusService);
  protected readonly Array = Array;
  private readonly statusField: string[] = ['COMPLETED', 'DISABLED'];
  private payloadConfigurator: GetSubjectsRequestPayload = {
    pageSize: this.pageSize(),
    page: this.currentPage(),
    status: this.statusField
  };
  private readonly subjectService = inject(SubjectService);
  private readonly fb = inject(FormBuilder);
  private readonly genericService = inject(GenericService);
  private readonly translateService = inject(TranslateService);
  private readonly userProfileService = inject(UserProfileService);
  constructor() {
    effect(
      () => {
        this.showRotateSubject.set(this.isSmallMobile() && !this.genericService.isLandscape());
      },
      {
        allowSignalWrites: true
      }
    );

    this.subjectFilterFg = this.fb.group({
      filterType: ['', Validators.required],
      filterValue: ['']
    });
  }

  ngOnInit(): void {
    this.setupViewMode();
    this.loadFirstCall();
  }

  ngOnDestroy(): void {
    this.messageStatusService.setSuccessMessage(null);
    this.messageStatusService.hide();
  }

  /**
   * Filter subjects based on the text provided in the form.
   */
  filterByText(): void {
    const type: string = this.subjectFilterFg.get('filterType')?.value;
    const value = this.subjectFilterFg.get('filterValue')?.value;

    if (!type || !value) {
      return;
    }

    const keyName = this.filterTypeList.find((item) => item.id === type)?.value;
    const newFilter: BadgeFilters = { name: keyName ?? '', value };

    this.manageBadgeFilter(newFilter);

    this.setPayloadFilter(type, value);
    this.payloadConfigurator.page = 1;
    this.loadDataTable().subscribe({
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Reset the filters applied to the subject list.
   * @param field {BadgeFilters | void} - Optional parameter to reset a specific filter field.
   */
  resetFilters(field?: BadgeFilters | void): void {
    if (field) {
      this.filters.forEach((item) => {
        if (item.name === field.name) {
          item.selected = undefined;
        }
      });
      this.manageBadgeFilter(field, true);
      const key = this.filterTypeList.find((item) => item.value === field.name)?.id;
      if (key) {
        this.setPayloadFilter(key, undefined);
      } else {
        const key = this.filters.find((item) => item.name === field.name)!.key;
        this.setPayloadFilter(key, key === 'status' ? this.statusField : undefined);
      }
    } else {
      this.badgeFilters.clear();
      this.payloadConfigurator.surnameNameCompanyName = undefined;
      this.payloadConfigurator.vatNumber = undefined;
      this.payloadConfigurator.taxCode = undefined;
      this.payloadConfigurator.warningOrError = undefined;
      this.payloadConfigurator.status = this.statusField;
      this.filters.forEach((item) => (item.selected = undefined));
    }
    this.subjectFilterFg.reset({ filterType: '' });
    this.payloadConfigurator.page = 1;
    this.loadDataTable().subscribe({
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Export the subject data to a CSV file.
   * It retrieves the fields to export, formats them, and sends a request to export the data.
   */
  exportData() {
    const prefixTranslate = 'administrative.subjectList.subjectListTableColum.';
    const exportFields: SubjectExportField[] = LIST_COL_EXPORT_SUBJECT.map(
      (key: string) =>
        ({
          field: key,
          label: Utility.translate(prefixTranslate + SUBJECT_CONSTANTS.MAPPING_EXPORT_FIELDS_LABEL[key], this.translateService)
        }) as SubjectExportField
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page, pageSize, ...payloadWithoutPagination } = this.payloadConfigurator;

    const body = {
      ...payloadWithoutPagination,
      fieldsToExport: exportFields,
      languageTranslate: (this.translateService.currentLang?.toUpperCase() ?? 'IT') as 'IT' | 'EN'
    } as GetSubjectsRequestPayloadExportCsv;
    if (this.sortSelected.field !== ('' as SubjectField) && this.sortSelected.direction !== '') {
      body.orderBy = this.sortSelected;
    }
    const exportPayload: PostApiSubjectV1Export$Json$Params = {
      body
    };
    this.subjectService.postApiSubjectV1Export$Json$Response(exportPayload).subscribe({
      next: (res) => {
        Utility.handleExportDataResponse(res, SUBJECT_CONSTANTS.EXPORT_FILE_NAME);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Navigate to the subject edit page to create a new subject or edit an existing one.
   */
  createSubject() {
    UtilityRouting.navigateToSubjectCreate();
  }

  /**
   * Navigate to the subject detail page.
   * @param idSubject {number} - The ID of the subject to load details for.
   */
  loadEditSubjectPage(idSubject: number): void {
    if (idSubject) {
      this.subjectService.postApiSubjectV1IdLock$Response({ id: idSubject! }).subscribe({
        next: (response) => {
          if (response.status === 204) {
            UtilityRouting.navigateToSubjectEdit(idSubject.toString(), false);
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

  /**
   * Call the service and subscribe the response for manage data
   */
  loadDataTable(): Observable<GetSubjectsResponse> {
    return this.retriveSubjects(this.payloadConfigurator).pipe(
      map((res: GetSubjectsResponse) => {
        if (res) {
          const valueForTable = Utilities.transformSubjectsForTable(res.subjects ?? []);
          this.subjectList.set(valueForTable ?? []);
          this.currentPage.set(res.currentPage ?? 1);
          this.totalPages.set(res.totalPages ?? 1);
          this.pageSize.set(res.pageSize ?? 0);
          this.totalItems.set(res.totalItems ?? 0);
        }
        this.isLoaded = true;

        return res;
      })
    );
  }

  pageChange(page: number): void {
    this.currentPage.set(page);
    this.payloadConfigurator.page = page;
    this.loadDataTable().subscribe({
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSort(event: any): void {
    this.payloadConfigurator.orderBy = {
      field: event.column.prop,
      direction: event.newValue
    };
    this.sortSelected = this.payloadConfigurator.orderBy;
    this.loadDataTable().subscribe({
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Open the sidebar for filtering subjects.
   */
  openSidebar(): void {
    this.showSidebar.set(true);
  }

  /**
   * Close the sidebar for filtering subjects.
   */
  closeSidebar(): void {
    this.showSidebar.set(false);
  }

  /**
   * Apply the selected filters to the subject list.
   * @param listFiltersApplied {FilterItem[]} - The list of filters to apply.
   */
  applyFilters(listFiltersApplied: FilterItem[]): void {
    this.showSidebar.set(false);

    listFiltersApplied.forEach((item) => {
      if (item.selected) {
        this.manageBadgeFilter({ name: item.name, value: item.selected });

        if (item.key === 'warningOrError') {
          this.setPayloadFilter(item.key, item.selected === 'generic.yes');
        } else {
          let value = '';
          switch (item.selected) {
            case 'userProfile.userList.state.completed':
              value = 'COMPLETED';
              break;
            case 'userProfile.userList.state.disabled':
              value = 'DISABLED';
              break;
            case 'userProfile.userList.state.wip':
              value = 'WIP';
              break;
          }
          this.setPayloadFilter(item.key, [value]);
        }
      }
    });
    this.payloadConfigurator.page = 1;
    this.loadDataTable().subscribe({
      error: (err) => {
        this.genericService.manageError(err);
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

  /**
   * Call API for retrive the list of subjects
   * @param body {GetSubjectsRequestPayload} the payload for request
   * @private
   */
  private retriveSubjects(body: GetSubjectsRequestPayload): Observable<GetSubjectsResponse> {
    // Create HTTP context with custom headers
    const context = Utility.setPermissionHeaders(FUNCTIONALITY.networkAdministrativeSubject, PERMISSION.read);

    const param: PostApiSubjectV1$Json$Params = {
      body
    };

    return this.subjectService.postApiSubjectV1$Json(param, context);
  }

  /**
   * Update the payload with filter values
   * @param key key of props for set value
   * @param value the value to search
   * @private
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private setPayloadFilter(key: string, value: string | any | undefined): void {
    switch (key) {
      case 'surnameNameCompanyName':
        this.payloadConfigurator.surnameNameCompanyName = value;
        break;
      case 'vatNumber':
        this.payloadConfigurator.vatNumber = value;
        break;
      case 'taxCode':
        this.payloadConfigurator.taxCode = value;
        break;
      case 'nation':
        this.payloadConfigurator.nation = value;
        break;
      case 'warningOrError':
        this.payloadConfigurator.warningOrError = value;
        break;
      case 'status':
        this.payloadConfigurator.status = value;
        break;
    }
  }

  /**
   * Call API for load subjects for table and subject on status "DRAFT" for show draft carousel
   * @private
   */
  private loadFirstCall(): void {
    const retrieveSubjectList = this.loadDataTable();
    const retrieveDraftSubjectList = this.retriveSubjects({
      page: 0,
      pageSize: 0,
      status: ['DRAFT']
    });
    forkJoin([retrieveSubjectList, retrieveDraftSubjectList]).subscribe({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      next: ([subjectList, draftSubjectList]) => {
        const list = Utility.buildCarouselArray(this.typeViewMode, draftSubjectList?.subjects ?? []);
        this.subjectListDraft.set(list);
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Manage the badge filter by adding or removing it from the set.
   * @param item {BadgeFilters} - The badge filter item to manage.
   * @param onlyRemove {boolean} - If true, only removes the item from the set; otherwise, updates or adds it.
   * @private
   */
  private manageBadgeFilter(item: BadgeFilters, onlyRemove = false): void {
    if (onlyRemove) {
      this.badgeFilters.delete(item);
    } else {
      this.badgeFilters = new Set(Array.from(this.badgeFilters).filter((f) => f.name !== item.name));
      this.badgeFilters.add({ name: item.name, value: item.value });
    }
  }

  hasAccess(profile: string, functionality: string, permission: string): boolean {
    const visible: boolean = UtilityProfile.checkAccessProfile(this.userProfileService, profile, functionality, permission);

    return visible;
  }
}
