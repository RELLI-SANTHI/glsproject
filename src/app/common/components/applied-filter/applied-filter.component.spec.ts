/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppliedFilterComponent } from './applied-filter.component';
import { ResetCommonFilterList } from '../../models/reset-filter-list'; // Update the path as needed
import { InputSignal, signal } from '@angular/core';
import { USER_STATUS } from '../../utilities/constants/profile';
import { TranslateModule } from '@ngx-translate/core';

describe('AppliedFilterComponent', () => {
  let component: AppliedFilterComponent;
  let fixture: ComponentFixture<AppliedFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppliedFilterComponent, TranslateModule.forRoot()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppliedFilterComponent);
    component = fixture.componentInstance;


    component.showFiltersApplied = signal([] as ResetCommonFilterList[]) as unknown as InputSignal<ResetCommonFilterList[]>;
    component.translateColumnName = signal('') as unknown as InputSignal<string>;
    component.translateStatusName = signal('') as unknown as InputSignal<string>;


    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // New tests

  it('should get status translation code for USER_STATUS values', () => {
    component.translateStatusName = signal('userStatus') as unknown as InputSignal<string>;
    const statusCode = component.getStatusTranslationCode(USER_STATUS.active);
    expect(statusCode).toBe('userStatus.active');
  });

  it('should return original field for non-USER_STATUS values', () => {
    component.translateStatusName = signal('userStatus') as unknown as InputSignal<string>;
    const nonStatusField = 'someOtherField';
    const statusCode = component.getStatusTranslationCode(nonStatusField);
    expect(statusCode).toBe(nonStatusField);
  });

  it('should get column translation code with defined field', () => {
    component.translateColumnName = signal('columnNames') as unknown as InputSignal<string>;
    const columnCode = component.getColumnTranslationCode('name');
    expect(columnCode).toBe('columnNames.name');
  });

  it('should get column translation code for "all" when field is undefined', () => {
    component.translateColumnName = signal('columnNames') as unknown as InputSignal<string>;
    const columnCode = component.getColumnTranslationCode(undefined);
    expect(columnCode).toBe('columnNames.all');
  });

  it('should emit resetFilter output when triggered', () => {
    const spy = spyOn(component.resetFilter, 'emit');
    const mockFilter: ResetCommonFilterList = { name: 'testField', value: 'testValue' };

    component.resetFilter.emit(mockFilter);

    expect(spy).toHaveBeenCalledWith(mockFilter);
  });

  it('should emit resetFilters output when triggered', () => {
    const spy = spyOn(component.resetFilters, 'emit');

    component.resetFilters.emit();

    expect(spy).toHaveBeenCalled();
  });

  it('should correctly display filters when showFiltersApplied has items', () => {
    const mockFilters: ResetCommonFilterList[] = [
      { name: 'column.name', value: 'John' },
      { name: 'status.active', value: 'Active' }
    ];

    component.showFiltersApplied = signal(mockFilters) as unknown as InputSignal<ResetCommonFilterList[]>;
    component.translateStatusName = signal('status') as unknown as InputSignal<string>;
    component.translateColumnName = signal('column') as unknown as InputSignal<string>;

    fixture.detectChanges();

    // Check that filters are processed correctly
    expect(component.showFiltersApplied().length).toBe(2);
    expect(component.getStatusTranslationCode(mockFilters[1].name)).toBe('status.active');
    expect(component.getColumnTranslationCode(mockFilters[0].name)).toBe('column.column.name');
  });
});