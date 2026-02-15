import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { FilterSidebarComponent } from './filter-sidebar.component';
import { FilterSidebar } from '../../models/filter-sidebar';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';

describe('FilterSidebarComponent', () => {
  let component: FilterSidebarComponent;
  let fixture: ComponentFixture<FilterSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterSidebarComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterSidebarComponent);
    component = fixture.componentInstance;
    signalSetFn(component.filters[SIGNAL], []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open filter and reset searchTerm', () => {
    const filter: FilterSidebar = { name: 'Test', options: [], selected: '', key: '1' };
    component.openFilter(filter);
    expect(component.activeFilter).toBe(filter);
    expect(component.searchTerm).toBe('');
  });

  it('should reset activeFilter and searchTerm on backToList', () => {
    component.activeFilter = { name: 'Test', options: [], selected: '', key: '1' };
    component.searchTerm = 'abc';
    component.backToList();
    expect(component.activeFilter).toBeNull();
    expect(component.searchTerm).toBe('');
  });

  it('should set selected option and call backToList on applySelection', () => {
    const filter: FilterSidebar = { name: 'Test', options: [], selected: '', key: '1' };
    spyOn(component, 'backToList');
    component.activeFilter = filter;
    component.applySelection('option1');
    expect(filter.selected).toBe('option1');
    expect(component.backToList).toHaveBeenCalled();
  });

  it('should not throw if applySelection called with no activeFilter', () => {
    component.activeFilter = null;
    expect(() => component.applySelection('option')).not.toThrow();
  });

  it('should emit applyFiltersEv on applyFilters', () => {
    spyOn(component.applyFiltersEv, 'emit');
    component.applyFilters();
    expect(component.applyFiltersEv.emit).toHaveBeenCalled();
  });

  it('should return label if present in getTranslateLabel', () => {
    expect(component.getTranslateLabel('myLabel')).toBe('myLabel');
  });

  it('should return generic.all if label is undefined and all=true', () => {
    expect(component.getTranslateLabel(undefined, true)).toBe('generic.all');
  });

  it('should return generic.filters if label is undefined and all=false', () => {
    expect(component.getTranslateLabel(undefined, false)).toBe('generic.filters');
  });

  it('should emit closeSideBarEv on closeFilters', () => {
    spyOn(component.closeSideBarEv, 'emit');
    component.closeFilters();
    expect(component.closeSideBarEv.emit).toHaveBeenCalled();
  });

  it('should not call backToList or set selected if activeFilter is null in applySelection', () => {
    spyOn(component, 'backToList');
    component.activeFilter = null;
    component.applySelection('option');
    expect(component.backToList).not.toHaveBeenCalled();
  });
});
