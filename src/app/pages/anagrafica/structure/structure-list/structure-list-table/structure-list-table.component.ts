import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  output,
  viewChild
} from '@angular/core';
import { DataTableColumnCellDirective, DatatableComponent, NgxDatatableModule, SortEvent } from '@swimlane/ngx-datatable';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

import { InfoMobileComponent } from '../../../../../common/components/info-mobile/info-mobile.component';
import { GlsPaginatorComponent } from '../../../../../common/components/gls-paginator/gls-paginator.component';
import { StructureResponse } from '../../../../../api/glsNetworkApi/models/structure-response';
import { ResetFilterStructureList } from '../../../../../common/models/reset-filter-structure-list';
import { ColTableInterface } from '../../../../../common/models/col-table-interface';
import { SortFiledStructureList } from '../../../../../common/models/sort-filed-structure-list';
import { GlsInputDropdownComponent } from '../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { FILTER_TYPE_LIST } from '../../../constants/structure-constant';
import { Utility } from '../../../../../common/utilities/utility';
import { UtilityRouting } from '../../../../../common/utilities/utility-routing';
import { STATUS } from '../../../../../common/utilities/constants/generic-constants';

@Component({
  selector: 'app-structure-list-table',
  standalone: true,
  imports: [
    DataTableColumnCellDirective,
    TranslatePipe,
    ReactiveFormsModule,
    NgClass,
    NgxDatatableModule,
    InfoMobileComponent,
    GlsPaginatorComponent,
    NgbTooltip,
    SlicePipe,
    DatePipe,
    GlsInputDropdownComponent,
    GlsInputComponent
  ],
  templateUrl: './structure-list-table.component.html',
  styleUrl: './structure-list-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StructureListTableComponent implements AfterViewInit, OnDestroy {
  showButtonFilter = input(false);
  isSmallMobile = input();
  showFiltersApplied = input<ResetFilterStructureList[]>();
  showRotateCard = input();
  pageSize = input<number>(0);
  structuresList = input.required<StructureResponse[]>();
  columns = input.required<ColTableInterface[]>();
  numColFrozen = input(0);
  sortSelected = input<SortFiledStructureList>();
  currentPage = input<number>(0);
  totalItems = input<number>(0);
  totalPages = input<number>(0);
  showWarning = input<boolean>(false);
  isOpenedFilter = model();
  structureFilterFg = model.required<FormGroup>();
  filterByAcronym = output();
  openColumnEditor = output();
  resetFilter = output<ResetFilterStructureList>();
  resetFilters = output();
  sort = output<SortEvent>();
  pageChange = output<number>();
  protected readonly filterTypeList = FILTER_TYPE_LIST;
  private table = viewChild<DatatableComponent>('table');
  private datatableWrapper = viewChild<ElementRef>('datatableWrapper');
  private resizeObserver!: ResizeObserver;
  private readonly translateService = inject(TranslateService);

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.table()?.recalculate();
    });

    this.resizeObserver.observe(this.datatableWrapper()?.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
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
   * Translates a label and truncates it if it exceeds 30 characters.
   * @param label The label to translate.
   * @returns The translated and truncated label.
   */
  getTranslatedLabel(label: string): string {
    const translated = Utility.translate(label, this.translateService);

    return Utility.sliceOverX(translated, 30);
  }

  /**
   * Determines the row type based on the field name.
   * @param field The field name.
   * @returns The row type (e.g., 'status', 'date', 'link', or 'string').
   */
  showRowType(field: string): string {
    return field === 'status'
      ? 'status'
      : field === 'Warning'
        ? 'Warning'
        : field === 'StartOfOperationalActivity' || field === 'EndOfOperationalActivity'
          ? 'date'
          : field === 'BuildingName'
            ? 'link'
            : 'string';
  }

  isWarningStructure(structure: StructureResponse): boolean {
    const warningField = structure.fields.find((x) => x.fieldName === 'Warning' && x.value === true);

    return !!warningField && warningField.value;
  }

  /**
   * Retrieves the status icon for a given structure based on its warning and status fields.
   * @param structure The structure to evaluate.
   * @returns The CSS class for the status icon.
   */
  getStatusIcon(structure: StructureResponse): string {
    const status: 'COMPLETED' | 'ACTIVE' | 'DISABLED' | 'DRAFT' = this.getStatus(structure);
    if (status === 'ACTIVE') {
      return 'bi-calendar-check primary';
    } else if (status === STATUS.COMPLETED) {
      return 'bi-calendar-check primary';
    } else if (structure.status === STATUS.DISABLED) {
      return 'bi-ban';
    } else {
      return '';
    }
  }

  getStatusClass(structure: StructureResponse): string {
    const status: 'COMPLETED' | 'ACTIVE' | 'DISABLED' | 'DRAFT' = this.getStatus(structure);
    if (status === 'ACTIVE') {
      return 'text-success';
    } else if (status === STATUS.COMPLETED) {
      return 'status-warning';
    } else if (structure.status === STATUS.DISABLED) {
      return 'status-disabled';
    } else {
      return '';
    }
  }

  getStatus(structure: StructureResponse): 'COMPLETED' | 'ACTIVE' | 'DISABLED' | 'DRAFT' {
    return structure.status as 'COMPLETED' | 'ACTIVE' | 'DISABLED' | 'DRAFT';
  }

  getStatusLabel(structure: StructureResponse): string {
    const status: 'COMPLETED' | 'ACTIVE' | 'DISABLED' | 'DRAFT' = this.getStatus(structure);

    return 'structureList.status.' + status.toLowerCase();
  }

  /**
   * Determines whether a column should be visible based on its key.
   * @param key The key of the column.
   * @returns True if the column is visible, false otherwise.
   */
  showColumn(key: string) {
    const col = this.columns().find((x: ColTableInterface) => x.field === key);

    return col ? col.columnVisible : false;
  }

  getFieldValue(structure: StructureResponse, field: string): string {
    return structure.fields?.find((x) => x.fieldName === field)?.description || structure.fields?.find((x) => x.fieldName === field)?.value;
  }

  /**
   * Navigates to the structure detail page for a specific structure.
   * @param structureId The ID of the structure.
   */
  goToStructureDetail(structureId: number): void {
    UtilityRouting.navigateToStructureDetailByStructureId(structureId.toString());
  }

  getFieldDate(structure: StructureResponse, field: string) {
    const dateString: string | undefined | null = structure.fields?.find((x) => x.fieldName === field)?.value;
    const date: Date | undefined = dateString ? new Date(dateString) : undefined;

    return date;
  }

  /**
   * Calculates the first result index for the current page.
   * @returns The first result index.
   */
  getFirstResult(): number {
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  /**
   * Calculates the last result index for the current page.
   * @returns The last result index.
   */
  getLastResult(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  }

  /**
   * Emits the `filterByAcronym` event to notify listeners that the filter action based on acronym has been triggered.
   */
  filterByAcronymEmit(): void {
    this.filterByAcronym.emit();
  }
}
