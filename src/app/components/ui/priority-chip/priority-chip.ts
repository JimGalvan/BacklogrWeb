import { Component, computed, input } from '@angular/core';

const PRIORITY_CONFIG = {
  P1: { label: 'P1 — Critical', cls: 'p1' },
  P2: { label: 'P2 — High',     cls: 'p2' },
  P3: { label: 'P3 — Medium',   cls: 'p3' },
};

@Component({
  selector: 'app-priority-chip',
  imports: [],
  templateUrl: './priority-chip.html',
  styleUrl: './priority-chip.css',
})
export class PriorityChipComponent {
  priority = input<'P1' | 'P2' | 'P3'>('P1');
  config = computed(() => PRIORITY_CONFIG[this.priority()]);
}
