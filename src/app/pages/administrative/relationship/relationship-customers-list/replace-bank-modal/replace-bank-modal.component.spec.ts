import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ReplaceBankModalComponent } from './replace-bank-modal.component';
import { BankResponse } from '../../../../../api/glsAdministrativeApi/models/bank-response';
import { BankService } from '../../../../../api/glsAdministrativeApi/services';
import { GenericService } from '../../../../../common/utilities/services/generic.service';

// eslint-disable-next-line max-lines-per-function
describe('ReplaceBankModalComponent', () => {
  let component: ReplaceBankModalComponent;
  let fixture: ComponentFixture<ReplaceBankModalComponent>;
  const dismissSpy = jasmine.createSpy('dismiss');
  const closeSpy = jasmine.createSpy('close');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplaceBankModalComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NgbActiveModal, useValue: { dismiss: dismissSpy, close: closeSpy } },
        { provide: FormBuilder, useValue: new FormBuilder() },
        { provide: BankService, useValue: {} },
        { provide: GenericService, useValue: { manageError: jasmine.createSpy() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReplaceBankModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set and get oldBank signal', () => {
    const bank: BankResponse = { id: 1, name: 'Bank1' } as BankResponse;
    component.oldBank.set(bank);
    expect(component.oldBank()).toEqual(bank);
  });

  it('should set and get newBank signal', () => {
    const bank: BankResponse = { id: 2, name: 'Bank2' } as BankResponse;
    component.newBank.set(bank);
    expect(component.newBank()).toEqual(bank);
  });

  it('should set and get oldBankList signal', () => {
    const banks: BankResponse[] = [{ id: 1, name: 'Bank1' } as BankResponse];
    component.oldBankList.set(banks);
    expect(component.oldBankList()).toEqual(banks);
  });

  it('should set and get newBankList signal', () => {
    const banks: BankResponse[] = [{ id: 2, name: 'Bank2' } as BankResponse];
    component.newBankList.set(banks);
    expect(component.newBankList()).toEqual(banks);
  });

  it('should set and get enableBtnChange signal', () => {
    component.enableBtnChange.set(true);
    expect(component.enableBtnChange()).toBeTrue();
  });

  it('should call closeModal without error', () => {
    component.closeModal();
    expect(dismissSpy).toHaveBeenCalled();
  });

  it('should call replace and close modal with correct data', () => {
    const oldBank: BankResponse = { id: 1, name: 'Old' } as BankResponse;
    const newBank: BankResponse = { id: 2, name: 'New' } as BankResponse;
    component.oldBank.set(oldBank);
    component.newBank.set(newBank);
    component.companyForm.get('administrativeId')?.setValue(123);

    component.replace();

    expect(closeSpy).toHaveBeenCalledWith({ old: 1, new: 2, idCompany: 123 });
  });
});
