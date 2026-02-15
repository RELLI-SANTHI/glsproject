import { AfterViewInit, ChangeDetectorRef, Component, effect, inject, input, model, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { GlsInputDropdownComponent } from '../../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { GlsInputCheckboxComponent } from '../../../../../../common/form/gls-input-checkbox/gls-input-checkbox.component';
import { GeneralModalComponent } from '../../../../../../common/components/general-modal/general-modal.component';
import { GeneralTableComponent } from '../../../../../../common/components/general-table/general-table.component';
import { AtecoModalComponent } from '../ateco-modal/ateco-modal.component';
import { CURRECY_COLUMN_LIST } from '../../../constants/subject-constants';
import { CurrencyService } from '../../../../../../api/glsAdministrativeApi/services/currency.service';
import { CurrencyModel } from '../../../../../../api/glsAdministrativeApi/models/currency-model';
import { RegionService } from '../../../../../../api/glsAdministrativeApi/services/region.service';
import { RegionModel } from '../../../../../../api/glsAdministrativeApi/models/region-model';
import { LanguageService } from '../../../../../../api/glsAdministrativeApi/services/language.service';
import { LanguageModel } from '../../../../../../api/glsAdministrativeApi/models/language-model';
import { AtecoCodeModel } from '../../../../../../api/glsAdministrativeApi/models/ateco-code-model';
import { ProvinceModel } from '../../../../../../api/glsNetworkApi/models/province-model';
import { ProvinceService } from '../../../../../../api/glsAdministrativeApi/services/province.service';
import { GenericDropdown } from '../../../../../../common/models/generic-dropdown';
import { Utility } from '../../../../../../common/utilities/utility';
import { UserProfileService } from '../../../../../../common/utilities/services/profile/user-profile.service';
import { CorporateGroupWithAdministrativeModel, UserDetailsModel } from '../../../../../../api/glsUserApi/models';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../../../../common/utilities/constants/profile';
import { CorporateGroupService } from '../../../../../../api/glsUserApi/services';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { MODAL_XL } from '../../../../../../common/utilities/constants/modal-options';
import { CurrencyFields, SubjectResponse } from '../../../../../../api/glsAdministrativeApi/models';
import { AtecoCodeService } from '../../../../../../api/glsAdministrativeApi/services';
import { WarningStatusComponent } from '../../../../../../common/components/warning-status/warning-status.component';
import { SubjectValidator } from '../../../validators/subject-validator';
import { NATIONS_LABELS } from '../../../../../../common/utilities/constants/generic-constants';
import {
  AT_LEAST_ONE_ALPHANUMERIC_REGEX,
  NO_SPECIAL_CHARACTER_REGEX,
  TAX_CODE_OR_VAT_NUMBER_REGEX
} from '../../../../../../common/utilities/constants/constant-validator';

@Component({
  selector: 'app-general-data',
  standalone: true,
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    GlsInputComponent,
    GlsInputDropdownComponent,
    GlsInputCheckboxComponent,
    CommonModule,
    WarningStatusComponent
  ],
  templateUrl: './general-data.component.html',
  styleUrl: './general-data.component.scss'
})
export class GeneralDataComponent implements OnInit, AfterViewInit {
  isWriting = input.required<boolean>();
  formGeneralData = input.required<FormGroup>();

