import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertMessage } from '../../../models/alert-message';

@Injectable({
  providedIn: 'root'
})
export class MessageStatusService {
  private _messageSubject = new BehaviorSubject<string | null>(null);
  private warningMessage = signal<AlertMessage | null>(null);
  private successMessage = signal<AlertMessage | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private messageParams = signal<Record<string, any>>({});

  get messageState$(): Observable<string | null> {
    return this._messageSubject.asObservable();
  }

  show(text: string) {
    this._messageSubject.next(text);
  }

  hide() {
    this._messageSubject.next(null);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setWarningMessage(message: AlertMessage | null, param?: Record<string, any>): void {
    this.warningMessage.set(message);
    this.messageParams.set(param ?? {});
  }

  getWarningMessage(): AlertMessage | null {
    return this.warningMessage();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setSuccessMessage(message: AlertMessage | null, param?: Record<string, any>): void {
    this.successMessage.set(message);
    this.messageParams.set(param ?? {});
  }

  getSuccessMessage(): AlertMessage | null {
    return this.successMessage();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getParams(): Record<string, any> {
    return this.messageParams();
  }
}
