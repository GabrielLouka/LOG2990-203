/* eslint-disable prettier/prettier */
import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ConfigurationPageComponent } from '@app/pages/configuration-page/configuration-page.component';
import { NgbCarouselConfig, NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sliding-page',
  standalone: true,
  imports: [NgbCarouselModule, NgIf],
  templateUrl: './sliding-page.component.html',
  providers: [NgbCarouselConfig], // add NgbCarouselConfig to the component providers
})
export class SlidingPageComponent {
  @Input() slides: ConfigurationPageComponent[];
  constructor(config: NgbCarouselConfig) {
    // customize default values of carousels used by this component tree
    config.interval = 10000;
    config.wrap = false;
    config.keyboard = false;
    config.pauseOnHover = false;
  }
}
