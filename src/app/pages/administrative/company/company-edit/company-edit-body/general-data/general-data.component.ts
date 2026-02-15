import { Component, Input, input, OnInit, inject, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CompanyDetailResponse, LanguageModel } from '../../../../../../api/glsAdministrativeApi/models';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { AdministrativeCommonService } from '../../../../services/administrative.service';
import { LanguageService } from '../../../../../../api/glsAdministrativeApi/services';
import { HttpErrorResponse } from '@angular/common/http';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { GlsInputCheckboxComponent } from '../../../../../../common/form/gls-input-checkbox/gls-input-checkbox.component';
import { GlsInputDropdownComponent } from '../../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { Utility } from '../../../../../../common/utilities/utility';
import { FUNCTIONALITY, PERMISSION } from '../../../../../../common/utilities/constants/profile';
import { GetApiLanguageV1$Json$Params } from '../../../../../../api/glsAdministrativeApi/fn/language/get-api-language-v-1-json';
import { GenericDropdown } from '../../../../../../common/models/generic-dropdown';
import { NATIONS_LABELS } from '../../../../../../common/utilities/constants/generic-constants';
import { TAX_CODE_OR_VAT_NUMBER_REGEX } from '../../../../../../common/utilities/constants/constant-validator';

@Component({
  selector: 'app-general-data',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, GlsInputComponent, GlsInputCheckboxComponent, GlsInputDropdownComponent],
  providers: [AdministrativeCommonService],
  templateUrl: './general-data.component.html',
  styleUrl: './general-data.component.scss'
})
export class GeneralDataComponent implements OnInit {
  isWriting = input.required<boolean>();
  generalDataFg = input.required<FormGroup>();
  // generalDataFg!: FormGroup;
  @Input() companyData: CompanyDetailResponse | null = null;
  languageList: LanguageModel[] = [];
  parentForm = input.required<FormGroup>();
  isDraft = input.required<boolean>();
  nationList = input<GenericDropdown[] | null>(null);
  nationDefault = input<GenericDropdown | null>(null);

  private readonly companyService = inject(AdministrativeCommonService);
  private languageService = inject(LanguageService);
  constructor(
    private fb: FormBuilder,
    private genericService: GenericService
  ) {
    effect(() => {
      if (this.nationDefault() && this.nationList()) {
        const nationId = this.parentForm()?.get('registeredOfficeAddress')?.get('legalAddressCountry')?.value;
        this.setNationValidators(nationId);
      }
    });
  }

  /**
   * Initializes the component and sets up the form and value changes watcher.
   * This method is called when the component is initialized.
   * It loads the language list and sets up a watcher for changes in the VAT GR field.
   * @returns void
   * */
  ngOnInit(): void {
    this.loadLanguageList();
    this.parentForm()
      ?.get('registeredOfficeAddress')
      ?.get('legalAddressCountry')
      ?.valueChanges.subscribe((value) => {
        this.setNationValidators(value);
      });
  }
  /**
   * Initializes the form group for general data.
   * This method is called when the component is initialized.
   * It sets up the form controls and their validators based on the company data.
   * @param companyData - The company data to populate the form controls.
   * @return void
   * */
  loadLanguageList(): void {
    const context = Utility.setPermissionHeaders(
      FUNCTIONALITY.networkAdministrativeCompany,
      this.isWriting() ? PERMISSION.write : PERMISSION.read
    );
    const params: GetApiLanguageV1$Json$Params = {};
    this.languageService.getApiLanguageV1$Json(params, context).subscribe({
      next: (languages: LanguageModel[]) => {
        this.languageList = languages;
        this.setDefaultValues();
      },
      error: (err: HttpErrorResponse) => {
        this.genericService.manageError(err);
      }
    });
  }

  /**
   * Sets default values for the form controls if they are not already populated.
   * @private
   */
  private setDefaultValues(): void {
    // if languageId is not populated, put the default value
    if (this.generalDataFg().get('languageId')?.value === null) {
      const languageDefault = this.languageList?.find((language) => language.isDefault)?.id ?? null;
      this.generalDataFg().get('languageId')?.setValue(languageDefault);
    }
  }

  setNationValidators(value: number): void {
    const nationSelected = this.nationList()?.find((c) => c.id === Number(value));

    const taxCodeControl = this.generalDataFg().get('taxIdcode');
    if (nationSelected?.code === NATIONS_LABELS.ISOCODE_IT) {
      taxCodeControl?.addValidators(Validators.pattern(TAX_CODE_OR_VAT_NUMBER_REGEX));
    } else {
      taxCodeControl?.setValidators([Validators.required, Validators.maxLength(16)]);
    }
    taxCodeControl?.updateValueAndValidity();
  }
}
