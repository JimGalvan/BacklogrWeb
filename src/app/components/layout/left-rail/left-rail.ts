import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-left-rail',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './left-rail.html',
  styleUrl: './left-rail.css',
})
export class LeftRailComponent implements OnInit {
  private authService = inject(AuthService);

  readonly email = signal('');
  readonly menuOpen = signal(false);

  ngOnInit(): void {
    this.authService.currentUser().subscribe({
      next: user => this.email.set(user.email),
      error: () => this.email.set(''),
    });
  }

  initials(): string {
    const email = this.email();
    if (!email) return '?';
    return email.slice(0, 2).toUpperCase();
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.update(open => !open);
  }

  @HostListener('document:click')
  closeMenu(): void {
    if (this.menuOpen()) this.menuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeMenuOnEscape(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.menuOpen.set(false);
    this.authService.logout().subscribe();
  }
}
