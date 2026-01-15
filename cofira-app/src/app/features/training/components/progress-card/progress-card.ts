import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkoutProgress } from '../../services/training.service';

@Component({
  selector: 'app-progress-card',
  imports: [RouterLink],
  templateUrl: './progress-card.html',
  styleUrl: './progress-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressCard {
  // Input signal for workout progress
  workoutProgress = input<WorkoutProgress | null>(null);
}
