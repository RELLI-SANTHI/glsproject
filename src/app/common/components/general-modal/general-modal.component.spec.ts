import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeneralModalComponent } from './general-modal.component';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ComponentRef, ViewContainerRef } from '@angular/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';

// Componente fake child
@Component({
  selector: 'app-fake-child',
  template: ''
})
class FakeChildComponent {
  @Input() someInput = '';
  @Output() rowSelected = new EventEmitter<any>();
}

// eslint-disable-next-line max-lines-per-function
describe('GeneralModalComponent', () => {
  let component: GeneralModalComponent;
  let fixture: ComponentFixture<GeneralModalComponent>;
  let modalRefSpy: jasmine.SpyObj<NgbActiveModal>;
  let fakeChildComponentRef: ComponentRef<FakeChildComponent>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);

    await TestBed.configureTestingModule({
      declarations: [FakeChildComponent],
      imports: [GeneralModalComponent, TranslateModule.forRoot()],
      providers: [{ provide: NgbActiveModal, useValue: spy }, TranslateService, TranslateStore]
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralModalComponent);
    component = fixture.componentInstance;
    modalRefSpy = TestBed.inject(NgbActiveModal) as jasmine.SpyObj<NgbActiveModal>;

    component.contentComponent = FakeChildComponent;
    component.contentInputs = { someInput: 'test value' };

    fixture.detectChanges();

    const fakeChildInstance = new FakeChildComponent();
    fakeChildComponentRef = {
      instance: fakeChildInstance,
      destroy: jasmine.createSpy('destroy')
    } as unknown as ComponentRef<FakeChildComponent>;

    spyOn(component.contentContainer as ViewContainerRef, 'createComponent').and.returnValue(fakeChildComponentRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dynamically create the contentComponent and set inputs', () => {
    component.ngAfterViewInit();

    expect(component.contentContainer.createComponent).toHaveBeenCalled();
    expect(fakeChildComponentRef.instance.someInput).toBe('test value');
  });

  it('should update selectedRow when child emits rowSelected', () => {
    component.ngAfterViewInit();

    const testRow = { id: 123 };
    (fakeChildComponentRef.instance.rowSelected as EventEmitter<any>).emit(testRow);

    expect(component.selectedRow).toEqual(testRow);
  });

  it('should call modalRef.dismiss when closeModal is called', () => {
    component.closeModal();
    expect(modalRefSpy.dismiss).toHaveBeenCalled();
  });

  it('should call modalRef.close with selectedRow when confirm is called and selectedRow is set', () => {
    const testRow = { id: 999 };
    component.selectedRow = testRow;

    component.confirm();

    expect(modalRefSpy.close).toHaveBeenCalledWith(testRow);
  });

  it('should call modalRef.close without parameters when confirm is called and selectedRow is undefined', () => {
    component.selectedRow = undefined;

    component.confirm();

    expect(modalRefSpy.close).toHaveBeenCalledWith();
  });
});
