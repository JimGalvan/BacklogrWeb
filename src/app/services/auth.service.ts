import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, UserProfile } from '../models/auth.model';

const BASE = `${environment.apiBaseUrl}/api/${environment.apiVersion}`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _token = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this._token());
  getToken = () => this._token();

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${BASE}/auth/login`, body).pipe(
      tap(r => this.storeTokens(r))
    );
  }

  register(body: RegisterRequest): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${BASE}/users`, body);
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<AuthResponse>(`${BASE}/auth/refresh`, { refreshToken }).pipe(
      tap(r => this.storeTokens(r))
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${BASE}/auth/logout`, null).pipe(
      finalize(() => this.clearSession())
    );
  }

  currentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${BASE}/users/me`);
  }

  clearSession(): void {
    this._token.set(null);
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }

  private storeTokens(r: AuthResponse): void {
    this._token.set(r.token);
    localStorage.setItem('refreshToken', r.refreshToken);
  }
}
