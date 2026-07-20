import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Source } from '../../../models/source.model';
import { SourceService } from '../../../services/source.service';
import { SourceContextBarComponent } from './source-context-bar';

const source = (id: string, status: Source['status'] = 'PROFILED'): Source => ({
  id,
  workspaceId: 'workspace-1',
  provider: 'GITHUB',
  sourceType: 'REPOSITORY',
  name: `repository-${id}`,
  organization: 'backlogr',
  projectReference: null,
  defaultBranch: 'main',
  remoteUrl: `https://github.com/backlogr/repository-${id}.git`,
  webUrl: `https://github.com/backlogr/repository-${id}`,
  status,
  indexJobId: status === 'PROFILING' ? 'job-1' : null,
  indexedRevision: status === 'PROFILED' ? '1234567890abcdef' : null,
  failure: null,
  addedAt: '2026-07-20T00:00:00Z',
});

describe('SourceContextBarComponent', () => {
  let sourceService: {
    getSources: ReturnType<typeof vi.fn>;
    getTicketContextSources: ReturnType<typeof vi.fn>;
    replaceTicketContextSources: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    sourceService = {
      getSources: vi.fn(() => of([])),
      getTicketContextSources: vi.fn(() => of([])),
      replaceTicketContextSources: vi.fn(() => of([])),
    };

    await TestBed.configureTestingModule({
      imports: [SourceContextBarComponent],
      providers: [
        provideRouter([]),
        { provide: SourceService, useValue: sourceService },
      ],
    }).compileComponents();
  });

  it('defaults to ticket-only context without selecting workspace sources automatically', async () => {
    sourceService.getSources.mockReturnValue(of([source('source-1')]));
    const fixture = createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ticket only');
    expect(sourceService.replaceTicketContextSources).not.toHaveBeenCalled();
  });

  it('saves the explicitly selected sources for the ticket', async () => {
    const first = source('source-1');
    const second = source('source-2', 'CONNECTED');
    sourceService.getSources.mockReturnValue(of([first, second]));
    sourceService.replaceTicketContextSources.mockReturnValue(of([second]));
    const fixture = createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.edit-button')?.click();
    fixture.detectChanges();
    element.querySelectorAll<HTMLInputElement>('.manifest-row input')[1].click();
    fixture.detectChanges();
    element.querySelector<HTMLButtonElement>('.modal-foot .btn--primary')?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(sourceService.replaceTicketContextSources).toHaveBeenCalledWith(
      'workspace-1',
      'BL-42',
      ['source-2'],
    );
    expect(element.textContent).toContain('repository-source-2');
  });

  it('summarizes multiple selected sources and their ready count', async () => {
    const first = source('source-1');
    const second = source('source-2', 'FAILED');
    sourceService.getSources.mockReturnValue(of([first, second]));
    sourceService.getTicketContextSources.mockReturnValue(of([first, second]));
    const fixture = createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('2 sources');
    expect(fixture.nativeElement.textContent).toContain('1 ready');
  });

  function createComponent() {
    const fixture = TestBed.createComponent(SourceContextBarComponent);
    fixture.componentRef.setInput('workspaceId', 'workspace-1');
    fixture.componentRef.setInput('ticketKey', 'BL-42');
    fixture.detectChanges();
    return fixture;
  }
});
