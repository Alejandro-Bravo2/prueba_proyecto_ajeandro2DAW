import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Checkbox),
      multi: true,
    },
  ],
})
export class Checkbox implements ControlValueAccessor {
  @Input() label = '';
  @Input() id = '';
  @Input() control: FormControl = new FormControl(); // Allow passing a FormControl instance

  // For ControlValueAccessor
  _value = false;
  _isDisabled = false;
  _onChange: (value: boolean) => void = (_value) => { /* noop */ };
  _onTouched: () => void = () => { /* noop */ };

  get value(): boolean {
    return this._value;
  }

  set value(val: boolean) {
    if (val !== this._value) {
      this._value = val;
      this._onChange(val);
    }
  }

  // ControlValueAccessor methods
  writeValue(value: boolean): void {
    this.value = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
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

  onToggle(event: Event): void {
    this.value = (event.target as HTMLInputElement).checked;
  }
}
