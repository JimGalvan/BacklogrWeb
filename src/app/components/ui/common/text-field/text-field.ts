import { Component, input, model, output } from '@angular/core';

/**
 * Shared text input with optional label. Signal-friendly: bind with [(value)].
 * Generalized from app-auth-field (which stays FormControl-based for auth pages).
 */
@Component({
  selector: 'app-text-field',
  imports: [],
  templateUrl: './text-field.html',
  styleUrl: './text-field.css',
})
export class TextFieldComponent {
  value = model<string>('');
  label = input<string>('');
  fieldId = input.required<string>();
  type = input<string>('text');
  placeholder = input<string>('');
  autocomplete = input<string>('');
  disabled = input(false);
  invalid = input(false);

  /** Emitted on Enter, for submit-on-enter flows. */
  entered = output<void>();
}
