import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoMobileComponent } from './info-mobile.component';
import { TranslateModule } from '@ngx-translate/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';

describe('InfoMobileComponent', () => {
  let component: InfoMobileComponent;
  let fixture: ComponentFixture<InfoMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoMobileComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InfoMobileComponent);
    component = fixture.componentInstance;
    signalSetFn(component.label[SIGNAL], 'label');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
