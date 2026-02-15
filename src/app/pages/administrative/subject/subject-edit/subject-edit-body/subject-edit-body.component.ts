import { Component, input, model, OnChanges, ViewChild } from '@angular/core';
import { BillingDataComponent } from './billing-data/billing-data.component';
import { NgbNav, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ContactInformationComponent } from './contact-information/contact-information.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataFiscalRappFiscComponent } from './data-fiscal-rapp-fisc/data-fiscal-rapp-fisc.component';
import { FiscalDataComponent } from './fiscal-data/fiscal-data.component';
import { GeneralDataComponent } from './general-data/general-data.component';
import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { CommercialRelationsComponent } from './commercial-relations/commercial-relations.component';
import { GlsInputCheckboxComponent } from '../../../../../common/form/gls-input-checkbox/gls-input-checkbox.component';
import { DatePipe } from '@angular/common';
import { Utility } from '../../../../../common/utilities/utility';
import { SubjectResponse, SubjectResponseShort } from '../../../../../api/glsAdministrativeApi/models';
import { GenericDropdown } from '../../../../../common/models/generic-dropdown';

@Component({
  selector: 'app-subject-edit-body',
  standalone: true,
  imports: [
    BillingDataComponent,
    NgbNav,
    NgbNavModule,
    TranslatePipe,
    ContactInformationComponent,
    FormsModule,
    GlsInputCheckboxComponent,
    DataFiscalRappFiscComponent,
    TranslateModule,
    FormsModule,
    FiscalDataComponent,
    GeneralDataComponent,
    GlsInputComponent,
    CommercialRelationsComponent,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './subject-edit-body.component.html',
  styleUrl: './subject-edit-body.component.scss'
})
export class SubjectEditBodyComponent implements OnChanges {
  @ViewChild('nav', { static: true }) nav!: NgbNav;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formParent = input.required<FormGroup | any>();
  isWrite = input.required<boolean>();
  showTabs = input.required<boolean>();
  nationDefault = input<GenericDropdown | null>(null);
  nationList = input<GenericDropdown[] | null>(null);
  viewData = input<SubjectResponse | null>(); // Adjust type as necessary for your data model
  accordingViewData = input<SubjectResponseShort | []>([]);
  isDraft = input.required<boolean>();
  warningOrError = model<boolean>(false);
  activeTab = 'tab1';
  protected readonly utility = Utility;

  ngOnChanges(): void {
    const dateAdded = this.formParent()?.get('dateAdded')?.value;
    if (this.isWrite() && dateAdded && this.formParent()?.get('dateAdded')?.disabled) {
      let formattedDate;

      if (typeof dateAdded === 'object') {
        formattedDate = Utility.fromDatepickerToString(dateAdded);
      } else {
        formattedDate = typeof dateAdded === 'string' && !dateAdded.includes('/') ? Utility.fromIsoStringToString(dateAdded) : dateAdded;
      }

      if (formattedDate !== null) {
        this.formParent()?.get('dateAdded')?.setValue(formattedDate);
      }
    }
  }

  /**
   * Checks if a section in the form is invalid.
   * A section is considered invalid if any of its fields are invalid.
   *
   * @param section - The name of the section to check.
   * @returns `true` if the section has invalid fields, otherwise `false`.
   */
  isSectionInvalid(section: string): boolean {
    if (!this.formParent()?.get('id')?.value) {
      return false;
    }
    switch (section) {
      case 'generalData':
        return Utility.checkFormValidity(this.formParent(), ['permanentEstablishmentDetail', 'taxRepresentativeDetail', 'invoiceDetail']);
      case 'fiscalData':
        return (
          this.formParent()?.get('permanentEstablishmentDetail')?.invalid || this.formParent()?.get('taxRepresentativeDetail')?.invalid
        );
      case 'billingData':
        return this.formParent()?.get('invoiceDetail')?.invalid;
      case 'commercialRelations':
        return false; // Assuming commercialRelations does not have specific validation
      default:
        return false;
    }
  }

  getDateAdded(): string {
    const dateAdded = this.formParent()?.get('dateAdded')?.value ?? '';

    return Utility.convertFromGenericDataToIsoString(dateAdded);
  }
}
