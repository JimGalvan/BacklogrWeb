import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { RefinementService } from './refinement.service';

const BASE = `${environment.apiBaseUrl}/api/${environment.apiVersion}`;

describe('RefinementService', () => {
  let service: RefinementService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RefinementService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RefinementService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads completed refinement findings with an encoded ticket key', () => {
    service.getFindings('workspace-1', 'backlogr:demo#42').subscribe();

    const request = http.expectOne(
      `${BASE}/workspaces/workspace-1/ai/tickets/backlogr%3Ademo%2342/refinement`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({ summary: 'Ready.', grounding: 'TICKET', findings: [] });
  });
});
