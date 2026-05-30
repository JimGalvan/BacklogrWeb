import { Component, computed, effect, inject, input, OnDestroy, signal } from '@angular/core';
import { Subject, merge, takeUntil } from 'rxjs';
import { Insights } from '../../models/insights.model';
import { TicketComment } from '../../models/workspace.model';
import { RefinementAnalysis, RefinementAnalysisResponse } from '../../models/refinement.model';
import { InsightsService } from '../../services/insights.service';
import { AiService } from '../../services/ai.service';
import { WorkspaceService } from '../../services/workspace.service';
import { ToolTabsComponent } from '../tool-tabs/tool-tabs';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

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
  selector: 'app-insights-panel',
  imports: [ToolTabsComponent, SafeHtmlPipe],
  templateUrl: './insights-panel.html',
  styleUrl: './insights-panel.css',
})
export class InsightsPanelComponent implements OnDestroy {
  private insightsService = inject(InsightsService);
  private aiService = inject(AiService);
  private workspaceService = inject(WorkspaceService);

  workspaceId = input<string>('');
  ticketKey = input<string>('');

  insights = signal<Insights | null>(null);
  streamedText = signal('');
  isDone = signal(false);
  isError = signal(false);
  activeTab = signal('summary');
  comments = signal<TicketComment[]>([]);

  refinementRawJson = signal('');
  refinementData = signal<RefinementAnalysis | null>(null);
  refinementIsDone = signal(false);
  refinementIsStreaming = signal(false);
  refinementIsError = signal(false);

  readonly commentAuthorMap = computed(() =>
    new Map(this.comments().map(comment => [comment.id, comment.authorName || comment.authorEmail]))
  );

  readonly tldrHtml = computed(() => {
    if (!this.isDone()) return '';
    return parseTldr(this.streamedText(), this.commentAuthorMap());
  });

  private destroy$ = new Subject<void>();
  private cancel$ = new Subject<void>();
  private cancelRefinement$ = new Subject<void>();

  constructor() {
    this.insightsService.getInsights('').subscribe(data => this.insights.set(data));

    effect(() => {
      const workspaceId = this.workspaceId();
      const ticketKey = this.ticketKey();
      if (workspaceId && ticketKey) {
        this.workspaceService.getTicketComments(workspaceId, ticketKey)
          .pipe(takeUntil(this.destroy$))
          .subscribe(comments => this.comments.set(comments));
        this.startStream();
      }
    });
  }

  startStream() {
    const workspaceId = this.workspaceId();
    const ticketKey = this.ticketKey();
    if (!workspaceId || !ticketKey) return;

    this.cancel$.next();
    this.streamedText.set('');
    this.isDone.set(false);
    this.isError.set(false);

    const stop$ = merge(this.destroy$, this.cancel$);

    this.aiService.streamTldr(workspaceId, ticketKey)
      .pipe(takeUntil(stop$))
      .subscribe({
        next: text => this.streamedText.set(text),
        error: () => {
          this.isError.set(true);
          this.isDone.set(true);
        },
        complete: () => this.isDone.set(true),
      });
  }

  startRefinementStream() {
    const workspaceId = this.workspaceId();
    const ticketKey = this.ticketKey();
    if (!workspaceId || !ticketKey) return;

    this.cancelRefinement$.next();
    this.refinementRawJson.set('');
    this.refinementData.set(null);
    this.refinementIsDone.set(false);
    this.refinementIsError.set(false);
    this.refinementIsStreaming.set(true);

    const stop$ = merge(this.destroy$, this.cancelRefinement$);

    this.aiService.streamRefinement(workspaceId, ticketKey)
      .pipe(takeUntil(stop$))
      .subscribe({
        next: raw => this.refinementRawJson.set(raw),
        error: () => {
          this.refinementIsError.set(true);
          this.refinementIsDone.set(true);
          this.refinementIsStreaming.set(false);
        },
        complete: () => {
          try {
            const parsed = JSON.parse(this.refinementRawJson()) as RefinementAnalysisResponse;
            this.refinementData.set(parsed.refinementAnalysis);
          } catch {
            this.refinementIsError.set(true);
          }
          this.refinementIsDone.set(true);
          this.refinementIsStreaming.set(false);
        },
      });
  }

  onTldrClick(event: MouseEvent) {
    const listItem = (event.target as Element).closest('li[data-comment-id]');
    if (!listItem) return;
    const commentId = listItem.getAttribute('data-comment-id');
    const commentElement = document.getElementById(`comment-${commentId}`);
    if (!commentElement) return;
    commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    commentElement.classList.add('comment-highlight');
    commentElement.addEventListener('animationend', () => commentElement.classList.remove('comment-highlight'), { once: true });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.cancelRefinement$.complete();
  }
}
