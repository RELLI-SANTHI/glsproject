import { AfterViewInit, Component, ElementRef, EventEmitter, inject, input, OnDestroy, Output, viewChild, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ADMINISTRATIVE_COMPANY_BUTTONS } from '../../../constants/administrative-constant';
import { CommonModule, Location } from '@angular/common';
import { DataTableColumnCellDirective, DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CompanyDetailResponse } from '../../../../../api/glsAdministrativeApi/models';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../../common/utilities/constants/profile';
import { BreadcrumbService } from '../../../../../common/utilities/services/breadcrumb/breadcrumb.service';
import { Router } from '@angular/router';
import { MessageStatusService } from '../../../../../common/utilities/services/message/message.service';
import { UtilityRouting } from '../../../../../common/utilities/utility-routing';
import { CorporateGroupWithAdministrativeModel } from '../../../../../api/glsUserApi/models';

@Component({
  selector: 'app-company-group-list-table',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgxDatatableModule, DatatableComponent, DataTableColumnCellDirective],
  templateUrl: './company-group-list-table.component.html',
  styleUrl: './company-group-list-table.component.scss'
})
export class CompanyGroupListTableComponent implements AfterViewInit, OnDestroy {
  @ViewChild('corporateTable') table!: DatatableComponent;
  corporateGroupList = input<CorporateGroupWithAdministrativeModel[]>();
  isSmallMobile = input();
  isTablet = input();
  selectValue = ADMINISTRATIVE_COMPANY_BUTTONS.GROUP_SOCIETY;
  @Output() enabled = new EventEmitter<{ buttonType: string; companyType: string }>();
  PROFILE = PROFILE;
  FUNCTIONALITY = FUNCTIONALITY;
  PERMISSION = PERMISSION;
  protected readonly viewButtonConstants = ADMINISTRATIVE_COMPANY_BUTTONS;
  protected readonly messageStatusService = inject(MessageStatusService);
  private datatableWrapper = viewChild<ElementRef>('datatableWrapper');
  private resizeObserver!: ResizeObserver;
  private readonly location = inject(Location);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly router = inject(Router);

  /**
   * Component constructor.
   * Initializes the component with necessary properties or services.
   */
  constructor() {
    // Initialize any necessary properties or services here
  }

  /**
   * ngAfterViewInit lifecycle hook.
   * This method is called after the component's view has been fully initialized.
   */
  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.table?.recalculate();
    });

    this.resizeObserver.observe(this.datatableWrapper()?.nativeElement);
  }

  /**
   *  Tracks items by their ID for efficient rendering in the table.
   * This method is used to optimize the rendering of items in the table by tracking them by
   * @param index
   * @param item
   * @returns
   */
  trackById(index: number, item: { id: number }): number {
    return item.id;
  }

  /**
   * This method is called when the user clicks on the search button.
   * It emits the searchRole event with the current value of the roleFilterFg form group.
   * @param row
   */
  toggleExpandRow(row: CompanyDetailResponse): void {
    this.table.rowDetail.toggleExpandRow(row);
  }

  /**
   * This method is called when the user toggles the detail row.
   * It logs the event to the console.
   * @param event
   */
  onDetailToggle(event: Event) {
  }

  /**
   *  Selects a button based on the provided value.
   * This method updates the `selectValue` property and emits the `enabled` event with
   * @param value
   */
  selectButton(value: string): void {
    this.selectValue = value;
    const object = {
      buttonType: value,
      companyType: ''
    };
    this.enabled.emit(object);
  }

  /**
   * Navigates to the edit corporate group page.
   * This method is called when the user clicks on the edit button for a corporate group.
   * @param id
   */
  goToCoporateGroupView(id: string): void {
    UtilityRouting.navigateToCarporateGroupDetail(id);
  }

  /**
   *  Navigates to the society view page.
   * This method is called when the user clicks on a society in the corporate group list.
   * @param id
   */
  goToSocietyView(id: number): void {
    UtilityRouting.navigateToSocietyDetailById(id);
  }

  /**
   * ngOnDestroy lifecycle hook.
   * This method is called when the component is about to be destroyed.
   */
  ngOnDestroy(): void {
    this.messageStatusService.hide();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}
