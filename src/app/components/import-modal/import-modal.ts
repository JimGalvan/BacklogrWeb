import { Component, inject, output, signal } from '@angular/core';
import { TicketService } from '../../services/ticket.service';
import { WorkspaceTicketSummary } from '../../models/ticket.model';

type ModalTab = 'url' | 'connect';

@Component({
  selector: 'app-import-modal',
  imports: [],
  templateUrl: './import-modal.html',
  styleUrl: './import-modal.css',
})
export class ImportModalComponent {
  private ticketService = inject(TicketService);

  close = output<void>();
  imported = output<void>();

  activeTab = signal<ModalTab>('url');
  urlValue = signal('');
  isLoading = signal(false);

  recentTickets: WorkspaceTicketSummary[] = [];

  constructor() {
    this.ticketService.getRecentTickets().subscribe(t => (this.recentTickets = t));
  }

  onUrlInput(event: Event) {
    this.urlValue.set((event.target as HTMLInputElement).value);
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  importFromUrl(url?: string) {
    const target = url ?? this.urlValue();
    if (!target || this.isLoading()) return;
    this.isLoading.set(true);
    this.ticketService.importTicket(target).subscribe(() => {
      this.isLoading.set(false);
      this.close.emit();
      this.imported.emit();
    });
  }
}
