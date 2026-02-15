import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ContentHeaderComponent } from '../../../../common/components/content-header/content-header.component';
import { RelationshipListTableComponent } from '../relationship-list-table/relationship-list-table.component';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { VIEW_MODE } from '../../../../common/app.constants';
import { GlsInputDropdownComponent } from '../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { GlsInputComponent } from '../../../../common/form/gls-input/gls-input.component';
import { RelationshipType } from '../enum/relationship-type';
import { AgentService } from '../../../../api/glsAdministrativeApi/services/agent.service';
import { PostApiAgentV1$Json$Params } from '../../../../api/glsAdministrativeApi/fn/agent/post-api-agent-v-1-json';
import { GetAgentsResponse } from '../../../../api/glsAdministrativeApi/models/get-agents-response';
import { AgentResponse } from '../../../../api/glsAdministrativeApi/models/agent-response';
import { BadgeFilters } from '../../../../common/models/badge-filters';
import { FILTER_AGENTS_TYPE_LIST, LIST_COL_EXPORT_AGENT, RELATIONSHIP_CONSTANTS } from '../constants/relationship-constants';
import { BadgeFiltersComponent } from '../../../../common/components/badge-filters/badge-filters.component';
import { AgentExportField, GetAgentsBaseRequest } from '../../../../api/glsAdministrativeApi/models';
import { PostApiAgentV1Export$Json$Params } from '../../../../api/glsAdministrativeApi/fn/agent/post-api-agent-v-1-export-json';
import { Utility } from '../../../../common/utilities/utility';
import { CarouselComponent } from '../../../../common/components/carousel/carousel.component';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { FilterSidebarComponent } from '../../../../common/components/filter-sidebar/filter-sidebar.component';
import { FilterSidebar } from '../../../../common/models/filter-sidebar';
import { FilterItem } from '../../../../common/models/filter-item';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../common/utilities/constants/profile';
import { UtilityProfile } from '../../../../common/utilities/utility-profile';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { GlsMessagesComponent } from '../../../../common/components/gls-messages/gls-messages.component';

