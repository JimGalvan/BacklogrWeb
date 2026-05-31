import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';
import { TicketComment } from '../../../models/workspace.model';
import { AiService } from '../../../services/ai.service';
import { WorkspaceService } from '../../../services/workspace.service';
import { SafeHtmlPipe } from '../../../core/pipes/safe-html.pipe';
import { IconComponent } from '../../ui/common/icon/icon';

function parseTldr(text: string, authorMap: Map<string, string>): string {
  const match = text.match(/<tldr>([\s\S]*?)<\/tldr>/);
  if (!match) return '';
  return match[1]
    .trim()
    .replace(/<ul>/, '<ul class="tldr-list">')
    .replace(
      /<li data-comment-id="([^"]+)">([\s\S]*?)<\/li>/g,
      (_, commentId, content) => {
        const label = authorMap.get(commentId) ?? `#${commentId}`;
        return `<li data-comment-id="${commentId}">${content}<span class="comment-ref">${label}</span></li>`;
      }
    );
}

@Component({
  selector: 'app-summary-tab',
  imports: [SafeHtmlPipe, IconComponent],
  templateUrl: './summary-tab.html',
  styleUrl: './summary-tab.css',
})
export class SummaryTabComponent {
  workspaceId = input<string>('');
  ticketKey = input<string>('');

  private aiService = inject(AiService);
  private workspaceService = inject(WorkspaceService);
  private destroyRef = inject(DestroyRef);

  readonly streamedText = signal('');
  readonly isDone = signal(false);
  readonly isError = signal(false);

  private comments = signal<TicketComment[]>([]);
  private cancel$ = new Subject<void>();

  private readonly commentAuthorMap = computed(() =>
    new Map(this.comments().map(comment => [comment.id, comment.authorName || comment.authorEmail]))
  );

  readonly tldrHtml = computed(() => {
    if (!this.isDone()) return '';
    return parseTldr(this.streamedText(), this.commentAuthorMap());
  });

  constructor() {
    effect(() => {
      const workspaceId = this.workspaceId();
      const ticketKey = this.ticketKey();
      if (workspaceId && ticketKey) {
        this.workspaceService.getTicketComments(workspaceId, ticketKey)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(comments => this.comments.set(comments));
        this.reanalyze();
      }
    });
  }

  reanalyze(): void {
    const workspaceId = this.workspaceId();
    const ticketKey = this.ticketKey();
    if (!workspaceId || !ticketKey) return;

    this.cancel$.next();
    this.streamedText.set('');
    this.isDone.set(false);
    this.isError.set(false);

    this.aiService.streamTldr(workspaceId, ticketKey)
      .pipe(takeUntil(this.cancel$), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: text => this.streamedText.set(text),
        error: () => {
          this.isError.set(true);
          this.isDone.set(true);
        },
        complete: () => this.isDone.set(true),
      });
  }

  onTldrClick(event: MouseEvent): void {
    const listItem = (event.target as Element).closest('li[data-comment-id]');
    if (!listItem) return;
    const commentId = listItem.getAttribute('data-comment-id');
    const commentElement = document.getElementById(`comment-${commentId}`);
    if (!commentElement) return;
    commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    commentElement.classList.add('comment-highlight');
    commentElement.addEventListener('animationend', () => commentElement.classList.remove('comment-highlight'), { once: true });
  }
}
