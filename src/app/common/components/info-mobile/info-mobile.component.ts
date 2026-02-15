import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-info-mobile',
  standalone: true,
  imports: [
    TranslatePipe
  ],
  templateUrl: './info-mobile.component.html',
  styleUrl: './info-mobile.component.scss'
})
export class InfoMobileComponent {

  label = input.required<string>();

}
