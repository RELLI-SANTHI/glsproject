import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { ContentHeaderComponent } from '../../../../common/components/content-header/content-header.component';
import { GlsInputDropdownComponent } from '../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { GlsInputComponent } from '../../../../common/form/gls-input/gls-input.component';
import { ReplaceAgentsModalComponent } from './replace-agents-modal/replace-agents-modal.component';
import { RelationshipListTableComponent } from '../relationship-list-table/relationship-list-table.component';
import { GenericService } from '../../../../common/utilities/services/generic.service';
import { VIEW_MODE } from '../../../../common/app.constants';
import { BadgeFiltersComponent } from '../../../../common/components/badge-filters/badge-filters.component';
import { BadgeFilters } from '../../../../common/models/badge-filters';
import { GlsMessagesComponent } from '../../../../common/components/gls-messages/gls-messages.component';
import { MessageStatusService } from '../../../../common/utilities/services/message/message.service';
import { RelationshipType } from '../enum/relationship-type';
import {
  FILTER_CUSTOMERS_TYPE_LIST,
  LIST_COL_EXPORT_CUSTOMER,
  RELATIONSHIP_CONSTANTS,
  RELATIONSHIP_CUSTOMER_TYPE
} from '../constants/relationship-constants';
import { CustomerService } from '../../../../api/glsAdministrativeApi/services/customer.service';
import { GetCustomersBaseRequest } from '../../../../api/glsAdministrativeApi/models/get-customers-base-request';
import { PostApiCustomerV1$Json$Params } from '../../../../api/glsAdministrativeApi/fn/customer/post-api-customer-v-1-json';
import { GetCustomersResponse } from '../../../../api/glsAdministrativeApi/models/get-customers-response';
import { CustomerResponseShort } from '../../../../api/glsAdministrativeApi/models/customer-response-short';
import {
  CategoryFields,
  CategoryResponse,
  CustomerExportField,
  GetCategoryResponse,
  ReplaceBankExportField,
  ReplaceBankField
} from '../../../../api/glsAdministrativeApi/models';
import { PostApiCustomerV1Export$Json$Params } from '../../../../api/glsAdministrativeApi/fn/customer/post-api-customer-v-1-export-json';
import { Utility } from '../../../../common/utilities/utility';
import { CarouselComponent } from '../../../../common/components/carousel/carousel.component';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';
import { FilterSidebarComponent } from '../../../../common/components/filter-sidebar/filter-sidebar.component';
import { FilterSidebar } from '../../../../common/models/filter-sidebar';
import { FilterItem } from '../../../../common/models/filter-item';
import { MODAL_LG } from '../../../../common/utilities/constants/modal-options';
import { AdministrativeService, CategoryService } from '../../../../api/glsAdministrativeApi/services';
import { ReplaceBankModalComponent } from './replace-bank-modal/replace-bank-modal.component';
import { PostApiAdministrativeV1$Json$Params } from '../../../../api/glsAdministrativeApi/fn/administrative/post-api-administrative-v-1-json';
import { PostApiCustomerV1ReplaceBank$Json$Params } from '../../../../api/glsAdministrativeApi/fn/customer/post-api-customer-v-1-replace-bank-json';
import { UtilityProfile } from '../../../../common/utilities/utility-profile';
import { UserProfileService } from '../../../../common/utilities/services/profile/user-profile.service';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../common/utilities/constants/profile';

