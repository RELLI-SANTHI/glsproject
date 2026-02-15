/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CompanyGroupListTableComponent } from './company-group-list-table.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CompanyDetailResponse } from '../../../../../api/glsAdministrativeApi/models';
import { UtilityRouting } from '../../../../../common/utilities/utility-routing';

describe('CompanyGroupListTableComponent', () => {
  let component: CompanyGroupListTableComponent;
  let fixture: ComponentFixture<CompanyGroupListTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyGroupListTableComponent, TranslateModule.forRoot(), HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyGroupListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should return the id of the item', () => {
    const item = { id: 42 };
    const index = 0;
    expect(component.trackById(index, item)).toBe(42);
  });

  it('should work with different ids', () => {
    const item = { id: 123 };
    expect(component.trackById(1, item)).toBe(123);
  });
  // Tests for toggleExpandRow
  it('should call table.rowDetail.toggleExpandRow with the given row', () => {
    const row = { id: 1 } as CompanyDetailResponse;
    component.table = {
      rowDetail: {
        toggleExpandRow: jasmine.createSpy('toggleExpandRow')
      }
    } as any;
    component.toggleExpandRow(row);
    expect(component.table.rowDetail.toggleExpandRow).toHaveBeenCalledWith(row);
  });

  // Tests for selectButton
  it('should set selectValue and emit the correct object when selectButton is called', () => {
    const value = 'testType';
    component.enabled = jasmine.createSpyObj('EventEmitter', ['emit']);
    component.selectButton(value);
    expect(component.selectValue).toBe(value);
    expect(component.enabled.emit).toHaveBeenCalledWith({
      buttonType: value,
      companyType: ''
    });
  });

  it('should emit with different buttonType values', () => {
    const value = 'anotherType';
    component.enabled = jasmine.createSpyObj('EventEmitter', ['emit']);
    component.selectButton(value);
    expect(component.enabled.emit).toHaveBeenCalledWith({
      buttonType: value,
      companyType: ''
    });
  });

  it('should call UtilityRouting.navigateToCarporateGroupDetail with the correct id', () => {
    // Arrange
    const id = 'test-id';
    const spy = spyOn(UtilityRouting, 'navigateToCarporateGroupDetail');

    // Act
    component.goToCoporateGroupView(id);

    // Assert
    expect(spy).toHaveBeenCalledWith(id);
  });
});
