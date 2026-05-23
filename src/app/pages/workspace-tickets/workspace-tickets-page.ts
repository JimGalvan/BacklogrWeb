import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { WorkspaceService } from '../../services/workspace.service';
import { Ticket } from '../../models/workspace.model';
import { FormsModule } from '@angular/forms';
import { ImportModalComponent } from '../../components/import-modal/import-modal';

function errorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse && err.error?.message) return err.error.message;
  return 'Something went wrong. Please try again.';
}

interface Toast { type: 'ok' | 'err'; msg: string; }

@Component({
  selector: 'app-workspace-tickets-page',
  imports: [FormsModule, RouterLink, ImportModalComponent],
  templateUrl: './workspace-tickets-page.html',
  styleUrl: './workspace-tickets-page.css',
})
export class TicketsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private workspaceService = inject(WorkspaceService);

  workspaceId = signal('');
  workspaceName = signal('');
  currentUserId = signal('');
  tickets = signal<Ticket[]>([]);
  mineOnly = signal(false);
  search = signal('');
  loading = signal(true);
  showImport = signal(false);
  toast = signal<Toast | null>(null);

  confirmRemove = signal<Ticket | null>(null);
  removeLoading = signal(false);

  readonly filteredTickets = computed(() => {
    const query = this.search().toLowerCase();
    const base = this.mineOnly()
      ? this.tickets().filter(ticket => ticket.importedBy === this.currentUserId())
      : this.tickets();
    return query
      ? base.filter(ticket =>
          ticket.ticketKey.toLowerCase().includes(query) ||
          ticket.summary.toLowerCase().includes(query) ||
          ticket.projectKey.toLowerCase().includes(query)
        )
      : base;
  });

  ngOnInit() {
    const workspaceId = this.route.snapshot.paramMap.get('workspaceId') ?? '';
    this.workspaceId.set(workspaceId);

    this.authService.currentUser().subscribe(user => {
      this.currentUserId.set(user.id);
      this.workspaceService.getUserWorkspaces(user.id).subscribe({
        next: workspaces => this.workspaceName.set(workspaces.find(workspace => workspace.id === workspaceId)?.name ?? workspaceId),
        error: () => {},
      });
    });

    this.loadTickets();
  }

  private loadTickets() {
    this.loading.set(true);
    this.workspaceService.getTickets(this.workspaceId()).subscribe({
      next: tickets => {
        this.tickets.set(tickets);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.showToast('err', errorMessage(err));
      },
    });
  }

  onImported() {
    this.loadTickets();
  }

  askRemove(ticket: Ticket) {
    this.confirmRemove.set(ticket);
  }

  confirmDoRemove() {
    const ticket = this.confirmRemove();
    if (!ticket || this.removeLoading()) return;
    this.removeLoading.set(true);
    this.workspaceService.removeTicket(this.workspaceId(), ticket.ticketKey).subscribe({
      next: () => {
        this.tickets.update(ts => ts.filter(t => t.ticketKey !== ticket.ticketKey));
        this.confirmRemove.set(null);
        this.removeLoading.set(false);
        this.showToast('ok', `Ticket ${ticket.ticketKey} removed`);
      },
      error: err => {
        this.removeLoading.set(false);
        this.confirmRemove.set(null);
        this.showToast('err', errorMessage(err));
      },
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private showToast(type: 'ok' | 'err', msg: string) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast.set({ type, msg });
    this.toastTimer = setTimeout(() => this.toast.set(null), 3200);
  }
}
