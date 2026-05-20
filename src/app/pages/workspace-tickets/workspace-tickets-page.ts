import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceTicket, ImportTicketRequest } from '../../models/workspace.model';

function errorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse && err.error?.message) return err.error.message;
  return 'Something went wrong. Please try again.';
}

interface Toast { type: 'ok' | 'err'; msg: string; }

@Component({
  selector: 'app-workspace-tickets-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './workspace-tickets-page.html',
  styleUrl: './workspace-tickets-page.css',
})
export class WorkspaceTicketsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private workspaceService = inject(WorkspaceService);

  workspaceId = signal('');
  workspaceName = signal('');
  currentUserId = signal('');
  tickets = signal<WorkspaceTicket[]>([]);
  mineOnly = signal(false);
  search = signal('');
  loading = signal(true);
  toast = signal<Toast | null>(null);

  importOpen = signal(false);
  importTicketKey = signal('');
  importProjectKey = signal('');
  importSummary = signal('');
  importCreatedAt = signal('');
  importLoading = signal(false);
  importError = signal('');

  confirmRemove = signal<WorkspaceTicket | null>(null);
  removeLoading = signal(false);

  readonly filteredTickets = computed(() => {
    const q = this.search().toLowerCase();
    const base = this.mineOnly()
      ? this.tickets().filter(t => t.importedBy === this.currentUserId())
      : this.tickets();
    return q
      ? base.filter(t =>
          t.ticketKey.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.projectKey.toLowerCase().includes(q)
        )
      : base;
  });

  readonly importValid = computed(() =>
    !!this.importTicketKey().trim() &&
    !!this.importProjectKey().trim() &&
    !!this.importSummary().trim() &&
    !!this.importCreatedAt()
  );

  ngOnInit() {
    const wsId = this.route.snapshot.paramMap.get('workspaceId') ?? '';
    this.workspaceId.set(wsId);

    this.authService.currentUser().subscribe(user => {
      this.currentUserId.set(user.id);
      this.workspaceService.getUserWorkspaces(user.id).subscribe({
        next: wss => this.workspaceName.set(wss.find(w => w.id === wsId)?.name ?? wsId),
        error: () => {},
      });
    });

    this.loadTickets();
  }

  private loadTickets() {
    this.loading.set(true);
    this.workspaceService.getWorkspaceTickets(this.workspaceId()).subscribe({
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

  openImport() {
    this.importTicketKey.set('');
    this.importProjectKey.set('');
    this.importSummary.set('');
    this.importCreatedAt.set('');
    this.importError.set('');
    this.importOpen.set(true);
  }

  submitImport() {
    if (!this.importValid() || this.importLoading()) return;
    const req: ImportTicketRequest = {
      ticketKey: this.importTicketKey().trim(),
      projectKey: this.importProjectKey().trim(),
      summary: this.importSummary().trim(),
      createdAt: new Date(this.importCreatedAt()).toISOString(),
    };
    this.importLoading.set(true);
    this.importError.set('');
    this.workspaceService.importWorkspaceTicket(this.workspaceId(), req).subscribe({
      next: ticket => {
        this.tickets.update(ts => [ticket, ...ts]);
        this.importOpen.set(false);
        this.importLoading.set(false);
        this.showToast('ok', `Ticket ${ticket.ticketKey} imported`);
      },
      error: err => {
        this.importLoading.set(false);
        this.importError.set(errorMessage(err));
      },
    });
  }

  askRemove(ticket: WorkspaceTicket) {
    this.confirmRemove.set(ticket);
  }

  confirmDoRemove() {
    const ticket = this.confirmRemove();
    if (!ticket || this.removeLoading()) return;
    this.removeLoading.set(true);
    this.workspaceService.removeWorkspaceTicket(this.workspaceId(), ticket.ticketKey).subscribe({
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
