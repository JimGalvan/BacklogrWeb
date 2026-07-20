import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Source } from '../../models/source.model';
import { Workspace } from '../../models/workspace.model';
import { AuthService } from '../../services/auth.service';
import { OnboardingService } from '../../services/onboarding.service';
import { ToastService } from '../../services/toast.service';
import { SourceService } from '../../services/source.service';
import { WorkspaceService } from '../../services/workspace.service';
import { SourcesPageComponent } from './sources-page';

const defaultWorkspace: Workspace = {
  id: 'workspace-default',
  name: 'Default workspace',
  ownerId: 'user-1',
  createdAt: '2026-07-20T00:00:00Z',
  lastModifiedAt: '2026-07-20T00:00:00Z',
};

const otherWorkspace: Workspace = {
  ...defaultWorkspace,
  id: 'workspace-other',
  name: 'Other workspace',
};

const failedSource: Source = {
  id: 'source-1',
  workspaceId: defaultWorkspace.id,
  provider: 'GITHUB',
  sourceType: 'REPOSITORY',
  name: 'demo-repository',
  organization: 'backlogr',
  projectReference: null,
  defaultBranch: 'main',
  remoteUrl: 'https://github.com/backlogr/demo-repository.git',
  webUrl: 'https://github.com/backlogr/demo-repository',
  status: 'FAILED',
  indexJobId: 'job-1',
  indexedRevision: null,
  failure: {
    code: 'CACHE_UNAVAILABLE',
    stage: 'LOADING_CHUNKS',
    message: 'Redis is unavailable. Check the Redis connection and retry.',
    canRetry: true,
  },
  addedAt: '2026-07-20T00:00:00Z',
};

describe('SourcesPageComponent', () => {
  let workspaceService: {
    getUserWorkspaces: ReturnType<typeof vi.fn>;
  };
  let sourceService: {
    getSources: ReturnType<typeof vi.fn>;
    addSource: ReturnType<typeof vi.fn>;
    reindexSource: ReturnType<typeof vi.fn>;
    removeSource: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    workspaceService = {
      getUserWorkspaces: vi.fn(() => of([otherWorkspace, defaultWorkspace])),
    };
    sourceService = {
      getSources: vi.fn(() => of([failedSource])),
      addSource: vi.fn(),
      reindexSource: vi.fn(),
      removeSource: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SourcesPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser: vi.fn(() => of({ id: 'user-1' })) } },
        {
          provide: OnboardingService,
          useValue: {
            getState: vi.fn(() => of({
              completed: true,
              suggestedStep: 'DONE',
              defaultWorkspace,
              connection: null,
              source: null,
              ticket: null,
            })),
          },
        },
        { provide: WorkspaceService, useValue: workspaceService },
        { provide: SourceService, useValue: sourceService },
        { provide: ToastService, useValue: { toast: vi.fn(() => null), ok: vi.fn(), err: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('opens on the default workspace and labels repositories by source type', async () => {
    const fixture = TestBed.createComponent(SourcesPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedWorkspaceId()).toBe(defaultWorkspace.id);
    expect(sourceService.getSources).toHaveBeenCalledWith(defaultWorkspace.id);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Code repository');
    fixture.destroy();
  });

  it('only re-indexes and removes a source after explicit user actions', async () => {
    sourceService.reindexSource.mockReturnValue(of({
      ...failedSource,
      status: 'PROFILING',
      failure: null,
    }));
    sourceService.removeSource.mockReturnValue(of(undefined));
    const fixture = TestBed.createComponent(SourcesPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(sourceService.reindexSource).not.toHaveBeenCalled();
    fixture.componentInstance.reindex(failedSource);
    expect(sourceService.reindexSource).toHaveBeenCalledWith(defaultWorkspace.id, failedSource.id);

    fixture.componentInstance.askRemove(failedSource);
    fixture.componentInstance.removeSource();
    expect(sourceService.removeSource).toHaveBeenCalledWith(defaultWorkspace.id, failedSource.id);
    expect(fixture.componentInstance.sources()).not.toContainEqual(failedSource);
    fixture.destroy();
  });
});
