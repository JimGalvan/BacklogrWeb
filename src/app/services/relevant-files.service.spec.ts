import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { RelevantFilesService } from './relevant-files.service';

const BASE = `${environment.apiBaseUrl}/api/${environment.apiVersion}`;

describe('RelevantFilesService', () => {
  let service: RelevantFilesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RelevantFilesService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RelevantFilesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads relevant files from the workspace ticket-context endpoint', () => {
    service.getRelevantFiles('workspace-1', 'backlogr:demo#42').subscribe();

    const request = http.expectOne(
      `${BASE}/workspaces/workspace-1/tickets/backlogr%3Ademo%2342/context/relevant-files`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({ grounding: 'TICKET_AND_CODE', indexing: false, files: [], warnings: [] });
  });

  it('bypasses the cache when relevance is explicitly refreshed', () => {
    service.getRelevantFiles('workspace-1', 'ticket-42', true).subscribe();

    const request = http.expectOne(request =>
      request.url === `${BASE}/workspaces/workspace-1/tickets/ticket-42/context/relevant-files`
        && request.params.get('refresh') === 'true',
    );
    expect(request.request.method).toBe('GET');
    request.flush({ grounding: 'TICKET_AND_CODE', indexing: false, files: [], warnings: [] });
  });
});
