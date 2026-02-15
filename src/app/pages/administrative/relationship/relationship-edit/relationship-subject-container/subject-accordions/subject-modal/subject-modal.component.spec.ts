import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { SubjectModalComponent } from './subject-modal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AdministrativeCommonService } from '../../../../../services/administrative.service';
import { UserDetailsModel } from '../../../../../../../api/glsUserApi/models';
import { FormGroup } from '@angular/forms';

// Mock del child component per evitare errori di template
@Component({
  selector: 'app-subject-edit-body',
  template: ''
})
class MockSubjectEditBodyComponent {
  @Input() formParent!: FormGroup;
}

describe('SubjectModalComponent', () => {
  let component: SubjectModalComponent;
  let fixture: ComponentFixture<SubjectModalComponent>;
  let mockModalRef: jasmine.SpyObj<NgbActiveModal>;

  beforeEach(async () => {
    mockModalRef = jasmine.createSpyObj('NgbActiveModal', ['dismiss', 'close']);

    await TestBed.configureTestingModule({
      imports: [
        SubjectModalComponent, // standalone component va qui
        TranslateModule.forRoot(),
        HttpClientTestingModule
      ],
      declarations: [MockSubjectEditBodyComponent], // solo il mock
      providers: [
        { provide: NgbActiveModal, useValue: mockModalRef },
        AdministrativeCommonService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.title).toBe('');
    expect(component.cancelText).toBe('');
    expect(component.confirmText).toBe('');
  });

  it('should close modal with formParent when confirm is called and formParent exists', () => {
    const administrativeService = TestBed.inject(AdministrativeCommonService);
    const user: UserDetailsModel = { profile: 'EVA_ADMIN', corporateGroup: { id: 1 } };
    const formGroup = administrativeService.setSubjectForm(user);
    component.formParent = formGroup;
    component.confirm();
    expect(mockModalRef.close).toHaveBeenCalledWith(formGroup);
  });

  it('should dismiss the modal when closeModal is called', () => {
    component.closeModal();
    expect(mockModalRef.dismiss).toHaveBeenCalled();
  });

  it('should close modal with undefined if formParent is undefined', () => {
    component.formParent = undefined as any;
    component.confirm();
    expect(mockModalRef.close).toHaveBeenCalledWith(undefined);
  });
});