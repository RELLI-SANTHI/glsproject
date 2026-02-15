/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  DEFAULT_LANGUAGE,
  ISOLATE_TRANSLATE_SERVICE,
  MissingTranslationHandler,
  TranslateCompiler,
  TranslateLoader,
  TranslateParser,
  TranslatePipe,
  TranslateService,
  TranslateStore,
  USE_DEFAULT_LANG,
  USE_EXTEND
} from '@ngx-translate/core';
import { NgClass } from '@angular/common';
import { of } from 'rxjs';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';

import { ViewDetailsReadComponent } from './view-details-read.component';

class FakeLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
}

class FakeParser extends TranslateParser {
  interpolate(expr: string | Function, params?: any): string {
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

describe('ViewDetailsReadComponent', () => {
  let component: ViewDetailsReadComponent;
  let fixture: ComponentFixture<ViewDetailsReadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslatePipe, NgClass, ViewDetailsReadComponent],
      providers: [
        TranslateStore,
        { provide: TranslateLoader, useClass: FakeLoader },
        TranslateService,
        { provide: TranslateParser, useClass: FakeParser },
        TranslateCompiler,
        { provide: MissingTranslationHandler, useClass: FakeMissingTranslationHandler },
        { provide: USE_DEFAULT_LANG, useValue: true },
        { provide: ISOLATE_TRANSLATE_SERVICE, useValue: false },
        { provide: USE_EXTEND, useValue: true },
        { provide: DEFAULT_LANGUAGE, useValue: 'en' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewDetailsReadComponent);
    component = fixture.componentInstance;
    signalSetFn(component.fieldsListInput[SIGNAL], [
      {
        fieldName: 'field1',
        fieldType: 'text',
        id: 1,
        section: 'section1',
        subSection: 'sub1',
        isVisible: true,
        isRequired: true
      },
      {
        fieldName: 'field2',
        fieldType: 'checkbox',
        id: 2,
        section: 'section2',
        subSection: 'sub2',
        isVisible: false,
        isRequired: false
      },
      {
        fieldName: 'field3',
        fieldType: 'radio',
        id: 3,
        section: 'section1',
        subSection: 'sub1',
        isVisible: true,
        isRequired: false
      }
    ]);
    signalSetFn(component.buildingAcronymMin[SIGNAL], 'A');
    signalSetFn(component.buildingAcronymMax[SIGNAL], 'Z');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have fieldsListInput as required input', () => {
    expect(component.fieldsListInput()).toBeDefined();
  });

  it('should return "even" class for even subsections', () => {
    component['subSectionOrder'] = { subSection1: 2 };
    expect(component.getSubSectionClass('subSection1')).toBe('even');
  });

  it('should return "odd" class for odd subsections', () => {
    component['subSectionOrder'] = { subSection1: 1 };
    expect(component.getSubSectionClass('subSection1')).toBe('odd');
  });

  it('should have required inputs defined', () => {
    expect(component.fieldsListInput()).toBeDefined();
    expect(component.buildingAcronymMin()).toBeDefined();
    expect(component.buildingAcronymMax()).toBeDefined();
  });

  it('should return "even" class for even subsections', () => {
    component['subSectionOrder'] = { sub1: 2 };
    expect(component.getSubSectionClass('sub1')).toBe('even');
  });

  it('should return "odd" class for odd subsections', () => {
    component['subSectionOrder'] = { sub1: 1 };
    expect(component.getSubSectionClass('sub1')).toBe('odd');
  });

  it('should filter visible fields', () => {
    const visibleFields = component.fieldsVisible();
    expect(visibleFields.length).toBe(2); // Only field1 and field3 are visible
  });

  it('should identify required fields', () => {
    const requiredField = component.isRequired({
      fieldName: 'field1',
      fieldType: 'text',
      id: 1,
      section: 'section1',
      subSection: 'sub1',
      isVisible: true,
      isRequired: true
    });

    const notRequiredField = component.isRequired({
      fieldName: 'field2',
      fieldType: 'checkbox',
      id: 2,
      section: 'section2',
      subSection: 'sub2',
      isVisible: false,
      isRequired: false
    });

    expect(requiredField).toBeTrue();
    expect(notRequiredField).toBeFalse();
  });

  it('should initialize subsection order correctly', () => {
    component['subSectionOrder'] = {};
    component.ngOnInit();
    expect(component['subSectionOrder']).toEqual({ sub1: 0, sub2: 1 });
  });
});
