import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LeftRailComponent } from './components/left-rail/left-rail';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LeftRailComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
