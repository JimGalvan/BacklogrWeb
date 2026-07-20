import { HttpErrorResponse } from '@angular/common/http';

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

/**
 * Extracts a user-facing message from an HTTP error.
 * Single replacement for the per-page `errorMessage` copies.
 */
export function errorMessage(err: unknown, fallback = DEFAULT_MESSAGE): string {
  if (err instanceof HttpErrorResponse && typeof err.error?.message === 'string') {
    return err.error.message;
  }
  return fallback;
}
