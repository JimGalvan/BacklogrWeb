import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';
import { TicketComment } from '../../../models/workspace.model';
import { AiService } from '../../../services/ai.service';
import { WorkspaceService } from '../../../services/workspace.service';
import { SafeHtmlPipe } from '../../../core/pipes/safe-html.pipe';
import { parseTldrResponse } from '../../../core/shared/ai-response-parser';
import { AiStreamCardComponent } from '../ai-stream-card/ai-stream-card';
import { IconComponent } from '../../ui/common/icon/icon';

export function formatTldrHtml(text: string, authorMap: Map<string, string>): string {
  const parsed = new DOMParser().parseFromString(parseTldrResponse(text), 'text/html');
  const allowedTags = new Set(['P', 'UL', 'LI', 'STRONG', 'EM']);

  for (const element of Array.from(parsed.body.querySelectorAll('*'))) {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      continue;
    }

    const commentId = element.tagName === 'LI' ? element.getAttribute('data-comment-id') : null;
    for (const attribute of Array.from(element.attributes)) {
      element.removeAttribute(attribute.name);
    }

    if (element.tagName === 'UL') element.classList.add('tldr-list');
    if (element.tagName === 'LI' && commentId) {
      element.setAttribute('data-comment-id', commentId);
      const reference = parsed.createElement('span');
      reference.className = 'comment-ref';
      reference.textContent = authorMap.get(commentId) ?? `#${commentId}`;
      element.append(reference);
    }
  }

  return parsed.body.innerHTML;
}
@Component({
  selector: 'app-summary-tab',
  imports: [AiStreamCardComponent, SafeHtmlPipe, IconComponent],
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
  readonly isStreaming = signal(false);
  readonly isDone = signal(false);
  readonly isError = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private comments = signal<TicketComment[]>([]);
  private cancel$ = new Subject<void>();
  private activeRun = 0;

  private readonly commentAuthorMap = computed(() =>
    new Map(this.comments().map(comment => [comment.id, comment.authorName || comment.authorEmail]))
  );

  readonly tldrHtml = computed(() => {
    if (!this.isDone() || this.isError()) return '';
    return formatTldrHtml(this.streamedText(), this.commentAuthorMap());
  });

  constructor() {
    effect(() => {
      const workspaceId = this.workspaceId();
      const ticketKey = this.ticketKey();
      if (!workspaceId || !ticketKey) return;

      this.reset();
      this.comments.set([]);
      this.workspaceService.getTicketComments(workspaceId, ticketKey)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: comments => {
            if (workspaceId === this.workspaceId() && ticketKey === this.ticketKey()) {
              this.comments.set(comments);
            }
          },
        });
    });
  }

  reanalyze(): void {
    const workspaceId = this.workspaceId();
    const ticketKey = this.ticketKey();
    if (!workspaceId || !ticketKey) return;

    const refresh = this.isDone() && !this.isError();
    const run = ++this.activeRun;
    this.cancel$.next();
    this.streamedText.set('');
    this.isStreaming.set(true);
    this.isDone.set(false);
    this.isError.set(false);
    this.errorMessage.set(null);

    this.aiService.streamTldr(workspaceId, ticketKey, refresh)
      .pipe(takeUntil(this.cancel$), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: text => {
          if (run === this.activeRun) this.streamedText.set(text);
        },
        error: error => {
          if (run !== this.activeRun) return;
          this.errorMessage.set(error instanceof Error ? error.message : 'The AI request failed. Please try again.');
          this.isStreaming.set(false);
          this.isError.set(true);
          this.isDone.set(true);
        },
        complete: () => {
          if (run !== this.activeRun) return;
          try {
            parseTldrResponse(this.streamedText());
          } catch (error) {
            this.errorMessage.set(error instanceof Error ? error.message : 'The AI returned an unreadable response.');
            this.isError.set(true);
          }
          this.isStreaming.set(false);
          this.isDone.set(true);
        },
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
    commentElement.addEventListener(
      'animationend',
      () => commentElement.classList.remove('comment-highlight'),
      { once: true },
    );
  }

  private reset(): void {
    this.activeRun++;
    this.cancel$.next();
    this.streamedText.set('');
    this.isStreaming.set(false);
    this.isDone.set(false);
    this.isError.set(false);
    this.errorMessage.set(null);
  }
}
