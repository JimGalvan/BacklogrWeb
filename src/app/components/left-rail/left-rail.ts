import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-left-rail',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './left-rail.html',
  styleUrl: './left-rail.css',
})
export class LeftRailComponent {}
