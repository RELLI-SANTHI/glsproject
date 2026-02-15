/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';
import { of } from 'rxjs';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';

import { ViewDetailsWriteComponent } from './view-details-write.component';
import { GlsInputCheckboxComponent } from '../../../form/gls-input-checkbox/gls-input-checkbox.component';
import { GlsInputComponent } from '../../../form/gls-input/gls-input.component';

class FakeLoader implements TranslateLoader {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTranslation(lang: string) {
    return of({});
  }
}

class FakeParser extends TranslateParser {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  interpolate(expr: string | Function, params?: any): string {
    if (typeof expr === 'function') {
      return expr(params); // Chiamata sicura solo se expr è una funzione
    }

    return expr; // Restituisce expr direttamente se è una stringa
  }

  getValue(target: any, key: string): any {
    return target[key];
  }
}

describe('ViewDetailsWriteComponent', () => {
  let component: ViewDetailsWriteComponent;
  let fixture: ComponentFixture<ViewDetailsWriteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
          parser: { provide: TranslateParser, useClass: FakeParser }
        }),
        GlsInputCheckboxComponent,
        GlsInputComponent,
        ViewDetailsWriteComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewDetailsWriteComponent);
    component = fixture.componentInstance;

    // Imposta i segnali
    signalSetFn(component.fieldsListInput[SIGNAL], [
      {
        fieldName: 'field1',
        subSection: 'sub1',
        isVisible: true,
        isRequired: false,
        fieldType: 'text', // Aggiungi un valore appropriato
        id: 1, // Aggiungi un ID univoco
        section: 'section1' // Aggiungi una sezione appropriata
      },
      {
        fieldName: 'field2',
        subSection: 'sub2',
        isVisible: false,
        isRequired: true,
        fieldType: 'checkbox', // Aggiungi un valore appropriato
        id: 2, // Aggiungi un ID univoco
        section: 'section2' // Aggiungi una sezione appropriata
      }
    ]);
    signalSetFn(
      component.formGroupInput[SIGNAL],
      new FormGroup({
        field1: new FormControl(false),
        field1_toggle: new FormControl(false),
        field2: new FormControl(false),
        field2_toggle: new FormControl(false)
      })
    );

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize subsection order correctly', () => {
    component.ngOnInit();
    expect(component['subSectionOrder']).toEqual({ sub1: 0, sub2: 1 });
  });

  it('should return "even" class for even subsections', () => {
    component['subSectionOrder'] = { sub1: 2 };
    expect(component.getSubSectionClass('sub1')).toBe('even');
  });

  it('should return "odd" class for odd subsections', () => {
    component['subSectionOrder'] = { sub1: 1 };
    expect(component.getSubSectionClass('sub1')).toBe('odd');
  });

  it('should handle field checkbox change', () => {
    const event = { target: { id: 'field1', checked: true } } as unknown as Event;
    spyOn(component.formGroupInput().get('field1_toggle')!, 'enable');
    component.onFieldChange(event);
    expect(component.formGroupInput().get('field1_toggle')!.enable).toHaveBeenCalled();
    expect(component.fieldsListInput()[0].isVisible).toBeTrue();
  });

  it('should handle field toggle change', () => {
    const event = { target: { id: 'field1-toggle', checked: true } } as unknown as Event;
    component.onFieldChangeToggle(event);
    expect(component.fieldsListInput()[0].isRequired).toBeTrue();
  });

  it('should log an error if toggle control is not found', () => {
    const event = { target: { id: 'nonexistentField', checked: true } } as unknown as Event;
    spyOn(console, 'error'); // Spia per intercettare i messaggi di errore
    component.onFieldChange(event);
    expect(console.error).toHaveBeenCalledWith('Toggle element nonexistentField_toggle not found!');
  });

  it('should disable toggle control and update field on checkbox uncheck', (done) => {
    const event = { target: { id: 'field1', checked: false } } as unknown as Event;
    const toggleControl = component.formGroupInput().get('field1_toggle') as FormControl;
    spyOn(toggleControl, 'disable');
    spyOn(component, 'updateFieldOnChangeToggle');

    component.onFieldChange(event);

    setTimeout(() => {
      const checkbox = document.getElementById('field1-toggle') as HTMLInputElement;
      expect(checkbox.checked).toBeFalse();
      expect(toggleControl.disable).toHaveBeenCalled();
      expect(component.updateFieldOnChangeToggle).toHaveBeenCalledWith('field1', false);
      done();
    }, 0);
  });
});
