import { Component, model, output } from '@angular/core';
import { IconComponent } from '../../../ui/common/icon/icon';

@Component({
  selector: 'app-import-url-tab',
  imports: [IconComponent],
  templateUrl: './url-tab.html',
  styleUrl: './url-tab.css',
})
export class ImportUrlTabComponent {
  url = model('');
  /** Emits a ticket key to import, or undefined to use the current URL value. */
  importTicket = output<string | undefined>();

  onInput(event: Event): void {
    this.url.set((event.target as HTMLInputElement).value);
  }
}
