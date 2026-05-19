import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ConnectUrlResponse } from '../models/integration.model';

const BASE = `${environment.apiBaseUrl}/api/${environment.apiVersion}`;
const STORAGE_KEY = 'connectedProviders';

@Injectable({ providedIn: 'root' })
export class IntegrationService {
  private http = inject(HttpClient);

  private _connected = signal<Set<string>>(
    new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'))
  );

  isConnected(provider: string): boolean {
    return this._connected().has(provider);
  }

  getConnectUrl(provider: string): Observable<ConnectUrlResponse> {
    return this.http.get<ConnectUrlResponse>(`${BASE}/auth/${provider}/connect`);
  }

  connect(provider: string): void {
    this.getConnectUrl(provider).subscribe({
      next: ({ url }) => {
        const popup = window.open(url, `${provider}-oauth`, 'width=600,height=700,left=200,top=100');
        const poll = setInterval(() => {
          if (popup?.closed) {
            clearInterval(poll);
            this.markConnected(provider);
          }
        }, 500);
      },
    });
  }

  markConnected(provider: string): void {
    this._connected.update(prev => {
      const next = new Set(prev);
      next.add(provider);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }
}
