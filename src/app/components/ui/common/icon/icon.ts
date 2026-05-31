import { Component, input } from '@angular/core';

export type IconName =
  | 'sparkle'
  | 'lightning'
  | 'refresh'
  | 'refresh-cw'
  | 'play'
  | 'search'
  | 'checklist'
  | 'document'
  | 'plus'
  | 'eye'
  | 'trash'
  | 'warning'
  | 'check'
  | 'link'
  | 'arrow-right';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.html',
  styleUrl: './icon.css',
})
export class IconComponent {
  name = input.required<IconName>();
  size = input(16);
  strokeWidth = input(2);
}
