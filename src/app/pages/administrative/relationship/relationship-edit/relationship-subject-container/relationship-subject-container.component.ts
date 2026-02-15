import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';

import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { GlsInputDropdownComponent } from '../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { SubjectAccordionsComponent } from './subject-accordions/subject-accordions.component';
import { GetSubjectsResponse } from '../../../../../api/glsAdministrativeApi/models/get-subjects-response';
import { GetSubjectsRequestPayload } from '../../../../../api/glsAdministrativeApi/models/get-subjects-request-payload';
import { PostApiSubjectV1$Json$Params } from '../../../../../api/glsAdministrativeApi/fn/subject/post-api-subject-v-1-json';
import { SubjectService } from '../../../../../api/glsAdministrativeApi/services/subject.service';
import { SubjectResponseShort } from '../../../../../api/glsAdministrativeApi/models/subject-response-short';
import { GenericService } from '../../../../../common/utilities/services/generic.service';
import { SubjectEditBodyComponent } from '../../../subject/subject-edit/subject-edit-body/subject-edit-body.component';
import { UserDetailsModel } from '../../../../../api/glsUserApi/models/user-details-model';
import { UserProfileService } from '../../../../../common/utilities/services/profile/user-profile.service';
import { AdministrativeCommonService } from '../../../services/administrative.service';
import { Utility } from '../../../../../common/utilities/utility';
import { FUNCTIONALITY, PERMISSION } from '../../../../../common/utilities/constants/profile';
import { GenericDropdown } from '../../../../../common/models/generic-dropdown';
import { NATIONS_LABELS } from '../../../../../common/utilities/constants/generic-constants';
import { NationsCodeService } from '../../../../../api/glsAdministrativeApi/services';
import { NationsCodeModel } from '../../../../../api/glsAdministrativeApi/models';

@Component({
  selector: 'app-relationship-subject-container',
  standalone: true,
  imports: [
    TranslatePipe,
    GlsInputComponent,
    GlsInputDropdownComponent,
    SubjectAccordionsComponent,
    SubjectEditBodyComponent,
    ReactiveFormsModule
  ],
  templateUrl: './relationship-subject-container.component.html',
  styleUrl: './relationship-subject-container.component.scss'
})
export class RelationshipSubjectContainerComponent implements OnInit {
  showEditSuccessMessage = signal<boolean>(true);
  showSelectionWarningMessage = signal<boolean>(true);
  showNoResultsWarning = signal<boolean>(false);
  showTabs = signal<boolean>(false);
  isTableVisible = signal<boolean>(true);
  totalItems = signal(0);
  currentPage = signal<number>(1);
  totalPages = signal(1);
  pageSize = signal(10);
  customersListFg!: FormGroup;
  isDraft = input.required<boolean>();
  isWrite = input<boolean>(true);
  relationshipForm = input<FormGroup>();
  corporateGroupId = input<number>();
  isFromAgent = input<boolean>(false);
  protected nationList = signal<GenericDropdown[]>([]);
  protected nationDefault = signal<GenericDropdown | null>(null);
  showLabelMessage = false;
  searchFilterType = '';
  searchFilterValue = '';
  filterTypeOptions = [
    { id: 'vatNumber', value: 'administrative.relationshipEdit.relationshipSubjectContainer.filter.vatNumber' },
    { id: 'taxCode', value: 'administrative.relationshipEdit.relationshipSubjectContainer.filter.taxCode' },
    { id: 'companyName', value: 'administrative.relationshipEdit.relationshipSubjectContainer.filter.companyName' }
  ];
  formParent!: FormGroup;

