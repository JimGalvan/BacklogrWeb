import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of } from 'rxjs';
import { TicketComment } from '../../../models/workspace.model';
import { AiService } from '../../../services/ai.service';
import { WorkspaceService } from '../../../services/workspace.service';
import { formatTldrHtml, SummaryTabComponent } from './summary-tab';

describe('SummaryTabComponent', () => {
  let streams: Subject<string>[];
  let aiService: { streamTldr: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    streams = [];
    aiService = {
      streamTldr: vi.fn((): Observable<string> => {
        const stream = new Subject<string>();
        streams.push(stream);
        return stream;
      }),
    };

    await TestBed.configureTestingModule({
      imports: [SummaryTabComponent],
      providers: [
        {provide: AiService, useValue: aiService},
        {provide: WorkspaceService, useValue: {getTicketComments: () => of([comment()])}},
      ],
    }).compileComponents();
  });

  it('waits for the user to generate and renders comment references', () => {
    const fixture = createComponent();

    expect(aiService.streamTldr).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.ai-run-btn')?.textContent).toContain('Generate TL;DR');
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.ai-run-btn')?.click();
    expect(aiService.streamTldr).toHaveBeenCalledWith('workspace-1', 'owner:repo#42');
    streams[0].next('<tldr><p>Implement the import.</p><ul><li data-comment-id="9001">Keep it read-only.</li></ul></tldr>');
    streams[0].complete();
    fixture.detectChanges();

    const reference = fixture.nativeElement.querySelector('li[data-comment-id="9001"] .comment-ref');
    expect(reference?.textContent).toBe('reviewer');
    expect(fixture.componentInstance.isDone()).toBe(true);
    expect(fixture.componentInstance.isError()).toBe(false);
  });

  it('cancels the active stream before re-analysis', () => {
    const fixture = createComponent();
    fixture.componentInstance.reanalyze();
    expect(streams[0].observed).toBe(true);

    fixture.componentInstance.reanalyze();

    expect(streams[0].observed).toBe(false);
    expect(streams[1].observed).toBe(true);
  });

  it('shows malformed model output as an actionable error', () => {
    const fixture = createComponent();
    fixture.componentInstance.reanalyze();
    streams[0].next('missing tldr wrapper');
    streams[0].complete();
    fixture.detectChanges();

    expect(fixture.componentInstance.isError()).toBe(true);
    expect(fixture.nativeElement.querySelector('.ai-error-state')?.textContent).toContain('unreadable response');
    expect(fixture.nativeElement.querySelector('.ai-error-state button')?.textContent).toContain('Try again');
  });

  it('scrolls to the comment referenced by a TLDR item', () => {
    const fixture = createComponent();
    const commentElement = document.createElement('div');
    commentElement.id = 'comment-9001';
    commentElement.scrollIntoView = vi.fn();
    document.body.append(commentElement);
    const listItem = document.createElement('li');
    listItem.dataset['commentId'] = '9001';
    const child = document.createElement('span');
    listItem.append(child);

    fixture.componentInstance.onTldrClick({target: child} as unknown as MouseEvent);

    expect(commentElement.scrollIntoView).toHaveBeenCalledWith({behavior: 'smooth', block: 'center'});
    expect(commentElement.classList.contains('comment-highlight')).toBe(true);
    commentElement.remove();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(SummaryTabComponent);
    fixture.componentRef.setInput('workspaceId', 'workspace-1');
    fixture.componentRef.setInput('ticketKey', 'owner:repo#42');
    fixture.detectChanges();
    return fixture;
  }
});

describe('formatTldrHtml', () => {
  it('removes markup outside the TLDR contract and escapes author labels', () => {
    const html = formatTldrHtml(
      '<tldr><p onclick="bad()">Safe<script>bad()</script></p><ul><li data-comment-id="1">Decision</li></ul></tldr>',
      new Map([['1', '<img src=x onerror=bad()>']]),
    );

    expect(html).not.toContain('onclick');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img src=x onerror=bad()&gt;');
  });
});

function comment(): TicketComment {
  return {
    id: '9001',
    authorEmail: 'reviewer@example.com',
    authorName: 'reviewer',
    body: {format: 'ADF', content: {type: 'doc', version: 1, content: []}},
    media: [],
    createdAt: '2026-07-19T12:10:00Z',
    updatedAt: '2026-07-19T12:10:00Z',
  };
}
