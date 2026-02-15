import { Component, inject, output } from '@angular/core';
import { MessageStatusService } from '../../utilities/services/message/message.service';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'gls-messages',
  standalone: true,
  imports: [TranslateModule, AsyncPipe, CommonModule],
  templateUrl: './gls-messages.component.html',
  styleUrl: './gls-messages.component.scss'
})
export class GlsMessagesComponent {
  downloadEvent = output();
  protected messageStatusService = inject(MessageStatusService);

  closeWarningMessage(): void {
    this.messageStatusService.setWarningMessage(null);
  }

  closeSuccessMessage(): void {
    this.messageStatusService.setSuccessMessage(null);
  }

  downloadReport(): void {
    this.downloadEvent.emit();
  }
}
