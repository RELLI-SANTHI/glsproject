import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeactivationModalComponent } from './deactivation-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

describe('DeactivationModalComponent', () => {
  let component: DeactivationModalComponent;
  let fixture: ComponentFixture<DeactivationModalComponent>;
  let activeModalSpy: jasmine.SpyObj<NgbActiveModal>;

  beforeEach(async () => {
    activeModalSpy = jasmine.createSpyObj('NgbActiveModal', ['close']);
    await TestBed.configureTestingModule({
      imports: [DeactivationModalComponent, TranslateModule.forRoot()],
      providers: [{ provide: NgbActiveModal, useValue: activeModalSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(DeactivationModalComponent);
    component = fixture.componentInstance;

    activeModalSpy = TestBed.inject(NgbActiveModal) as jasmine.SpyObj<NgbActiveModal>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close modal with false on closeModal()', () => {
    component.closeModal();
    expect(activeModalSpy.close).toHaveBeenCalledWith(false);
  });

  it('should close modal with true on confirmDeactivation()', () => {
    component.confirmDeactivation();
    expect(activeModalSpy.close).toHaveBeenCalledWith(true);
  });

  it('should accept input values', () => {
    component.titleLabel = 'Deactivate';
    component.titleParam = 'Test Company';
    component.titleBody = 'Are you sure?';
    expect(component.titleLabel).toBe('Deactivate');
    expect(component.titleParam).toBe('Test Company');
    expect(component.titleBody).toBe('Are you sure?');
  });
});
