import { Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'text';

/**
 * Shared button primitive. Label/content is projected.
 * Extracted from the `.btn` system previously duplicated per page.
 */
@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class ButtonComponent {
  variant = input<ButtonVariant>('secondary');
  type = input<'button' | 'submit'>('button');
  disabled = input(false);
  loading = input(false);

  clicked = output<void>();

  onClick(): void {
    if (!this.disabled() && !this.loading()) this.clicked.emit();
  }
}
