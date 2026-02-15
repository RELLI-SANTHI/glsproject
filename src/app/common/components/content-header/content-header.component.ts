import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-content-header',
  standalone: true,
  imports: [TranslatePipe, NgClass],
  templateUrl: './content-header.component.html',
  styleUrl: './content-header.component.scss'
})
export class ContentHeaderComponent {
  image = input.required<string>();
  title = input.required<string>();
  subTitle = input.required<string>();
  showBtnExport = input();
  disableExportBtn = input();
  showBtnCreate = input();
  labelBtnCreate = input<string>('');
  isSmallMobile = input();
  isTablet = input();
  btnExportEvent = output();
  btnCreateEvent = output();
  isEditTitle = input<boolean>();
}
