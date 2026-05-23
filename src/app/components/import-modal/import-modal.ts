import { Component, inject, Input, output, signal } from '@angular/core';
import { TicketService } from '../../services/ticket.service';
import { WorkspaceService } from '../../services/workspace.service';
import { IntegrationService } from '../../services/integration.service';
import { WorkspaceTicketSummary } from '../../models/ticket.model';
import { INTEGRATION_PROVIDERS, IntegrationProvider } from '../../models/integration.model';

type ModalTab = 'url' | 'connect';

@Component({
  selector: 'app-import-modal',
  imports: [],
  templateUrl: './import-modal.html',
  styleUrl: './import-modal.css',
})
export class ImportModalComponent {
  private ticketService = inject(TicketService);
  private workspaceService = inject(WorkspaceService);
  private integrationService = inject(IntegrationService);

  @Input() workspaceId = '';
  close = output<void>();
  imported = output<void>();

  activeTab = signal<ModalTab>('url');
  urlValue = signal('');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showConnectHint = signal(false);

  readonly providers: IntegrationProvider[] = INTEGRATION_PROVIDERS.filter(p => !p.comingSoon);
  recentTickets: WorkspaceTicketSummary[] = [];

  constructor() {
    this.ticketService.getRecentTickets().subscribe(t => (this.recentTickets = t));
  }

  isConnected(id: string): boolean {
    return this.integrationService.isConnected(id);
  }

  connect(id: string): void {
    this.integrationService.connect(id);
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
    this.errorMessage.set(null);
    this.showConnectHint.set(false);

    if (!this.workspaceId) {
      this.isLoading.set(false);
      this.errorMessage.set('Open a workspace first, then import from there.');
      return;
    }

    this.workspaceService.importTicket(this.workspaceId, { url: target }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.close.emit();
        this.imported.emit();
      },
      error: (err: { status: number; error?: { message?: string } }) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Import failed. Please try again.');
        if (err.status === 400 && err.error?.message?.toLowerCase().includes('connect')) {
          this.showConnectHint.set(true);
        }
      },
    });
  }
}
