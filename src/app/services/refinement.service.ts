import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE as BASE } from '../core/api/api-base';
import { RefinementFindingsResponse } from '../models/refinement.model';

@Injectable({ providedIn: 'root' })
export class RefinementService {
  private http = inject(HttpClient);

  getFindings(workspaceId: string, ticketKey: string): Observable<RefinementFindingsResponse> {
    return this.http.get<RefinementFindingsResponse>(
      `${BASE}/workspaces/${workspaceId}/ai/tickets/${encodeURIComponent(ticketKey)}/refinement`,
    );
  }
}
