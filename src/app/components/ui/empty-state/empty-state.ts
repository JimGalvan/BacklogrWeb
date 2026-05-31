import { Component, input } from '@angular/core';

/**
 * Centered empty / error placeholder: projected icon, heading, optional
 * subtext, and an optional action (e.g. a button or link) via default slot.
 * Shared across pages — the parent is responsible for positioning/centering.
 */
@Component({
  selector: 'app-empty-state',
  imports: [],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyStateComponent {
  heading = input.required<string>();
  subtext = input<string>('');
}
