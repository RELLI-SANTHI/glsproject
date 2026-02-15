import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
  TemplateRef
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GenericService } from '../../utilities/services/generic.service';
import { VIEW_MODE } from '../../app.constants';

@Component({
  selector: 'gls-stepper',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './gls-stepper.component.html',
  styleUrl: './gls-stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlsStepperComponent implements OnInit {
  @Input() steps: { title: string; template: TemplateRef<unknown>; formGroup: FormGroup }[] = [];
  @Input() isPrevioursEnable?: boolean = true;
  @Input() enableStepsNavigation = false;
  @Input() currentStep = 0;
  @Input() isEditMode = 'create'; // default false
  @Input() preserveContent = false; // default false
  @Output() stepChangeEvent = new EventEmitter();
  stepStates: boolean[] = [];
  stepVisited: boolean[] = [];
  isSmallMobile = signal(false);
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
   * * @description This method is called when the component is initialized.
   * * It initializes the step states and subscribes to form changes for each step.
   * * It sets the initial state of the stepper based on the edit mode and previous step enablement.
   */
  ngOnInit() {
    this.initializeStepStates();
    this.initializeStepVisited();
    this.subscribeToFormChanges();
  }
  /**
   * * @description This method initializes the step states based on the edit mode and previous step enablement.
   * * If the edit mode is 'edit', all steps are enabled. Otherwise, only the first step is enabled.
   */
  initializeStepStates() {
    if (this.isEditMode === 'edit') {
      this.stepStates = this.steps.map(() => true);
    } else {
      this.stepStates = this.steps.map((_, index) => index === 0);
    }
  }
  /**
   * * @description This method initializes the step visited states to false for all steps.
   * * It is used to track whether a step has been visited or not.
   */
  initializeStepVisited() {
    this.stepVisited = this.steps.map(() => false);
  }
  /**
   * * @description This method subscribes to form changes for each step.
   * * It disables the next steps if the current step is not valid and previous step enablement is false.
   */
  subscribeToFormChanges() {
    this.steps.forEach((step, index) => {
      step.formGroup.valueChanges.subscribe(() => {
        // if (!step.formGroup.valid && this.isPrevioursEnable) {
        this.disableNextSteps(index);
        // }
      });
    });
  }
  /**
   * * @description This method is called when the user clicks on a step.
   * * It checks if the clicked step is enabled and if the previous step is enabled.
   * @param index
   * @returns
   */
  isStepEnabled(index: number): boolean {
    return this.stepStates[index] || this.enableStepsNavigation;
  }
  /**
   * * @description This method is called when the user clicks on a step.
   * * It checks if the clicked step is enabled and if the previous step is enabled.
   * @param index
   */
  onStepChange(index: number) {
    if (index !== this.currentStep && (this.isStepEnabled(index) || (this.isPrevioursEnable && this.hasVisitedStep(index)))) {
      if (this.steps[this.currentStep].formGroup.valid) {
        this.currentStep = index;
        this.stepStates[this.currentStep] = true;
        this.stepVisited[index] = true;
      }
      this.stepChangeEvent.emit({ index, data: this.steps[this.currentStep].formGroup.value });
    }
  }
  /**
   * * @description This method is called when the user clicks on the next button.
   * * It checks if the current step is valid and if the previous step is enabled.
   * * If the current step is valid, it enables the next step and disables the next steps.
   * @param event
   * @param i
   */
  onKeyDownHandler(event: KeyboardEvent, i: number): void {
    if ((event.key === 'Enter' || event.key === ' ') &&
        i !== this.currentStep &&
        (this.isStepEnabled(i) || (this.isPrevioursEnable && this.hasVisitedStep(i)))) {
      this.onStepChange(i);
      event.preventDefault(); // space key के default scroll को रोकने के लिए
    }
  }
  /**
   * * @description This method is called when the user clicks on the next button.
   * * It checks if the current step is valid and if the previous step is enabled.
   * * If the current step is valid, it enables the next step.
   */
  enableNextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.stepStates[this.currentStep + 1] = true;
    }
  }
  /**
   * * @description This method is called when the user clicks on the next button.
   * * It disables the next steps based on the current step and previous step enablement.
   * @param startIndex
   */
  disableNextSteps(startIndex: number) {
    if (!this.isPrevioursEnable && this.currentStep < this.steps.length - 1) {
      this.stepStates[this.currentStep] = false;
    } else {
      for (let i = startIndex + 1; i < this.steps.length; i++) {
        this.stepStates[i] = false;
        this.stepVisited[i] = false;
      }
    }
  }
  /**
   * * @description This method is called when the user clicks on the next button.
   * * It checks if the current step is valid and if the previous step is enabled.
   * * If the current step is valid, it enables the next step and disables the next steps.
   */
  onStepComplete() {
    if (!this.isPrevioursEnable && this.isEditMode === 'create') {
      this.enableNextStep();
      this.disableNextSteps(this.currentStep);
    } else if (this.isPrevioursEnable && this.steps[this.currentStep].formGroup.valid) {
      this.enableNextStep();
    } else {
      this.stepChangeEvent.emit({ index: this.currentStep, data: this.steps[this.currentStep].formGroup.value });
    }
    this.onStepChange(this.currentStep + 1);
  }
  /**
   * * * @description This method is called when the user clicks on the previous button.
   * * It checks if the current step is valid and if the previous step is enabled.
   * @param index
   * @returns
   */
  hasVisitedStep(index: number): boolean {
    return this.stepVisited[index];
  }
  /**
   * * @description This method is called when the user clicks on the previous button.
   * * It checks if the current step is valid and if the previous step is enabled.
   * @param width
   */
  private setDynamicStepperWidth(width: string): void {
    document.documentElement.style.setProperty('--dynamic-stepper-width', width);
  }
}
