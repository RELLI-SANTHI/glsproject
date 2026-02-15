import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeFiltersComponent } from './badge-filters.component';
import { BadgeFilters } from '../../models/badge-filters';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'host-component',
  template: `<app-badge-filters [showFiltersApplied]="filters"></app-badge-filters>`,
  standalone: true,
  imports: [BadgeFiltersComponent]
})
class TestHostComponent {
  filters: BadgeFilters[] = [
    { name: 'type', value: 'customer' },
    { name: 'status', value: 'active' }
  ];
}

describe('BadgeFiltersComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestHostComponent,
        TranslateModule.forRoot() // ✅ OK solo qui
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the host and child component', () => {
    expect(fixture).toBeTruthy();
    const badgeEl = fixture.nativeElement.querySelector('app-badge-filters');
    expect(badgeEl).toBeTruthy();
  });

  it('should pass filters input correctly', () => {
    const badgeCmp: BadgeFiltersComponent = fixture.debugElement.children[0].componentInstance;
    const filters = badgeCmp.showFiltersApplied();
    expect(filters.length).toBe(2);
    expect(filters[0].name).toBe('type');
    expect(filters[1].value).toBe('active');
  });
});
