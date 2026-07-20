import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { API_BASE as BASE } from '../core/api/api-base';
import {
  CONNECTION_RESULT_MESSAGE_TYPE,
  ConnectUrlResponse,
  ConnectionAuthorizationResponse,
  ConnectionResult,
} from '../models/integration.model';

const STORAGE_KEY = 'connectedProviders';
const POPUP_FEATURES = 'popup=yes,width=640,height=760,left=200,top=80';
const POPUP_CLOSED_POLL_MS = 400;

/** Reads the persisted provider list, tolerating missing or corrupted storage. */
function readStoredProviders(): Set<string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return new Set(Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : []);
  } catch {
    return new Set();
  }
}

@Injectable({ providedIn: 'root' })
export class IntegrationService {
  private http = inject(HttpClient);

  private connected = signal<Set<string>>(readStoredProviders());

  isConnected(provider: string): boolean {
    return this.connected().has(provider.toLowerCase());
  }

  connect(provider: string, returnPath = '/integrations'): Observable<ConnectionResult> {
    return new Observable<ConnectionResult>(observer => {
      const providerId = provider.toLowerCase();
      const popup = window.open('about:blank', `${providerId}-authorization`, POPUP_FEATURES);

      if (!popup) {
        observer.error(new Error('Your browser blocked the connection window. Allow popups for Backlogr and try again.'));
        return;
      }

      let finished = false;
      let requestSubscription: Subscription | undefined;

      const cleanup = () => {
        window.removeEventListener('message', onMessage);
        window.clearInterval(closedPoll);
        requestSubscription?.unsubscribe();
      };

      const finish = (result: ConnectionResult) => {
        if (finished) return;
        finished = true;
        if (result.status === 'connected') this.markConnected(result.provider);
        observer.next(result);
        observer.complete();
        cleanup();
      };

      const onMessage = (event: MessageEvent<ConnectionResult>) => {
        if (event.origin !== window.location.origin || event.source !== popup) return;
        if (event.data?.type !== CONNECTION_RESULT_MESSAGE_TYPE || event.data.provider !== providerId) return;
        finish(event.data);
      };

      window.addEventListener('message', onMessage);

      const closedPoll = window.setInterval(() => {
        if (popup.closed && !finished) {
          finish({
            type: CONNECTION_RESULT_MESSAGE_TYPE,
            provider: providerId,
            status: providerId === 'github' ? 'cancelled' : 'connected',
            message: providerId === 'github'
              ? 'The GitHub connection window was closed before setup finished.'
              : undefined,
          });
        }
      }, POPUP_CLOSED_POLL_MS);

      requestSubscription = this.getAuthorizationUrl(providerId, returnPath).subscribe({
        next: ({ url }) => {
          try {
            popup.location.href = url;
            popup.focus();
          } catch {
            popup.close();
            cleanup();
            observer.error(new Error('Provider authorization could not be opened.'));
          }
        },
        error: () => {
          popup.close();
          cleanup();
          observer.error(new Error('Backlogr could not start the provider connection. Check the API and try again.'));
        },
      });

      return cleanup;
    });
  }

  markConnected(provider: string): void {
    this.connected.update(previous => {
      const next = new Set(previous);
      next.add(provider.toLowerCase());
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  private getAuthorizationUrl(provider: string, returnPath: string): Observable<ConnectUrlResponse> {
    if (provider === 'github') {
      return this.http.post<ConnectionAuthorizationResponse>(`${BASE}/connections/authorization`, {
        provider: 'GITHUB',
        returnPath,
      });
    }
    return this.http.get<ConnectUrlResponse>(`${BASE}/auth/${provider}/connect`);
  }
}
