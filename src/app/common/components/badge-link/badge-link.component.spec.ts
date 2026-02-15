import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeLinkComponent } from './badge-link.component';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { TranslateModule } from '@ngx-translate/core';

describe('BadgeLinkComponent', () => {
  let component: BadgeLinkComponent;
  let fixture: ComponentFixture<BadgeLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeLinkComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeLinkComponent);
    component = fixture.componentInstance;
    signalSetFn(component.label[SIGNAL], 'Test Label');
    signalSetFn(component.value[SIGNAL], 'Test Value');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set label and value inputs', () => {
    signalSetFn(component.label[SIGNAL], 'Test Label');
    signalSetFn(component.value[SIGNAL], 'Test Value');
    expect(component.label()).toBe('Test Label');
    expect(component.value()).toBe('Test Value');
  });

  it('should emit linkClick event and call preventDefault on onClick', () => {
    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');
    spyOn(component.linkClick, 'emit');
    component.onClick(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.linkClick.emit).toHaveBeenCalled();
  });
});
