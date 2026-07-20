import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE as BASE } from '../core/api/api-base';
import { Source } from '../models/source.model';

/** Workspace source lifecycle and per-ticket source context. */
@Injectable({ providedIn: 'root' })
export class SourceService {
  private http = inject(HttpClient);

  getSources(workspaceId: string): Observable<Source[]> {
    return this.http.get<Source[]>(`${BASE}/workspaces/${workspaceId}/sources`);
  }

  getSource(workspaceId: string, sourceId: string): Observable<Source> {
    return this.http.get<Source>(`${BASE}/workspaces/${workspaceId}/sources/${sourceId}`);
  }

  addSource(workspaceId: string, url: string): Observable<Source> {
    return this.http.post<Source>(`${BASE}/workspaces/${workspaceId}/sources`, { url });
  }

  reindexSource(workspaceId: string, sourceId: string): Observable<Source> {
    return this.http.post<Source>(`${BASE}/workspaces/${workspaceId}/sources/${sourceId}/reindex`, null);
  }

  removeSource(workspaceId: string, sourceId: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/workspaces/${workspaceId}/sources/${sourceId}`);
  }

  getTicketContextSources(workspaceId: string, ticketKey: string): Observable<Source[]> {
    return this.http.get<Source[]>(
      `${BASE}/workspaces/${workspaceId}/tickets/${encodeURIComponent(ticketKey)}/context/sources`
    );
  }

  replaceTicketContextSources(
    workspaceId: string,
    ticketKey: string,
    sourceIds: string[],
  ): Observable<Source[]> {
    return this.http.put<Source[]>(
      `${BASE}/workspaces/${workspaceId}/tickets/${encodeURIComponent(ticketKey)}/context/sources`,
      { sourceIds },
    );
  }
}
