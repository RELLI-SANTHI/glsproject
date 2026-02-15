import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { GenericService } from '../../utilities/services/generic.service';
import { VIEW_MODE } from '../../app.constants';

@Component({
  selector: 'gls-paginator',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  templateUrl: './gls-paginator.component.html',
  styleUrl: './gls-paginator.component.scss'
})
export class GlsPaginatorComponent implements OnChanges {
  @Input() page = 1;
  @Input() pageSize: number | undefined = 10;
  @Input() totalItems = 0;
  @Input() totalPages = 0;
  @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();
  visiblePages = 5;
  smallPage = 3;
  pages?: number[];

  private readonly genericService = inject(GenericService);
  isSmallMobile = false;
  /**
   * Handles changes in the paginator's inputs and calculates which page numbers to display.
   * The paginator shows a limited number of page buttons with ellipsis (...) for skipped pages.
   */
  // eslint-disable-next-line max-lines-per-function
  ngOnChanges() {
    this.isSmallMobile = this.genericService.viewMode() === VIEW_MODE.MOBILE;
    if (this.isSmallMobile) {
      this.visiblePages = 3;
    } else {
      this.visiblePages = 5;
    }
    const pagesFiltered = [];
    if (this.isSmallMobile) {
      // show only button prev - next and current page number
      this.pages = [this.page];

      return;
    }
    // Calculate half of visible pages for centered current page
    const half = Math.floor(this.visiblePages / 2);

    // Case 1: Total pages are less than or equal to visible pages - show all pages
    if (this.totalPages <= this.visiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pagesFiltered.push(i);
      }
    }
    // Case 2: Current page is near the start - show first {visiblePages-1} pages + ellipsis + last page
    else if (this.page <= half + 1) {
      for (let i = 1; i <= this.visiblePages - 1; i++) {
        pagesFiltered.push(i);
      }
      pagesFiltered.push(0); // 0 represents ellipsis (...)
      pagesFiltered.push(this.totalPages);
    }
    // Case 3: Current page is near the end - show first page + ellipsis + last {visiblePages-2} pages
    else if (this.page >= this.totalPages - half) {
      pagesFiltered.push(1);
      pagesFiltered.push(0); // ellipsis
      for (let i = this.totalPages - (this.visiblePages - 2); i <= this.totalPages; i++) {
        pagesFiltered.push(i);
      }
    }
    // Case 4: Current page is in the middle - show first page + ellipsis + surrounding pages + ellipsis + last page
    else {
      pagesFiltered.push(1);
      pagesFiltered.push(0); // first ellipsis
      for (let i = this.page - half + 1; i <= this.page + half - 1; i++) {
        pagesFiltered.push(i);
      }
      pagesFiltered.push(0); // second ellipsis
      pagesFiltered.push(this.totalPages);
    }

    // For very small number of visible pages, show all page numbers without filtering
    this.pages =
      this.visiblePages < this.smallPage && this.visiblePages <= this.totalPages
        ? Array.from({ length: this.totalPages }, (_, i) => i + 1)
        : pagesFiltered;
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.pageChange.emit(this.page);
    }
  }

  nextPage() {
    if (this.totalPages && this.page < this.totalPages) {
      this.page++;
      this.pageChange.emit(this.page);
    }
  }

  goToPage(page: number) {
    if (page === 0) {
      return;
    }
    this.page = page;
    this.pageChange.emit(this.page);
  }
}
