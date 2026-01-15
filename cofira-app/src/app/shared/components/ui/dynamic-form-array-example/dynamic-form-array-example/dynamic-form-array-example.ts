import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { phoneValidator } from '../../../../validators/spanish-formats.validator';

@Component({
  selector: 'app-dynamic-form-array-example',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-form-array-example.html',
  styleUrl: './dynamic-form-array-example.scss',
})
export class DynamicFormArrayExample {
  private readonly fb = inject(FormBuilder);

  parentForm: FormGroup = this.fb.group({
    phoneNumbers: this.fb.array([this.createPhoneNumberControl()])
  });

  get phoneNumbers(): FormArray<FormControl<string | null>> {
    return this.parentForm.get('phoneNumbers') as FormArray<FormControl<string | null>>;
  }

  createPhoneNumberControl(): FormControl<string | null> {
    return new FormControl('', [Validators.required, phoneValidator()]);
  }

  addPhoneNumber(): void {
    this.phoneNumbers.push(this.createPhoneNumberControl());
  }

  removePhoneNumber(index: number): void {
    if (this.phoneNumbers.length > 1) { // Ensure at least one field remains
      this.phoneNumbers.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.parentForm.valid) {
      // Formulario valido - procesar datos
      // En una implementacion real, aqui se enviarian los datos al servidor
    } else {
      this.parentForm.markAllAsTouched();
    }
  }
}
