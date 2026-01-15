import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  index: number;
  label: string;
}

@Component({
  selector: 'app-steps-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './steps-indicator.html',
  styleUrl: './steps-indicator.scss',
})
export class StepsIndicator {
  // Using Angular 20 input signals
  steps = input<Step[]>([]);
  currentStep = input<number>(1);
}
