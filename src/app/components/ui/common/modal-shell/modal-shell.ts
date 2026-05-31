import { Component, input, output } from '@angular/core';

/**
 * Modal backdrop + animated card. Clicking the backdrop (but not the card)
 * emits `dismiss`. Card contents are projected.
 */
@Component({
  selector: 'app-modal-shell',
  imports: [],
  templateUrl: './modal-shell.html',
  styleUrl: './modal-shell.css',
})
export class ModalShellComponent {
  width = input(480);
  dismiss = output<void>();

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.dismiss.emit();
    }
  }
}
