import { DatePipe } from '@angular/common';
import { Component, input, OnInit, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableColumnCellDirective, DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { GlsPaginatorComponent } from '../../../../../../../common/components/gls-paginator/gls-paginator.component';

@Component({
  selector: 'app-commercial-relations-table',
  standalone: true,
  templateUrl: './commercial-relations-table.component.html',
  styleUrls: ['./commercial-relations-table.component.css'],
  imports: [DataTableColumnCellDirective, DatatableComponent, NgxDatatableModule, TranslatePipe, DatePipe, GlsPaginatorComponent]
})
export class CommercialRelationsTableComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  comRelList = input<any>();
  isCustomer = input<boolean>(); // 'client' or 'agent'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  comRelListFiltered = signal<any[]>([]);
  pageSize = 10;
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  private sortProp = '';
  private sortDir: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    this.comRelListFiltered.set(this.comRelList() ?? []);
    this.updatePagination();
  }

  /**
   * Calculate the index of the first result on the current page.
   * @returns The index of the first result (1-based).
   */
  getFirstResult(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  /**
   * Calculate the index of the last result on the current page.
   * @returns The index of the last result (1-based).
   */
  getLastResult(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  /**
   * Handle page change event.
   * @param page {number} - The new page number.
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.applySortAndPagination();
  }

  /**
   * Handle sort event.
   * @param event
   */
  onSort(event: { sorts: { prop: string | number; dir: 'asc' | 'desc' }[] }): void {
    this.sortProp = String(event.sorts[0].prop);
    this.sortDir = event.sorts[0].dir;
    this.currentPage = 1;
    this.applySortAndPagination();
  }

  /**
   * Apply sorting and pagination to the commercial relations list.
   * @private
   */
  private applySortAndPagination(): void {
    const data = [...(this.comRelList() ?? [])];

    if (this.sortProp) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.sort((a: any, b: any) => {
        const valA = a[this.sortProp];
        const valB = b[this.sortProp];
        if (valA == null) {
          return 1;
        }
        if (valB == null) {
          return -1;
        }
        if (valA < valB) {
          return this.sortDir === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return this.sortDir === 'asc' ? 1 : -1;
        }

        return 0;
      });
    }

    const start = (this.currentPage - 1) * this.pageSize;
    this.comRelListFiltered.set(data.slice(start, start + this.pageSize));
  }

  /**
   * Update pagination details based on the current list.
   * @private
   */
  private updatePagination(): void {
    this.totalItems = this.comRelList()?.length ?? 0;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
  }
}
