import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription, switchMap, timer } from 'rxjs';
import { Source, hasIndexingSources } from '../../models/source.model';

export const SOURCE_POLL_INTERVAL_MS = 2000;

/**
 * Re-fetches a source list on an interval while any source is still indexing.
 *
 * `startIfNeeded` begins polling only when `current` contains an indexing source.
 * On each tick, `apply` updates component state with the fetched list and returns
 * the sources the poller should keep watching — return an empty array to stop
 * (e.g. when the response is stale because the workspace changed).
 */
export class SourcePoller {
  private subscription?: Subscription;

  constructor(private readonly destroyRef: DestroyRef) {
    destroyRef.onDestroy(() => this.stop());
  }

  startIfNeeded(
    current: Source[],
    fetch: () => Observable<Source[]>,
    apply: (fetched: Source[]) => Source[],
  ): void {
    this.stop();
    if (!hasIndexingSources(current)) return;

    this.subscription = timer(SOURCE_POLL_INTERVAL_MS, SOURCE_POLL_INTERVAL_MS).pipe(
      switchMap(fetch),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: fetched => {
        const tracked = apply(fetched);
        if (!hasIndexingSources(tracked)) this.stop();
      },
      error: () => this.stop(),
    });
  }

  stop(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
  }
}
