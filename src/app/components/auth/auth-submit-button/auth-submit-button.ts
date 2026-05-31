import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-submit-button',
  imports: [],
  templateUrl: './auth-submit-button.html',
  styleUrl: './auth-submit-button.css',
})
export class AuthSubmitButtonComponent {
  label = input.required<string>();
  loading = input(false);
}
