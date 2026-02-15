import { Component, input, OnInit, output, signal } from '@angular/core';
import { DataTableColumnCellDirective, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslatePipe } from '@ngx-translate/core';
import { BankResponse } from '../../../../../../api/glsAdministrativeApi/models/bank-response';
import { GlsPaginatorComponent } from '../../../../../../common/components/gls-paginator/gls-paginator.component';

@Component({
  selector: 'app-replace-bank-table',
  standalone: true,
  imports: [DataTableColumnCellDirective, NgxDatatableModule, TranslatePipe, GlsPaginatorComponent],
  templateUrl: './replace-bank-table.component.html',
  styleUrl: './replace-bank-table.component.scss'
})
export class ReplaceBankTableComponent implements OnInit {
  bankList = input<BankResponse[]>();
  tableId = input<string>();
  rowSelected = output<BankResponse>();
  bankListFiltered = signal<BankResponse[]>([]);
  selectedRow: BankResponse | undefined;
  pageSize = 10;
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;

  ngOnInit(): void {
    this.bankListFiltered.set(this.bankList() ?? []);
    this.updatePagination();
  }

  getFirstResult(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getLastResult(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.bankListFiltered.set(this.bankList()!.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize));
  }

  private updatePagination(): void {
    this.totalItems = this.bankList()?.length ?? 0;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
  }
}
