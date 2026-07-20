import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, switchMap, tap } from 'rxjs';
import { errorMessage } from '../../core/utils/http-error';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { WorkspaceService } from '../../services/workspace.service';
import { Ticket, Workspace } from '../../models/workspace.model';
import { OnboardingService } from '../../services/onboarding.service';
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
  private router = inject(Router);
  private authService = inject(AuthService);
  private workspaceService = inject(WorkspaceService);
  private onboardingService = inject(OnboardingService);
  private destroyRef = inject(DestroyRef);
  protected toastService = inject(ToastService);

  workspaceId = signal('');
  workspaces = signal<Workspace[]>([]);
  currentUserId = signal('');
  tickets = signal<Ticket[]>([]);
  mineOnly = signal(false);
  search = signal('');
  loading = signal(true);
  showImport = signal(false);

  confirmRemove = signal<Ticket | null>(null);
  removeLoading = signal(false);

  readonly selectedWorkspace = computed(() =>
    this.workspaces().find(workspace => workspace.id === this.workspaceId()) ?? null
  );

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

  ngOnInit(): void {
    this.authService.currentUser().pipe(
      tap(user => this.currentUserId.set(user.id)),
      switchMap(user => forkJoin({
        workspaces: this.workspaceService.getUserWorkspaces(user.id),
        onboarding: this.onboardingService.getState(),
      })),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: ({ workspaces, onboarding }) => {
        this.workspaces.set(workspaces);
        const requestedId = this.route.snapshot.queryParamMap.get('workspaceId')
          ?? this.route.snapshot.paramMap.get('workspaceId');
        const requested = workspaces.find(workspace => workspace.id === requestedId);
        const defaultWorkspace = workspaces.find(
          workspace => workspace.id === onboarding.defaultWorkspace.id
        );
        const initial = requested ?? defaultWorkspace ?? workspaces[0] ?? null;
        if (initial) {
          this.selectWorkspace(initial.id, true);
        } else {
          this.loading.set(false);
        }
      },
      error: error => {
        this.loading.set(false);
        this.toastService.err(errorMessage(error, 'Workspaces could not be loaded.'));
      },
    });
  }

  selectWorkspace(workspaceId: string, replaceUrl = false): void {
    if (!workspaceId || !this.workspaces().some(workspace => workspace.id === workspaceId)) return;
    this.workspaceId.set(workspaceId);
    this.search.set('');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { workspaceId },
      replaceUrl,
    });
    this.loadTickets(workspaceId);
  }

  private loadTickets(workspaceId: string): void {
    this.loading.set(true);
    this.tickets.set([]);
    this.workspaceService.getTickets(workspaceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: tickets => {
        if (workspaceId !== this.workspaceId()) return;
        this.tickets.set(tickets);
        this.loading.set(false);
      },
      error: err => {
        if (workspaceId !== this.workspaceId()) return;
        this.loading.set(false);
        this.toastService.err(errorMessage(err));
      },
    });
  }

  onImported(): void {
    this.loadTickets(this.workspaceId());
  }

  askRemove(ticket: Ticket) {
    this.confirmRemove.set(ticket);
  }

  confirmDoRemove() {
    const ticket = this.confirmRemove();
    if (!ticket || this.removeLoading()) return;
    this.removeLoading.set(true);
    this.workspaceService.removeTicket(this.workspaceId(), ticket.ticketKey)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
