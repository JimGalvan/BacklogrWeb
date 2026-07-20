import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { WorkspaceService } from './workspace.service';

const BASE = `${environment.apiBaseUrl}/api/${environment.apiVersion}`;

describe('WorkspaceService ticket URLs', () => {
  let service: WorkspaceService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorkspaceService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WorkspaceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('encodes provider ticket keys in detail, comment, and delete URLs', () => {
    const key = 'backlogr:demo-repository#42';
    const encodedKey = 'backlogr%3Ademo-repository%2342';

    service.getTicket('workspace-1', key).subscribe();
    http.expectOne(`${BASE}/workspaces/workspace-1/tickets/${encodedKey}`).flush({});

    service.getTicketComments('workspace-1', key).subscribe();
    http.expectOne(`${BASE}/workspaces/workspace-1/tickets/${encodedKey}/comments`).flush([]);

    service.removeTicket('workspace-1', key).subscribe();
    http.expectOne({
      method: 'DELETE',
      url: `${BASE}/workspaces/workspace-1/tickets/${encodedKey}`,
    }).flush(null);
  });

});
