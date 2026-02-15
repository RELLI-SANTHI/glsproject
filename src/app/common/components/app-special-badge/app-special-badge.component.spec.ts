import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSpecialBadgeComponent } from './app-special-badge.component';

describe('AppSpecialBadgeComponent', () => {
  let component: AppSpecialBadgeComponent;
  let fixture: ComponentFixture<AppSpecialBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSpecialBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppSpecialBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
