import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { GenericService } from '../../utilities/services/generic.service';
import { VIEW_MODE } from '../../app.constants';

@Component({
  selector: 'gls-navbar',
  standalone: true,
  imports: [NgbCollapseModule, TranslateModule],
  templateUrl: './gls-navbar.component.html',
  styleUrl: './gls-navbar.component.scss'
})
export class GlsNavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  isSmallMobile = false;
  private readonly genericService = inject(GenericService);

  ngOnInit(): void {
    this.isSmallMobile = this.genericService.viewMode() === VIEW_MODE.MOBILE;
  }

  toggleSidebarValue() {
    this.toggleSidebar.emit();
  }
}
