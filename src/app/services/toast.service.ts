import { Injectable, signal } from '@angular/core';
import { Toast } from '../components/ui/common/toast/toast';

const AUTO_DISMISS_MS = 3200;

/**
 * Signal-based toast state shared across pages.
 * Render once per page with `<app-toast [toast]="toastService.toast()" />`.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly toast = signal<Toast | null>(null);

  ok(msg: string): void {
    this.show({ type: 'ok', msg });
  }

  err(msg: string): void {
    this.show({ type: 'err', msg });
  }

  show(toast: Toast): void {
    if (this.timer) clearTimeout(this.timer);
    this.toast.set(toast);
    this.timer = setTimeout(() => this.toast.set(null), AUTO_DISMISS_MS);
  }

  clear(): void {
    if (this.timer) clearTimeout(this.timer);
    this.toast.set(null);
  }
}
