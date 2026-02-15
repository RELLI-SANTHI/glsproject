import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeLangComponent } from './change-lang.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { GlsLanguageModalComponent } from '../modal-dialog/gls-language-modal/gls-language-modal.component';
import { ChangeDetectorRef } from '@angular/core';

interface MockModalRef {
  componentInstance: { data?: string };
}

describe('ChangeLangComponent', () => {
  let fixture: ComponentFixture<ChangeLangComponent>;
  let component: ChangeLangComponent;
  let mockModalService: jasmine.SpyObj<NgbModal>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['get', 'stream'], {
      currentLang: 'it',
      onLangChange: of(),
      onTranslationChange: of(),
      onDefaultLangChange: of()
    });
    mockTranslateService.get.and.returnValue(of('test'));
    mockTranslateService.stream.and.returnValue(of('test'));

    const mockChangeDetectorRef = {
      markForCheck: () => {},
      detach: () => {},
      detectChanges: () => {},
      checkNoChanges: () => {},
      reattach: () => {}
    } as ChangeDetectorRef;

    await TestBed.configureTestingModule({
      imports: [ChangeLangComponent],
      providers: [
        { provide: NgbModal, useValue: mockModalService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: TranslatePipe, useValue: new TranslatePipe(mockTranslateService, mockChangeDetectorRef) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeLangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should open the modal and pass the current language', () => {
    const mockModalRef: MockModalRef = { componentInstance: {} };
    mockModalService.open.and.returnValue(mockModalRef as unknown as NgbModalRef);

    component.openModal();

    expect(mockModalService.open).toHaveBeenCalledWith(GlsLanguageModalComponent, jasmine.any(Object));
    expect(mockModalRef.componentInstance.data).toBe('it');
  });

  it('should use the translation service for the current language', () => {
    const service = (component as unknown as { translateService: TranslateService })['translateService'];
    expect(service.currentLang).toBe('it');
  });
});
