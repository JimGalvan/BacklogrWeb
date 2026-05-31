import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LeftRailComponent } from '../left-rail/left-rail';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, LeftRailComponent],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class ShellComponent {}
