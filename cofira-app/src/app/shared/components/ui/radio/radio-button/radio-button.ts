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
  @Input() label: string = '';
  @Input() id: string = '';
  @Input() name: string = ''; // Name is crucial for radio button groups
  @Input() value: any; // The value this specific radio button represents
  @Input() control: FormControl = new FormControl(); // Allow passing a FormControl instance

  // For ControlValueAccessor
  _internalValue: any = ''; // Value of the selected radio button in the group
  _isDisabled: boolean = false;
  _onChange: (value: any) => void = () => {};
  _onTouched: () => void = () => {};

  get checked(): boolean {
    return this._internalValue === this.value;
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this._internalValue = value;
  }

  registerOnChange(fn: (value: any) => void): void {
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
