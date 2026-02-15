/* eslint-disable @typescript-eslint/no-explicit-any */
import { AfterViewInit, Component, ElementRef, EventEmitter, inject, input, Input, Output, viewChild } from '@angular/core';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgForOf } from '@angular/common';
import { Utility } from '../../utilities/utility';
import { GlsPaginatorComponent } from '../gls-paginator/gls-paginator.component';

@Component({
  selector: 'app-general-table',
  standalone: true,
  imports: [NgxDatatableModule, TranslateModule, NgForOf, GlsPaginatorComponent],
  templateUrl: './general-table.component.html',
  styleUrl: './general-table.component.scss'
})
export class GeneralTableComponent implements AfterViewInit {
  @Input() columns!: Record<string, any>[];
  @Input() data!: Record<string, any>[];

  @Output() rowSelected = new EventEmitter<any>(); // output to Modal

  pageSize = input<number>(10);
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  filteredData: Record<string, any>[] = [];
  private sortEvent: any = null;
  private resizeObserver!: ResizeObserver;
  private datatableWrapper = viewChild<ElementRef>('datatableWrapper');
  private table = viewChild<DatatableComponent>('table');
  private readonly translateService = inject(TranslateService);

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.table()?.recalculate();
    });

    this.resizeObserver.observe(this.datatableWrapper()?.nativeElement);
    this.initPagination();
  }

  initPagination(): void {
    this.totalItems = this.data?.length ?? 0;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize());
    this.filteredData = this.data?.slice((this.currentPage - 1) * this.pageSize(), this.currentPage * this.pageSize()) ?? [];
  }

  selectRow(row: any): void {
    this.rowSelected.emit(row);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFilterAndSort();
  }

  // Handle sort events
  onSort(event: any) {
    this.sortEvent = event;
    this.applyFilterAndSort();
  }

  // Apply filters and sorting to the full dataset
  applyFilterAndSort() {
    // First apply any filters to get filtered data from allPayments
    let filteredData = [...this.data]; // Apply your filters here if needed
    // Then apply sorting if we have a sort event
    if (this.sortEvent) {
      const { prop, dir } = this.sortEvent.sorts[0];
      filteredData = filteredData.sort((a, b) => {
        const valueA = a[prop] ?? '';
        const valueB = b[prop] ?? '';

        if (dir === 'asc') {
          return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        } else {
          return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
        }
      });
    }
    // Update the total count (if needed)
    this.totalItems = filteredData.length;
    // Apply pagination to get just the current page
    const start = (this.currentPage - 1) * this.pageSize();
    const end = Math.min(start + this.pageSize(), filteredData.length);
    this.filteredData = filteredData.slice(start, end);
  }

  getFirstResult(): number {
    return (this.currentPage - 1) * this.pageSize() + 1;
  }

  getLastResult(): number {
    return Math.min(this.currentPage * this.pageSize(), this.totalItems);
  }

  /**
   * Translate the label of column
   * @param label
   */
  translateLabelCol(label: string): string {
    return Utility.translate(label, this.translateService);
  }
}
