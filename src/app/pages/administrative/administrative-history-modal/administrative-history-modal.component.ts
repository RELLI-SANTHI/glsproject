import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GlsInputComponent } from '../../../common/form/gls-input/gls-input.component';
import { GlsInputDropdownComponent } from '../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { HISTORY_OPTIONS_SEARCH } from './constants/administrative-history-constants';
import { HistoryModalModel, HistoryModalModelItem } from '../models/history-modal-model';
import { NgClass, NgIf } from '@angular/common';
import { Utility } from '../../../common/utilities/utility';
import { VIEW_MODE } from '../../../common/app.constants';
import { GenericService } from '../../../common/utilities/services/generic.service';

@Component({
  selector: 'app-administrative-history-modal',
  standalone: true,
  imports: [NgxDatatableModule, TranslatePipe, GlsInputComponent, GlsInputDropdownComponent, NgIf, NgClass],
  templateUrl: './administrative-history-modal.component.html',
  styleUrl: './administrative-history-modal.component.scss'
})
export class AdministrativeHistoryModalComponent implements OnInit {
  historyLocalList = signal<HistoryModalModel[]>([]);
  historyFilterForm!: FormGroup;
  isSmallMobile = signal(false);
  @Input() historyList: HistoryModalModel[] = [];
  protected readonly optionsHistory = HISTORY_OPTIONS_SEARCH;
  private readonly fb = inject(FormBuilder);
  private readonly genericService = inject(GenericService);

  constructor(
    public activeModal: NgbActiveModal,
    private translate: TranslateService
  ) {
  }

  ngOnInit(): void {
    const remapped = this.remapData(this.historyList);
    const listFinal = this.firstSort(remapped);
    this.historyLocalList.set(listFinal);

    this.historyFilterForm = this.fb.group({
      searchTerm: [''],
      searchField: ['']
    });
    this.historyFilterForm.get('searchTerm')?.valueChanges.subscribe((value) => {
      if (!value) {
        this.resetHistoryFilter();
      }
    });

    this.isSmallMobile.set(this.genericService.viewMode() === VIEW_MODE.MOBILE);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onTreeAction(event: any) {
    const row = event.row;
    if (row.treeStatus === 'collapsed') {
      row.treeStatus = 'expanded';
    } else {
      row.treeStatus = 'collapsed';
    }
    this.historyLocalList.update((list) => [...list]);
  }

  enableSearch(): boolean {
    return this.historyFilterForm.get('searchTerm')?.value !== '' && this.historyFilterForm.get('searchField')?.value !== '';
  }

  // eslint-disable-next-line max-lines-per-function
  searchHistory(): void {
    const searchTerm = this.historyFilterForm.get('searchTerm')?.value.toLowerCase();
    const searchField = this.historyFilterForm.get('searchField')?.value;

    let filteredList: HistoryModalModel[] = [];

    if (searchTerm && searchField) {
      if (searchField === 'lastUpdate') {
        filteredList = this.historyList.filter((item) => {
          if (!item.lastUpdate) {
            return false; // Skip if lastUpdate is undefined or null
          }

          return item.items?.some((child: HistoryModalModelItem) => child.date.toLowerCase().includes(searchTerm));
        });
      } else if (searchField === 'fieldName') {
        filteredList = this.historyList.filter((item) => {
          if (!item.fieldName) {
            return false; // Skip if fieldName is undefined or null
          }
          const translated = this.translate.instant('administrative.fields.' + item.fieldName).toLowerCase();

          return translated.includes(searchTerm);
        });
      } else if (searchField === 'fieldValue') {
        filteredList = this.historyList.filter((item) =>
          item.items?.some((child: HistoryModalModelItem) => {
            if (!child.value) {
              return false; // Skip if value is undefined or null
            }
            const translated = this.translate.instant(this.translateChildValue(child.value)).toLowerCase();

            return translated.includes(searchTerm);
          })
        );
      }
    } else {
      filteredList = this.historyList;
    }

    this.historyLocalList.set(this.remapData(filteredList));
  }

  closeModal(): void {
    this.activeModal.dismiss();
  }

  exportHistory(): void {
    this.activeModal.close({ export: true, filters: this.historyFilterForm.value });
  }

  translateChildValue(value: string): string {
    const valuesToTranslate = [
      'true',
      'false',
      'True',
      'False',
      'COMPLETED',
      'ACTIVE',
      'INACTIVE',
      'DISABLED',
      'DRAFT',
      'I',
      'E',
      'ID01',
      'ID02'
    ];
    if (valuesToTranslate.includes(value)) {
      return 'administrative.fields.' + value;
    }
    // Enters only if value is an ISO string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...)
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T.*)?$/;
    if (typeof value === 'string' && isoDateRegex.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('it-IT');
      }
    }

