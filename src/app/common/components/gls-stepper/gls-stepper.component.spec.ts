/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlsStepperComponent } from './gls-stepper.component';
import { EventEmitter, TemplateRef } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subscription } from 'rxjs';
import { VIEW_MODE } from '../../app.constants';
import { GenericService } from '../../utilities/services/generic.service';

describe('GlsStepperComponent', () => {
  let component: GlsStepperComponent;
  let fixture: ComponentFixture<GlsStepperComponent>;
  beforeEach(() => {
    const mockGenericService = jasmine.createSpyObj('GenericService', [], {
      viewModeValue: VIEW_MODE.DESKTOP,
      sidebarOpenedValue: true
    });

    TestBed.configureTestingModule({
      imports: [GlsStepperComponent, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [{ provide: GenericService, useValue: mockGenericService }]
    }).compileComponents();

    fixture = TestBed.createComponent(GlsStepperComponent);
    component = fixture.componentInstance;
    component.stepChangeEvent = new EventEmitter();
  });

  it('should change step if valid and step is enabled', () => {
    spyOn(component.stepChangeEvent, 'emit');
    component.steps = [
      { title: 'Step 1', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) },
      { title: 'Step 2', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) }
    ];
    component.currentStep = 0;
    component.stepStates = [true, true];
    component.stepVisited = [true, true];
    spyOn(component, 'isStepEnabled').and.returnValue(true);
    spyOn(component, 'hasVisitedStep').and.returnValue(true);

    component.onStepChange(1);

    expect(component.currentStep).toBe(1);
    expect(component.stepStates[1]).toBeTrue();
    expect(component.stepVisited[1]).toBeTrue();
    expect(component.stepChangeEvent.emit).toHaveBeenCalledWith({
      index: 1,
      data: component.steps[0].formGroup.value
    });
  });

  it('should not change step if step is not enabled', () => {
    spyOn(component, 'isStepEnabled').and.returnValue(false);
    spyOn(component, 'hasVisitedStep').and.returnValue(false);
    component.currentStep = 0;
    component.onStepChange(1);
    expect(component.currentStep).toBe(0);
  });

  it('should enable the next step if not the last step', () => {
    component.steps = [
      { title: 'Step 1', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) },
      { title: 'Step 2', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) }
    ];
    component.currentStep = 0;
    component.stepStates = [true, false];

    component.enableNextStep();

    expect(component.stepStates[1]).toBeTrue();
  });

  it('should not enable the next step if already on the last step', () => {
    component.steps = [{ title: 'Step 1', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) }];
    component.currentStep = 0;
    component.stepStates = [true];

    component.enableNextStep();

    expect(component.stepStates.length).toBe(1);
  });

  it('should handle onStepComplete correctly', () => {
    spyOn(component, 'enableNextStep');
    spyOn(component, 'disableNextSteps');
    spyOn(component, 'onStepChange');
    spyOn(component.stepChangeEvent, 'emit');

    component.isPrevioursEnable = false;
    component.isEditMode = 'create';
    component.steps = [
      { title: 'Step 1', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) },
      { title: 'Step 2', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) }
    ];
    component.currentStep = 0;

    component.onStepComplete();

    expect(component.enableNextStep).toHaveBeenCalled();
    expect(component.disableNextSteps).toHaveBeenCalledWith(0);
    expect(component.onStepChange).toHaveBeenCalledWith(1);
  });

  it('should initialize step states correctly in create mode', () => {
    component.isEditMode = 'create';
    component.steps = [
      { title: 'Step 1', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) },
      { title: 'Step 2', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) }
    ];

    component.initializeStepStates();

    expect(component.stepStates).toEqual([true, false]);
  });

  it('should initialize step states correctly in edit mode', () => {
    component.isEditMode = 'edit';
    component.steps = [
      { title: 'Step 1', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) },
      { title: 'Step 2', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) }
    ];

    component.initializeStepStates();

    expect(component.stepStates).toEqual([true, true]);
  });

  it('should initialize step visited states correctly', () => {
    component.steps = [
      { title: 'Step 1', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) },
      { title: 'Step 2', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) }
    ];

    component.initializeStepVisited();

    expect(component.stepVisited).toEqual([false, false]);
  });

  it('should disable next steps starting from the given index', () => {
    component.steps = [
      { title: 'Step 1', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) },
      { title: 'Step 2', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) },
      { title: 'Step 3', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) }
    ];
    component.stepStates = [true, true, true];
    component.stepVisited = [true, true, true];

    component.disableNextSteps(1);

    expect(component.stepStates).toEqual([true, true, false]);
    expect(component.stepVisited).toEqual([true, true, false]);
  });

  it('should return true if the step has been visited', () => {
    component.stepVisited = [true, false, false];
    expect(component.hasVisitedStep(0)).toBeTrue();
    expect(component.hasVisitedStep(1)).toBeFalse();
  });

  it('should set the dynamic stepper width correctly', () => {
    // Spy on the `setProperty` method of `document.documentElement.style`
    const spy = spyOn(document.documentElement.style, 'setProperty');

    // Call the private method `setDynamicStepperWidth` with a specific value
    component['setDynamicStepperWidth']('10rem');

    // Verify that `setProperty` was called with the correct CSS variable and value
    expect(spy).toHaveBeenCalledWith('--dynamic-stepper-width', '10rem');

    // Call the method again with a different value
    component['setDynamicStepperWidth']('5rem');

    // Verify that `setProperty` was called again with the new value
    expect(spy).toHaveBeenCalledWith('--dynamic-stepper-width', '5rem');
  });

  it('should subscribe to form changes and disable next steps if form is invalid', () => {
    const mockFormGroup = new FormGroup({});
    const mockSubscription = new Subscription();

    spyOn(mockFormGroup.valueChanges, 'subscribe').and.callFake((observerOrNext) => {
      if (typeof observerOrNext === 'function') {
        observerOrNext({}); // Simula l'esecuzione del callback con un valore vuoto
      }

      return mockSubscription; // Restituisce un oggetto Subscription valido
    });

    component.steps = [
      { title: 'Step 1', template: {} as TemplateRef<unknown>, formGroup: mockFormGroup },
      { title: 'Step 2', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) }
    ];
    spyOn(component, 'disableNextSteps');

    component.subscribeToFormChanges();

    expect(mockFormGroup.valueChanges.subscribe).toHaveBeenCalled();
    expect(component.disableNextSteps).toHaveBeenCalledWith(0);
  });

  it('should handle onStepComplete for all conditions', () => {
    spyOn(component, 'enableNextStep');
    spyOn(component, 'disableNextSteps');
    spyOn(component, 'onStepChange');
    spyOn(component.stepChangeEvent, 'emit');

    // Case 1: isPrevioursEnable = false, isEditMode = 'create'
    component.isPrevioursEnable = false;
    component.isEditMode = 'create';
    component.steps = [
      { title: 'Step 1', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) },
      { title: 'Step 2', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) }
    ];
    component.currentStep = 0;

    component.onStepComplete();

    expect(component.enableNextStep).toHaveBeenCalled();
    expect(component.disableNextSteps).toHaveBeenCalledWith(0);
    expect(component.onStepChange).toHaveBeenCalledWith(1);

    // Case 2: isPrevioursEnable = true, formGroup valido
    component.isPrevioursEnable = true;
    component.steps[0].formGroup.setErrors(null); // Form valido

    component.onStepComplete();

    expect(component.enableNextStep).toHaveBeenCalled();

    // Case 3: isPrevioursEnable = true, formGroup non valido
    component.steps[0].formGroup.setErrors({ invalid: true }); // Form non valido

    component.onStepComplete();

    expect(component.stepChangeEvent.emit).toHaveBeenCalledWith({
      index: 0,
      data: component.steps[0].formGroup.value
    });

    // Case 4: isPrevioursEnable = false, isEditMode = 'edit'
    component.isPrevioursEnable = false;
    component.isEditMode = 'edit';

    component.onStepComplete();

    expect(component.stepChangeEvent.emit).toHaveBeenCalledWith({
      index: 0,
      data: component.steps[0].formGroup.value
    });
  });

  it('should do nothing if isPrevioursEnable is false and on the last step', () => {
    component.isPrevioursEnable = false;
    component.currentStep = 2;
    component.steps = [
      { title: 'Step 1', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) },
      { title: 'Step 2', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) },
      { title: 'Step 3', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) }
    ];
    component.stepStates = [true, true, true];
    component.stepVisited = [true, true, true];

    component.disableNextSteps(2);

    expect(component.stepStates).toEqual([true, true, true]);
    expect(component.stepVisited).toEqual([true, true, true]);
  });

  it('should return true if the step is enabled', () => {
    component.stepStates = [true, false, true];
    expect(component.isStepEnabled(0)).toBeTrue();
    expect(component.isStepEnabled(1)).toBeFalse();
    expect(component.isStepEnabled(2)).toBeTrue();
  });

  it('should subscribe to all form changes and disable next steps for each form', () => {
    const mockFormGroup1 = new FormGroup({});
    const mockFormGroup2 = new FormGroup({});
    const mockSubscription = new Subscription();

    spyOn(mockFormGroup1.valueChanges, 'subscribe').and.callFake((observerOrNext) => {
      // Ensure the callback is a function before calling it
      if (typeof observerOrNext === 'function') {
        observerOrNext({}); // Simulate a value change
      }

      return mockSubscription; // Return a valid Subscription object
    });

    spyOn(mockFormGroup2.valueChanges, 'subscribe').and.callFake((observerOrNext) => {
      // Ensure the callback is a function before calling it
      if (typeof observerOrNext === 'function') {
        observerOrNext({}); // Simulate a value change
      }

      return mockSubscription; // Return a valid Subscription object
    });

    spyOn(component, 'disableNextSteps');

    component.steps = [
      { title: 'Step 1', template: {} as TemplateRef<unknown>, formGroup: mockFormGroup1 },
      { title: 'Step 2', template: {} as TemplateRef<unknown>, formGroup: mockFormGroup2 }
    ];

    component.subscribeToFormChanges();

    expect(mockFormGroup1.valueChanges.subscribe).toHaveBeenCalled();
    expect(mockFormGroup2.valueChanges.subscribe).toHaveBeenCalled();
    expect(component.disableNextSteps).toHaveBeenCalledWith(0);
    expect(component.disableNextSteps).toHaveBeenCalledWith(1);
  });

  it('should not change step if the current form is invalid', () => {
    spyOn(component.stepChangeEvent, 'emit');
    component.steps = [
      { title: 'Step 1', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) },
      { title: 'Step 2', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) }
    ];
    component.currentStep = 0;
    component.steps[0].formGroup.setErrors({ invalid: true });

    component.onStepChange(1);

    expect(component.currentStep).toBe(0);
    expect(component.stepChangeEvent.emit).not.toHaveBeenCalled();
  });

  it('should set the dynamic stepper width to different values', () => {
    const spy = spyOn(document.documentElement.style, 'setProperty');

    component['setDynamicStepperWidth']('10rem');
    expect(spy).toHaveBeenCalledWith('--dynamic-stepper-width', '10rem');

    component['setDynamicStepperWidth']('5rem');
    expect(spy).toHaveBeenCalledWith('--dynamic-stepper-width', '5rem');
  });

  it('should not change step if step is not enabled and not visited', () => {
    spyOn(component, 'isStepEnabled').and.returnValue(false);
    spyOn(component, 'hasVisitedStep').and.returnValue(false);
    component.currentStep = 0;

    component.onStepChange(1);

    expect(component.currentStep).toBe(0);
  });

  it('should disable the current step if isPrevioursEnable is false and not on the last step', () => {
    component.isPrevioursEnable = false;
    component.currentStep = 1;
    component.steps = [
      { title: 'Step 1', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) },
      { title: 'Step 2', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) },
      { title: 'Step 3', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) }
    ];
    component.stepStates = [true, true, true];

    component.disableNextSteps(1);

    expect(component.stepStates).toEqual([true, false, true]);
  });

  it('should handle formGroup without valueChanges gracefully', () => {
    const mockFormGroup = {
      valueChanges: of() // Simula un Observable vuoto
    } as Partial<FormGroup> as FormGroup; // Usa Partial per evitare errori di tipo

    component.steps = [{ title: 'Step 1', template: {} as TemplateRef<unknown>, formGroup: mockFormGroup }];

    expect(() => component.subscribeToFormChanges()).not.toThrow();
  });
  it('should emit stepChangeEvent if form is invalid and isPrevioursEnable is true', () => {
    spyOn(component.stepChangeEvent, 'emit');
    component.isPrevioursEnable = true;
    component.steps = [{ title: 'Step 1', template: {} as TemplateRef<unknown>, formGroup: new FormGroup({}) }];
    component.currentStep = 0;
    component.steps[0].formGroup.setErrors({ invalid: true });

    component.onStepComplete();

    expect(component.stepChangeEvent.emit).toHaveBeenCalledWith({
      index: 0,
      data: component.steps[0].formGroup.value
    });
  });

  it('should call initializeStepStates, initializeStepVisited, and subscribeToFormChanges on ngOnInit', () => {
    spyOn(component, 'initializeStepStates');
    spyOn(component, 'initializeStepVisited');
    spyOn(component, 'subscribeToFormChanges');

    component.ngOnInit();

    expect(component.initializeStepStates).toHaveBeenCalled();
    expect(component.initializeStepVisited).toHaveBeenCalled();
    expect(component.subscribeToFormChanges).toHaveBeenCalled();
  });

  it('should set dynamic stepper width correctly in the constructor', () => {
    const mockGenericService = TestBed.inject(GenericService) as jasmine.SpyObj<GenericService>;
    const spySetDynamicStepperWidth = spyOn<any>(GlsStepperComponent.prototype, 'setDynamicStepperWidth');

    // Caso 1: DESKTOP con sidebar aperta
    Object.defineProperty(mockGenericService, 'viewModeValue', { get: () => VIEW_MODE.DESKTOP });
    Object.defineProperty(mockGenericService, 'sidebarOpenedValue', { get: () => true });
    const fixture1 = TestBed.createComponent(GlsStepperComponent);
    fixture1.detectChanges();
    expect(spySetDynamicStepperWidth).toHaveBeenCalledWith('15.60rem');

    // Caso 2: DESKTOP con sidebar chiusa
    Object.defineProperty(mockGenericService, 'sidebarOpenedValue', { get: () => false });
    const fixture2 = TestBed.createComponent(GlsStepperComponent);
    fixture2.detectChanges();
    expect(spySetDynamicStepperWidth).toHaveBeenCalledWith('4.25rem');

    // Caso 3: MOBILE
    Object.defineProperty(mockGenericService, 'viewModeValue', { get: () => VIEW_MODE.MOBILE });
    const fixture3 = TestBed.createComponent(GlsStepperComponent);
    fixture3.detectChanges();
    expect(spySetDynamicStepperWidth).toHaveBeenCalledWith('0rem');

    // Caso 4: Default (non MOBILE o DESKTOP)
    Object.defineProperty(mockGenericService, 'viewModeValue', { get: () => 'UNKNOWN' });
    const fixture4 = TestBed.createComponent(GlsStepperComponent);
    fixture4.detectChanges();
    expect(spySetDynamicStepperWidth).toHaveBeenCalledWith('4.25rem');
  });
});
