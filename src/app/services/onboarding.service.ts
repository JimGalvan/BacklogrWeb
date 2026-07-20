import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE as BASE } from '../core/api/api-base';
import { OnboardingState } from '../models/onboarding.model';


@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private http = inject(HttpClient);

  getState(): Observable<OnboardingState> {
    return this.http.get<OnboardingState>(`${BASE}/onboarding`);
  }

  complete(): Observable<OnboardingState> {
    return this.http.post<OnboardingState>(`${BASE}/onboarding/complete`, null);
  }

  addSource(workspaceId: string, url: string): Observable<unknown> {
    return this.http.post(`${BASE}/workspaces/${workspaceId}/sources`, { url });
  }
}