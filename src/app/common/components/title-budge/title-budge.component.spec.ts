/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TitleBudgeComponent } from './title-budge.component';
import { TranslateModule } from '@ngx-translate/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';

describe('TitleBudgeComponent', () => {
  let component: TitleBudgeComponent;
  let fixture: ComponentFixture<TitleBudgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitleBudgeComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TitleBudgeComponent);
    component = fixture.componentInstance;
    signalSetFn(component.label[SIGNAL], 'Test Label');
    signalSetFn(component.value[SIGNAL], 'Test Value');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a label input', () => {
    fixture.detectChanges();
    expect(component.label()).toBe('Test Label');
  });

  it('should have a value input', () => {
    fixture.detectChanges();
    expect(component.value()).toBe('Test Value');
  });

  it('should render label and value in the template', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Label');
    expect(compiled.textContent).toContain('Test Value');
  });
});
