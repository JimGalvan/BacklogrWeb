import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketComment } from '../../../models/workspace.model';
import { WorkspaceService } from '../../../services/workspace.service';
import { CommentComponent } from '../comment/comment';

@Component({
  selector: 'app-comments-section',
  imports: [CommentComponent],
  templateUrl: './comments-section.html',
  styleUrl: './comments-section.css',
})
export class CommentsSectionComponent {
  workspaceId = input<string>('');
  ticketKey = input<string>('');

  private workspaceService = inject(WorkspaceService);
  private destroyRef = inject(DestroyRef);

  comments = signal<TicketComment[]>([]);
  status = signal<'idle' | 'loading' | 'loaded' | 'error'>('idle');

  constructor() {
    effect(() => {
      const workspaceId = this.workspaceId();
      const ticketKey = this.ticketKey();

      if (!workspaceId || !ticketKey) {
        this.status.set('idle');
        return;
      }

      this.status.set('loading');
      this.workspaceService.getTicketComments(workspaceId, ticketKey)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: comments => {
            this.comments.set(
              [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            );
            this.status.set('loaded');
          },
          error: () => {
            this.comments.set([]);
            this.status.set('error');
          },
        });
    });
  }
}