    return value;
  }

  /**
   * Sorts the history list based on the specified column and direction.
   * This method handles sorting for parent rows and ensures that child rows remain associated with their respective parents.
   * @param event
   */
  // eslint-disable-next-line max-lines-per-function, @typescript-eslint/no-explicit-any
  sortCol(event: any): void {
    const sortDir = event.sorts[0]?.dir;
    const sortProp = event.sorts[0]?.prop;

    if (!sortDir || !sortProp) {
      return;
    }

    const parents = this.historyLocalList().filter((item) => item.id?.includes('parent'));
    const children = this.historyLocalList().filter((item) => item.id?.includes('child'));

    let tempParents: { original: HistoryModalModel; sortValue: string | number }[];

    if (sortProp === 'fieldName') {
      tempParents = parents.map((parent) => ({
        original: parent,
        sortValue: parent.fieldName ? this.translate.instant('administrative.fields.' + parent.fieldName).toLowerCase() : ''
      }));
    } else if (sortProp === 'lastUpdate') {
      tempParents = parents.map((parent) => ({
        original: parent,
        sortValue: parent.lastUpdate ? Utility.parseDateTimeString(parent.lastUpdate)?.getTime() || 0 : 0
      }));
    } else {
      // If the sort property is not recognized, do not sort.
      return;
    }

    tempParents.sort((a, b) => {
      let comparison = 0;
      if (typeof a.sortValue === 'string' && typeof b.sortValue === 'string') {
        comparison = a.sortValue.localeCompare(b.sortValue);
      } else if (typeof a.sortValue === 'number' && typeof b.sortValue === 'number') {
        comparison = a.sortValue - b.sortValue;
      }

      return sortDir === 'asc' ? comparison : -comparison;
    });

    const sortedList: HistoryModalModel[] = [];
    for (const tempParent of tempParents) {
      sortedList.push(tempParent.original);

      // Sort children according to the selected column
      let parentChildren = children.filter((child) => child.parentId === tempParent.original.id);

      if (sortProp === 'fieldName') {
        parentChildren = parentChildren.sort((a, b) => {
          const fieldA = a.fieldName ? this.translate.instant('administrative.fields.' + a.fieldName).toLowerCase() : '';
          const fieldB = b.fieldName ? this.translate.instant('administrative.fields.' + b.fieldName).toLowerCase() : '';

          return sortDir === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
        });
      } else if (sortProp === 'lastUpdate') {
        parentChildren = parentChildren.sort((a, b) => {
          const dateA = a.lastUpdate ? Utility.parseDateTimeString(a.lastUpdate)?.getTime() || 0 : 0;
          const dateB = b.lastUpdate ? Utility.parseDateTimeString(b.lastUpdate)?.getTime() || 0 : 0;

          return sortDir === 'asc' ? dateA - dateB : dateB - dateA;
        });
      }

      sortedList.push(...parentChildren);
    }

    this.historyLocalList.set(sortedList);
  }

  private remapData(data: HistoryModalModel[]): HistoryModalModel[] {
    const result: HistoryModalModel[] = [];
    let idCounter = 0;

    for (const item of data) {
      const parentId = `parent-${idCounter++}`;
      result.push({
        id: parentId,
        fieldName: item.fieldName,
        prefixLabel: item.prefixLabel,
        lastUpdate: item.lastUpdate,
        treeStatus: 'collapsed'
      });

      if (Array.isArray(item.items)) {
        item?.items?.forEach((child: HistoryModalModelItem) => {
          const childId = `child-${idCounter++}`;
          result.push({
            id: childId,
            fieldName: child.value,
            lastUpdate: child.date,
            parentId: parentId,
            treeStatus: 'disabled'
          });
        });
      }
    }

    return result;
  }

  private resetHistoryFilter(): void {
    this.historyLocalList.set(this.remapData(this.historyList));
  }

  /**
   * 1) Group parents by same lastUpdate date (ignoring time)
   * 2) Sort all parents by lastUpdate (desc, date and time)
   * 3) Then by fieldName (asc) and force order by name inside group
   * 4) For each parent, append its children sorted by lastUpdate (desc, date and time)
   */
  // eslint-disable-next-line max-lines-per-function
  private firstSort(list: HistoryModalModel[]): HistoryModalModel[] {
    // Separate parents and children
    const parents = list.filter((item) => !item.parentId);
    const children = list.filter((item) => !!item.parentId);

    // Helper to extract only the date part (dd/MM/yyyy) from lastUpdate
    const getDateOnly = (dateStr?: string) => {
      if (!dateStr) {
        return '';
      }
      const [datePart] = dateStr.split(' ');

      return datePart || '';
    };

    // Group parents by date only (ignoring time)
    const parentsGrouped: Record<string, HistoryModalModel[]> = {};
    parents.forEach((parent) => {
      const dateOnly = getDateOnly(parent.lastUpdate);
      if (!parentsGrouped[dateOnly]) {
        parentsGrouped[dateOnly] = [];
      }
      parentsGrouped[dateOnly].push(parent);
    });

    // Sort date keys descending (most recent date group first)
    const sortedDates = Object.keys(parentsGrouped)
      .sort((a, b) => {
        const dateA = Utility.parseDateTimeString(a)?.getTime() || 0;
        const dateB = Utility.parseDateTimeString(b)?.getTime() || 0;

        return dateB - dateA;
      });

    const result: HistoryModalModel[] = [];
    for (const dateKey of sortedDates) {
      // Sort parents in this group by lastUpdate (desc, date and time), then by fieldName (asc)
      const group = parentsGrouped[dateKey].slice().sort((a, b) => {
        const dateA = a.lastUpdate ? Utility.parseDateTimeString(a.lastUpdate)?.getTime() || 0 : 0;
        const dateB = b.lastUpdate ? Utility.parseDateTimeString(b.lastUpdate)?.getTime() || 0 : 0;
        if (dateA !== dateB) {
          return dateB - dateA;
        }
        const fieldA = (a.fieldName ?? '').toString().toLowerCase();
        const fieldB = (b.fieldName ?? '').toString().toLowerCase();

        return fieldA.localeCompare(fieldB);
      });

      for (const parent of group) {
        result.push(parent);
        // Children of this parent, sorted by lastUpdate (desc, date and time)
        const parentChildren = children
          .filter((child) => child.parentId === parent.id)
          .sort((a, b) => {
            const dateA = a.lastUpdate ? Utility.parseDateTimeString(a.lastUpdate)?.getTime() || 0 : 0;
            const dateB = b.lastUpdate ? Utility.parseDateTimeString(b.lastUpdate)?.getTime() || 0 : 0;

            return dateB - dateA;
          });
        result.push(...parentChildren);
      }
    }

    return result;
  }
}
