import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'gls-title-budge',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './title-budge.component.html',
  styleUrl: './title-budge.component.scss'
})
export class TitleBudgeComponent {
  label = input.required<string>();
  value = input.required<string | null>();
}
