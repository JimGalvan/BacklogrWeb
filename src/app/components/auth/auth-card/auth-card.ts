import { Component, input } from '@angular/core';

/**
 * Auth page shell: brand logo, title/subtitle header, error/success banners,
 * and a content slot for the form + footer. Shared by login and register.
 */
@Component({
  selector: 'app-auth-card',
  imports: [],
  templateUrl: './auth-card.html',
  styleUrl: './auth-card.css',
})
export class AuthCardComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  error = input<string | null>(null);
  success = input<string | null>(null);
}
