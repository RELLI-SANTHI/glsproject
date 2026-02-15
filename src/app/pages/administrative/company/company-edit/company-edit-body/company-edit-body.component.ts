import { Component, Input, input, ViewChild } from '@angular/core';
import { NgbNav, NgbNavModule, NgbNavOutlet } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { GeneralDataComponent } from './general-data/general-data.component';
import { RegisteredOfficeAddressComponent } from './registered-office-address/registered-office-address.component';
import { ContactInfoComponent } from './contact-info/contact-info.component';
import { BillingDataComponent } from './billing-data/billing-data.component';
import { CompanyDataComponent } from './company-data/company-data.component';
import { EndActivityComponent } from './end-activity/end-activity.component';
import { AdministrativeRelationsComponent } from './administrative-relations/administrative-relations.component';
import { CompanyDetailResponse } from '../../../../../api/glsAdministrativeApi/models';
import { map, Observable } from 'rxjs';
import { GetApiAdministrativeV1Id$Json$Params } from '../../../../../api/glsAdministrativeApi/fn/administrative/get-api-administrative-v-1-id-json';
import { AdministrativeService } from '../../../../../api/glsAdministrativeApi/services';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { CompanyCommercialRelationsComponent } from './company-commercial-relations/company-commercial-relations.component';
import { AdministrativeStructuresComponent } from './administrative-structures/administrative-structures.component';
import { GenericDropdown } from '../../../../../common/models/generic-dropdown';

@Component({
  selector: 'app-company-edit-body',
  standalone: true,
  imports: [
    NgbNav,
    NgbNavModule,
    TranslatePipe,
    GeneralDataComponent,
    RegisteredOfficeAddressComponent,
    ContactInfoComponent,
    BillingDataComponent,
    CompanyDataComponent,
    EndActivityComponent,
    AdministrativeRelationsComponent,
    CompanyCommercialRelationsComponent,
    AdministrativeStructuresComponent
  ],
  templateUrl: './company-edit-body.component.html',
  styleUrl: './company-edit-body.component.scss'
})
export class CompanyEditBodyComponent {
  isWrite = input.required<boolean>();
  formParent = input.required<FormGroup>();
  activeTab = 'tab1';
  @ViewChild('nav', { static: true }) nav!: NgbNav;
  @ViewChild('navOutlet', { static: true }) navOutlet!: NgbNavOutlet;
  companyData = input.required<CompanyDetailResponse | null>();
  isDraft = input.required<boolean>();
  nationList = input<GenericDropdown[] | null>(null);
  nationDefault = input<GenericDropdown | null>(null);
  // companyData: CompanyDetailResponse | null = null;
  @Input() id: number | null = null;
  constructor(
    private admService: AdministrativeService,
    private route: ActivatedRoute
  ) {}

  /**
   * Fetches company data by ID.
   *
   * This method retrieves company details from the database asynchronously using the `getApiAdministrativeV1Id$Json` API.
   *
   * @param id - The ID of the company to retrieve.
   * @returns An Observable containing the company details.
   */
  getCompanyData(id: number): Observable<CompanyDetailResponse> {
    const params: GetApiAdministrativeV1Id$Json$Params = { id };

    return this.admService.getApiAdministrativeV1Id$Json(params).pipe(map((response: CompanyDetailResponse) => response));
  }

  getGeneralDataForm(): FormGroup {
    return this.formParent().get('generalData') as FormGroup;
  }

  getOfficeAddressForm(): FormGroup {
    return this.formParent().get('registeredOfficeAddress') as FormGroup;
  }

  getContactInformationForm(): FormGroup {
    return this.formParent().get('contactInformation') as FormGroup;
  }

  getActivityEndDateForm(): FormGroup {
    return this.formParent().get('activityEndDate') as FormGroup;
  }

  getAdminRelationForm(): FormGroup {
    return this.formParent().get('administrativeRelations') as FormGroup;
  }

  getBillingDataForm(): FormGroup {
    return this.formParent().get('billingData') as FormGroup;
  }

  getCompanyDataForm(): FormGroup {
    return this.formParent().get('companyData') as FormGroup;
  }

  /**
   * Checks if a section in the form is invalid.
   * A section is considered invalid if any of its fields are invalid.
   *
   * @param section - The name of the section to check.
   * @returns `true` if the section has invalid fields, otherwise `false`.
   */
  isSectionInvalid(section: string): boolean {
    // eslint-disable-next-line no-extra-boolean-cast
    if (!this.id) {
      return false;
    }
    switch (section) {
      case 'generalData':
        return (
          this.getGeneralDataForm()?.invalid ||
          this.getOfficeAddressForm()?.invalid ||
          this.getContactInformationForm()?.invalid ||
          this.getActivityEndDateForm()?.invalid
        );
      case 'billingData':
        return this.getBillingDataForm()?.invalid || this.getCompanyDataForm()?.invalid;
      case 'administrativeRelations':
        return this.getAdminRelationForm()?.invalid ?? false;
      case 'commercialRelations':
        return false; // Assuming commercialRelations does not have specific validation
      case 'structures':
        return false; // Assuming structures does not have specific validation
      default:
        return false;
    }
  }
}
