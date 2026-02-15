import { ChangeDetectionStrategy, Component, inject, input, model, OnInit, signal } from '@angular/core';
import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';

import { GlsInputDropdownComponent } from '../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { GlsInputDataComponent } from '../../../../../common/form/gls-input-data/gls-input-date.component';
import { CompanyDetailResponse, GetAdministrativesResponse } from '../../../../../api/glsAdministrativeApi/models';
import { AdministrativeService } from '../../../../../api/glsAdministrativeApi/services/administrative.service';
import { PostApiAdministrativeV1$Json$Params } from '../../../../../api/glsAdministrativeApi/fn/administrative/post-api-administrative-v-1-json';
import { GlsInputCheckboxComponent } from '../../../../../common/form/gls-input-checkbox/gls-input-checkbox.component';
import { GenericService } from '../../../../../common/utilities/services/generic.service';
import { Utility } from '../../../../../common/utilities/utility';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../../common/utilities/constants/profile';
import { UtilityProfile } from '../../../../../common/utilities/utility-profile';
import { UserProfileService } from '../../../../../common/utilities/services/profile/user-profile.service';

@Component({
  selector: 'app-relationship-data',
  standalone: true,
  imports: [
    GlsInputComponent,
    GlsInputDropdownComponent,
    ReactiveFormsModule,
    TranslatePipe,
    GlsInputDataComponent,
    GlsInputCheckboxComponent,
    DatePipe
  ],
  templateUrl: './relationship-data.component.html',
  styleUrl: './relationship-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RelationshipDataComponent implements OnInit {
  relationshipDataForm = input.required<FormGroup>();
  isDraft = input.required<boolean>();
  isWriting = input<boolean>();
  isEnabledDate = input<boolean>();
  isFromSubject = input<boolean>();
  isFromAgent = input<boolean>();
  corporateGroupId = model<number>();
  companies = signal<CompanyDetailResponse[]>([]);

  PROFILE = PROFILE;
  FUNCTIONALITY = FUNCTIONALITY;
  PERMISSION = PERMISSION;

  private readonly genericService = inject(GenericService);
  private readonly administrativeService = inject(AdministrativeService);
  protected readonly userProfileService = inject(UserProfileService);

  ngOnInit() {
    const status = this.relationshipDataForm()?.get('status')?.value;
    this.getSociety();
    if (!this.isEnabledDate()) {
      this.relationshipDataForm()?.get('endOfRelationshipValidity')?.disable();
    } else if (this.isEnabledDate() && status !== 'DRAFT') {
      this.relationshipDataForm()?.get('administrativeId')?.disable();
      this.relationshipDataForm()?.get('customerCode')?.disable();
      this.relationshipDataForm()?.get('agentCode')?.disable();
    }

    const endDate = this.relationshipDataForm()?.get('endOfRelationshipValidity')?.value;
    if (this.isEnabledDate() && endDate) {
      this.relationshipDataForm()?.get('endOfRelationshipValidity')?.setValue(Utility.fromIsoStringToDatepicker(endDate));
    }
  }

  getSocietyName(): string | undefined {
    const administrativeId = this.relationshipDataForm()?.get('administrativeId')?.value;
    const company = this.companies().find((c) => c.id === administrativeId);

    return company ? company.name! : undefined;
  }

  onValueChange(value: string | number, controlName: string): void {
    const control = this.relationshipDataForm().get(controlName);
    if (control) {
      control.setValue(Number(value));
      if (!this.isFromSubject()) {
        const company = this.companies().filter((c: CompanyDetailResponse) => c.id === Number(value));
        this.corporateGroupId.set(company[0]?.corporateGroupId);
      }
    }
  }

  /**
   * Function to retrieve company data based on the provided request payload.
   * This function uses the AdministrativeService to make a POST request to the API.
   * This function retrieves the company data based on the provided request payload.
   * @returns An observable that emits the response containing the company data.
   */
  private getSociety() {
    const param: PostApiAdministrativeV1$Json$Params = {
      body: { status: ['COMPLETED'] }
    };
    if (this.corporateGroupId()) {
      param.body!.corporateGroupId = this.corporateGroupId();
    }
    // Create HTTP context with custom headers
    const context =
      !this.isFromSubject() || (this.isFromSubject() && this.relationshipDataForm().value.typeRelationship != '')
        ? Utility.setPermissionHeaders(
            this.isFromAgent() ? FUNCTIONALITY.networkAdministrativeAgent : FUNCTIONALITY.networkAdministrativeCustomer,
            this.isWriting() ? PERMISSION.write : PERMISSION.read
          )
        : undefined;
    this.administrativeService.postAdministrativeV1CompaniesWithoutBreakVisibility$Json(param, context).subscribe({
      next: (response: GetAdministrativesResponse) => {
        if (response && response.companies && response.companies.length > 0) {
          this.companies.set(response.companies);
          if (response.companies.length === 1) {
            this.relationshipDataForm()?.get('administrativeId')?.setValue(response.companies[0].id);
          }
        }
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }

  hasAccess(profile: string, functionality: string, permission: string): boolean {
    const visible: boolean = UtilityProfile.checkAccessProfile(this.userProfileService, profile, functionality, permission);

    return visible;
  }
}
