import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

const BASE = `${environment.apiBaseUrl}/api/${environment.apiVersion}`;

@Injectable({ providedIn: 'root' })
export class AiService {
  private authService = inject(AuthService);

  streamRefinement(workspaceId: string, ticketKey: string): Observable<string> {
    return this.streamEndpoint(`${BASE}/workspaces/${workspaceId}/ai/tickets/${encodeURIComponent(ticketKey)}/refinement`);
  }

  streamTestCases(workspaceId: string, ticketKey: string): Observable<string> {
    return this.streamEndpoint(`${BASE}/workspaces/${workspaceId}/ai/tickets/${encodeURIComponent(ticketKey)}/test-cases`);
  }

  streamTldr(workspaceId: string, ticketKey: string): Observable<string> {
    return this.streamEndpoint(`${BASE}/workspaces/${workspaceId}/ai/tickets/${encodeURIComponent(ticketKey)}/tldr`);
  }

  private streamEndpoint(url: string): Observable<string> {
    return new Observable<string>(observer => {
      const controller = new AbortController();
      let accumulated = '';
      let buffer = '';

      const consumeEvent = (event: string): void => {
        const data = event
          .split(/\r?\n/)
          .filter(line => line.startsWith('data:'))
          .map(line => line.slice(5).replace(/^ /, ''))
          .join('\n');
        if (!data) return;
        accumulated += data;
        observer.next(accumulated);
      };

      const consumeCompleteEvents = (): void => {
        let boundary = buffer.match(/\r?\n\r?\n/);
        while (boundary?.index !== undefined) {
          consumeEvent(buffer.slice(0, boundary.index));
          buffer = buffer.slice(boundary.index + boundary[0].length);
          boundary = buffer.match(/\r?\n\r?\n/);
        }
      };

      fetch(url, {
        headers: {
          Authorization: `Bearer ${this.authService.getToken()}`,
          Accept: 'text/event-stream',
        },
        signal: controller.signal,
      })
        .then(async response => {
          if (!response.ok) throw await this.responseError(response);
          if (!response.body) throw new Error('The AI stream could not be opened. Please try again.');

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          while (!observer.closed) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            consumeCompleteEvents();
          }

          if (observer.closed) return;
          buffer += decoder.decode();
          consumeCompleteEvents();
          if (buffer.trim()) consumeEvent(buffer);
          observer.complete();
        })
        .catch(error => {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          if (!observer.closed) observer.error(error);
        });

      return () => controller.abort();
    });
  }

  private async responseError(response: Response): Promise<Error> {
    let serverMessage = '';
    try {
      const body = await response.json() as { message?: unknown };
      if (typeof body.message === 'string') serverMessage = body.message;
    } catch {
      // The status-specific fallback below remains actionable when the body is not JSON.
    }

    const fallback = new Map<number, string>([
      [401, 'Your session expired. Sign in and try again.'],
      [403, 'You do not have access to run AI insights for this workspace.'],
      [404, 'The ticket or its provider connection is no longer available.'],
      [429, 'The AI service is busy. Wait a moment and try again.'],
      [503, 'The AI service is currently unavailable. Please try again later.'],
    ]).get(response.status) ?? 'The AI request failed. Please try again.';

    return new Error(serverMessage || fallback);
  }
}
