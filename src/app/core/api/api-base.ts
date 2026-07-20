import { environment } from '../../../environments/environment';

/**
 * Single source of truth for the versioned API base URL.
 * Replaces the per-service `const BASE = ...` duplication.
 */
export const API_BASE = `${environment.apiBaseUrl}/api/${environment.apiVersion}`;

/** Build an API URL from path segments: apiUrl('workspaces', id, 'sources'). */
export function apiUrl(...segments: (string | number)[]): string {
  return [API_BASE, ...segments.map(String)].join('/');
}
