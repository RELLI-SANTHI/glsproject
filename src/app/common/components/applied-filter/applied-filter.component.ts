import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { USER_STATUS } from '../../utilities/constants/profile';
import { ResetCommonFilterList } from '../../models/reset-filter-list';

@Component({
  selector: 'app-applied-filter',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './applied-filter.component.html',
  styleUrl: './applied-filter.component.scss'
})
export class AppliedFilterComponent {
  showFiltersApplied = input.required<ResetCommonFilterList[]>();
  resetFilter = output<ResetCommonFilterList>();
  resetFilters = output();
  translateColumnName = input<string>('');
  translateStatusName = input<string>('');

  constructor() {
    //  constructor
  }

  /**
   *  Resets a specific filter based on the provided field.
   * * @param field The field of the filter to reset.
   * @param field
   * @returns
   */
  getStatusTranslationCode(field: string) {
    if (Object.values(USER_STATUS).includes(field as USER_STATUS)) {
      return this.translateStatusName() + '.' + field.toLowerCase();
    }

    return field;
  }

  /**
   * Resets a specific filter based on the provided field.
   * @param field The field of the filter to reset.
   * @returns The translation code for the column name.
   */
  getColumnTranslationCode(field: unknown | undefined) {
    if (field) {
      return this.translateColumnName() +'.' + field;
    } else {
      return this.translateColumnName() + '.all';
    }
  }
}
