import { Component, DestroyRef, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { errorMessage } from '../../../core/utils/http-error';
import { SourcePoller } from '../../../core/shared/source-poller';
import { Source, sourceStatusLabel, sourceTypeLabel } from '../../../models/source.model';
import { SourceService } from '../../../services/source.service';
import { ButtonComponent } from '../../ui/common/button/button';
import { IconComponent } from '../../ui/common/icon/icon';
import { ModalShellComponent } from '../../ui/common/modal-shell/modal-shell';

@Component({
  selector: 'app-source-context-bar',
  imports: [ButtonComponent, IconComponent, ModalShellComponent, RouterLink],
  templateUrl: './source-context-bar.html',
  styleUrl: './source-context-bar.css',
})
export class SourceContextBarComponent {
  workspaceId = input.required<string>();
  ticketKey = input.required<string>();

  private readonly sourceService = inject(SourceService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly poller = new SourcePoller(this.destroyRef);

  readonly availableSources = signal<Source[]>([]);
  readonly selectedSources = signal<Source[]>([]);
  readonly loading = signal(false);
  readonly modalOpen = signal(false);
  readonly selectedDraft = signal<Set<string>>(new Set());
  readonly saving = signal(false);
  readonly actionError = signal<string | null>(null);

  readonly readyCount = computed(() =>
    this.selectedSources().filter(source => source.status === 'PROFILED').length
  );
  readonly onlySource = computed(() =>
    this.selectedSources().length === 1 ? this.selectedSources()[0] : null
  );

  constructor() {
    effect(() => {
      const workspaceId = this.workspaceId();
      const ticketKey = this.ticketKey();
      untracked(() => this.loadContext(workspaceId, ticketKey));
    });
  }

  openEditor(): void {
    this.selectedDraft.set(new Set(this.selectedSources().map(source => source.id)));
    this.actionError.set(null);
    this.modalOpen.set(true);
  }

  closeEditor(): void {
    if (this.saving()) return;
    this.modalOpen.set(false);
    this.actionError.set(null);
  }

  toggleSource(sourceId: string): void {
    const updated = new Set(this.selectedDraft());
    updated.has(sourceId) ? updated.delete(sourceId) : updated.add(sourceId);
    this.selectedDraft.set(updated);
  }

  isSelected(sourceId: string): boolean {
    return this.selectedDraft().has(sourceId);
  }

  saveContext(): void {
    const workspaceId = this.workspaceId();
    const ticketKey = this.ticketKey();
    if (!workspaceId || !ticketKey || this.saving()) return;

    this.saving.set(true);
    this.actionError.set(null);
    this.sourceService.replaceTicketContextSources(
      workspaceId,
      ticketKey,
      [...this.selectedDraft()],
    ).pipe(
      finalize(() => this.saving.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: selected => {
        if (this.isStale(workspaceId, ticketKey)) return;
        const selectedIds = new Set(selected.map(source => source.id));
        this.selectedSources.set(
          this.availableSources().filter(source => selectedIds.has(source.id))
        );
        this.modalOpen.set(false);
        this.startPollingIfNeeded();
      },
      error: error => this.actionError.set(
        errorMessage(error, 'Ticket context could not be saved.')
      ),
    });
  }

  readonly sourceTypeLabel = sourceTypeLabel;
  readonly statusLabel = sourceStatusLabel;

  private loadContext(workspaceId: string, ticketKey: string): void {
    this.poller.stop();
    this.availableSources.set([]);
    this.selectedSources.set([]);
    if (!workspaceId || !ticketKey) return;

    this.loading.set(true);
    forkJoin({
      available: this.sourceService.getSources(workspaceId),
      selected: this.sourceService.getTicketContextSources(workspaceId, ticketKey),
    }).pipe(
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: ({ available, selected }) => {
        if (this.isStale(workspaceId, ticketKey)) return;
        const selectedIds = new Set(selected.map(source => source.id));
        this.availableSources.set(available);
        this.selectedSources.set(available.filter(source => selectedIds.has(source.id)));
        this.startPollingIfNeeded();
      },
      error: () => this.actionError.set('Ticket source context is temporarily unavailable.'),
    });
  }

  private startPollingIfNeeded(): void {
    const workspaceId = this.workspaceId();
    const selectedIds = new Set(this.selectedSources().map(source => source.id));
    this.poller.startIfNeeded(
      this.selectedSources(),
      () => this.sourceService.getSources(workspaceId),
      available => {
        if (workspaceId !== this.workspaceId()) return [];
        const selected = available.filter(source => selectedIds.has(source.id));
        this.availableSources.set(available);
        this.selectedSources.set(selected);
        return selected;
      },
    );
  }

  private isStale(workspaceId: string, ticketKey: string): boolean {
    return workspaceId !== this.workspaceId() || ticketKey !== this.ticketKey();
  }
}
