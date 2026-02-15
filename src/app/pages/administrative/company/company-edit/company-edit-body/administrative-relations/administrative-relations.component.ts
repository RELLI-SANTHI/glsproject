import { Component, Input, input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GlsInputDropdownComponent } from '../../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { TranslatePipe } from '@ngx-translate/core';
import { GlsInputCheckboxComponent } from '../../../../../../common/form/gls-input-checkbox/gls-input-checkbox.component';
import { CompanyDetailResponse } from '../../../../../../api/glsAdministrativeApi/models';
import { CorporateGroupModel, UserDetailsModel } from '../../../../../../api/glsUserApi/models';
import { map, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { CorporateGroupService } from '../../../../../../api/glsUserApi/services';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { UserProfileService } from '../../../../../../common/utilities/services/profile/user-profile.service';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../../../common/utilities/constants/profile';
import { UtilityProfile } from '../../../../../../common/utilities/utility-profile';

@Component({
  selector: 'app-administrative-relations',
  standalone: true,
  imports: [GlsInputDropdownComponent, ReactiveFormsModule, TranslatePipe, GlsInputCheckboxComponent],
  templateUrl: './administrative-relations.component.html',
  styleUrl: './administrative-relations.component.scss'
})
export class AdministrativeRelationsComponent implements OnInit {
  isWriting = input.required<boolean>();
  @Input() companyData: CompanyDetailResponse | null = null;
  corporateGroupList: CorporateGroupModel[] = [];
  parentForm = input.required<FormGroup>();
  adminRelationFg = input.required<FormGroup>();
  protected logedUser?: UserDetailsModel;
  PROFILE = PROFILE;
  FUNCTIONALITY = FUNCTIONALITY;
  PERMISSION = PERMISSION;
  isDraft = input.required<boolean>();
  private readonly userProfileService = inject(UserProfileService);

  constructor(
    private fb: FormBuilder,
    private corporateGroupService: CorporateGroupService,
    private genericService: GenericService
  ) {
    this.userProfileService.profile$.subscribe((loguser: UserDetailsModel | null) => {
      if (loguser) {
        this.logedUser = loguser;
      }
    });
  }

  /**
   * Initializes the component and fetches corporate groups.
   * This method is called when the component is initialized.
   * It retrieves the list of corporate groups using the `getCorporateGroup` method.
   * It also sets up the form group for administrative relations.
   * @returns void
   * */
  ngOnInit(): void {
    this.getCorporateGroup();
  }

  /**
   * Loads corporate groups, updates local list and dropdown options,
   */
  public getCorporateGroup(): void {
    this.retrieveCorporateGroup().subscribe({
      next: (res: CorporateGroupModel[]) => {
        this.corporateGroupList = res;
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  hasAccess(profile: string, functionality: string, permission: string): boolean {
    const visible: boolean = UtilityProfile.checkAccessProfile(this.userProfileService, profile, functionality, permission);

    return visible;
  }

  /**
   * Calls the CorporateGroupService API to fetch the list of corporate groups.
   * @returns Observable<CorporateGroupModel[]>
   */
  private retrieveCorporateGroup(): Observable<CorporateGroupModel[]> {
    return this.corporateGroupService.getApiCorporategroupV1$Json().pipe(map((res: CorporateGroupModel[]) => res || []));
  }
}
