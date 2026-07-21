import { TestBed } from '@angular/core/testing';
import { lastValueFrom, toArray } from 'rxjs';
import { environment } from '../../environments/environment';
import { AiService } from './ai.service';
import { AuthService } from './auth.service';

const BASE = `${environment.apiBaseUrl}/api/${environment.apiVersion}`;

describe('AiService', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(() => new Promise<Response>(() => {}));
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
    ['tldr', (service: AiService) => service.streamTldr('workspace-1', 'backlogr:demo#42')],
  ])('encodes provider ticket keys and aborts cancelled %s streams', (suffix, request) => {
    const subscription = request(TestBed.inject(AiService)).subscribe();
    const expectedUrl = `${BASE}/workspaces/workspace-1/ai/tickets/backlogr%3Ademo%2342/${suffix}`;
    const options = fetchMock.mock.calls[0][1] as RequestInit;

    expect(fetchMock).toHaveBeenCalledWith(
      expectedUrl,
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    subscription.unsubscribe();
    expect(options.signal?.aborted).toBe(true);
  });

  it('preserves SSE events split across network chunks', async () => {
    // The backend writes `data:<token>` with no space after the colon.
    fetchMock.mockResolvedValue(streamResponse([
      'da',
      'ta:<tldr>Summary\n',
      '\ndata:</tldr>\n\n',
    ]));

    const values = await lastValueFrom(
      TestBed.inject(AiService).streamTldr('workspace-1', 'issue#1').pipe(toArray())
    );

    expect(values).toEqual(['<tldr>Summary', '<tldr>Summary</tldr>']);
  });

  it('preserves leading spaces in tokens', async () => {
    // Models emit leading-space tokens (" Alt", " duplication"); the space sits
    // right after `data:` and must survive, or adjacent words run together.
    fetchMock.mockResolvedValue(streamResponse([
      'data:Fix\n\n',
      'data: Alt\n\n',
      'data:+drag\n\n',
      'data: duplication\n\n',
    ]));

    const values = await lastValueFrom(
      TestBed.inject(AiService).streamTldr('workspace-1', 'issue#1').pipe(toArray())
    );

    expect(values[values.length - 1]).toBe('Fix Alt+drag duplication');
  });

  it('surfaces the backend error message', async () => {
    fetchMock.mockResolvedValue(new Response(
      JSON.stringify({message: 'AI service is currently unavailable.'}),
      {status: 503, headers: {'Content-Type': 'application/json'}},
    ));

    await expect(lastValueFrom(
      TestBed.inject(AiService).streamTldr('workspace-1', 'issue#1')
    )).rejects.toThrow('AI service is currently unavailable.');
  });
});

function streamResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach(chunk => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });
  return new Response(body, {headers: {'Content-Type': 'text/event-stream'}});
}
