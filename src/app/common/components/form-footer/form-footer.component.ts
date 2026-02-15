import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { VIEW_MODE } from '../../app.constants';
import { GenericService } from '../../utilities/services/generic.service';

@Component({
  selector: 'app-form-footer',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './form-footer.component.html',
  styleUrl: './form-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFooterComponent {
  showDraftExit = input<boolean>(true);
  disableDraftExit = input<boolean>(false);
  labelDraftExit = input<string>('formFooter.saveDraftExit');
  showNextBtn = input<boolean>(true);
  disableNextBtn = input<boolean>(false);
  labelNextBtn = input<string>('');
  exitEvent = output();
  saveDraftExitEvent = output();
  nextBtnEvent = output();
  private isSmallMobile = signal(false);
  private readonly genericService = inject(GenericService);

  constructor() {
    effect(
      () => {
        const typeView = this.genericService.viewModeValue;
        const sidebarOpened = this.genericService.sidebarOpenedValue;

        this.isSmallMobile.set(typeView === VIEW_MODE.MOBILE);

        if (typeView === VIEW_MODE.DESKTOP) {
          if (sidebarOpened) {
            this.setDynamicStepperWidth('15.60rem');
          } else {
            this.setDynamicStepperWidth('4.25rem');
          }
        } else {
          switch (typeView) {
            case VIEW_MODE.MOBILE:
              this.setDynamicStepperWidth('0rem');
              break;
            default:
              this.setDynamicStepperWidth('4.25rem');
              break;
          }
        }
      },
      {
        allowSignalWrites: true
      }
    );
  }

  /**
   * Emit event wht clicked the "Exit" button.
   */
  goToExit(): void {
    this.exitEvent.emit();
  }

  /**
   * Emit event wht clicked the "Save Draft and exit" button.
   */
  saveDraftExit(): void {
    this.saveDraftExitEvent.emit();
  }

  /**
   * Emit event wht clicked the "Next" button.
   */
  nextBtnEv(): void {
    this.nextBtnEvent.emit();
  }

  /**
   * This method set the width component when change the left sidebar
   * @param width the width of component.
   */
  private setDynamicStepperWidth(width: string): void {
    document.documentElement.style.setProperty('--dynamic-stepper-width', width);
  }
}
