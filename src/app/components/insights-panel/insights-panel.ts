import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, Observable, interval, merge, take, takeUntil } from 'rxjs';
import { Insights } from '../../models/insights.model';
import { InsightsService } from '../../services/insights.service';
import { ToolTabsComponent } from '../tool-tabs/tool-tabs';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-insights-panel',
  imports: [ToolTabsComponent, SafeHtmlPipe],
  templateUrl: './insights-panel.html',
  styleUrl: './insights-panel.css',
})
export class InsightsPanelComponent implements OnInit, OnDestroy {
  private insightsService = inject(InsightsService);

  insights = signal<Insights | null>(null);
  streamedText = signal('');
  isDone = signal(false);
  visibleBullets = signal(0);
  activeTab = signal('summary');

  private destroy$ = new Subject<void>();
  private cancel$ = new Subject<void>();

  ngOnInit() {
    this.insightsService.getInsights('PAY-4827').subscribe(data => {
      this.insights.set(data);
      this.startStream();
    });
  }

  startStream() {
    const data = this.insights();
    if (!data) return;

    this.cancel$.next();
    this.streamedText.set('');
    this.isDone.set(false);
    this.visibleBullets.set(0);

    const stop$ = merge(this.destroy$, this.cancel$);

    this.streamText(data.tldr)
      .pipe(takeUntil(stop$))
      .subscribe({
        next: text => this.streamedText.set(text),
        complete: () => {
          this.isDone.set(true);
          interval(320)
            .pipe(take(data.bullets.length), takeUntil(stop$))
            .subscribe(i => this.visibleBullets.set(i + 1));
        },
      });
  }

  private streamText(text: string): Observable<string> {
    return new Observable<string>(observer => {
      let current = 0;
      let stopped = false;
      observer.next('');

      const advance = () => {
        if (stopped || current >= text.length) {
          if (!stopped) observer.complete();
          return;
        }
        const chunk = Math.floor(Math.random() * 5) + 2;
        current = Math.min(current + chunk, text.length);
        observer.next(text.slice(0, current));
        setTimeout(advance, 12 + Math.random() * 8);
      };

      setTimeout(advance, 14);
      return () => { stopped = true; };
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
