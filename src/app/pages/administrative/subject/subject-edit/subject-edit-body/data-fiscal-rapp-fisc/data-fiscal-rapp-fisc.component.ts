import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { TranslateModule } from '@ngx-translate/core';
import { GlsInputCheckboxComponent } from '../../../../../../common/form/gls-input-checkbox/gls-input-checkbox.component';
import { NationsCodeModel, SubjectResponse } from '../../../../../../api/glsAdministrativeApi/models';
import { GlsInputDropdownComponent } from '../../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { NationsCodeService } from '../../../../../../api/glsAdministrativeApi/services';
import { Subscription } from 'rxjs';
import { GenericDropdown } from '../../../../../../common/models/generic-dropdown';
import { TAX_CODE_OR_VAT_NUMBER_REGEX } from '../../../../../../common/utilities/constants/constant-validator';

@Component({
  selector: 'app-data-fiscal-rapp-fisc',
  standalone: true,
  imports: [GlsInputComponent, TranslateModule, ReactiveFormsModule, GlsInputCheckboxComponent, GlsInputDropdownComponent],
  templateUrl: './data-fiscal-rapp-fisc.component.html',
  styleUrl: './data-fiscal-rapp-fisc.component.scss'
})
export class DataFiscalRappFiscComponent implements OnInit, OnDestroy {
  isWriting = input.required<boolean>();
  dataFiscalRappFiscForm = input.required<FormGroup>();
  formGeneralData = input.required<FormGroup>();
  nationDefault = input<GenericDropdown | null>(null);
  subjectData = input<SubjectResponse | null>();
  isDraft = input.required<boolean>();
  nations: GenericDropdown[] = [];

  private subscriptionList: Subscription[] = [];

  private readonly nationsCodeService = inject(NationsCodeService);

  ngOnInit(): void {
    if (this.isWriting()) {
      this.retriveNationsCodeList();
      this.changeNation();
    }
  }

  ngOnDestroy() {
    this.subscriptionList.forEach((sub: Subscription) => sub.unsubscribe());
  }

  get isPhysicalPerson(): boolean {
    return this.formGeneralData().get('isPhysicalPerson')?.value;
  }

  changeNation() {
    const subscription = this.dataFiscalRappFiscForm()
      .get('countryID')
      ?.valueChanges.subscribe((nationId) => {
        const nationName = this.nations.find((nation) => nation.id === Number(nationId))?.value;
        this.dataFiscalRappFiscForm().get('countryName')?.setValue(nationName);
        if (Number(nationId) === this.nationDefault()?.id) {
          this.dataFiscalRappFiscForm()
            .get('codeId')
            ?.setValidators([Validators.required, Validators.pattern(TAX_CODE_OR_VAT_NUMBER_REGEX)]);
        } else {
          this.dataFiscalRappFiscForm()
            .get('codeId')
            ?.setValidators([Validators.required, Validators.maxLength(28)]);
          // this.dataFiscalRappFiscForm().get('codeId')?.removeValidators(Validators.required);
        }
        this.dataFiscalRappFiscForm().get('codeId')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      });

    if (subscription) {
      this.subscriptionList.push(subscription);
    }
  }

  private retriveNationsCodeList(): void {
    const payload = { body: {} };
    this.nationsCodeService.postApiNationscodeV1$Json(payload).subscribe({
      next: (nationsRes) => {
        this.nations = nationsRes.map((item: NationsCodeModel) => ({
          id: item.id,
          value: `${item.isoCode} - ${item.description}`
        }));
      }
    });
  }
}
