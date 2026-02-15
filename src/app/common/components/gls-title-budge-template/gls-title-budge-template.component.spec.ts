/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlsTitleBudgeTemplateComponent } from './gls-title-budge-template.component';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';

describe('GlsTitleBudgeTemplateComponent', () => {
  let component: GlsTitleBudgeTemplateComponent;
  let fixture: ComponentFixture<GlsTitleBudgeTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlsTitleBudgeTemplateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GlsTitleBudgeTemplateComponent);
    component = fixture.componentInstance;
    signalSetFn(component.src[SIGNAL], 'Test Label');
    signalSetFn(component.templateName[SIGNAL], 'Test Value');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
