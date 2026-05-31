import { Component, input, output } from '@angular/core';
import { IconComponent, IconName } from '../icon/icon';

/**
 * Generic confirmation modal. Backdrop click and Cancel both emit `cancel`;
 * the primary button emits `confirm`. Set `danger` for destructive actions.
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [IconComponent],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialogComponent {
  title = input.required<string>();
  message = input<string>('');
  icon = input<IconName | null>(null);
  confirmLabel = input('Confirm');
  cancelLabel = input('Cancel');
  danger = input(false);
  loading = input(false);

  confirm = output<void>();
  cancel = output<void>();
}
