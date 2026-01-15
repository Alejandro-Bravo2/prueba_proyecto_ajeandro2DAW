import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-radio-button',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './radio-button.html',
  styleUrl: './radio-button.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioButton),
      multi: true,
    },
  ],
})
export class RadioButton implements ControlValueAccessor {
  @Input() label = '';
  @Input() id = '';
  @Input() name = ''; // Name is crucial for radio button groups
  @Input() value: string | number = ''; // The value this specific radio button represents
  @Input() control: FormControl = new FormControl(); // Allow passing a FormControl instance

  // For ControlValueAccessor
  _internalValue: string | number = ''; // Value of the selected radio button in the group
  _isDisabled = false;
  _onChange: (value: string | number) => void = (_value) => { /* noop */ };
  _onTouched: () => void = () => { /* noop */ };

  get checked(): boolean {
    return this._internalValue === this.value;
  }

  // ControlValueAccessor methods
  writeValue(value: string | number): void {
    this._internalValue = value;
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

  onSelect(event: Event): void {
    const targetValue = (event.target as HTMLInputElement).value;
    this.value = targetValue; // Update internal value based on selected radio
    this._onChange(targetValue);
    this._onTouched();
  }

  onBlur(): void {
    this._onTouched();
  }
}
