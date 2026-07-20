import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { OnboardingState } from '../../models/onboarding.model';
import { Ticket } from '../../models/workspace.model';
import { IntegrationService } from '../../services/integration.service';
import { OnboardingService } from '../../services/onboarding.service';
import { WorkspaceService } from '../../services/workspace.service';
import { OnboardingPageComponent } from './onboarding-page';

describe('OnboardingPageComponent', () => {
  const state: OnboardingState = {
    completed: false,
    suggestedStep: 'TICKET',
    defaultWorkspace: {
      id: 'workspace-1',
      name: 'My Workspace',
      ownerId: 'user-1',
      createdAt: '2026-07-19T12:00:00Z',
      lastModifiedAt: '2026-07-19T12:00:00Z',
    },
    connection: { id: 'connection-1', displayName: 'backlogr-demo', status: 'ACTIVE' },
    source: { id: 'source-1', displayName: 'demo-repository', status: 'CONNECTED' },
    ticket: null,
  };

  const ticket = {
    id: 'ticket-1',
    ticketKey: 'backlogr:demo-repository#42',
    workspaceId: 'workspace-1',
    importedBy: 'user-1',
    projectKey: 'backlogr/demo-repository',
    title: 'Provider-neutral onboarding',
    provider: 'GITHUB',
    createdAt: '2026-07-19T12:00:00Z',
    importedAt: '2026-07-19T12:05:00Z',
  } as Ticket;

  const onboardingService = {
    getState: vi.fn(() => of(state)),
    complete: vi.fn(() => of({ ...state, completed: true })),
    addSource: vi.fn(() => of({})),
  };
  const integrationService = { connect: vi.fn() };
  const workspaceService = { importTicket: vi.fn(() => of(ticket)) };
  const router = { navigate: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [OnboardingPageComponent],
      providers: [
        { provide: OnboardingService, useValue: onboardingService },
        { provide: IntegrationService, useValue: integrationService },
        { provide: WorkspaceService, useValue: workspaceService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
  });

  it('imports one GitHub Issue and keeps onboarding open for confirmation', () => {
    const component = TestBed.createComponent(OnboardingPageComponent).componentInstance;
    component.state.set(state);
    component.ticketUrl.set(' https://github.com/backlogr/demo-repository/issues/42 ');

    component.importTicket();

    expect(workspaceService.importTicket).toHaveBeenCalledWith('workspace-1', {
      url: 'https://github.com/backlogr/demo-repository/issues/42',
    });
    expect(component.importedTicket()).toEqual(ticket);
    expect(component.ticketImported()).toBe(true);
    expect(component.ticketUrl()).toBe('');
    expect(onboardingService.complete).not.toHaveBeenCalled();
  });

  it('completes onboarding and routes imported tickets to the workspace ticket list', () => {
    const component = TestBed.createComponent(OnboardingPageComponent).componentInstance;
    component.state.set(state);

    component.complete('tickets');

    expect(onboardingService.complete).toHaveBeenCalledOnce();
    expect(router.navigate).toHaveBeenCalledWith(['/workspaces', 'workspace-1', 'tickets']);
  });

  it('completes onboarding and routes a skipped import to workspaces', () => {
    const component = TestBed.createComponent(OnboardingPageComponent).componentInstance;
    component.state.set(state);

    component.complete('workspace');

    expect(router.navigate).toHaveBeenCalledWith(['/workspaces']);
  });
});
