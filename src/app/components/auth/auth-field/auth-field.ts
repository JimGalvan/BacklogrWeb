import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-field',
  imports: [ReactiveFormsModule],
  templateUrl: './auth-field.html',
  styleUrl: './auth-field.css',
})
export class AuthFieldComponent {
  label = input.required<string>();
  control = input.required<FormControl>();
  fieldId = input.required<string>();
  type = input<string>('text');
  placeholder = input<string>('');
  autocomplete = input<string>('');
}
