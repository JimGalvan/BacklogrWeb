import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../components/ui/icon/icon';

@Component({
  selector: 'app-wt-toolbar',
  imports: [FormsModule, IconComponent],
  templateUrl: './wt-toolbar.html',
  styleUrl: './wt-toolbar.css',
})
export class WtToolbarComponent {
  mineOnly = model(false);
  search = model('');
  count = input(0);
}
