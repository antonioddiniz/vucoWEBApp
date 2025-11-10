import { Component, Input } from '@angular/core';

export interface CarouselItem {
  id: number;
  imageSrc: string;
  contentDescription?: string;
}

@Component({
  selector: 'app-banner-carousel',
  templateUrl: './banner-carousel.component.html',
  styleUrls: ['./banner-carousel.component.scss']
})
export class BannerCarouselComponent {
  @Input() items: CarouselItem[] = [];
  @Input() preferredItemWidth: number = 252; // em pixels, equivalente a 252.dp
  @Input() maxSmallItemWidth: number = 56; // em pixels, equivalente a 56.dp

  constructor() { }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/placeholder.png';
    }
  }
}