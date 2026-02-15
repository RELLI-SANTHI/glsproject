import { Component, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { GlsLanguageModalComponent } from '../modal-dialog/gls-language-modal/gls-language-modal.component';
import { GenericService } from '../../utilities/services/generic.service';
import { MODAL_MD } from '../../utilities/constants/modal-options';

@Component({
  selector: 'app-change-lang',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './change-lang.component.html',
  styleUrl: './change-lang.component.scss'
})
export class ChangeLangComponent {
  protected readonly genericService = inject(GenericService);
  private readonly translateService = inject(TranslateService);
  private readonly modalService = inject(NgbModal);

  openModal(): void {
    const modalRef = this.modalService.open(GlsLanguageModalComponent, MODAL_MD);
    modalRef.componentInstance.data = this.translateService.currentLang;
  }
}
