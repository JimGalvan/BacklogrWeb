import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-left-rail',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './left-rail.html',
  styleUrl: './left-rail.css',
})
export class LeftRailComponent {
  private authService = inject(AuthService);

  logout() {
    this.authService.logout().subscribe();
  }
}
