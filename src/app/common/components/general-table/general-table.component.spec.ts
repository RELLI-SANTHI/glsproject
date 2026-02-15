/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeneralTableComponent } from './general-table.component';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Utility } from '../../../common/utilities/utility'; // Adjust path if needed

// eslint-disable-next-line max-lines-per-function
describe('GeneralTableComponent', () => {
  let component: GeneralTableComponent;
  let fixture: ComponentFixture<GeneralTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralTableComponent, TranslateModule, TranslateModule.forRoot()],
      providers: [TranslateService, TranslateStore]
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit selected row when selectRow is called', () => {
    spyOn(component.rowSelected, 'emit');

    const row = { name: 'Mario', age: 30 };
    component.selectRow(row);

    expect(component.rowSelected.emit).toHaveBeenCalledWith(row);
  });

  it('should update currentPage and call applyFilterAndSort on page change', () => {
    spyOn(component, 'applyFilterAndSort');
    component.onPageChange(3);
    expect(component.currentPage).toBe(3);
    expect(component.applyFilterAndSort).toHaveBeenCalled();
  });

  it('should update sortEvent and call applyFilterAndSort on sort', () => {
    spyOn(component, 'applyFilterAndSort');
    const sortEvent = { prop: 'name', dir: 'asc' };
    component.onSort(sortEvent);
    expect(component.applyFilterAndSort).toHaveBeenCalled();
  });

  it('should return correct first result index', () => {
    component.currentPage = 2;
    expect(component.pageSize()).toBe(10);
    expect(component.getFirstResult()).toBe(11); // (2-1)*10+1 = 11
  });

  it('should return correct last result index', () => {
    component.currentPage = 2;
    expect(component.pageSize()).toBe(10);
    component.totalItems = 18;
    expect(component.getLastResult()).toBe(18); // min(2*10, 18) = 18

    component.totalItems = 25;
    expect(component.getLastResult()).toBe(20); // min(2*10, 25) = 20
  });

  it('should translate label using Utility.translate', () => {
    const translateSpy = spyOn(Utility, 'translate').and.returnValue('translated');
    const label = 'TestLabel';
    const result = component.translateLabelCol(label);
    expect(translateSpy).toHaveBeenCalledWith(label, jasmine.anything());
    expect(result).toBe('translated');
  });

  it('should apply filter and sort data in ascending order', () => {
    component.data = [
      { name: 'Charlie', age: 30 },
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 28 }
    ];
    component.currentPage = 1;
    expect(component.pageSize()).toBe(10);
    (component as any).sortEvent = { sorts: [{ prop: 'name', dir: 'asc' }] };

    component.applyFilterAndSort();

    expect(component.filteredData.length).toBe(3);
    expect(component.filteredData[0]['name']).toBe('Alice');
    expect(component.filteredData[1]['name']).toBe('Bob');
    expect(component.totalItems).toBe(3);
  });

  it('should apply filter and sort data in descending order', () => {
    component.data = [
      { name: 'Charlie', age: 30 },
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 28 }
    ];
    component.currentPage = 1;
    expect(component.pageSize()).toBe(10);
   (component as any).sortEvent = { sorts: [{ prop: 'name', dir: 'desc' }] };
    component.applyFilterAndSort();

    expect(component.filteredData.length).toBe(3);
    expect(component.filteredData[0]['name']).toBe('Charlie');
    expect(component.filteredData[1]['name']).toBe('Bob');
    expect(component.totalItems).toBe(3);
  });

  it('should paginate filtered data', () => {
    component.data = [
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 28 },
      { name: 'Charlie', age: 30 }
    ];
    component.currentPage = 2;
    expect(component.pageSize()).toBe(10);
    (component as any).sortEvent = { sorts: [{ prop: 'name', dir: 'asc' }] };
    component.applyFilterAndSort();
    expect(component.filteredData.length).toBe(0);
     expect(component.totalItems).toBe(3);
  });

  it('should handle no sortEvent gracefully', () => {
    component.data = [
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 28 }
    ];
    component.currentPage = 1;
    expect(component.pageSize()).toBe(10);
    (component as any).sortEvent = undefined;

    component.applyFilterAndSort();

    expect(component.filteredData.length).toBe(2);
    expect(component.filteredData[0]['name']).toBe('Alice');
    expect(component.filteredData[1]['name']).toBe('Bob');
    expect(component.totalItems).toBe(2);
  });
});
