import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TicketListItem } from '../../models/ticket.model';
import { TicketService } from '../../services/ticket.service';
import { TicketRowComponent } from '../../components/ticket-row/ticket-row';
import { ImportModalComponent } from '../../components/import-modal/import-modal';

type StatusFilter = 'All' | 'Open' | 'In Progress' | 'In Review' | 'Done' | 'Backlog';

const STATUS_FILTERS: StatusFilter[] = ['All', 'Open', 'In Progress', 'In Review', 'Done', 'Backlog'];

@Component({
  selector: 'app-tickets-page',
  imports: [TicketRowComponent, ImportModalComponent],
  templateUrl: './tickets-page.html',
  styleUrl: './tickets-page.css',
})
export class TicketsPageComponent implements OnInit {
  private ticketService = inject(TicketService);

  tickets = signal<TicketListItem[]>([]);
  activeFilter = signal<StatusFilter>('All');
  showModal = signal(false);

  readonly statusFilters = STATUS_FILTERS;

  filteredTickets = computed(() => {
    const filter = this.activeFilter();
    const all = this.tickets();
    return filter === 'All' ? all : all.filter(t => t.status === filter);
  });

  ngOnInit() {
    this.ticketService.getImportedTickets().subscribe(t => this.tickets.set(t));
  }

  removeTicket(key: string) {
    this.ticketService.removeTicket(key).subscribe(() => {
      this.tickets.update(list => list.filter(t => t.key !== key));
    });
  }

  onImported() {
    this.showModal.set(false);
    this.ticketService.getImportedTickets().subscribe(t => this.tickets.set(t));
  }
}
