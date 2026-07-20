import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { errorMessage } from '../../core/utils/http-error';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { WorkspaceService } from '../../services/workspace.service';
import { Ticket } from '../../models/workspace.model';
import { ImportModalComponent } from '../../components/modals/import-modal/import-modal';
import { ConfirmDialogComponent } from '../../components/ui/common/confirm-dialog/confirm-dialog';
import { ToastComponent } from '../../components/ui/common/toast/toast';
import { WtHeaderComponent } from './wt-header/wt-header';
import { WtToolbarComponent } from './wt-toolbar/wt-toolbar';
import { WtTableComponent } from './wt-table/wt-table';

@Component({
  selector: 'app-workspace-tickets-page',
  imports: [
    ImportModalComponent,
    ConfirmDialogComponent,
    ToastComponent,
    WtHeaderComponent,
    WtToolbarComponent,
    WtTableComponent,
  ],
  templateUrl: './workspace-tickets-page.html',
  styleUrl: './workspace-tickets-page.css',
})
export class TicketsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private workspaceService = inject(WorkspaceService);
  protected toastService = inject(ToastService);

  workspaceId = signal('');
  workspaceName = signal('');
  currentUserId = signal('');
  tickets = signal<Ticket[]>([]);
  mineOnly = signal(false);
  search = signal('');
  loading = signal(true);
  showImport = signal(false);

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
          ticket.title.toLowerCase().includes(query) ||
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
        this.toastService.err(errorMessage(err));
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
        this.toastService.ok(`Ticket ${ticket.ticketKey} removed`);
      },
      error: err => {
        this.removeLoading.set(false);
        this.confirmRemove.set(null);
        this.toastService.err(errorMessage(err));
      },
    });
  }
}