  listSubjects = signal<SubjectResponseShort[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedRow: any;
  subjectSelected = output<boolean>();
  isItalianSubject = output<boolean>();
  protected readonly userProfileService = inject(UserProfileService);
  private readonly fb = inject(FormBuilder);
  private readonly subjectService = inject(SubjectService);
  private readonly genericService = inject(GenericService);
  private readonly administrativeService = inject(AdministrativeCommonService);
  private readonly nationsCodeService = inject(NationsCodeService);
  private payloadConfigurator: GetSubjectsRequestPayload = {
    pageSize: this.pageSize(),
    page: this.currentPage(),
    status: ['COMPLETED', 'ACTIVE']
  };
  private user!: UserDetailsModel | null;

  constructor() {
    this.userProfileService.profile$.subscribe((profileValue) => {
      this.user = profileValue;
    });
  }

  ngOnInit() {
    this.buildForm();
    this.subscribeToFilterTypeChanges();
    if (!this.isWrite()) {
      this.loadDetailSubject(this.relationshipForm()?.get('subjectId')?.value);
    }
  }

  onSearchClick(): void {
    this.searchFilterValue = this.customersListFg?.get('filterValue')?.value ?? '';
    const props = this.customersListFg.get('filterType')?.value;
    if (props === 'vatNumber') {
      this.payloadConfigurator.taxCode = null;
      this.payloadConfigurator.vatNumber = this.searchFilterValue;
      this.payloadConfigurator.surnameNameCompanyName = null;
      this.loadAccordions();
    } else if (props === 'companyName') {
      this.payloadConfigurator.taxCode = null;
      this.payloadConfigurator.vatNumber = null;
      this.payloadConfigurator.surnameNameCompanyName = this.searchFilterValue;
      this.loadAccordions();
    } else if (props === 'taxCode') {
      this.payloadConfigurator.taxCode = this.searchFilterValue;
      this.payloadConfigurator.vatNumber = null;
      this.payloadConfigurator.surnameNameCompanyName = null;
      this.loadAccordions();
    }
  }

  pageChange(page: number): void {
    this.currentPage.set(page);
    this.payloadConfigurator.page = page;
    this.loadAccordions();
  }

  setSubjectId(row: SubjectResponseShort): void {
    this.relationshipForm()?.get('subjectId')?.setValue(row.id);
    this.relationshipForm()?.get('invoiceDetail')?.get('startOfAccountingActivity')?.setValue(row.dateAdded);
    const nationIT = this.nationList()?.find((nation) => nation.code === NATIONS_LABELS.ISOCODE_IT);
    const isItalianRelationship = row.nationId === nationIT?.id || row.nationId === String(nationIT?.id);
    this.subjectSelected.emit(true);
    this.isItalianSubject.emit(isItalianRelationship);
  }

  private buildForm(): void {
    this.customersListFg = this.fb.group({
      filterType: ['', Validators.required],
      filterValue: ['']
    });
  }

  private subscribeToFilterTypeChanges(): void {
    this.customersListFg?.get('filterType')?.valueChanges?.subscribe((value) => {
      this.showLabelMessage = false;
      this.showNoResultsWarning.set(false);
      this.searchFilterType = 'administrative.relationshipEdit.relationshipSubjectContainer.filter.'.concat(value);
    });
  }

  private loadAccordions(): void {
    if (this.corporateGroupId()) {
      this.payloadConfigurator.corporateGroupId = this.corporateGroupId();
    }

    const payload = { body: {} };
    const nationsCall = this.nationsCodeService.postApiNationscodeV1$Json(payload);

    forkJoin({ subjects: this.retriveSubjects(this.payloadConfigurator), nations: nationsCall }).subscribe({
      next: (res: { subjects: GetSubjectsResponse; nations: NationsCodeModel[] }) => {
        if (res.subjects) {
          this.listSubjects.set(res.subjects.subjects ?? []);
          this.currentPage.set(res.subjects.currentPage ?? 1);
          this.totalPages.set(res.subjects.totalPages ?? 1);
          this.pageSize.set(res.subjects.pageSize ?? 0);
          this.totalItems.set(res.subjects.totalItems ?? 0);
        }
        this.showMessage();
        this.nationList.set(
          res.nations.map((item: NationsCodeModel) => ({
            id: item.id,
            value: `${item.isoCode} - ${item.description}`,
            isDefault: item.isDefault || false,
            code: item.isoCode
          }))
        );
        this.nationDefault.set(this.nationList()?.find((nation) => nation.isDefault) ?? null);
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  private retriveSubjects(body: GetSubjectsRequestPayload): Observable<GetSubjectsResponse> {
    // Create HTTP context with custom headers
    const context = Utility.setPermissionHeaders(
      this.isFromAgent() ? FUNCTIONALITY.networkAdministrativeAgent : FUNCTIONALITY.networkAdministrativeCustomer,
      PERMISSION.read
    );
    const param: PostApiSubjectV1$Json$Params = {
      body
    };

    return this.subjectService.postApiSubjectV1$Json(param, context);
  }

  private showMessage(): void {
    const hasResults = (this.showLabelMessage = this.listSubjects().length > 0);
    this.showNoResultsWarning.set(!hasResults);
    this.isTableVisible.set(hasResults);
  }

  private loadDetailSubject(subjectId: number): void {
    this.subjectService.getApiSubjectV1Id$Json({ id: subjectId }).subscribe({
      next: (response) => {
        this.formParent = this.administrativeService.setSubjectForm(this.user!, response);
        // this.table()?.rowDetail.toggleExpandRow(subject);
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }
}