  formGeneralDataForm!: FormGroup;
  naturalPersonValue = 'administrative.generalData.radioValues.naturalPerson';
  legalPersonValue = 'administrative.generalData.radioValues.legalPerson';
  today: Date = new Date();
  selectedAtecoCode: AtecoCodeModel | undefined;
  selectedCurrency: CurrencyModel | undefined;
  Utility = Utility;
  PROFILE = PROFILE;
  warningOrError = model<boolean>(false);
  subjectData = input<SubjectResponse | null>();
  nationList = input<GenericDropdown[] | null>(null);
  nationDefault = input<GenericDropdown | null>(null);
  protected corporateGroupList: GenericDropdown[] = [];
  protected regionList: RegionModel[] = [];
  protected languageList: LanguageModel[] = [];
  protected regOffProvList: ProvinceModel[] = [];
  protected readonly userProfileService = inject(UserProfileService);
  protected user!: UserDetailsModel | null;
  private listCurrency: CurrencyModel[] = [];
  private atecoCodeList: AtecoCodeModel[] = [];
  private readonly modalService = inject(NgbModal);
  private readonly translateService = inject(TranslateService);
  private readonly columnsCurTable = CURRECY_COLUMN_LIST;
  private readonly currencyService = inject(CurrencyService);
  private readonly regionService = inject(RegionService);
  private readonly languageService = inject(LanguageService);
  private readonly provinceService = inject(ProvinceService);
  private readonly corporateGroupService = inject(CorporateGroupService);
  private readonly atecoCodeService = inject(AtecoCodeService);
  private readonly fb = inject(FormBuilder);
  private readonly genericService = inject(GenericService);
  isDraft = input.required<boolean>();

  constructor(private cdRef: ChangeDetectorRef) {
    this.userProfileService.profile$.subscribe((profileValue) => {
      this.user = profileValue;
    });

    effect(() => {
      if (this.nationDefault() && this.nationList()) {
        this.setNationDefault();
        this.setNationValidators();
      }
    });
  }

  ngOnInit(): void {
    this.setValidatorsOnChooseRC();
    this.formGeneralDataForm = this.fb.group({
      region: this.fb.control({ value: '', disabled: false }),
      province: this.fb.control({ value: '', disabled: false })
    });

    this.formGeneralData()
      .get('isPhysicalPerson')
      ?.valueChanges.subscribe(() => {
        SubjectValidator.updatePersonValidators(this.formGeneralData());
        SubjectValidator.updateVatGroupValidators(this.formGeneralData());
      });

    if (this.isWriting()) {
      this.retrieveListDropdowns();
    }
  }

