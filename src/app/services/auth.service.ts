import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, RegistrationResponse, UserProfile } from '../models/auth.model';

const BASE = `${environment.apiBaseUrl}/api/${environment.apiVersion}`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private token = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.token());
  getToken = () => this.token();

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${BASE}/auth/login`, body).pipe(
      tap(response => this.storeTokens(response))
    );
  }

  register(body: RegisterRequest): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${BASE}/auth/register`, body).pipe(
      tap(response => this.storeTokens(response))
    );
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<AuthResponse>(`${BASE}/auth/refresh`, { refreshToken }).pipe(
      tap(response => this.storeTokens(response))
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
    this.token.set(null);
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }

  private storeTokens(response: AuthResponse): void {
    this.token.set(response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
  }
}
