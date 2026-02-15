import { Component, effect, inject, Input, OnInit, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ReplaceBankTableComponent } from './replace-bank-table/replace-bank-table.component';
import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { PostApiBankV1$Json$Params } from '../../../../../api/glsAdministrativeApi/fn/bank/post-api-bank-v-1-json';
import { GetBankResponse } from '../../../../../api/glsAdministrativeApi/models/get-bank-response';
import { BankService } from '../../../../../api/glsAdministrativeApi/services/bank.service';
import { GenericService } from '../../../../../common/utilities/services/generic.service';
import { BankResponse } from '../../../../../api/glsAdministrativeApi/models/bank-response';
import { GlsInputDropdownComponent } from '../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { CompanyDetailResponse } from '../../../../../api/glsAdministrativeApi/models/company-detail-response';

@Component({
  selector: 'app-replace-bank-modal',
  standalone: true,
  imports: [TranslatePipe, ReplaceBankTableComponent, GlsInputComponent, GlsInputDropdownComponent],
  templateUrl: './replace-bank-modal.component.html',
  styleUrl: './replace-bank-modal.component.scss'
})
export class ReplaceBankModalComponent implements OnInit {
  @Input() listCompany: CompanyDetailResponse[] = [];
  readonly title = 'administrative.replaceBankModal.title';
  readonly cancel = 'administrative.replaceAgentModal.cancel';
  readonly confirm = 'administrative.replaceAgentModal.confirm';
  readonly abi = 'administrative.relationshipEdit.relationshipBankingData.abi';
  readonly cab = 'administrative.relationshipEdit.relationshipBankingData.cab';
  readonly selection = 'administrative.replaceAgentModal.selection';
  readonly selectBankToRep = 'administrative.replaceAgentModal.selectBankToRep';
  readonly selectBankNew = 'administrative.replaceAgentModal.selectBankNew';

  oldBankForm!: FormGroup;
  newBankForm!: FormGroup;
  companyForm!: FormGroup;
  oldBank = signal<BankResponse | null>(null);
  newBank = signal<BankResponse | null>(null);
  oldBankList = signal<BankResponse[]>([]);
  newBankList = signal<BankResponse[]>([]);
  enableBtnChange = signal<boolean>(false);
  private readonly modalRef = inject(NgbActiveModal);
  private readonly fb = inject(FormBuilder);
  private readonly bankService = inject(BankService);
  private readonly genericService = inject(GenericService);

  constructor() {
    effect(
      () => {
        this.enableBtnChange.set(!!this.oldBank() && !!this.newBank());
      },
      {
        allowSignalWrites: true
      }
    );
  }

  ngOnInit(): void {
    this.buildForms();
  }

  closeModal(): void {
    this.modalRef.dismiss();
  }

  /**
   * Replaces the old bank with the new bank and closes the modal.
   */
  replace(): void {
    this.modalRef.close({
      old: this.oldBank()?.id,
      new: this.newBank()?.id,
      idCompany: Number(this.companyForm.get('administrativeId')?.value)
    });
  }

  /**
   * Checks if the old bank search button should be disabled.
   */

  searchOldDisable(): boolean | undefined {
    const abiControl = this.oldBankForm.get('abi');
    const cabControl = this.oldBankForm.get('cab');

    const abiValid = abiControl?.value && !abiControl?.invalid;
    const cabValidOrEmpty = !cabControl?.value || !cabControl?.invalid;

    return !(abiValid && cabValidOrEmpty);
  }

  /**
   * Checks if the search button for the new bank is disabled.
   */

  searchNewDisable(): boolean | undefined {
    const abiControl = this.newBankForm.get('abi');
    const cabControl = this.newBankForm.get('cab');

    const abiValid = abiControl?.value && !abiControl?.invalid;
    const cabValidOrEmpty = !cabControl?.value || !cabControl?.invalid;

    return !(abiValid && cabValidOrEmpty);
  }

  isOldBankTableVisible = false;
  isNewBankTableVisible = false;

  /**
   * Searches for banks based on the ABI and CAB codes provided in the form.
   * @param oldBank {boolean} - If true, searches for the old bank; otherwise, searches for the new bank.
   */
  searchBank(oldBank = false): void {
    const form = oldBank ? this.oldBankForm : this.newBankForm;

    if (oldBank) {
      // reset old bank selection
      this.oldBank.set(null);
      this.isOldBankTableVisible = false;
    } else {
      // reset new bank selection
      this.newBank.set(null);
      this.isNewBankTableVisible = false;
    }

    const payload: PostApiBankV1$Json$Params = {
      body: {
        abiCode: form.get('abi')?.value,
        cabCode: form.get('cab')?.value
      }
    } as PostApiBankV1$Json$Params;
    this.bankService.postApiBankV1$Json(payload).subscribe({
      next: (res: GetBankResponse) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        oldBank ? this.oldBankList.set(res.banks) : this.newBankList.set(res.banks);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        oldBank ? (this.isOldBankTableVisible = true) : (this.isNewBankTableVisible = true);
      },
      error: (error) => {
        this.genericService.manageError(error);
      }
    });
  }

  /**
   * Builds the forms used in the component.
   * @private
   */
  private buildForms(): void {
    this.companyForm = this.fb.group({
      administrativeId: [null, [Validators.required]]
    });

    this.oldBankForm = this.fb.group({
      abi: [null, [Validators.pattern('^[0-9]{5}$'), Validators.minLength(5), Validators.maxLength(5)]],
      cab: [null, [Validators.pattern('^[0-9]{5}$'), Validators.minLength(5), Validators.maxLength(5)]]
    });
    this.newBankForm = this.fb.group({
      abi: [null, [Validators.pattern('^[0-9]{5}$'), Validators.minLength(5), Validators.maxLength(5)]],
      cab: [null, [Validators.pattern('^[0-9]{5}$'), Validators.minLength(5), Validators.maxLength(5)]]
    });
  }
}
