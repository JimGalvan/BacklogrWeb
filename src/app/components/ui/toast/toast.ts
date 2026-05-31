import { Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon';

export interface Toast {
  type: 'ok' | 'err';
  msg: string;
}

@Component({
  selector: 'app-toast',
  imports: [IconComponent],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class ToastComponent {
  toast = input<Toast | null>(null);
}
