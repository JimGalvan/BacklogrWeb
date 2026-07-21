import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RelevantFilesService } from '../../../services/relevant-files.service';
import { RelevantFilesTabComponent } from './relevant-files-tab';

describe('RelevantFilesTabComponent', () => {
  const response = {
    grounding: 'TICKET_AND_CODE' as const,
    indexing: false,
    files: [{
      sourceId: 'source-1',
      sourceName: 'backlogr-api',
      revision: '1234567890abcdef',
      path: 'src/main/java/TicketCore.java',
      matches: [{ startLine: 12, endLine: 18, excerpt: 'class TicketCore {}' }],
    }],
    warnings: [],
  };
  let getRelevantFiles: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    getRelevantFiles = vi.fn(() => of(response));
    await TestBed.configureTestingModule({
      imports: [RelevantFilesTabComponent],
      providers: [{
        provide: RelevantFilesService,
        useValue: { getRelevantFiles },
      }],
    }).compileComponents();
  });

  it('loads once when opened and renders safely escaped indexed excerpts', () => {
    const fixture = createComponent();

    fixture.componentInstance.load();
    fixture.componentInstance.load();
    fixture.detectChanges();

    expect(getRelevantFiles).toHaveBeenCalledOnce();
    expect(getRelevantFiles).toHaveBeenCalledWith('workspace-1', 'backlogr:demo#42', false);
    expect(fixture.nativeElement.textContent).toContain('src/main/java/TicketCore.java');
    expect(fixture.nativeElement.textContent).toContain('Implementation · JAVA');
    expect(fixture.nativeElement.textContent).toContain('Lines 12–18');
    expect(fixture.nativeElement.querySelector('code')?.textContent).toBe('class TicketCore {}');
  });

  it('refreshes an already loaded result on demand', () => {
    const fixture = createComponent();

    fixture.componentInstance.load();
    fixture.componentInstance.refresh();

    expect(getRelevantFiles).toHaveBeenCalledTimes(2);
    expect(getRelevantFiles).toHaveBeenLastCalledWith('workspace-1', 'backlogr:demo#42', true);
  });

  function createComponent() {
    const fixture = TestBed.createComponent(RelevantFilesTabComponent);
    fixture.componentRef.setInput('workspaceId', 'workspace-1');
    fixture.componentRef.setInput('ticketKey', 'backlogr:demo#42');
    fixture.detectChanges();
    return fixture;
  }
});
