import { Component, input } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { WarningRow } from '../../models/warning-status';

@Component({
  selector: 'app-warning-status',
  standalone: true,
  imports: [NgIf, NgClass, NgbTooltip, TranslatePipe],
  templateUrl: './warning-status.component.html',
  styleUrl: './warning-status.component.scss'
})
export class WarningStatusComponent {
  row = input<WarningRow>();
  label = input<string>('');
}
