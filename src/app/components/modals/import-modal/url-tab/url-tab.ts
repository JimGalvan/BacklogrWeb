import { Component, inject, model, output } from '@angular/core';
import { TicketService } from '../../../../services/ticket.service';
import { WorkspaceTicketSummary } from '../../../../models/ticket.model';
import { IconComponent } from '../../../ui/common/icon/icon';

@Component({
  selector: 'app-import-url-tab',
  imports: [IconComponent],
  templateUrl: './url-tab.html',
  styleUrl: './url-tab.css',
})
export class ImportUrlTabComponent {
  private ticketService = inject(TicketService);

  url = model('');
  /** Emits a ticket key to import, or undefined to use the current URL value. */
  importTicket = output<string | undefined>();

  recentTickets: WorkspaceTicketSummary[] = [];

  constructor() {
    this.ticketService.getRecentTickets().subscribe(tickets => (this.recentTickets = tickets));
  }

  onInput(event: Event): void {
    this.url.set((event.target as HTMLInputElement).value);
  }
}
