import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-app-special-badge',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './app-special-badge.component.html',
  styleUrl: './app-special-badge.component.scss'
})
export class AppSpecialBadgeComponent {
  showBadge = input<boolean>(false);
}