@Component({
  selector: 'app-relationship-customers-list',
  standalone: true,
  imports: [
    ContentHeaderComponent,
    TranslatePipe,
    GlsInputDropdownComponent,
    GlsInputComponent,
    RelationshipListTableComponent,
    BadgeFiltersComponent,
    GlsMessagesComponent,
    CommonModule,
    ReactiveFormsModule,
    CarouselComponent,
    NgbTooltip,
    FilterSidebarComponent
  ],
  templateUrl: './relationship-customers-list.component.html',
  styleUrl: './relationship-customers-list.component.scss'
})
export class RelationshipCustomersListComponent implements OnInit, OnDestroy {
  listCustomers = signal<CustomerResponseShort[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listCustomersDraft = signal<any[]>([]);
  showRotateRelaship = signal(false);
  isSmallMobile = signal(false);
  isTablet = signal(false);
  currentPage = signal<number>(1);
  totalPages = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  showSidebar = signal(false);
  firstCol = signal('administrative.relationshipListTable.clientCode');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reportExcel: any | null = null;
  typeViewMode: VIEW_MODE = VIEW_MODE.DESKTOP;
  relationshipType = RelationshipType.Customer;
  customersListFg!: FormGroup;
  badgeFilters: Set<BadgeFilters> = new Set<BadgeFilters>();
  isCustomerLAC = false;
  isLoaded = false;
  categoryIds: number[] = [];
  categories: CategoryResponse[] = [];
  typeReportDownloaded: string | null = null;
  inputType: 'text' | 'number' = 'text'; // Default input type

  PROFILE = PROFILE;
  FUNCTIONALITY = FUNCTIONALITY;
  PERMISSION = PERMISSION;
  protected readonly filters: FilterSidebar[] = [
    {
      key: 'warningOrError',
      name: 'administrative.subjectList.subjectListTableColum.warning',
      options: ['generic.yes', 'generic.no']
    }
  ];
  protected readonly messageStatusService = inject(MessageStatusService);
  protected readonly filterCustomersList = FILTER_CUSTOMERS_TYPE_LIST;
  protected readonly Array = Array;
  private readonly userProfileService = inject(UserProfileService);
  private readonly statusField: string[] = ['COMPLETED', 'DISABLED'];
  private payloadConfigurator: GetCustomersBaseRequest = {
    pageSize: this.pageSize(),
    page: this.currentPage(),
    status: this.statusField,
    categoryId: []
  };
  private readonly modalService = inject(NgbModal);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly genericService = inject(GenericService);
  private readonly customerService = inject(CustomerService);
  private readonly translateService = inject(TranslateService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly categoryService = inject(CategoryService);
  private readonly administrativeService = inject(AdministrativeService);

  constructor() {
    effect(
      () => {
        this.showRotateRelaship.set(this.isSmallMobile() && !this.genericService.isLandscape());
      },
      {
        allowSignalWrites: true
      }
    );
    this.activatedRoute.data.subscribe((data) => {
      this.isCustomerLAC = data['customerType'] == RELATIONSHIP_CUSTOMER_TYPE.customerLAC;
    });
  }

  ngOnInit(): void {
    this.setupViewMode();
    this.buildForm();
    this.loadFirstCallWithCategories();
  }

  ngOnDestroy(): void {
    this.messageStatusService.setSuccessMessage(null);
    this.messageStatusService.hide();
  }

  newRelation(idRelaship = 0) {
    UtilityRouting.navigateToRelationshipNew(idRelaship, this.isCustomerLAC ? RelationshipType.CustomerLac : RelationshipType.Customer);
  }

  getPageTitle(): string {
    return this.isCustomerLAC ? 'administrative.relationshipCustomerList.titleLac' : 'administrative.relationshipCustomerList.title';
  }

  exportClientsData() {
    const prefixTranslate = 'administrative.relationshipListTableExport.';

    const exportFields: CustomerExportField[] = LIST_COL_EXPORT_CUSTOMER.map(
      (key) =>
        ({
          field: key,
          label: Utility.translate(prefixTranslate + key, this.translateService)
        }) as CustomerExportField
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page, pageSize, ...filteredConfigurator } = this.payloadConfigurator;

    const body = {
      ...filteredConfigurator,
      fieldsToReturn: exportFields,
      languageTranslate: (this.translateService.currentLang?.toUpperCase() ?? 'IT') as 'IT' | 'EN'
    };

    const exportPayload: PostApiCustomerV1Export$Json$Params = {
      body
    };
    this.customerService.postApiCustomerV1Export$Json$Response(exportPayload).subscribe({
      next: (res) => {
        Utility.handleExportDataResponse(res, RELATIONSHIP_CONSTANTS.EXPORT_FILE_NAME_CUSTOMER);
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
    const type: string = this.customersListFg.get('filterType')?.value;

    const value = this.customersListFg.get('filterValue')?.value;

    if (!type || !value) {
      return;
    }

    const keyName = this.filterCustomersList.find((item) => item.id === type)?.value;
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
      const key = this.filterCustomersList.filter((item) => item.value === field.name)[0]?.id;
      if (key) {
        this.setPayloadFilter(key, undefined);
      } else {
        const key = this.filters.find((item) => item.name === field.name)!.key;
        this.setPayloadFilter(key, undefined);
      }
    } else {
      this.badgeFilters.clear();
      this.payloadConfigurator.customerCode = undefined;
      this.payloadConfigurator.surnameNameCompanyName = undefined;
      this.payloadConfigurator.taxCode = undefined;
      this.payloadConfigurator.vatNumber = undefined;
      this.payloadConfigurator.warningOrError = undefined;
      this.payloadConfigurator.categoryId?.splice(0);
      this.payloadConfigurator.categoryId?.push(...this.categoryIds);
      this.payloadConfigurator.vatRateNameOrVatExemptionName = undefined;
      this.payloadConfigurator.codPay = undefined;
      this.filters.forEach((item) => (item.selected = undefined));
    }
    this.customersListFg.reset({ filterType: '' });
    this.payloadConfigurator.page = 1;
    this.loadDataTable();
  }

  openModalSubAgents(): void {
    const modalRef = this.modalService.open(ReplaceAgentsModalComponent, MODAL_LG);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modalRef.result.then((result: { response: any }) => {
      this.reportExcel = result.response;
      this.typeReportDownloaded = 'agents';
    });
  }

  /**
   * Open the modal for replacing banks.
   */
  openModalSubBanks(): void {
    const param: PostApiAdministrativeV1$Json$Params = {
      body: {
        page: 0,
        status: ['COMPLETED']
      }
    };
    this.administrativeService.postAdministrativeV1CompaniesWithoutBreakVisibility$Json(param).subscribe({
      next: (res) => {
        const modalRef = this.modalService.open(ReplaceBankModalComponent, MODAL_LG);
        modalRef.componentInstance.listCompany = res.companies;

        modalRef.result.then((obj: { old: number; new: number; idCompany: number }) => {
          this.callReplaceBanks(obj.old, obj.new, obj.idCompany);
        });
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Call the service and subscribe the response for manage data
   */
  loadDataTable(): void {
    this.retriveCustomers(this.payloadConfigurator).subscribe({
      next: (res: GetCustomersResponse) => {
        if (res) {
          this.listCustomers.set(res?.items ?? []);
          this.currentPage.set(res.currentPage ?? 1);
          this.totalPages.set(res.totalPages ?? 1);
          this.pageSize.set(res.pageSize ?? 0);
          this.totalItems.set(res.totalItems ?? 0);
        }
      },
      error: (err) => {
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
   * Navigate to the relationship edit page.
   * @param idRel {number} - The ID of the relationship to edit
   */
  loadEditRelPage(idRel: number): void {
    this.customerService.postApiCustomerV1IdLock$Response({ id: idRel }).subscribe({
      next: (response) => {
        if (response.status === 204) {
          UtilityRouting.navigateToRelationshipEditById(
            idRel.toString(),
            this.isCustomerLAC ? RelationshipType.CustomerLac : RelationshipType.Customer
          );
        } else {
          this.genericService.openErrorModal('generic.error.generic', 'concurrency.lockedCustomer');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Navigate to the relationship detail page.
   * @param idRel {number} - The ID of the relationship to edit
   */
  loadDetailRelPage(idRel: number): void {
    UtilityRouting.navigateToRelationshipDetailById(
      idRel.toString(),
      this.isCustomerLAC ? RelationshipType.CustomerLac : RelationshipType.Customer
    );
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
        this.setPayloadFilter(item.key, this.getValueFilter(item.key, item.selected));
      }
    });
    this.payloadConfigurator.page = 1;
    this.loadDataTable();
  }

  hasAccess(profile: string, functionality: string, permission: string): boolean {
    const visible: boolean = UtilityProfile.checkAccessProfile(this.userProfileService, profile, functionality, permission);

    return visible;
  }

  /**
   * Download the report based on the type of report downloaded.
   */
  downloadResponse(): void {
    const nameFile =
      this.typeReportDownloaded === 'banks' ? RELATIONSHIP_CONSTANTS.REPORT_ABI_CAB : RELATIONSHIP_CONSTANTS.REPORT_AGENT_REPLACEMENT;
    Utility.handleExportDataResponse(this.reportExcel, nameFile);
  }

  onFilterTypeChange(event: Event): void {
    const filterControl = this.customersListFg.get('filterType')?.value;
    if (event !== undefined) {
      if (filterControl === 'customerCode') {
        this.inputType = 'number';
      } else {
        this.inputType = 'text';
      }
      this.customersListFg.get('filterValue')?.setValue('');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getValueFilter(key: string, value: string): any {
    switch (key) {
      case 'warningOrError':
        return value == 'generic.yes';
      case 'categoryId':
        return this.categories.find((cat) => cat.categoryCode + ' - ' + cat.categoryDescription === value)?.id;
      default:
        return value;
    }
  }

  private buildForm(): void {
    this.customersListFg = this.fb.group({
      filterType: ['', Validators.required],
      filterValue: ['']
    });
  }

  /**
   * Configures the display mode.
   */
  private setupViewMode(): void {
    this.typeViewMode = this.genericService.viewMode();
    this.isSmallMobile.set(this.typeViewMode === VIEW_MODE.MOBILE);
    this.isTablet.set(this.typeViewMode === VIEW_MODE.TABLET);
  }

  /**
   * Call API for retrive the list of customers
   * @param body {GetCustomersBaseRequest} the payload for request
   * @private
   */
  private retriveCustomers(body: GetCustomersBaseRequest): Observable<GetCustomersResponse> {
    const param: PostApiCustomerV1$Json$Params = {
      body: {
        ...body
      }
    };

    // Create HTTP context with custom headers
    const context = Utility.setPermissionHeaders(FUNCTIONALITY.networkAdministrativeCustomer, PERMISSION.read);

    return this.customerService.postApiCustomerV1$Json(param, context);
  }

  private retrieveCategories(): Observable<GetCategoryResponse> {
    return this.categoryService.postApiCategoryV1$Json({
      body: {
        orderBy: {
          field: 'Code' as CategoryFields,
          direction: 'asc'
        }
      }
    });
  }

  private loadFirstCallWithCategories(): void {
    this.retrieveCategories().subscribe({
      next: (res) => {
        const categoryIds = res.items
          .filter((item) => (this.isCustomerLAC ? item.categoryCode === '802' : item.categoryCode !== '802'))
          .map((item) => item.id!);
        this.categoryIds = categoryIds ?? [];
        this.payloadConfigurator.categoryId?.push(...this.categoryIds);
        this.categories = res.items;
        if (!this.isCustomerLAC) {
          this.filters.push({
            key: 'categoryId',
            name: 'administrative.subjectList.subjectListTableColum.category',
            options: this.categories
              .filter((item) => item.categoryCode !== '802')
              .map((category) => category.categoryCode + ' - ' + category.categoryDescription)
          });
        }
        this.loadFirstCall();
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Call API for load subjects for table and subject on status "DRAFT" for show draft carousel
   * @private
   */
  private loadFirstCall(): void {
    const firstCall = this.retriveCustomers(this.payloadConfigurator);
    const secondCall = this.retriveCustomers({
      categoryId: this.payloadConfigurator.categoryId,
      page: 0,
      pageSize: 0,
      status: ['DRAFT']
    });
    forkJoin([firstCall, secondCall]).subscribe({
      next: ([firstRes, secondRes]) => {
        this.listCustomers.set(firstRes?.items ?? []);
        // TODO: hide draft. waith for implementation
        // const list = Utility.buildCarouselArray(this.typeViewMode, secondRes?.items ?? []);
        // this.listCustomersDraft.set(list);
        this.isLoaded = true;
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
      case 'customerCode':
        this.payloadConfigurator.customerCode = Number(value);
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
      case 'warningOrError':
        this.payloadConfigurator.warningOrError = value;
        break;
      case 'categoryId':
        this.payloadConfigurator.categoryId?.splice(0);
        if (value !== undefined && value !== '') {
          this.payloadConfigurator.categoryId?.push(Number(value));
        } else {
          this.payloadConfigurator.categoryId?.push(...this.categoryIds);
        }
        break;
      case 'codPay':
        this.payloadConfigurator.codPay = value;
        break;
      case 'vatRateValue':
        this.payloadConfigurator.vatRateNameOrVatExemptionName = value;
        break;
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

  /**
   * Call the service to replace banks.
   * @param oldId {number} - The ID of the old bank to be replaced.
   * @param newId {number} - The ID of the new bank to replace with.
   * @param idAdministrative {number} - The ID of the administrative entity.
   * @private
   */
  // eslint-disable-next-line max-lines-per-function
  private callReplaceBanks(oldId: number, newId: number, idAdministrative: number): void {
    const prefixTranslate = 'administrative.relationshipCustomerList.';

    const bankFields: ReplaceBankField[] = [
      'CustomerCode',
      'NameSurnameCompanyName',
      'VatNumber',
      'TaxCode',
      'AdministrativeName',
      'OldBankAbi',
      'OldBankCab',
      'NewBankAbi',
      'NewBankCab'
    ];

    const exportFields: ReplaceBankExportField[] = bankFields.map(
      (key: string) =>
        ({
          field: key,
          label: Utility.translate(prefixTranslate + key, this.translateService)
        }) as ReplaceBankExportField
    );

    const payload: PostApiCustomerV1ReplaceBank$Json$Params = {
      body: {
        administrativeId: idAdministrative,
        oldBankId: oldId,
        newBankId: newId,
        fieldsToExport: exportFields
      }
    };
    this.customerService.postApiCustomerV1ReplaceBank$Json$Response(payload).subscribe({
      next: (response) => {
        this.reportExcel = response;
        this.typeReportDownloaded = 'banks';
        (async () => {
          const recordCount = await Utility.countCsvRecordsFromBlob(response.body);
          this.messageStatusService.setSuccessMessage(
            {
              title: 'administrative.replaceBankModal.success',
              message: 'administrative.replaceBankModal.successSecondMessage',
              showDownloadReportButton: true
            },
            { recordCount: recordCount }
          );
        })();
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }
}
