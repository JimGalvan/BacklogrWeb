import { DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AiResponseFormatError } from './ai-response-parser';

/** Drives an AI SSE stream and validates its completed response. */
export class AiStreamController<T> {
  readonly data = signal<T | null>(null);
  readonly isStreaming = signal(false);
  readonly isDone = signal(false);
  readonly isError = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private cancel$ = new Subject<void>();
  private activeRun = 0;

  constructor(
    private readonly source: (workspaceId: string, ticketKey: string) => Observable<string>,
    private readonly parse: (raw: string) => T,
    private readonly destroyRef: DestroyRef,
  ) {
    this.destroyRef.onDestroy(() => this.cancel());
  }

  start(workspaceId: string, ticketKey: string): void {
    if (!workspaceId || !ticketKey) return;

    const run = ++this.activeRun;
    this.cancel$.next();
    this.data.set(null);
    this.isError.set(false);
    this.errorMessage.set(null);
    this.isDone.set(false);
    this.isStreaming.set(true);

    let raw = '';
    this.source(workspaceId, ticketKey)
      .pipe(takeUntil(this.cancel$), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: chunk => {
          if (run === this.activeRun) raw = chunk;
        },
        error: error => {
          if (run === this.activeRun) this.fail(error);
        },
        complete: () => {
          if (run !== this.activeRun) return;
          try {
            this.data.set(this.parse(raw));
            this.isDone.set(true);
            this.isStreaming.set(false);
          } catch (error) {
            this.fail(error);
          }
        },
      });
  }

  cancel(): void {
    this.activeRun++;
    this.cancel$.next();
    this.isStreaming.set(false);
  }

  private fail(error: unknown): void {
    const message = error instanceof AiResponseFormatError
      ? error.message
      : error instanceof Error && error.message
        ? error.message
        : 'The AI request failed. Please try again.';
    this.data.set(null);
    this.errorMessage.set(message);
    this.isError.set(true);
    this.isDone.set(true);
    this.isStreaming.set(false);
  }
}
