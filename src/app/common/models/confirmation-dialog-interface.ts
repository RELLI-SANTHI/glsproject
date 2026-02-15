export interface ConfirmationDialogData {
  title: string;
  content: string;
  content2?: string;
  confirmText: string;
  additionalData?: { placeHolder: string; value: string | number }[];
  showCancel: boolean;
  cancelText?: string;
  userName?: string;
}
