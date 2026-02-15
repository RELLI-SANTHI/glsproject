/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AtecoModalComponent } from './ateco-modal.component';
import { GlsInputComponent } from '../../../../../../common/form/gls-input/gls-input.component';
import { GlsPaginatorComponent } from '../../../../../../common/components/gls-paginator/gls-paginator.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { AtecoCodeModel } from '../../../../../../api/glsAdministrativeApi/models';

describe('AtecoModalComponent', () => {
  let component: AtecoModalComponent;
  let fixture: ComponentFixture<AtecoModalComponent>;
  let modalServiceSpy: jasmine.SpyObj<NgbActiveModal>;

  const mockAtecoCodes: AtecoCodeModel[] = [
    {
      id: 1,
      code: '01.11.10',
      description: 'Coltivazione di cereali (escluso il riso), leguminose da granella e semi oleosi'
    },
    {
      id: 2,
      code: '01.11.20',
      description: 'Coltivazione di riso'
    },
    {
      id: 3,
      code: '01.12.00',
      description: 'Coltivazione di ortaggi, specialità orticole e prodotti di vivai'
    }
  ];

  beforeEach(async () => {
    modalServiceSpy = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TranslateModule.forRoot(), NgxDatatableModule, GlsInputComponent, GlsPaginatorComponent],
      declarations: [],
      providers: [FormBuilder, { provide: NgbActiveModal, useValue: modalServiceSpy }, HttpClient, HttpHandler]
    }).compileComponents();

    fixture = TestBed.createComponent(AtecoModalComponent);
    component = fixture.componentInstance;

    // Set up initial data
    component.listAteco.set([...mockAtecoCodes]);
    component.filteredAteco.set([...mockAtecoCodes]);
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with an invalid form', () => {
    expect(component.enableSearch()).toBeFalsy();
  });

  it('should enable search when search term length is >= 3 and searchField has value', () => {
    component.atecoFilterForm.get('searchTerm')?.setValue('abc');
    component.atecoFilterForm.get('searchField')?.setValue('code');
    expect(component.enableSearch()).toBeTruthy();
  });

  it('should disable search when search term length is < 3', () => {
    component.atecoFilterForm.get('searchTerm')?.setValue('ab');
    expect(component.enableSearch()).toBeFalsy();
  });

  it('should filter ateco codes based on code', () => {
    component.atecoFilterForm.get('searchTerm')?.setValue('01.11.10');
    component.atecoFilterForm.get('searchField')?.setValue('code');
    component.searchAtecoCodes();

    const filtered = component.filteredAteco();
    expect(filtered.length).toBe(1);
    expect(filtered[0].code).toBe('01.11.10');
  });

  it('should filter ateco codes based on description', () => {
    component.atecoFilterForm.get('searchTerm')?.setValue('cereali');
    component.searchAtecoCodes();
    expect(component.filteredAteco().length).toBe(1);
    expect(component.filteredAteco()[0].description).toContain('cereali');
  });

  it('should perform case insensitive search', () => {
    component.atecoFilterForm.get('searchTerm')?.setValue('coltivazione');
    component.searchAtecoCodes();
    expect(component.filteredAteco().length).toBe(3);
  });

  it('should return empty array when no matches found', () => {
    component.atecoFilterForm.get('searchTerm')?.setValue('xyz');
    component.searchAtecoCodes();
    expect(component.filteredAteco().length).toBe(0);
  });

  it('should calculate first result correctly for pagination', () => {
    component.currentPage = 2;
    component.pageSize = 10;
    expect(component.getFirstResult()).toBe(11);
  });

  it('should calculate last result correctly for pagination', () => {
    component.currentPage = 1;
    component.pageSize = 10;
    component.totalItems = 3;
    expect(component.getLastResult()).toBe(3);
  });

  it('should update pagination values when filtered results change', () => {
    component.atecoFilterForm.get('searchTerm')?.setValue('cereali');
    component.searchAtecoCodes();
    expect(component.totalItems).toBe(1);
    expect(component.totalPages).toBe(1);
  });

  it('should handle page changes correctly', () => {
    const newPage = 2;
    component.onPageChange(newPage);
    expect(component.currentPage).toBe(newPage);
  });

  it('should set selectedRow on selectRow()', () => {
    const row = mockAtecoCodes[0];
    component.selectRow(row);
    expect(component.selectedRow).toEqual(row);
  });

  it('should dismiss the modal on closeModal()', () => {
    component.closeModal();
    expect(modalServiceSpy.dismiss).toHaveBeenCalled();
  });

  it('should close the modal with selectedRow on confirm()', () => {
    const selected = mockAtecoCodes[0];
    component.selectedRow = selected;
    component.confirm();
    expect(modalServiceSpy.close).toHaveBeenCalledWith(selected);
  });

  it('should have correct column configuration', () => {
    expect(component.columns.length).toBeGreaterThan(0);
    // Adjust based on actual column configuration in ATECO_COLUMN_LIST
  });
});
