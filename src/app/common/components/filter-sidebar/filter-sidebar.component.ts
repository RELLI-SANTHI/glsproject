import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NgClass } from '@angular/common';

import { FilterPipe } from '../../utilities/pipes/filter.pipe';
import { FilterSidebar } from '../../models/filter-sidebar';
import { FilterItem } from '../../models/filter-item';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [FormsModule, FilterPipe, TranslatePipe, NgClass],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.scss'
})
export class FilterSidebarComponent {
  filters = input.required<FilterSidebar[]>();
  closeSideBarEv = output();
  applyFiltersEv = output<FilterItem[]>();
  activeFilter: FilterSidebar | null = null;
  searchTerm = '';

  /**
   * Open the list of filters
   * @param filter
   */
  openFilter(filter: FilterSidebar): void {
    this.activeFilter = filter;
    this.searchTerm = '';
  }

  /**
   * Back to list of options
   */
  backToList() {
    this.activeFilter = null;
    this.searchTerm = '';
  }

  /**
   * Select an option and close the list of options
   * @param option
   */
  applySelection(option: string) {
    if (this.activeFilter) {
      this.activeFilter.selected = option;
      this.backToList();
    }
  }

  /**
   * Apply the selected filters and close the sidebar
   */
  applyFilters(): void {
    this.applyFiltersEv.emit(this.filters());
  }

  /**
   * Close the sidebar without applying filters
   */
  closeFilters(): void {
    this.closeSideBarEv.emit();
  }

  /**
   * Retrieve the label's
   * @param label
   * @param all show if is all options label
   */
  getTranslateLabel(label: string | undefined, all = false): string {
    return label ? label : all ? 'generic.all' : 'generic.filters';
  }
}
