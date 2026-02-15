import { Component, EventEmitter, input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-badge-link',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './badge-link.component.html',
  styleUrl: './badge-link.component.scss'
})
export class BadgeLinkComponent {
  label = input.required<string>();
  value = input.required<string | null>();
  @Output() linkClick = new EventEmitter<Event>();

  onClick(event: Event) {
    event.preventDefault();
    this.linkClick.emit();
  }
}
