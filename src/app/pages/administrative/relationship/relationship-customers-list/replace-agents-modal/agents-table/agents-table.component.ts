import { Component, EventEmitter, input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableColumnCellDirective, DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-agents-table',
  standalone: true,
  imports: [DataTableColumnCellDirective, DatatableComponent, NgxDatatableModule, TranslatePipe],
  templateUrl: './agents-table.component.html',
  styleUrl: './agents-table.component.scss'
})
export class AgentsTableComponent {
  agentsList = input<any>();
  newAgentsList = input<any>();
  tableId = input<string>();
  @Output() rowSelectedFT = new EventEmitter<any>();
  @Output() rowSelectedST = new EventEmitter<any>();
  selectedRow: any;

  selectRow(row: any): void {
    this.selectedRow = row;
    if (this.tableId() === 'replaced') {
      this.rowSelectedFT.emit(row);
    } else {
      this.rowSelectedST.emit(row);
    }
  }
}
