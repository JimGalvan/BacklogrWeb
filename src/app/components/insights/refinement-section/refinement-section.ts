import { Component, input } from '@angular/core';
import { RefinementItem } from '../../../models/refinement.model';

@Component({
  selector: 'app-refinement-section',
  imports: [],
  templateUrl: './refinement-section.html',
  styleUrl: './refinement-section.css',
})
export class RefinementSectionComponent {
  title = input.required<string>();
  items = input.required<RefinementItem[]>();
}
