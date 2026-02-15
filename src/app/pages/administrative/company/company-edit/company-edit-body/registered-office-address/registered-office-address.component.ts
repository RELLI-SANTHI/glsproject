import { Component, inject, Input, input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { GlsInputDropdownComponent } from '../../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { NationsCodeService, ProvinceService, RegionService } from '../../../../../../api/glsAdministrativeApi/services';
import { CompanyDetailResponse, NationsCodeModel, ProvinceModel, RegionModel } from '../../../../../../api/glsAdministrativeApi/models';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { NATIONS_LABELS } from '../../../../../../common/utilities/constants/generic-constants';

@Component({
  selector: 'app-registered-office-address',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, GlsInputComponent, GlsInputDropdownComponent, CommonModule],
  templateUrl: './registered-office-address.component.html',
  styleUrl: './registered-office-address.component.scss'
})
export class RegisteredOfficeAddressComponent implements OnInit {
  isWriting = input.required<boolean>();
  officeAddressFg = input.required<FormGroup>();
  @Input() companyData: CompanyDetailResponse | null = null;
  regCountryList: NationsCodeModel[] = [];
  regionList: RegionModel[] = [];
  provOptions: ProvinceModel[] = [];

  isDraft = input.required<boolean>();

  private nationsCodeService = inject(NationsCodeService);
  private regionService = inject(RegionService);
  private provinceService = inject(ProvinceService);
  private genericService = inject(GenericService);

  protected readonly languageList = []; // This should be populated with API call
  protected readonly atecoCodeList = []; // This should be populated with API call

  /**
   * Component for managing the registered office address in the company edit form.
   * It initializes the form, fetches country and region lists, and updates the form with company data.
   */

  ngOnInit(): void {
    this.setValidatorsOnChooseRC();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const param: any = {
      body: {
        orderBy: {
          field: 'Code',
          direction: 'asc'
        }
      }
    };

    forkJoin({
      nationOptions: this.nationsCodeService.getApiNationscodeV1$Json(),
      regionOptions: this.regionService.postApiRegionV1Getall$Json(param),
      provinceOptions: this.provinceService.postApiProvinceV1Getall$Json(param)
    }).subscribe(({ nationOptions, regionOptions, provinceOptions }) => {
      this.regCountryList = nationOptions;
      this.regionList = regionOptions;
      this.provOptions = provinceOptions;

      this.setDefaultValues();
    });
  }

  private setDefaultValues(): void {
    // if nationId is not populated, put the default value
    if (this.officeAddressFg().get('legalAddressCountry')?.value === null) {
      const nationDefault = this.regCountryList.find((nation) => nation.isoCode === NATIONS_LABELS.ISOCODE_DEFAULT)?.id ?? null;
      this.officeAddressFg().get('legalAddressCountry')?.setValue(nationDefault);
    }
    this.onValueChange(this.officeAddressFg().get('legalAddressCountry')?.value);
  }

  /**
   * Sets validators on the form controls based on the choice of Italian or foreign
   * @private
   */
  private setValidatorsOnChooseRC(): void {
    this.officeAddressFg()
      ?.get('legalAddressCountry')
      ?.valueChanges.subscribe((value) => {
        this.onValueChange(value);
      });
  }

  private onValueChange(value: number | string | null): void {
    const nationIT = this.regCountryList.find((nation) => nation.isoCode === NATIONS_LABELS.ISOCODE_IT)?.id ?? null;

    const provinceControl = this.officeAddressFg().get('province');
    const regionControl = this.officeAddressFg().get('regione');

    // const postalCodeControl = this.officeAddressFg().get('postalCode');
    // const cityControl = this.officeAddressFg().get('city');
    // const addressControl = this.officeAddressFg().get('legalAddress');

    // postalCodeControl?.setValidators([Validators.required, Validators.pattern(POSTAL_CODE_IT_REGEX), Validators.maxLength(5)]);
    // cityControl?.setValidators([Validators.required, Validators.pattern(NO_SPECIAL_CHARACTER_REGEX), Validators.maxLength(35)]);
    // addressControl?.setValidators([Validators.required, Validators.pattern(AT_LEAST_ONE_ALPHANUMERIC_REGEX), Validators.maxLength(30)]);

    if (nationIT && value !== nationIT && value !== nationIT.toString()) {
      provinceControl?.removeValidators(Validators.required);
      regionControl?.removeValidators(Validators.required);

      provinceControl?.setValue(null);
      regionControl?.setValue(null);
      provinceControl?.disable();
      regionControl?.disable();
    } else {
      provinceControl?.addValidators(Validators.required);
      regionControl?.addValidators(Validators.required);

      provinceControl?.enable();
      regionControl?.enable();
    }
    provinceControl?.updateValueAndValidity();
    regionControl?.updateValueAndValidity();
    // postalCodeControl?.updateValueAndValidity();
    // cityControl?.updateValueAndValidity();
    // addressControl?.updateValueAndValidity();
  }
}
