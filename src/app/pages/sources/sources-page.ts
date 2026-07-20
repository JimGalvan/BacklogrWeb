import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin, switchMap } from 'rxjs';
import { ButtonComponent } from '../../components/ui/common/button/button';
import { ConfirmDialogComponent } from '../../components/ui/common/confirm-dialog/confirm-dialog';
import { IconComponent } from '../../components/ui/common/icon/icon';
import { ModalShellComponent } from '../../components/ui/common/modal-shell/modal-shell';
import { ToastComponent } from '../../components/ui/common/toast/toast';
import { errorMessage } from '../../core/utils/http-error';
import { SourcePoller } from '../../core/shared/source-poller';
import { Source, shortRevision, sourceStatusLabel, sourceTypeLabel } from '../../models/source.model';
import { Workspace } from '../../models/workspace.model';
import { AuthService } from '../../services/auth.service';
import { OnboardingService } from '../../services/onboarding.service';
import { ToastService } from '../../services/toast.service';
import { SourceService } from '../../services/source.service';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'app-sources-page',
  imports: [
    FormsModule,
    ButtonComponent,
    ConfirmDialogComponent,
    IconComponent,
    ModalShellComponent,
    ToastComponent,
  ],
  templateUrl: './sources-page.html',
  styleUrl: './sources-page.css',
})
export class SourcesPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly onboardingService = inject(OnboardingService);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly sourceService = inject(SourceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly toastService = inject(ToastService);

  readonly workspaces = signal<Workspace[]>([]);
  readonly selectedWorkspaceId = signal('');
  readonly sources = signal<Source[]>([]);
  readonly loading = signal(true);
  readonly actionSourceId = signal<string | null>(null);
  readonly addOpen = signal(false);
  readonly sourceUrl = signal('');
  readonly addLoading = signal(false);
  readonly addError = signal('');
  readonly removeTarget = signal<Source | null>(null);
  readonly removeLoading = signal(false);

  readonly selectedWorkspace = computed(() =>
    this.workspaces().find(workspace => workspace.id === this.selectedWorkspaceId()) ?? null
  );

  private readonly poller = new SourcePoller(this.destroyRef);

  ngOnInit(): void {
    this.authService.currentUser().pipe(
      switchMap(user => forkJoin({
        workspaces: this.workspaceService.getUserWorkspaces(user.id),
        onboarding: this.onboardingService.getState(),
      })),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: ({ workspaces, onboarding }) => {
        this.workspaces.set(workspaces);
        const requestedId = this.route.snapshot.queryParamMap.get('workspaceId');
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
    this.selectedWorkspaceId.set(workspaceId);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { workspaceId },
      replaceUrl,
    });
    this.loadSources(workspaceId);
  }

  openAdd(): void {
    this.sourceUrl.set('');
    this.addError.set('');
    this.addOpen.set(true);
  }

  closeAdd(): void {
    if (this.addLoading()) return;
    this.addOpen.set(false);
  }

  addSource(event: Event): void {
    event.preventDefault();
    const workspaceId = this.selectedWorkspaceId();
    const url = this.sourceUrl().trim();
    if (!workspaceId || !url || this.addLoading()) return;

    this.addLoading.set(true);
    this.addError.set('');
    this.sourceService.addSource(workspaceId, url).pipe(
      finalize(() => this.addLoading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: source => {
        this.sources.update(sources => [source, ...sources]);
        this.addOpen.set(false);
        this.toastService.ok(`${source.name} added to ${this.selectedWorkspace()?.name}`);
        this.startPollingIfNeeded();
      },
      error: error => this.addError.set(
        errorMessage(error, 'The source could not be added. Check the URL and connection access.')
      ),
    });
  }

  reindex(source: Source): void {
    const workspaceId = this.selectedWorkspaceId();
    if (!workspaceId || this.actionSourceId()) return;
    this.actionSourceId.set(source.id);
    this.sourceService.reindexSource(workspaceId, source.id).pipe(
      finalize(() => this.actionSourceId.set(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: updated => {
        this.replaceSource(updated);
        this.toastService.ok(`Re-indexing ${source.name}`);
        this.startPollingIfNeeded();
      },
      error: error => this.toastService.err(errorMessage(error, `Could not re-index ${source.name}.`)),
    });
  }

  askRemove(source: Source): void {
    this.removeTarget.set(source);
  }

  removeSource(): void {
    const workspaceId = this.selectedWorkspaceId();
    const source = this.removeTarget();
    if (!workspaceId || !source || this.removeLoading()) return;
    this.removeLoading.set(true);
    this.sourceService.removeSource(workspaceId, source.id).pipe(
      finalize(() => this.removeLoading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        this.sources.update(sources => sources.filter(item => item.id !== source.id));
        this.removeTarget.set(null);
        this.toastService.ok(`${source.name} removed from ${this.selectedWorkspace()?.name}`);
        this.startPollingIfNeeded();
      },
      error: error => {
        this.removeTarget.set(null);
        this.toastService.err(errorMessage(error, `Could not remove ${source.name}.`));
      },
    });
  }

  readonly sourceTypeLabel = sourceTypeLabel;
  readonly statusLabel = sourceStatusLabel;
  readonly shortRevision = shortRevision;

  private loadSources(workspaceId: string): void {
    this.poller.stop();
    this.loading.set(true);
    this.sources.set([]);
    this.sourceService.getSources(workspaceId).pipe(
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: sources => {
        if (workspaceId !== this.selectedWorkspaceId()) return;
        this.sources.set(sources);
        this.startPollingIfNeeded();
      },
      error: error => this.toastService.err(errorMessage(error, 'Sources could not be loaded.')),
    });
  }

  private startPollingIfNeeded(): void {
    const workspaceId = this.selectedWorkspaceId();
    this.poller.startIfNeeded(
      this.sources(),
      () => this.sourceService.getSources(workspaceId),
      sources => {
        if (workspaceId !== this.selectedWorkspaceId()) return [];
        this.sources.set(sources);
        return sources;
      },
    );
  }

  private replaceSource(updated: Source): void {
    this.sources.update(sources => sources.map(source => source.id === updated.id ? updated : source));
  }
}
