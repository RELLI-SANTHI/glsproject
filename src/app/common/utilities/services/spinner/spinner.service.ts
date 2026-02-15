import { Injectable, Signal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpinnerStatusService {
  private spinner = signal(false);

  get loaderState(): Signal<boolean> {
    return this.spinner.asReadonly();
  }

  show() {
    this.spinner.set(true);
  }

  hide() {
    this.spinner.set(false);
  }
}
