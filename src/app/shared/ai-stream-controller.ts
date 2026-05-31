import { DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, takeUntil } from 'rxjs';

/**
 * Drives an AI SSE stream that accumulates a JSON payload and parses it once
 * the stream completes. Shared by the refinement and test-cases tabs.
 */
export class AiStreamController<T> {
  readonly data = signal<T | null>(null);
  readonly isStreaming = signal(false);
  readonly isDone = signal(false);
  readonly isError = signal(false);

  private cancel$ = new Subject<void>();

  constructor(
    private readonly source: (workspaceId: string, ticketKey: string) => Observable<string>,
    private readonly parse: (raw: string) => T,
    private readonly destroyRef: DestroyRef,
  ) {}

  start(workspaceId: string, ticketKey: string): void {
    if (!workspaceId || !ticketKey) return;

    this.cancel$.next();
    this.data.set(null);
    this.isError.set(false);
    this.isDone.set(false);
    this.isStreaming.set(true);

    let raw = '';
    this.source(workspaceId, ticketKey)
      .pipe(takeUntil(this.cancel$), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: chunk => { raw = chunk; },
        error: () => this.fail(),
        complete: () => {
          try {
            this.data.set(this.parse(raw));
          } catch {
            this.isError.set(true);
          }
          this.isDone.set(true);
          this.isStreaming.set(false);
        },
      });
  }

  private fail(): void {
    this.isError.set(true);
    this.isDone.set(true);
    this.isStreaming.set(false);
  }
}
