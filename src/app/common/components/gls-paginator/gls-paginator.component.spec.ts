/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GlsPaginatorComponent } from './gls-paginator.component';

describe('GlsPaginatorComponent', () => {
  let component: GlsPaginatorComponent;
  let fixture: ComponentFixture<GlsPaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlsPaginatorComponent, TranslateModule.forRoot()],
      providers: [TranslateService]
    }).compileComponents();

    fixture = TestBed.createComponent(GlsPaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the correct page size', () => {
    component.pageSize = 10;
    fixture.detectChanges();
    expect(component.pageSize).toBe(10);
  });

  it('should emit pageChange event when calling previousPage()', () => {
    spyOn(component.pageChange, 'emit');
    component.page = 2;
    component.previousPage();
    expect(component.page).toBe(1);
    expect(component.pageChange.emit).toHaveBeenCalledWith(1);
  });

  it('should not change page when calling previousPage() on first page', () => {
    spyOn(component.pageChange, 'emit');
    component.page = 1;
    component.previousPage();
    expect(component.page).toBe(1);
    expect(component.pageChange.emit).not.toHaveBeenCalled();
  });

  it('should emit pageChange event when calling nextPage()', () => {
    spyOn(component.pageChange, 'emit');
    component.page = 1;
    component.totalPages = 3;
    component.nextPage();
    expect(component.page).toBe(2);
    expect(component.pageChange.emit).toHaveBeenCalledWith(2);
  });

  it('should not change page when calling nextPage() on last page', () => {
    spyOn(component.pageChange, 'emit');
    component.page = 3;
    component.totalPages = 3;
    component.nextPage();
    expect(component.page).toBe(3);
    expect(component.pageChange.emit).not.toHaveBeenCalled();
  });

  it('should emit pageChange event when calling goToPage()', () => {
    spyOn(component.pageChange, 'emit');
    component.goToPage(3);
    expect(component.page).toBe(3);
    expect(component.pageChange.emit).toHaveBeenCalledWith(3);
  });

  it('should not emit pageChange when calling goToPage() with 0', () => {
    spyOn(component.pageChange, 'emit');
    component.goToPage(0);
    expect(component.pageChange.emit).not.toHaveBeenCalled();
  });

  it('should update pages array when ngOnChanges() is called with totalPages <= visiblePages', () => {
    component.totalPages = 4;
    component.page = 2;
    component.ngOnChanges();
    expect(component.pages).toEqual([1, 2, 3, 4]);
  });

  it('should update pages array when ngOnChanges() is called with page at the start of range', () => {
    component.totalPages = 10;
    component.visiblePages = 5;
    component.page = 2; // Near the start
    component.ngOnChanges();
    expect(component.pages).toEqual([1, 2, 3, 4, 0, 10]);
  });

  it('should update pages array when ngOnChanges() is called with page at the end of range', () => {
    component.totalPages = 10;
    component.visiblePages = 5;
    component.page = 9; // Near the end
    component.ngOnChanges();
    expect(component.pages).toEqual([1, 0, 7, 8, 9, 10]);
  });

  it('should update pages array when ngOnChanges() is called with page in the middle range (else case)', () => {
    component.totalPages = 10;
    component.visiblePages = 5;
    component.page = 5; // Middle of the range
    component.ngOnChanges();
    expect(component.pages).toEqual([1, 0, 4, 5, 6, 0, 10]);
  });
});
