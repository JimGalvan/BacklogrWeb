import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tag',
  imports: [],
  templateUrl: './tag.html',
  styleUrl: './tag.css',
})
export class TagComponent {
  label = input.required<string>();
}
