import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RefinementFindingsResponse } from '../../../models/refinement.model';
import { RefinementService } from '../../../services/refinement.service';
import { RefinementTabComponent } from './refinement-tab';

const response: RefinementFindingsResponse = {
  summary: 'One decision needs attention.',
  grounding: 'TICKET_AND_CODE',
  findings: [{
    id: 'RF-01',
    category: 'API_OR_COMPATIBILITY_RISK',
    title: 'Response compatibility is unclear',
    problem: 'The existing response behavior is not defined.',
    evidence: [{
      type: 'SOURCE_FILE',
      label: 'Ticket controller',
      excerpt: 'The current endpoint returns the legacy response.',
      commentId: null,
      imageNumber: null,
      imageUrl: null,
      sourceId: 'source-1',
      sourceName: 'backlogr-api',
      path: 'src/TicketController.java',
    }],
    decisionNeeded: 'Decide whether the old response remains compatible.',
    recommendedChange: {
      type: 'CLARIFYING_QUESTION',
      text: 'Must existing clients continue to receive the legacy response?',
    },
    verificationRule: 'The expected response compatibility is explicit.',
  }],
};

describe('RefinementTabComponent', () => {
  let getFindings: ReturnType<typeof vi.fn>;
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    getFindings = vi.fn(() => of(response));
    writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [RefinementTabComponent],
      providers: [{ provide: RefinementService, useValue: { getFindings } }],
    }).compileComponents();
  });

  it('renders evidence-backed findings and their grounding', () => {
    const fixture = createComponent();

    fixture.componentInstance.run();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('One decision needs attention.');
    expect(text).toContain('Ticket + code');
    expect(text).toContain('src/TicketController.java');
    expect(text).toContain('Decide whether the old response remains compatible.');
    expect(text).toContain('The expected response compatibility is explicit.');
    expect(getFindings).toHaveBeenCalledWith('workspace-1', 'backlogr:demo#42', false);
  });

  it('bypasses cached findings when an existing result is re-analyzed', () => {
    const fixture = createComponent();

    fixture.componentInstance.run();
    fixture.componentInstance.run();

    expect(getFindings).toHaveBeenLastCalledWith('workspace-1', 'backlogr:demo#42', true);
  });

  it('copies only the proposed ticket change', async () => {
    const fixture = createComponent();
    fixture.componentInstance.run();
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.copy-action')
      ?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(writeText).toHaveBeenCalledWith(
      'Must existing clients continue to receive the legacy response?',
    );
    expect(fixture.nativeElement.textContent).toContain('Copied');
  });

  it('shows the explicit no-findings state', () => {
    getFindings.mockReturnValue(of({
      summary: 'No significant refinement gaps found.',
      grounding: 'TICKET',
      findings: [],
    }));
    const fixture = createComponent();

    fixture.componentInstance.run();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No significant refinement gaps found');
    expect(fixture.nativeElement.textContent).toContain('Ticket only');
  });

  function createComponent() {
    const fixture = TestBed.createComponent(RefinementTabComponent);
    fixture.componentRef.setInput('workspaceId', 'workspace-1');
    fixture.componentRef.setInput('ticketKey', 'backlogr:demo#42');
    fixture.detectChanges();
    return fixture;
  }
});
