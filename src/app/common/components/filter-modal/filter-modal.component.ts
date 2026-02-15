import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'gls-filter-modal',
  standalone: true,
  imports: [],
  templateUrl: './filter-modal.component.html',
  styleUrl: './filter-modal.component.scss'
})


export class FilterModalComponent {

  constructor(
    private activeModal: NgbActiveModal,
  ) { };

  closeModal() {
    this.activeModal.close();
  }
}
