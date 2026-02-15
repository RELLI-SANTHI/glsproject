import { Component, inject, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { SubjectEditBodyComponent } from '../../../../../subject/subject-edit/subject-edit-body/subject-edit-body.component';
import { FormGroup } from '@angular/forms';
import { GenericDropdown } from '../../../../../../../common/models/generic-dropdown';
@Component({
  selector: 'app-subject-modal',
  standalone: true,
  imports: [TranslateModule, SubjectEditBodyComponent],
  templateUrl: './subject-modal.component.html',
  styleUrl: './subject-modal.component.scss'
})
export class SubjectModalComponent {
  @Input() title = '';
  @Input() cancelText = '';
  @Input() confirmText = '';
  @Input() formParent!: FormGroup;
  @Input() nationDefault: GenericDropdown | null = null;
  @Input() nationList: GenericDropdown[] | null = null;

  private readonly ngbActiveModal = inject(NgbActiveModal);

  closeModal(): void {
    this.ngbActiveModal.dismiss();
  }

  confirm(): void {
    this.ngbActiveModal.close(this.formParent);
  }
}
