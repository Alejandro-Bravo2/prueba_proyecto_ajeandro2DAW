import { Component, inject, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProgressService, ProgressEntry } from '../../services/progress.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-add-progress-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-progress-form.html',
  styleUrl: './add-progress-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddProgressForm {
  private formBuilder = inject(FormBuilder);
  private progressService = inject(ProgressService);
  private toastService = inject(ToastService);

  // Output event when progress is added
  progressAdded = output<ProgressEntry>();

  // Signals
  showForm = signal(false);
  isSubmitting = signal(false);
  exercises = signal<string[]>([]);

  progressForm = this.formBuilder.group({
    exerciseName: ['', [Validators.required, Validators.minLength(2)]],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    weight: [0, [Validators.required, Validators.min(0)]],
    reps: [0, [Validators.required, Validators.min(1)]],
    sets: [0, [Validators.required, Validators.min(1)]],
    notes: [''],
  });

  ngOnInit(): void {
    this.loadExercises();
  }

  private loadExercises(): void {
    const userId = this.getUserId();
    if (userId) {
      this.progressService.getUserExercises(userId).subscribe({
        next: (exercises) => {
          this.exercises.set(exercises);
        },
        error: (err) => {
          console.error('Error loading exercises:', err);
        },
      });
    }
  }

  toggleForm() {
    this.showForm.update((value) => !value);
    if (!this.showForm()) {
      this.progressForm.reset({
        date: new Date().toISOString().split('T')[0],
        weight: 0,
        reps: 0,
        sets: 0,
      });
    }
  }

  onSubmit() {
    if (this.progressForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      const userId = this.getUserId();
      if (!userId) {
        this.toastService.error('Usuario no autenticado');
        this.isSubmitting.set(false);
        return;
      }

      const formValue = this.progressForm.value;
      const progressData: Omit<ProgressEntry, 'id'> = {
        userId,
        date: formValue.date || new Date().toISOString().split('T')[0],
        exerciseName: formValue.exerciseName || '',
        weight: formValue.weight || 0,
        reps: formValue.reps || 0,
        sets: formValue.sets || 0,
        notes: formValue.notes || undefined,
      };

      this.progressService.addProgressEntry(progressData).subscribe({
        next: (entry) => {
          this.toastService.success('Progreso registrado exitosamente');
          this.progressAdded.emit(entry);
          this.toggleForm();
          this.isSubmitting.set(false);
          this.loadExercises(); // Reload exercises list
        },
        error: (err) => {
          console.error('Error adding progress:', err);
          this.toastService.error('Error al registrar el progreso');
          this.isSubmitting.set(false);
        },
      });
    } else {
      this.progressForm.markAllAsTouched();
    }
  }

  private getUserId(): string | null {
    const user = localStorage.getItem('currentUser');
    if (user) {
      return JSON.parse(user).id;
    }
    return null;
  }
}
