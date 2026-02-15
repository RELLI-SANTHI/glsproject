import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { UtilityRouting } from '../../utilities/utility-routing';

@Component({
  selector: 'gls-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgbTooltipModule],
  templateUrl: './gls-card.component.html',
  styleUrl: './gls-card.component.scss'
})
export class GlsCardComponent {
  // label = input.required<string>();
  header = input<string>();
  title = input.required<string>();
  subtitle = input<string>();
  icon = input.required<string>();
  isTitleLink = input<boolean>(false);
  goToLink = input<string>();
  goToParam = input<string>();
  size = input<'s' | 'm' | 'l'>('s');

  goTo(): void {
    UtilityRouting.navigateTo(this.goToLink()!, this.goToParam());
  }
}
