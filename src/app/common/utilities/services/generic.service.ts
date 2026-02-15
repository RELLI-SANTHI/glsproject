import { computed, Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VIEW_MODE } from '../../app.constants';
import { HttpErrorResponse } from '@angular/common/http';
import { Utility } from '../utility';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogData } from '../../models/confirmation-dialog-interface';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MODAL_MD } from '../constants/modal-options';

@Injectable({
  providedIn: 'root'
})
export class GenericService {
  resizeMainPage = signal('3.5rem');
  viewMode = signal<VIEW_MODE>(VIEW_MODE.DESKTOP);
  sidebarOpened = signal(false);
  isLandscape = signal(false);
  isUserImpressed = signal(false);
  defaultValue = computed(() => this.isUserImpressed() ? '7rem' : '3.5rem');
  dialogData!: ConfirmationDialogData;
  modalRef!: NgbModalRef;

  private routePageType = new BehaviorSubject(null);

  constructor(private modalService: NgbModal) {}

  get viewModeValue() {
    return this.viewMode();
  }

  get sidebarOpenedValue() {
    return this.sidebarOpened();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getPageType(data: any) {
    this.routePageType.next(data);
  }

  /**
   * Opens an error modal with the provided title, message, and additional data.
   * @param title - The title of the modal.
   * @param errorMessage - The error message to display.
   * @param additionalData - Optional additional data to display in the modal.
   * @param confirmText
   * @param callback
   * @param showCancel
   */
  // eslint-disable-next-line max-lines-per-function
  openErrorModal(
    title: string,
    errorMessage: string,
    additionalData?: {
      placeHolder: string;
      value: string | number;
    }[],
    confirmText?: string,
    callback?: () => void,
    showCancel?: boolean
  ): void {
    this.dialogData = {
      title: title,
      content: errorMessage,
      additionalData,
      showCancel: showCancel ?? false,
      confirmText: confirmText ?? 'ok'
    };

    try {
      this.modalRef = this.modalService.open(ConfirmationDialogComponent, MODAL_MD);

      if (this.modalRef?.componentInstance) {
        this.modalRef.componentInstance.data = this.dialogData;
      }

      this.modalRef?.result
        ?.then((result: string) => {
          if (result) {
            // handle result if needed
            if (callback) {
              callback();
            }
          }
        })
        .catch(() => {
          // handle dismiss or error
        });
    } catch (error) {
      console.error('Failed to open modal:', error);
    }
  }

  /**
   * Handles HTTP errors by logging them, extracting error details, and displaying an error modal.
   * @param err
   */
  manageError(err: HttpErrorResponse): void {
    Utility.logErrorForDevEnvironment(err);
    try {
      // verify if 'innerException' exist in err.error
      let errorMessage = 'serviceMessage.genericError';
      let additionalData: { placeHolder: string; value: string | number }[] | undefined;
      if (err.error && typeof err.error === 'object' && 'innerException' in err.error) {
        errorMessage = 'serviceMessage.' + (err.error.innerException?.internalCode || 'genericError');
        additionalData = err.error?.innerException?.additionalData;
      } else {
        const errorJson = JSON.parse(err.error);
        errorMessage = 'serviceMessage.' + (errorJson.innerException?.internalCode || 'genericError');
        additionalData = errorJson.innerException?.additionalData;
      }
      this.openErrorModal('attention', errorMessage, additionalData);
    } catch {
      this.openErrorModal('attention', 'serviceMessage.genericError');
    }
  }

  /**
   * Resizes the main page based on whether the user is impressed or not.
   */
  resizePage(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.isUserImpressed() ? this.resizeMainPage.update(() => '12rem') : this.resizeMainPage.update(() => '8.75rem');
  }
}
