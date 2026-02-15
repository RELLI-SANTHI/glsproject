import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercialRelationsTableComponent } from './commercial-relations-table.component';
import { TranslateModule } from '@ngx-translate/core';

describe('CommercialRelationsTableComponent', () => {
  let component: CommercialRelationsTableComponent;
  let fixture: ComponentFixture<CommercialRelationsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommercialRelationsTableComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CommercialRelationsTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Pagination methods', () => {
    it('should return the correct first result index', () => {
      component.currentPage = 2;
      component.pageSize = 10;
      expect(component.getFirstResult()).toBe(11);
    });

    it('should return the correct last result index', () => {
      component.currentPage = 2;
      component.pageSize = 10;
      component.totalItems = 15;
      expect(component.getLastResult()).toBe(15);
    });

    it('should update currentPage and comRelListFiltered on page change', () => {
      const mockList: { status: string }[] = Array.from({ length: 25 }, (_, i) => ({ status: 'COMPLETED' }));

      spyOn(component, 'comRelList').and.returnValue(mockList);

      component.pageSize = 10;
      component.onPageChange(2);

      expect(component.comRelListFiltered() as { status: string }[]).toEqual(mockList.slice(10, 20));
    });
  });

  describe('Sorting and pagination', () => {
    it('should sort by a string property in ascending order', () => {
      const mockList = [
        { name: 'B' },
        { name: 'A' },
        { name: 'C' }
      ];
      spyOn(component, 'comRelList').and.returnValue(mockList);
      component.pageSize = 10;
      component.onSort({ sorts: [{ prop: 'name', dir: 'asc' }] });
      expect((component.comRelListFiltered() as { name: string }[]).map((r) => r.name)).toEqual(['A', 'B', 'C']);
    });

    it('should sort by a string property in descending order', () => {
      const mockList = [
        { name: 'B' },
        { name: 'A' },
        { name: 'C' }
      ];
      spyOn(component, 'comRelList').and.returnValue(mockList);
      component.pageSize = 10;
      component.onSort({ sorts: [{ prop: 'name', dir: 'desc' }] });
      expect((component.comRelListFiltered() as { name: string }[]).map((r) => r.name)).toEqual(['C', 'B', 'A']);
    });

    it('should reset to first page on sort', () => {
      const mockList = Array.from({ length: 25 }, (_, i) => ({ name: `Name${i}` }));
      spyOn(component, 'comRelList').and.returnValue(mockList);
      component.currentPage = 3;
      component.onSort({ sorts: [{ prop: 'name', dir: 'asc' }] });
      expect(component.currentPage).toBe(1);
    });
  });
});
