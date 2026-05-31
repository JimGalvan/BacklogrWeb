import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-switch',
  imports: [RouterLink],
  templateUrl: './auth-switch.html',
  styleUrl: './auth-switch.css',
})
export class AuthSwitchComponent {
  prompt = input.required<string>();
  linkText = input.required<string>();
  link = input.required<string>();
}
