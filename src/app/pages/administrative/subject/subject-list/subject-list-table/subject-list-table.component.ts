import { AfterViewInit, Component, ElementRef, inject, input, OnDestroy, output, viewChild } from '@angular/core';
import { DataTableColumnCellDirective, DatatableComponent, NgxDatatableModule, SortEvent } from '@swimlane/ngx-datatable';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { GetSubjectsResponse, SubjectResponseShort } from '../../../../../api/glsAdministrativeApi/models';
import { GlsPaginatorComponent } from '../../../../../common/components/gls-paginator/gls-paginator.component';
import { InfoMobileComponent } from '../../../../../common/components/info-mobile/info-mobile.component';
import { CommonModule } from '@angular/common';
import { WarningStatusComponent } from '../../../../../common/components/warning-status/warning-status.component';
import { UtilityRouting } from '../../../../../common/utilities/utility-routing';
import { STATUS } from '../../../../../common/utilities/constants/generic-constants';

@Component({
  selector: 'app-subject-list-table',
  standalone: true,
  imports: [
    DataTableColumnCellDirective,
    DatatableComponent,
    NgxDatatableModule,
    TranslatePipe,
    GlsPaginatorComponent,
    InfoMobileComponent,
    CommonModule,
    WarningStatusComponent
  ],
  templateUrl: './subject-list-table.component.html',
  styleUrl: './subject-list-table.component.scss'
})
export class SubjectListTableComponent implements AfterViewInit, OnDestroy {
  subjectList = input.required<GetSubjectsResponse[]>();
  totalItems = input<number>(0);
  pageSize = input<number>(0);
  currentPage = input<number>(0);
  totalPages = input<number>(0);
  showRotateSubject = input();
  pageChange = output<number>();
  sort = output<SortEvent>();
  private readonly router = inject(Router);
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

  /**
   * Navigates to the subject edit page for a specific subject.
   * @param idSubject The ID of the subject.
   */

  goToSubjectDetail(idSubject: number): void {
    UtilityRouting.navigateToSubjectDetailById(idSubject);
  }

  getFirstResult(): number {
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  getLastResult(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  }

  getStatusClass(subject: SubjectResponseShort): string {
    const status: 'COMPLETED' | 'DISABLED' = this.getStatus(subject);
    if (status === STATUS.COMPLETED) {
      return 'text-success';
    } else if (subject.status === STATUS.DISABLED) {
      return 'status-disabled';
    } else {
      return '';
    }
  }

  getStatusLabel(subject: SubjectResponseShort): string {
    const status: 'COMPLETED' | 'DISABLED' = this.getStatus(subject);

    return 'structureList.status.' + status.toLowerCase();
  }

  getStatus(subject: SubjectResponseShort): 'COMPLETED' | 'DISABLED' {
    return subject.status as 'COMPLETED' | 'DISABLED';
  }
}
