/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlsLanguageModalComponent } from './gls-language-modal.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

describe('GlsLanguageModalComponent', () => {
  let component: GlsLanguageModalComponent;
  let fixture: ComponentFixture<GlsLanguageModalComponent>;
  let activeModal: jasmine.SpyObj<NgbActiveModal>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    activeModal = jasmine.createSpyObj('NgbActiveModal', ['close']);
    translateService = jasmine.createSpyObj('TranslateService', ['use']);

    await TestBed.configureTestingModule({
      imports: [GlsLanguageModalComponent],
      providers: [
        { provide: NgbActiveModal, useValue: activeModal },
        { provide: TranslateService, useValue: translateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GlsLanguageModalComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize selectLang with input data on ngOnInit', () => {
    component.data = 'en';
    component.ngOnInit();
    expect(component.selectLang).toBe('en');
  });

  it('should update selectLang when onSelectChange is called', () => {
    component.onSelectChange('it');
    expect(component.selectLang).toBe('it');
  });

  it('should close modal with false when closeModal is called', () => {
    component.closeModal();
    expect(activeModal.close).toHaveBeenCalledWith(false);
  });

  it('should change language, close modal, and emit event when save is called', () => {
    component.selectLang = 'it';
    spyOn(component.dataChange, 'emit');

    component.save();

    expect(translateService.use).toHaveBeenCalledWith('it');
    expect(activeModal.close).toHaveBeenCalledWith(true);
    expect(component.dataChange.emit).toHaveBeenCalledWith('it');
  });
});
