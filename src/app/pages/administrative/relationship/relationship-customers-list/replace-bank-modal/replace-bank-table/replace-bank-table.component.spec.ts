import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { TranslateModule } from '@ngx-translate/core';

import { ReplaceBankTableComponent } from './replace-bank-table.component';
import { BankResponse } from '../../../../../../api/glsAdministrativeApi/models/bank-response';

// eslint-disable-next-line max-lines-per-function
describe('ReplaceBankTableComponent', () => {
  let component: ReplaceBankTableComponent;
  let fixture: ComponentFixture<ReplaceBankTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplaceBankTableComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplaceBankTableComponent);
    component = fixture.componentInstance;
    signalSetFn(component.bankList[SIGNAL], []);
    signalSetFn(component.tableId[SIGNAL], '');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept bankList input', () => {
    const banks: BankResponse[] = [{ id: 1, name: 'Bank1' } as BankResponse];
    signalSetFn(component.bankList[SIGNAL], banks);
    expect(component.bankList()).toEqual(banks);
  });

  it('should accept tableId input', () => {
    signalSetFn(component.tableId[SIGNAL], 'test-table');
    expect(component.tableId()).toBe('test-table');
  });

  it('should emit rowSelected output', (done) => {
    const bank: BankResponse = { id: 2, name: 'Bank2' } as BankResponse;
    component.rowSelected.subscribe((selected) => {
      expect(selected).toEqual(bank);
      done();
    });
    component.rowSelected.emit(bank);
  });

  it('should set filtered bank list and update pagination on ngOnInit', () => {
    const banks: BankResponse[] = [
      { id: 1, name: 'Bank1' } as BankResponse,
      { id: 2, name: 'Bank2' } as BankResponse
    ];
    signalSetFn(component.bankList[SIGNAL], banks);
    component.ngOnInit();
    expect(component.bankListFiltered()).toEqual(banks);
    expect(component.totalItems).toBe(2);
    expect(component.totalPages).toBe(1);
  });

  it('should return correct first and last result indexes', () => {
    component.pageSize = 10;
    component.currentPage = 2;
    component.totalItems = 25;
    expect(component.getFirstResult()).toBe(11);
    expect(component.getLastResult()).toBe(20);
  });

  it('should update filtered list on page change', () => {
    const banks: BankResponse[] = [];
    for (let i = 1; i <= 25; i++) {
      banks.push({ id: i, name: `Bank${i}` } as BankResponse);
    }
    signalSetFn(component.bankList[SIGNAL], banks);
    component.pageSize = 10;
    component.currentPage = 1;
    component.ngOnInit();
    component.onPageChange(2);
    expect(component.currentPage).toBe(2);
    expect(component.bankListFiltered()).toEqual(banks.slice(10, 20));
  });

  it('should handle empty bankList gracefully', () => {
    signalSetFn(component.bankList[SIGNAL], []);
    component.ngOnInit();
    expect(component.bankListFiltered()).toEqual([]);
    expect(component.totalItems).toBe(0);
    expect(component.totalPages).toBe(0);
  });
});
