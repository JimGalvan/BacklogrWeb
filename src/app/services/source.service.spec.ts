import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { SourceService } from './source.service';

const BASE = `${environment.apiBaseUrl}/api/${environment.apiVersion}`;

describe('SourceService', () => {
  let service: SourceService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SourceService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SourceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses the workspace-scoped source lifecycle endpoints', () => {
    service.getSources('workspace-1').subscribe();
    http.expectOne(`${BASE}/workspaces/workspace-1/sources`).flush([]);

    service.getSource('workspace-1', 'source-1').subscribe();
    http.expectOne(`${BASE}/workspaces/workspace-1/sources/source-1`).flush({});

    service.addSource('workspace-1', 'https://github.com/backlogr/demo').subscribe();
    const addRequest = http.expectOne(`${BASE}/workspaces/workspace-1/sources`);
    expect(addRequest.request.method).toBe('POST');
    expect(addRequest.request.body).toEqual({ url: 'https://github.com/backlogr/demo' });
    addRequest.flush({});

    service.reindexSource('workspace-1', 'source-1').subscribe();
    const reindexRequest = http.expectOne(`${BASE}/workspaces/workspace-1/sources/source-1/reindex`);
    expect(reindexRequest.request.method).toBe('POST');
    expect(reindexRequest.request.body).toBeNull();
    reindexRequest.flush({});

    service.removeSource('workspace-1', 'source-1').subscribe();
    http.expectOne({
      method: 'DELETE',
      url: `${BASE}/workspaces/workspace-1/sources/source-1`,
    }).flush(null);
  });

  it('encodes provider ticket keys in the ticket-context endpoints', () => {
    const key = 'backlogr:demo-repository#42';
    const encodedKey = 'backlogr%3Ademo-repository%2342';

    service.getTicketContextSources('workspace-1', key).subscribe();
    http.expectOne(`${BASE}/workspaces/workspace-1/tickets/${encodedKey}/context/sources`).flush([]);

    service.replaceTicketContextSources('workspace-1', key, ['source-1']).subscribe();
    const contextRequest = http.expectOne(
      `${BASE}/workspaces/workspace-1/tickets/${encodedKey}/context/sources`
    );
    expect(contextRequest.request.method).toBe('PUT');
    expect(contextRequest.request.body).toEqual({ sourceIds: ['source-1'] });
    contextRequest.flush([]);
  });
});
