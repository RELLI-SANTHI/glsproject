import { Component, input, output } from '@angular/core';
import { BadgeFilters } from '../../models/badge-filters';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-badge-filters',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './badge-filters.component.html',
  styleUrl: './badge-filters.component.scss'
})
export class BadgeFiltersComponent {
  showFiltersApplied = input.required<BadgeFilters[]>();
  resetFilters = output<BadgeFilters | void>();
}
