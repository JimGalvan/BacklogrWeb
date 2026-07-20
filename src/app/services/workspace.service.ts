import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE as BASE } from '../core/api/api-base';
import { Workspace, WorkspaceMember, CreateWorkspaceRequest, Ticket, TicketComment, ImportTicketRequest } from '../models/workspace.model';


@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private http = inject(HttpClient);

  getUserWorkspaces(userId: string): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(`${BASE}/users/${userId}/workspaces`);
  }

  getWorkspaceMembers(workspaceId: string): Observable<WorkspaceMember[]> {
    return this.http.get<WorkspaceMember[]>(`${BASE}/workspaces/${workspaceId}/members`);
  }

  createWorkspace(req: CreateWorkspaceRequest): Observable<Workspace> {
    return this.http.post<Workspace>(`${BASE}/workspaces`, req);
  }

  inviteMember(workspaceId: string, email: string): Observable<WorkspaceMember> {
    return this.http.post<WorkspaceMember>(`${BASE}/workspaces/${workspaceId}/invite`, { email });
  }

  removeMember(workspaceId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/workspaces/${workspaceId}/members/${userId}`);
  }

  getTickets(workspaceId: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${BASE}/workspaces/${workspaceId}/tickets`);
  }

  getTicket(workspaceId: string, ticketKey: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${BASE}/workspaces/${workspaceId}/tickets/${encodeURIComponent(ticketKey)}`);
  }

  importTicket(workspaceId: string, req: ImportTicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(`${BASE}/workspaces/${workspaceId}/tickets/import`, req);
  }

  removeTicket(workspaceId: string, ticketKey: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/workspaces/${workspaceId}/tickets/${encodeURIComponent(ticketKey)}`);
  }

  getTicketComments(workspaceId: string, ticketKey: string): Observable<TicketComment[]> {
    return this.http.get<TicketComment[]>(`${BASE}/workspaces/${workspaceId}/tickets/${encodeURIComponent(ticketKey)}/comments`);
  }
}
