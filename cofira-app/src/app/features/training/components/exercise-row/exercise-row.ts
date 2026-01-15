import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  completed: boolean;
}

@Component({
  selector: 'app-exercise-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exercise-row.html',
  styleUrl: './exercise-row.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseRow {
  // Using Angular 20 input signal
  exercise = input<Exercise | undefined>(undefined);
}
