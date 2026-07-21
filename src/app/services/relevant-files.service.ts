import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE as BASE } from '../core/api/api-base';
import { RelevantFilesResponse } from '../models/relevant-files.model';

@Injectable({ providedIn: 'root' })
export class RelevantFilesService {
  private http = inject(HttpClient);

  getRelevantFiles(
    workspaceId: string,
    ticketKey: string,
    refresh = false,
  ): Observable<RelevantFilesResponse> {
    return this.http.get<RelevantFilesResponse>(
      `${BASE}/workspaces/${workspaceId}/tickets/${encodeURIComponent(ticketKey)}/context/relevant-files`,
      { params: refresh ? { refresh: 'true' } : {} },
    );
  }
}
