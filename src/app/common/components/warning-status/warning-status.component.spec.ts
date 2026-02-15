import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningStatusComponent } from './warning-status.component';
import { WarningRow } from '../../models/warning-status';
import { TranslateModule } from '@ngx-translate/core';

describe('WarningStatusComponent', () => {
  let component: WarningStatusComponent;
  let fixture: ComponentFixture<WarningStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarningStatusComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WarningStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept input row', async () => {
    const mockRow: WarningRow = {
      warning: true,
      error: false
    };

    fixture.componentRef.setInput('row', mockRow);
    fixture.detectChanges();

    expect(component.row()).toEqual(mockRow);
  });
});
