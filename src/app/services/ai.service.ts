import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

const BASE = `${environment.apiBaseUrl}/api/${environment.apiVersion}`;

@Injectable({ providedIn: 'root' })
export class AiService {
  private authService = inject(AuthService);

  streamRefinement(workspaceId: string, ticketKey: string): Observable<string> {
    return this.streamEndpoint(`${BASE}/workspaces/${workspaceId}/ai/tickets/${ticketKey}/refinement`);
  }

  streamTestCases(workspaceId: string, ticketKey: string): Observable<string> {
    return this.streamEndpoint(`${BASE}/workspaces/${workspaceId}/ai/tickets/${ticketKey}/test-cases`);
  }

  streamTldr(workspaceId: string, ticketKey: string): Observable<string> {
    return this.streamEndpoint(`${BASE}/workspaces/${workspaceId}/ai/tickets/${ticketKey}/tldr`);
  }

  private streamEndpoint(url: string): Observable<string> {
    return new Observable<string>(observer => {
      const token = this.authService.getToken();
      const controller = new AbortController();
      let accumulated = '';

      fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        signal: controller.signal,
      })
        .then(async response => {
          if (!response.ok) {
            const error = await response.json();
            observer.error(error);
            return;
          }

          const reader = response.body!.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const raw = decoder.decode(value, { stream: true });
            for (const line of raw.split('\n')) {
              if (line.startsWith('data:')) {
                accumulated += line.slice(5);
                observer.next(accumulated);
              }
            }
          }

          observer.complete();
        })
        .catch(error => {
          if (error.name !== 'AbortError') {
            observer.error(error);
          }
        });

      return () => controller.abort();
    });
  }
}
