import { AfterViewInit, Component, ElementRef, input, OnDestroy, output, viewChild } from '@angular/core';
import { DatatableComponent, NgxDatatableModule, SortEvent } from '@swimlane/ngx-datatable';
import { TranslatePipe } from '@ngx-translate/core';

import { InfoMobileComponent } from '../../../../common/components/info-mobile/info-mobile.component';
import { GlsPaginatorComponent } from '../../../../common/components/gls-paginator/gls-paginator.component';
import { RelationshipType } from '../enum/relationship-type';
import { CustomerResponseShort } from '../../../../api/glsAdministrativeApi/models/customer-response-short';
import { WarningStatusComponent } from '../../../../common/components/warning-status/warning-status.component';

@Component({
  selector: 'app-relationship-list-table',
  standalone: true,
  imports: [NgxDatatableModule, TranslatePipe, InfoMobileComponent, GlsPaginatorComponent, WarningStatusComponent],
  templateUrl: './relationship-list-table.component.html',
  styleUrl: './relationship-list-table.component.scss'
})
export class RelationshipListTableComponent implements AfterViewInit, OnDestroy {
  listRelationships = input.required<CustomerResponseShort[]>();
  nameFirstColumn = input.required<string>();
  isAgent = input.required<boolean>();
  showRotateRelaship = input();
  totalItems = input<number>(0);
  pageSize = input<number>(0);
  currentPage = input<number>(0);
  totalPages = input<number>(0);
  relationshipType = input<RelationshipType>();
  pageChange = output<number>();
  sort = output<SortEvent>();
  itemIdSelected = output<number>();
  private resizeObserver!: ResizeObserver;
  private datatableWrapper = viewChild<ElementRef>('datatableWrapper');
  private table = viewChild<DatatableComponent>('table');

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

  goToCustomersDetail(customersId: number): void {
    this.itemIdSelected.emit(customersId);
  }

  getFirstResult(): number {
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  getLastResult(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  }
}
