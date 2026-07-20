import { TestBed } from '@angular/core/testing';
import { Ticket } from '../../../models/workspace.model';
import { TopbarComponent } from './topbar';

describe('TopbarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TopbarComponent] }).compileComponents();
  });

  it('shows the external action for the ticket provider without legacy actions', () => {
    const fixture = TestBed.createComponent(TopbarComponent);
    fixture.componentRef.setInput('ticket', ticket('GITHUB', 'https://github.com/backlogr/demo/issues/42'));
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const providerLink = element.querySelector<HTMLAnchorElement>('.pill-btn');
    expect(providerLink?.textContent).toContain('View in GitHub');
    expect(providerLink?.href).toBe('https://github.com/backlogr/demo/issues/42');
    expect(element.textContent).not.toContain('Copy');
    expect(element.textContent).not.toContain('Import ticket');
  });

  it('uses the provider label supplied by the imported ticket', () => {
    const fixture = TestBed.createComponent(TopbarComponent);
    fixture.componentRef.setInput('ticket', ticket('JIRA', 'https://backlogr.atlassian.net/browse/BL-42'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('View in Jira');
  });

  function ticket(provider: string, externalUrl: string): Ticket {
    return {
      id: 'ticket-1',
      ticketKey: provider === 'GITHUB' ? 'backlogr:demo#42' : 'BL-42',
      workspaceId: 'workspace-1',
      importedBy: 'user-1',
      projectKey: provider === 'GITHUB' ? 'backlogr/demo' : 'BL',
      title: 'Provider action',
      provider,
      externalUrl,
      media: [],
      createdAt: '2026-07-20T00:00:00Z',
      importedAt: '2026-07-20T00:00:00Z',
    };
  }
});
