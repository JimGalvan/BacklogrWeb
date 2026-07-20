import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { AiService } from './ai.service';
import { AuthService } from './auth.service';

const BASE = `${environment.apiBaseUrl}/api/${environment.apiVersion}`;

describe('AiService ticket URLs', () => {
  const fetchMock = vi.fn(() => new Promise<Response>(() => {}));

  beforeEach(() => {
    fetchMock.mockClear();
    vi.stubGlobal('fetch', fetchMock);
    TestBed.configureTestingModule({
      providers: [
        AiService,
        { provide: AuthService, useValue: { getToken: () => 'test-token' } },
      ],
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['refinement', (service: AiService) => service.streamRefinement('workspace-1', 'backlogr:demo#42')],
    ['test-cases', (service: AiService) => service.streamTestCases('workspace-1', 'backlogr:demo#42')],
    ['tldr', (service: AiService) => service.streamTldr('workspace-1', 'backlogr:demo#42')],
  ])('encodes provider ticket keys for %s streaming', (suffix, request) => {
    const subscription = request(TestBed.inject(AiService)).subscribe();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/workspaces/workspace-1/ai/tickets/backlogr%3Ademo%2342/${suffix}`,
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    subscription.unsubscribe();
  });
});
