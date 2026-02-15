import { Component, Inject } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { ConfirmationDialogData } from '../../../models/confirmation-dialog-interface';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
  /**
   * Constructor
   * @param activeModal
   * @param data
   */
  constructor(
    private readonly activeModal: NgbActiveModal,
    @Inject(NgbModal) public data: ConfirmationDialogData
  ) {
    // constructor
  }

  get additionalData() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const additionalData: any = {};
    this.data.additionalData?.forEach((data: { placeHolder: string; value: string | number }) => {
      const key = data.placeHolder.replace('{', '').replace('}', '');
      additionalData[key] = data.value;

      // { minLength: field.minLength, maxLength: field.maxLength }
    });

    return additionalData;
  }

  /**
   * Close modal method
   */
  closeModal() {
    this.activeModal.dismiss();
  }

  /**
   * On confirm method
   */
  onConfirm() {
    this.activeModal.close(true);
  }
}