  /**
   * Manually triggers change detection after the view has been initialized.
   * This is necessary to handle dynamic form state (e.g., validity or control status)
   * that may change after the initial rendering, avoiding ExpressionChangedAfterItHasBeenCheckedError.
   */
  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
  }

  /**
   * Opens a modal to select an Ateco code.
   */
  openAtecoCodeModal(): void {
    const modalRef = this.modalService.open(AtecoModalComponent, MODAL_XL);

    modalRef.componentInstance.title = this.translateService.instant('administrative.generalData.modalValues.titleAteco');
    modalRef.componentInstance.cancelText = this.translateService.instant('administrative.generalData.modalValues.btnCancel');
    modalRef.componentInstance.confirmText = this.translateService.instant('administrative.generalData.modalValues.btnConfirm');

    modalRef.result
      .then((selectedRows) => {
        if (selectedRows) {
          this.selectedAtecoCode = selectedRows;
          this.formGeneralData().get('atecoCodeId')?.setValue(this.selectedAtecoCode?.id);
          this.warningOrError.set(false);
        }
      })
      .catch((err) => {
        console.error('Modal dismissed without selection', err);
      });
  }

  removeAteco(): void {
    this.selectedAtecoCode = undefined;
    this.formGeneralData().get('atecoCodeId')?.setValue(null);
    this.warningOrError.set(false);
  }

  removeCurrency(): void {
    this.selectedCurrency = undefined;
    this.formGeneralData().get('currencyId')?.setValue(null);
  }

  /**
   * Handles the change of value in the form control.
   * @param value
   * @param controlName
   */
  onValueChange(value: string | number, controlName: string): void {
    const control = this.formGeneralData().get(controlName);
    if (control) {
      control.setValue(Number(value));
    }
    if (controlName === 'nationId') {
      // const nationSelected = this.nationList()?.find((c) => c.id === Number(value));
      // this.formGeneralData().get('nationName')?.setValue(nationSelected?.value);
      // this.setNationValidators(Number(nationSelected?.id));
    }
  }

  setNationValidators(): void {
    const nationId = this.formGeneralData()?.get('nationId')?.value;
    const nationSelected = this.nationList()?.find((c) => c.id === Number(nationId));
    this.formGeneralData().get('nationName')?.setValue(nationSelected?.value);

    const provinceIdControl = this.formGeneralData().get('provinceId');
    const regionIdControl = this.formGeneralData().get('regionId');
    // const postalCodeControl = this.formGeneralData().get('postCode');
    const cityControl = this.formGeneralData().get('city');
    const addressControl = this.formGeneralData().get('address');
    const taxCodeControl = this.formGeneralData().get('taxCode');
    cityControl?.setValidators([Validators.required, Validators.pattern(NO_SPECIAL_CHARACTER_REGEX), Validators.maxLength(35)]);
    if (nationSelected?.code === NATIONS_LABELS.ISOCODE_IT) {
      provinceIdControl?.addValidators(Validators.required);
      regionIdControl?.addValidators(Validators.required);
      // postalCodeControl?.addValidators(Validators.pattern('^[0-9]{5}$'));
      addressControl?.setValidators([Validators.required, Validators.pattern(AT_LEAST_ONE_ALPHANUMERIC_REGEX), Validators.maxLength(60)]);
      taxCodeControl?.addValidators(Validators.pattern(TAX_CODE_OR_VAT_NUMBER_REGEX));
      this.formGeneralData().get('provinceId')?.enable();
      this.formGeneralData().get('regionId')?.enable();
    } else {
      provinceIdControl?.setValue(null);
      regionIdControl?.setValue(null);
      provinceIdControl?.removeValidators(Validators.required);
      regionIdControl?.removeValidators(Validators.required);
      // postalCodeControl?.setValidators([Validators.required, Validators.maxLength(5)]);
      addressControl?.setValidators([Validators.required, Validators.pattern(AT_LEAST_ONE_ALPHANUMERIC_REGEX), Validators.maxLength(30)]);
      taxCodeControl?.setValidators([Validators.required, Validators.maxLength(16)]);
      this.formGeneralData().get('provinceId')?.setValue(null);
      this.formGeneralData().get('regionId')?.setValue(null);
      this.formGeneralData().get('provinceId')?.disable();
      this.formGeneralData().get('regionId')?.disable();
    }
    provinceIdControl?.updateValueAndValidity();
    regionIdControl?.updateValueAndValidity();
    // postalCodeControl?.updateValueAndValidity();
    cityControl?.updateValueAndValidity();
    addressControl?.updateValueAndValidity();
    taxCodeControl?.updateValueAndValidity();
  }

  /**
   * Returns the label for the currency button based on whether a currency is selected.
   */
  getCurrencyBtnLabel(): string {
    if (this.selectedCurrency) {
      return 'administrative.relationshipEdit.relationshipBillingData.changePaymentCode';
    } else {
      return 'administrative.relationshipEdit.relationshipBillingData.choosePaymentCode';
    }
  }

  /**
   * Returns the label for the currency button based on whether a currency is selected.
   */
  getAtecoBtnLabel(): string {
    if (this.selectedAtecoCode) {
      return 'administrative.relationshipEdit.relationshipBillingData.changePaymentCode';
    } else {
      return 'administrative.relationshipEdit.relationshipBillingData.choosePaymentCode';
    }
  }

  /**
   * Opens a modal to select a currency.
   */
  openCurrencyModal() {
    const modalRef = this.modalService.open(GeneralModalComponent, MODAL_XL);

    modalRef.componentInstance.title = this.translateService.instant('administrative.generalData.modalValues.titolo');
    modalRef.componentInstance.cancelText = this.translateService.instant('administrative.generalData.modalValues.btnCancel');
    modalRef.componentInstance.confirmText = this.translateService.instant('administrative.generalData.modalValues.btnConfirm');

    modalRef.componentInstance.contentComponent = GeneralTableComponent;
    modalRef.componentInstance.contentInputs = {
      columns: this.columnsCurTable,
      data: this.listCurrency
    };

    modalRef.result.then((selectedRows) => {
      if (selectedRows) {
        this.selectedCurrency = selectedRows;
        this.formGeneralData().get('currencyId')?.setValue(this.selectedCurrency?.id);
      }
    });
  }

  /**
   * Sets default values for the form controls if they are not already populated.
   * @private
   */
  private setDefaultValues(): void {
    // if languageId is not populated, put the default value
    if (this.formGeneralData().get('languageId')?.value === null) {
      const languageDefault = this.languageList?.find((language) => language.isDefault)?.id ?? null;
      this.formGeneralData().get('languageId')?.setValue(languageDefault);
    }
    // if nationId is not populated, put the default value
    if (this.formGeneralData().get('currencyId')?.value === null) {
      this.selectedCurrency =
        this.listCurrency.find((currency) => currency.isDefault) ?? this.listCurrency.find((currency) => currency.acronym === 'EUR');
      this.formGeneralData().get('currencyId')?.setValue(this.selectedCurrency?.id);
    }
    this.onValueChange(this.formGeneralData().get('nationId')?.value, 'nationId');
  }

  private setNationDefault(): void {
    // if nationId is not populated, put the default value
    if (this.formGeneralData().get('nationId')?.value === null || this.formGeneralData().get('nationId')?.value === 0) {
      const nationDefault = this.nationList()?.find((nation) => nation.isDefault);

      this.formGeneralData()
        .get('nationId')
        ?.setValue(nationDefault?.id ?? null);
      this.formGeneralData()
        .get('nationName')
        ?.setValue(nationDefault?.value ?? '--');
    }
  }

  /**
   * Sets validators on the form controls based on the choice of Italian or foreign
   * @private
   */
  private setValidatorsOnChooseRC(): void {
    this.formGeneralData()
      ?.get('nationId')
      ?.valueChanges.subscribe(() => {
        this.setNationValidators();
      });
  }

  /**
   * Retrieves the list of dropdowns for all dropdown form.
   * @private
   */
  // eslint-disable-next-line max-lines-per-function
  private retrieveListDropdowns(): void {
    const payload = { body: {} };
    const payloadWithSort = { body: { orderBy: { field: 'Acronym' as CurrencyFields, direction: 'asc' } } };

    const context = Utility.setPermissionHeaders(FUNCTIONALITY.networkAdministrativeSubject, PERMISSION.write);

    const regionsCall = this.regionService.postApiRegionV1Getall$Json(payload, context);
    const languageCall = this.languageService.postApiLanguageV1$Json(payload);
    const provinceCall = this.provinceService.postApiProvinceV1Getall$Json(payload);
    const currencyCall = this.currencyService.postApiCurrencyV1$Json(payloadWithSort);
    const corporateGroupCall = this.corporateGroupService.getApiCorporategroupV1$Json();
    const atecoCodeCall = this.atecoCodeService.postApiAtecocodeV1$Json(payload);

    forkJoin([regionsCall, languageCall, provinceCall, currencyCall, corporateGroupCall, atecoCodeCall]).subscribe({
      next: ([regionsRes, languageRes, provinceRes, currencyRes, corporateGroupRes, atecoCodes]) => {
        this.regionList = regionsRes;
        this.languageList = languageRes;
        this.regOffProvList = provinceRes;
        this.listCurrency = currencyRes;
        this.atecoCodeList = atecoCodes.atecoCodes ?? [];
        this.listCurrency = currencyRes ?? [];

        const newObject = { id: corporateGroupRes[0].id, name: corporateGroupRes[0].corporateName }; // create new object in administrative array
        corporateGroupRes[0].administratives.push(newObject); // push new object into administrative array
        this.corporateGroupList = (corporateGroupRes || []).map((item: CorporateGroupWithAdministrativeModel) => ({
          // create dropdown list
          id: item.id,
          value: item.corporateName
        }));

        this.formGeneralData().get('corporateGroupId')?.setValue(newObject.id); // set default value for corporate group
        this.setDefaultValues();

        const atecoId = this.formGeneralData().get('atecoCodeId')?.value;
        const currencyId = this.formGeneralData().get('currencyId')?.value;

        if (atecoId && this.atecoCodeList?.length) {
          this.selectedAtecoCode = this.atecoCodeList.find((c) => c.id === atecoId);
        }
        if (currencyId && this.listCurrency?.length) {
          this.selectedCurrency = this.listCurrency.find((c) => c.id === currencyId);
        }
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }
}
