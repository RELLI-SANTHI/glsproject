import { ChangeDetectorRef, Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin, Subscription } from 'rxjs';

import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { GlsInputDropdownComponent } from '../../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { NationsCodeService, ProvinceService } from '../../../../../../api/glsAdministrativeApi/services';
import { NationsCodeModel, SubjectResponse } from '../../../../../../api/glsAdministrativeApi/models';
import { ProvinceModel } from '../../../../../../api/glsNetworkApi/models/province-model';
import { GlsInputCheckboxComponent } from '../../../../../../common/form/gls-input-checkbox/gls-input-checkbox.component';
import { GenericDropdown } from '../../../../../../common/models/generic-dropdown';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { SubjectValidator } from '../../../validators/subject-validator';
import { NATIONS_LABELS } from '../../../../../../common/utilities/constants/generic-constants';

@Component({
  selector: 'app-fiscal-data',
  standalone: true,
  imports: [ReactiveFormsModule, GlsInputComponent, TranslateModule, GlsInputDropdownComponent, GlsInputCheckboxComponent],
  templateUrl: './fiscal-data.component.html',
  styleUrl: './fiscal-data.component.scss'
})
export class FiscalDataComponent implements OnInit, OnDestroy {
  isWriting = input.required<boolean>();
  formFiscalData = input.required<FormGroup>();
  isDraft = input.required<boolean>();
  nations: GenericDropdown[] = [];
  provinces: ProvinceModel[] = [];
  subjectData = input<SubjectResponse | null>();

  private readonly nationsCodeService = inject(NationsCodeService);
  private readonly provinceService = inject(ProvinceService);
  private readonly genericService = inject(GenericService);

  private subscriptionList: Subscription[] = [];

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    if (this.isWriting()) {
      this.retrieveListDropdowns();
      this.changeNation();

      this.formFiscalData()
        .get('subjectType')
        ?.valueChanges.subscribe(() => {
          SubjectValidator.updatePermanentEstablishmentDetailValidators(this.formFiscalData());
        });
    }
  }

  ngOnDestroy() {
    this.subscriptionList.forEach((sub: Subscription) => sub.unsubscribe());
  }

  onCheckboxChange() {
    this.cd.detectChanges();
  }

  changeNation() {
    const subscription = this.formFiscalData()
      .get('nationId')
      ?.valueChanges.subscribe((nationId: string) => {
        const nationSelected = this.nations.find((nation) => nation.id === Number(nationId));
        this.formFiscalData().get('nationName')?.setValue(nationSelected?.value);

        const subjectType = this.formFiscalData().get('subjectType')?.value;
        const provinceIdControl = this.formFiscalData().get('provinceId');
        if (subjectType && nationSelected?.code === NATIONS_LABELS.ISOCODE_IT) {
          provinceIdControl?.setValidators(Validators.required);
        } else {
          provinceIdControl?.removeValidators(Validators.required);
        }
        provinceIdControl?.updateValueAndValidity();
      });

    if (subscription) {
      this.subscriptionList.push(subscription);
    }
  }

  /**
   * Retrieves the list of dropdowns for all dropdown form.
   */
  retrieveListDropdowns(): void {
    const payload = { body: {} };
    const nationsCall = this.nationsCodeService.postApiNationscodeV1$Json(payload);
    const provenceCall = this.provinceService.postApiProvinceV1Getall$Json(payload);
    forkJoin([nationsCall, provenceCall]).subscribe({
      next: ([nationsRes, provenceRes]) => {
        this.nations = nationsRes.map((item: NationsCodeModel) => ({
          id: item.id,
          value: `${item.isoCode} - ${item.description}`,
          code: item.isoCode
        }));
        this.provinces = provenceRes;
      },
      error: (err) => {
        this.genericService.manageError(err);
      }
    });
  }
}