@Component({
  selector: 'app-relationship-agents-list',
  standalone: true,
  imports: [
    CommonModule,
    ContentHeaderComponent,
    RelationshipListTableComponent,
    TranslatePipe,
    GlsInputDropdownComponent,
    GlsInputComponent,
    BadgeFiltersComponent,
    CarouselComponent,
    NgbTooltip,
    DatePipe,
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    FilterSidebarComponent,
    GlsMessagesComponent
  ],
  templateUrl: './relationship-agents-list.component.html',
  styleUrl: './relationship-agents-list.component.scss'
})
export class RelationshipAgentsListComponent implements OnInit, OnDestroy {
  listAgents = signal<AgentResponse[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listAgentsDraft = signal<any[][]>([]);
  firstCol = signal('administrative.relationshipListTable.agentCode');
  showRotateRelationship = signal(false);
  isSmallMobile = signal(false);
  isTablet = signal(false);
  currentPage = signal<number>(1);
  totalPages = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  showSidebar = signal(false);
  typeViewMode: VIEW_MODE = VIEW_MODE.DESKTOP;
  agentsFilterFg!: FormGroup;
  inputType: 'text' | 'number' = 'text'; // Default input type
  relationshipType = RelationshipType.Agent;
  badgeFilters: Set<BadgeFilters> = new Set<BadgeFilters>();
  readonly filterAgentsList = FILTER_AGENTS_TYPE_LIST;
  protected readonly filters: FilterSidebar[] = [
    {
      key: 'warning',
      name: 'administrative.subjectList.subjectListTableColum.warning',
      options: ['generic.yes', 'generic.no']
    }
  ];
  protected readonly Array = Array;
  private readonly genericService = inject(GenericService);
  private readonly statusField: string[] = ['COMPLETED', 'DISABLED'];
  private payloadConfigurator: GetAgentsBaseRequest = {
    pageSize: this.pageSize(),
    page: this.currentPage(),
    status: this.statusField
  };
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly agentService = inject(AgentService);
  private readonly translateService = inject(TranslateService);
  private readonly userProfileService = inject(UserProfileService);
  protected readonly messageStatusService = inject(MessageStatusService);

  PROFILE = PROFILE;
  FUNCTIONALITY = FUNCTIONALITY;
  PERMISSION = PERMISSION;

  constructor() {
    effect(
      () => {
        this.showRotateRelationship.set(this.isSmallMobile() && !this.genericService.isLandscape());
      },
      {
        allowSignalWrites: true
      }
    );
  }

  ngOnInit() {
    this.setupViewMode();
    this.buildForm();
    this.loadFirstCall();
  }

  exportAgentsData() {
    const prefixTranslate = 'administrative.relationshipListTable.';
    const exportFields: AgentExportField[] = LIST_COL_EXPORT_AGENT.map(
      (key) =>
        ({
          field: key,
          label: Utility.translate(prefixTranslate + RELATIONSHIP_CONSTANTS.MAPPING_EXPORT_FIELDS_LABEL[key], this.translateService)
        }) as AgentExportField
    );

    const body = {
      ...this.payloadConfigurator,
      fieldsToReturn: exportFields,
      languageTranslate: (this.translateService.currentLang?.toUpperCase() ?? 'IT') as 'IT' | 'EN'
    };
    delete body.pageSize; // Remove pageSize for export
    delete body.page; // Remove page for export
    const exportPayload: PostApiAgentV1Export$Json$Params = {
      body
    };

    // Create HTTP context with custom headers
    const context = Utility.setPermissionHeaders(FUNCTIONALITY.networkAdministrativeAgent, PERMISSION.read);

    this.agentService.postApiAgentV1Export$Json$Response(exportPayload, context).subscribe({
      next: (res) => {
        Utility.handleExportDataResponse(res, RELATIONSHIP_CONSTANTS.EXPORT_FILE_NAME_AGENT);
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Filter subjects based on the acronym provided in the form.
   */
  filterByAcronym(): void {
    const type: string = this.agentsFilterFg.get('filterType')?.value;

    const value = this.agentsFilterFg.get('filterValue')?.value;

    if (!type || !value) {
      return;
    }

    const keyName = this.filterAgentsList.find((item) => item.id === type)?.value;
    const newFilter: BadgeFilters = { name: keyName ?? '', value };

    this.manageBadgeFilter(newFilter);

    this.setPayloadFilter(type, value);
    this.payloadConfigurator.page = 1;
    this.loadDataTable();
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
      const key = this.filterAgentsList.filter((item) => item.value === field.name)[0]?.id;
      if (key) {
        this.setPayloadFilter(key, undefined);
      } else {
        const key = this.filters.find((item) => item.name === field.name)!.key;
        this.setPayloadFilter(key, undefined);
      }
    } else {
      this.badgeFilters.clear();
      this.payloadConfigurator.agentCode = undefined;
      this.payloadConfigurator.surnameNameCompanyName = undefined;
      this.payloadConfigurator.taxCode = undefined;
      this.payloadConfigurator.vatNumber = undefined;
      this.payloadConfigurator.warning = undefined;
      this.payloadConfigurator.administrativeName = undefined;
      this.filters.forEach((item) => (item.selected = undefined));
    }
    this.agentsFilterFg.reset({ filterType: '' });
    this.payloadConfigurator.page = 1;
    this.loadDataTable();
  }

  /**
   * Navigate to the relationship creation page for agents (centralized).
   * @param idRelationship {number} - The ID of the relationship to create. Defaults to 0 if not provided.
   */
  newAgentRelationship(idRelationship = 0): void {
    UtilityRouting.navigateToAgentRelationshipCreate(idRelationship);
  }

  /**
   * Navigate to the relationship detail page for agents.
   * @param idRel {number} - The ID of the relationship to edit
   */
  loadDetailRelPage(idRel: number): void {
    UtilityRouting.navigateToRelationshipDetailById(idRel.toString(), RelationshipType.Agent);
  }

  /**
   * Navigate to the relationship edit page for agents.
   * @param idRel {number} - The ID of the relationship to edit
   */
  loadEditRelPage(idRel: number): void {
    this.agentService.postApiAgentV1IdLock$Response({ id: idRel! }).subscribe({
      next: (response) => {
        if (response.status === 204) {
          UtilityRouting.navigateToRelationshipEditById(idRel.toString(), RelationshipType.Agent);
        } else {
          this.genericService.openErrorModal('generic.error.generic', 'concurrency.lockedAgent');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  pageChange(page: number): void {
    this.currentPage.set(page);
    this.payloadConfigurator.page = page;
    this.loadDataTable();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSort(event: any): void {
    this.payloadConfigurator.orderBy = {
      field: event.column.prop,
      direction: event.newValue
    };

    this.loadDataTable();
  }

  /**
   * Call the service and subscribe the response for manage data
   */
  loadDataTable(): void {
    this.retriveAgents(this.payloadConfigurator).subscribe({
      next: (res: GetAgentsResponse) => {
        if (res) {
          this.listAgents.set(res?.agents ?? []);
          this.currentPage.set(res?.currentPage ?? 1);
          this.totalPages.set(res?.totalPages ?? 1);
          this.pageSize.set(res?.pageSize ?? 0);
          this.totalItems.set(res?.totalItems ?? 0);
        }
      },
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
        this.setPayloadFilter(item.key, item.selected === 'generic.yes');
      }
    });
    this.payloadConfigurator.page = 1;
    this.loadDataTable();
  }

  /**
   * Configures the display mode.
   */
  private setupViewMode(): void {
    this.typeViewMode = this.genericService.viewMode();
    this.isSmallMobile.set(this.typeViewMode === VIEW_MODE.MOBILE);
    this.isTablet.set(this.typeViewMode === VIEW_MODE.TABLET);
  }

  private buildForm(): void {
    this.agentsFilterFg = this.fb.group({
      filterType: ['', Validators.required],
      filterValue: ['']
    });
  }

  /**
   * Call API for retrive the list of customers
   * @param body {GetAgentsBaseRequest} the payload for request
   * @private
   */
  private retriveAgents(body: GetAgentsBaseRequest): Observable<GetAgentsResponse> {
    const param: PostApiAgentV1$Json$Params = {
      body
    };

    return this.agentService.postApiAgentV1$Json(param);
  }

  /**
   * Call API for load subjects for table and subject on status "DRAFT" for show draft carousel
   * @private
   */
  private loadFirstCall(): void {
    const firstCall = this.retriveAgents(this.payloadConfigurator);
    const secondCall = this.retriveAgents({
      page: 0,
      pageSize: 0,
      status: ['DRAFT']
    });
    forkJoin([firstCall, secondCall]).subscribe({
      next: ([firstRes, secondRes]) => {
        this.listAgents.set(firstRes?.agents ?? []);
        // TODO: hide draft. waith for implementation
        // const list = Utility.buildCarouselArray(this.typeViewMode, secondRes?.agents ?? []);
        // this.listAgentsDraft.set(list);
        this.currentPage.set(firstRes.currentPage ?? 1);
        this.totalPages.set(firstRes.totalPages ?? 1);
        this.pageSize.set(firstRes.pageSize ?? 0);
        this.totalItems.set(firstRes.totalItems ?? 0);
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
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
      case 'agentCode':
        this.payloadConfigurator.agentCode = Number(value);
        break;
      case 'surnameNameCompanyName':
        this.payloadConfigurator.surnameNameCompanyName = value;
        break;
      case 'taxCode':
        this.payloadConfigurator.taxCode = value;
        break;
      case 'vatNumber':
        this.payloadConfigurator.vatNumber = value;
        break;
      case 'warning':
        this.payloadConfigurator.warning = value;
        break;
      case 'administrativeName':
        this.payloadConfigurator.administrativeName = value;
    }
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

  ngOnDestroy(): void {
    this.messageStatusService.setSuccessMessage(null);
    this.messageStatusService.hide();
  }

  onFilterTypeChange(event: Event): void {
    const filterControl = this.agentsFilterFg.get('filterType')?.value;
    if (event !== undefined) {
      if (filterControl === 'agentCode') {
        this.inputType = 'number';
      } else {
        this.inputType = 'text';
      }
      this.agentsFilterFg.get('filterValue')?.setValue('');
    }
  }
}
