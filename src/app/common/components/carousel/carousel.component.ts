import { ChangeDetectionStrategy, Component, ContentChild, inject, input, OnInit, output, TemplateRef, ViewChild } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { NgbCarousel, NgbSlide, NgbTooltipModule, NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';

import { GenericService } from '../../utilities/services/generic.service';
import { VIEW_MODE } from '../../app.constants';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../utilities/constants/profile';
import { Carousel } from '../../models/carousel';
import { UserProfileService } from '../../utilities/services/profile/user-profile.service';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [NgbCarousel, NgbSlide, NgbTooltipModule, NgTemplateOutlet, NgClass],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NgbCarouselConfig]
})
export class CarouselComponent implements OnInit {
  constructor(config: NgbCarouselConfig) {
    config.animation = false; // Disabilita l'animazione per migliorare l'accessibilità
    config.interval = 0; // Disabilita l'auto-scorrimento per migliorare l'accessibilità
  }
  @ViewChild('carousel', { static: false }) carousel!: NgbCarousel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @ContentChild(TemplateRef) slideTemplate!: TemplateRef<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listCarousel = input.required<Carousel<any>[][]>();
  clickEvent = output<number>();
  typeViewMode: VIEW_MODE = VIEW_MODE.DESKTOP;
  PROFILE = PROFILE;
  FUNCTIONALITY = FUNCTIONALITY;
  PERMISSION = PERMISSION;
  private readonly genericService = inject(GenericService);
  private readonly userProfileService = inject(UserProfileService);

  get isDesktop(): boolean {
    return this.typeViewMode === VIEW_MODE.DESKTOP;
  }

  ngOnInit(): void {
    this.typeViewMode = this.genericService.viewMode();
  }

  goToSlide(index: number) {
    if (this.carousel) {
      const i = this.getSlideID(index);
      this.carousel.select(i);
    }
  }

  getActivePointer(activeId: string, i: number): boolean {
    return activeId ? activeId === this.getSlideID(i) : false;
  }

  getSlideID(index: number): string {
    return `ngb-slide-${index}`;
  }
}
