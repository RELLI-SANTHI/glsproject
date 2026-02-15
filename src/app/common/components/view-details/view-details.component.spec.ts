import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ViewDetailsComponent } from './view-details.component';
import { ViewDetailsReadComponent } from './view-details-read/view-details-read.component';
import { ViewDetailsWriteComponent } from './view-details-write/view-details-write.component';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';

class FakeLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
}

class FakeParser extends TranslateParser {
  interpolate(expr: string | any, params?: any): string {
    if (typeof expr === 'function') {
      return expr(params);
    }
    return expr;
  }

  getValue(target: any, key: string): any {
    return target[key];
  }
}

class FakeMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: any) {
    return 'translation not found';
  }
}

describe('ViewDetailsComponent', () => {
  let component: ViewDetailsComponent;
  let fixture: ComponentFixture<ViewDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
          parser: { provide: TranslateParser, useClass: FakeParser },
          missingTranslationHandler: { provide: MissingTranslationHandler, useClass: FakeMissingTranslationHandler }
        }),
        ViewDetailsComponent,
        ViewDetailsReadComponent,
        ViewDetailsWriteComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewDetailsComponent);
    component = fixture.componentInstance;

    // Mock inputs
    signalSetFn(component.fieldsList[SIGNAL], [
      {
        fieldName: 'field1',
        section: 'section1',
        isVisible: true,
        isRequired: true,
        fieldType: 'text', // Aggiungi il tipo di campo
        id: 1, // Aggiungi un ID univoco
        subSection: 'sub1' // Aggiungi una sotto-sezione
      },
      {
        fieldName: 'field2',
        section: 'section1',
        isVisible: true,
        isRequired: false,
        fieldType: 'checkbox',
        id: 2,
        subSection: 'sub1'
      },
      {
        fieldName: 'field3',
        section: 'section2',
        isVisible: true,
        isRequired: true,
        fieldType: 'radio',
        id: 3,
        subSection: 'sub2'
      }
    ]);

    signalSetFn(
      component.formGroupInput[SIGNAL],
      new FormGroup({
        field1: new FormControl(true),
        field2: new FormControl(false),
        field3: new FormControl(true),
        field1_toggle: new FormControl(true),
        field2_toggle: new FormControl(false),
        field3_toggle: new FormControl(true)
      })
    );

    fixture.detectChanges();
  });

  it('should create the component', () => {
    // Verify that the component is created successfully
    expect(component).toBeTruthy();
  });

  it('should filter out duplicate field names', () => {
    // Ensure that duplicate field names are removed
    const filteredFields = component.filteredFieldsList;
    expect(filteredFields.length).toBe(3); // No duplicates in the mock data
  });

  it('should return unique sections from fieldsList', () => {
    // Verify that unique sections are returned
    const uniqueSections = component.uniqueSections();
    expect(uniqueSections).toEqual(['section1', 'section2']);
  });

  it('should return the correct building acronym min value', () => {
    // Mock the formGroupInput.get method to return a specific value
    spyOn(component.formGroupInput(), 'get').and.returnValue({ value: 'A' } as any);
    expect(component.getBuildingAcronymMin()).toBe('A');
  });

  it('should return the correct building acronym max value', () => {
    // Mock the formGroupInput.get method to return a specific value
    spyOn(component.formGroupInput(), 'get').and.returnValue({ value: 'Z' } as any);
    expect(component.getBuildingAcronymMax()).toBe('Z');
  });

  it('should count selected fields in a section', () => {
    // Verify the count of selected fields in a specific section
    const selectedFields = component.getSelectedFieldsInSection('section1');
    expect(selectedFields).toBe(1); // Only field1 is selected
  });

  it('should count total fields in a section', () => {
    // Verify the total number of fields in a specific section
    const totalFields = component.getTotalFieldsInSection('section1');
    expect(totalFields).toBe(2); // field1 and field2 belong to section1
  });

  it('should count mandatory fields in a section (readonly mode)', () => {
    // Mock readonly mode and verify the count of mandatory fields
    spyOn(component, 'readonly').and.returnValue(true);
    const mandatoryFields = component.getMandatoryFieldsInSection('section1');
    expect(mandatoryFields).toBe(1); // Only field1 is mandatory and visible
  });

  it('should count mandatory fields in a section (edit mode)', () => {
    // Mock edit mode and verify the count of mandatory fields
    spyOn(component, 'readonly').and.returnValue(false);
    const mandatoryFields = component.getMandatoryFieldsInSection('section1');
    expect(mandatoryFields).toBe(1); // Only field1_toggle is true
  });

  it('should return fields in a section', () => {
    // Verify that the correct fields are returned for a specific section
    const fieldsInSection = component.getFieldsInSection('section1');
    expect(fieldsInSection.length).toBe(2); // field1 and field2 belong to section1
  });
});
