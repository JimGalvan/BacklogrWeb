import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.model';
import { AuthCardComponent } from '../../components/auth/auth-card/auth-card';
import { AuthFieldComponent } from '../../components/auth/auth-field/auth-field';
import { AuthSubmitButtonComponent } from '../../components/auth/auth-submit-button/auth-submit-button';
import { AuthSwitchComponent } from '../../components/auth/auth-switch/auth-switch';

@Component({
  selector: 'app-register-page',
  imports: [
    ReactiveFormsModule,
    AuthCardComponent,
    AuthFieldComponent,
    AuthSubmitButtonComponent,
    AuthSwitchComponent,
  ],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  loading = signal(false);
  error = signal<string | null>(null);

  submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    this.authService.register(this.form.getRawValue() as RegisterRequest).subscribe({
      next: () => this.router.navigate(['/onboarding']),
      error: (err) => {
        this.error.set(err.error?.message ?? 'Registration failed. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
