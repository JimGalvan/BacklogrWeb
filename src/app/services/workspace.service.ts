import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Workspace, WorkspaceMember, CreateWorkspaceRequest } from '../models/workspace.model';

const BASE = `${environment.apiBaseUrl}/api/${environment.apiVersion}`;

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
}
