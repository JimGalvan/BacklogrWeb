import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.model';
import { AuthCardComponent } from '../../components/auth/auth-card/auth-card';
import { AuthFieldComponent } from '../../components/auth/auth-field/auth-field';
import { AuthSubmitButtonComponent } from '../../components/auth/auth-submit-button/auth-submit-button';
import { AuthSwitchComponent } from '../../components/auth/auth-switch/auth-switch';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    AuthCardComponent,
    AuthFieldComponent,
    AuthSubmitButtonComponent,
    AuthSwitchComponent,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/tickets';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(
    (this.router.getCurrentNavigation()?.extras.state as { registered?: boolean })?.registered
      ? 'Account created. Sign in to continue.'
      : null
  );

  submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    this.authService.login(this.form.getRawValue() as LoginRequest).subscribe({
      next: () => this.router.navigateByUrl(this.returnUrl),
      error: (err) => {
        this.error.set(err.error?.message ?? 'Invalid email or password.');
        this.loading.set(false);
      },
    });
  }
}
