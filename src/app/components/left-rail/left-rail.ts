import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-left-rail',
  imports: [],
  templateUrl: './left-rail.html',
  styleUrl: './left-rail.css',
})
export class LeftRailComponent {
  activeNav = signal('tickets');
}
