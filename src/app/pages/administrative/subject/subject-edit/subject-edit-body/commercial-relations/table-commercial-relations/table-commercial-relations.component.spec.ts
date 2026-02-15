import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableCommercialRelationsComponent } from './table-commercial-relations.component';
import { TranslateModule } from '@ngx-translate/core';
import { SubjectAgentDetail } from '../../../../../../../api/glsAdministrativeApi/models/subject-agent-detail';
import { SubjectCustomerDetail } from '../../../../../../../api/glsAdministrativeApi/models/subject-customer-detail';

describe('TableCommercialRelationsComponent', () => {
  let component: TableCommercialRelationsComponent;
  let fixture: ComponentFixture<TableCommercialRelationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCommercialRelationsComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TableCommercialRelationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default comRelList as undefined or empty', () => {
    expect(component.comRelList()).toBeUndefined();
  });

  describe('getStatus', () => {
    it('should return the correct status', () => {
      const subject = { status: 'COMPLETED' } as any;
      expect(component.getStatus(subject)).toBe('COMPLETED');
    });
  });

  describe('getStatusClass', () => {
    it('should return "text-success" for COMPLETED status', () => {
      const subject = { status: 'COMPLETED' } as any;
      expect(component.getStatusClass(subject)).toBe('text-success');
    });

    it('should return "status-disabled" for DISABLED status', () => {
      const subject = { status: 'DISABLED' } as any;
      expect(component.getStatusClass(subject)).toBe('status-disabled');
    });

    it('should return empty string for DRAFT status', () => {
      const subject = { status: 'DRAFT' } as any;
      expect(component.getStatusClass(subject)).toBe('');
    });
  });

  describe('getStatusLabel', () => {
    it('should return correct label for COMPLETED status', () => {
      const subject = { status: 'COMPLETED' } as any;
      expect(component.getStatusLabel(subject)).toBe('structureList.status.completed');
    });

    it('should return correct label for DISABLED status', () => {
      const subject = { status: 'DISABLED' } as any;
      expect(component.getStatusLabel(subject)).toBe('structureList.status.disabled');
    });

    it('should return correct label for DRAFT status', () => {
      const subject = { status: 'DRAFT' } as any;
      expect(component.getStatusLabel(subject)).toBe('structureList.status.draft');
    });
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

      expect(component.currentPage).toBe(2);
      expect(component.comRelListFiltered()).toEqual(mockList.slice(10, 20));
    });
  });

  describe('Sorting and pagination (real interfaces)', () => {
    let component: TableCommercialRelationsComponent;
    let fixture: ComponentFixture<TableCommercialRelationsComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(TableCommercialRelationsComponent);
      component = fixture.componentInstance;
      component.pageSize = 10;
      component.currentPage = 1;
      component.comRelListFiltered.set([]);
      (component as unknown as { sortProp: string }).sortProp = '';
      (component as unknown as { sortDir: 'asc' | 'desc' }).sortDir = 'asc';
    });

    it('should sort SubjectAgentDetail by status (asc) and paginate', () => {
      const mockList: SubjectAgentDetail[] = [
        { status: 'COMPLETED' } as SubjectAgentDetail,
        { status: 'DRAFT' } as SubjectAgentDetail,
        { status: 'DISABLED' } as SubjectAgentDetail
      ];
      spyOn(component, 'comRelList').and.returnValue(mockList);

      component.pageSize = 2;
      component.onSort({ sorts: [{ prop: 'status', dir: 'asc' }] });

      expect(component.comRelListFiltered()).toEqual([
        { status: 'COMPLETED' },
        { status: 'DISABLED' }
      ]);
    });

    it('should sort SubjectCustomerDetail by status (desc) and paginate', () => {
      const mockList: SubjectCustomerDetail[] = [
        { status: 'COMPLETED' } as SubjectCustomerDetail,
        { status: 'DRAFT' } as SubjectCustomerDetail,
        { status: 'DISABLED' } as SubjectCustomerDetail
      ];
      spyOn(component, 'comRelList').and.returnValue(mockList);

      component.pageSize = 2;
      component.onSort({ sorts: [{ prop: 'status', dir: 'desc' }] });

      expect(component.comRelListFiltered()).toEqual([
        { status: 'DRAFT' },
        { status: 'DISABLED' }
      ]);
    });

    it('should reset to first page on sort', () => {
      const mockList: SubjectAgentDetail[] = [
        { status: 'COMPLETED' } as SubjectAgentDetail,
        { status: 'DISABLED' } as SubjectAgentDetail,
        { status: 'DRAFT' } as SubjectAgentDetail
      ];
      spyOn(component, 'comRelList').and.returnValue(mockList);

      component.currentPage = 2;
      component.pageSize = 2;
      component.onSort({ sorts: [{ prop: 'status', dir: 'asc' }] });

      expect(component.currentPage).toBe(1);
    });

    it('should paginate correctly after sorting', () => {
      const mockList: SubjectAgentDetail[] = [
        { status: 'DRAFT' } as SubjectAgentDetail,
        { status: 'DISABLED' } as SubjectAgentDetail,
        { status: 'COMPLETED' } as SubjectAgentDetail,
        { status: 'COMPLETED' } as SubjectAgentDetail
      ];
      spyOn(component, 'comRelList').and.returnValue(mockList);

      component.pageSize = 2;
      component.onSort({ sorts: [{ prop: 'status', dir: 'asc' }] });
      expect(component.comRelListFiltered()).toEqual([
        { status: 'COMPLETED' },
        { status: 'COMPLETED' }
      ]);

      component.onPageChange(2);
      expect(component.comRelListFiltered()).toEqual([
        { status: 'DISABLED' },
        { status: 'DRAFT' }
      ]);
    });
  });
});