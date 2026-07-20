import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { OnboardingService } from '../../services/onboarding.service';
import { WorkspaceService } from '../../services/workspace.service';
import { Workspace } from '../../models/workspace.model';
import { TicketsPageComponent } from './workspace-tickets-page';

const defaultWorkspace: Workspace = {
  id: 'workspace-default',
  name: 'My Workspace',
  ownerId: 'user-1',
  createdAt: '2026-07-20T00:00:00Z',
  lastModifiedAt: '2026-07-20T00:00:00Z',
};

const otherWorkspace: Workspace = {
  ...defaultWorkspace,
  id: 'workspace-other',
  name: 'Product Workspace',
};

describe('TicketsPageComponent workspace selection', () => {
  let queryParams: Record<string, string>;
  let workspaceService: {
    getUserWorkspaces: ReturnType<typeof vi.fn>;
    getTickets: ReturnType<typeof vi.fn>;
    removeTicket: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    queryParams = {};
    workspaceService = {
      getUserWorkspaces: vi.fn(() => of([otherWorkspace, defaultWorkspace])),
      getTickets: vi.fn(() => of([])),
      removeTicket: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TicketsPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser: () => of({ id: 'user-1' }) } },
        {
          provide: OnboardingService,
          useValue: {
            getState: () => of({
              completed: true,
              suggestedStep: 'DONE',
              defaultWorkspace,
              connection: null,
              source: null,
              ticket: null,
            }),
          },
        },
        { provide: WorkspaceService, useValue: workspaceService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              get queryParamMap() { return convertToParamMap(queryParams); },
              paramMap: convertToParamMap({}),
            },
          },
        },
      ],
    }).compileComponents();
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  it('loads tickets from the onboarding default workspace', async () => {
    const fixture = createComponent();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.workspaceId()).toBe(defaultWorkspace.id);
    expect(workspaceService.getTickets).toHaveBeenCalledWith(defaultWorkspace.id);
    expect(fixture.nativeElement.textContent).toContain('My Workspace');
  });

  it('honors a workspace requested in the query string', async () => {
    queryParams = { workspaceId: otherWorkspace.id };
    const fixture = createComponent();
    await fixture.whenStable();

    expect(fixture.componentInstance.workspaceId()).toBe(otherWorkspace.id);
    expect(workspaceService.getTickets).toHaveBeenCalledWith(otherWorkspace.id);
  });

  function createComponent() {
    const fixture = TestBed.createComponent(TicketsPageComponent);
    fixture.detectChanges();
    return fixture;
  }
});
