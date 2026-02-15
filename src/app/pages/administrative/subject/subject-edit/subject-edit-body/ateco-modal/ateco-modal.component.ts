import { AfterViewInit, Component, ElementRef, inject, Input, OnInit, signal, viewChild } from '@angular/core';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgClass, NgForOf } from '@angular/common';

import { AtecoCodeService } from '../../../../../../api/glsAdministrativeApi/services/ateco-code.service';
import { AtecoCodeModel } from '../../../../../../api/glsAdministrativeApi/models/ateco-code-model';
import { ATECO_COLUMN_LIST, ATECO_OPTIONS_SEARCH } from '../../../constants/subject-constants';
import { Utility } from '../../../../../../common/utilities/utility';
import { PostApiAtecocodeV1$Json$Params } from '../../../../../../api/glsAdministrativeApi/fn/ateco-code/post-api-atecocode-v-1-json';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { GlsInputDropdownComponent } from '../../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { GlsPaginatorComponent } from '../../../../../../common/components/gls-paginator/gls-paginator.component';
import { AtecoCodeBaseResponse } from '../../../../../../api/glsAdministrativeApi/models/ateco-code-base-response';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { VIEW_MODE } from '../../../../../../common/app.constants';

@Component({
  selector: 'app-ateco-modal',
  standalone: true,
  imports: [
    NgxDatatableModule,
    FormsModule,
    TranslatePipe,
    ReactiveFormsModule,
    NgForOf,
    GlsInputComponent,
    GlsInputDropdownComponent,
    GlsPaginatorComponent,
    NgClass
  ],
  templateUrl: './ateco-modal.component.html',
  styleUrl: './ateco-modal.component.scss'
})
export class AtecoModalComponent implements OnInit, AfterViewInit {
  @Input() title = '';
  @Input() cancelText = '';
  @Input() confirmText = '';

  atecoFilterForm: FormGroup;
  selectedRow: AtecoCodeModel | null = null;
  isSmallMobile = signal(false);
  listAteco = signal<AtecoCodeModel[]>([]);
  filteredAteco = signal<AtecoCodeModel[]>([]);
  currentPageAteco = signal<AtecoCodeModel[]>([]);
  readonly columns = ATECO_COLUMN_LIST;
  readonly optionsAtecoSearch = ATECO_OPTIONS_SEARCH;
  pageSize = 10;
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  private table = viewChild<DatatableComponent>('table');
  private resizeObserver!: ResizeObserver;
  private datatableWrapper = viewChild<ElementRef>('datatableWrapper');
  private readonly atecoCodeService = inject(AtecoCodeService);
  private readonly translateService = inject(TranslateService);
  private readonly genericService = inject(GenericService);

  constructor(
    public modalRef: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.atecoFilterForm = this.fb.group({
      searchTerm: [''],
      searchField: ['']
    });
  }

  ngOnInit() {
    this.loadAtecoCodes();
    this.isSmallMobile.set(this.genericService.viewMode() === VIEW_MODE.MOBILE);
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.table()?.recalculate();
    });

    this.resizeObserver.observe(this.datatableWrapper()?.nativeElement);
  }

  enableSearch(): boolean {
    return this.atecoFilterForm.get('searchField')?.value !== '';
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.currentPageAteco.set(this.filteredAteco().slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize));
  }

  getFirstResult(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getLastResult(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  searchAtecoCodes(): void {
    const searchTerm = this.atecoFilterForm.get('searchTerm')?.value?.toLowerCase() || '';
    const searchField = this.atecoFilterForm.get('searchField')?.value;

    const filtered = this.listAteco().filter((ateco) => {
      const target = searchField === 'code' ? ateco.code : ateco.description;

      return target?.toLowerCase().includes(searchTerm);
    });

    this.filteredAteco.set(filtered);
    this.onPageChange(1);
    this.updatePagination();
  }

  selectRow(row: AtecoCodeModel): void {
    this.selectedRow = row;
  }

  closeModal() {
    this.modalRef.dismiss();
  }

  confirm() {
    this.modalRef.close(this.selectedRow);
  }

  /**
   * Translate the label of column
   * @param label
   */
  translateLabelCol(label: string): string {
    return Utility.translate(label, this.translateService);
  }

  private updatePagination(): void {
    this.totalItems = this.filteredAteco().length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
  }

  private loadAtecoCodes(): void {
    const params: PostApiAtecocodeV1$Json$Params = {
      body: {}
    };
    this.atecoCodeService.postApiAtecocodeV1$Json(params).subscribe({
      next: (data: AtecoCodeBaseResponse) => {
        this.listAteco.set(data.atecoCodes ?? []);
        this.filteredAteco.set(data.atecoCodes ?? []);
        this.currentPageAteco.set(this.filteredAteco().slice(0, this.pageSize));
        this.updatePagination();
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }
}
