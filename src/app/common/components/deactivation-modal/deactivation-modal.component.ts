import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-deactivation-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './deactivation-modal.component.html',
  styleUrl: './deactivation-modal.component.scss'
})
export class DeactivationModalComponent {
  @Input() titleLabel!: string;
  @Input() titleParam!: string;
  @Input() titleBody!: string;

  constructor(public activeModal: NgbActiveModal) {}

  closeModal(): void {
    this.activeModal.close(false);
  }

  confirmDeactivation(): void {
    this.activeModal.close(true);
  }
}
