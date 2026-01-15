import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl } from '@angular/forms';

interface DropdownOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Dropdown),
      multi: true,
    },
  ],
})
export class Dropdown implements ControlValueAccessor {
  @Input() label = '';
  @Input() options: DropdownOption[] = [];
  @Input() control: FormControl = new FormControl(); // Allow passing a FormControl instance
  @Input() placeholder = 'Seleccione una opción';

  // For ControlValueAccessor - placeholders for callbacks
  _value: string | number = '';
  _isDisabled = false;
  _onChange: (value: string | number) => void = (_value) => { /* noop */ };
  _onTouched: () => void = () => { /* noop */ };

  get value(): string | number {
    return this._value;
  }

  set value(val: string | number) {
    if (val !== this._value) {
      this._value = val;
      this._onChange(val);
    }
  }

  // ControlValueAccessor methods
  writeValue(value: string | number): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._isDisabled = isDisabled;
  }

  onBlur(): void {
    this._onTouched();
  }
}
