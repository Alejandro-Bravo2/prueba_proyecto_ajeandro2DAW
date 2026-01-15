import { Component, input, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ProgressEntry } from '../../services/progress.service';

@Component({
  selector: 'app-strength-gain-chart',
  imports: [BaseChartDirective],
  templateUrl: './strength-gain-chart.html',
  styleUrl: './strength-gain-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StrengthGainChart {
  // Input signals
  progressEntries = input<ProgressEntry[]>([]);
  exercises = input<string[]>([]);

  // Selected exercise for the chart
  selectedExercise = signal<string>('');

  // Computed signal for filtered progress data
  filteredProgress = computed(() => {
    const selected = this.selectedExercise();
    if (!selected) return [];

    return this.progressEntries()
      .filter((entry) => entry.exerciseName === selected)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  // Computed signal to check if there's data
  hasProgressData = computed(() => this.filteredProgress().length > 0);

  // Chart configuration
  lineChartData = signal<ChartConfiguration<'line'>['data']>({
    labels: [],
    datasets: [],
  });

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Peso (kg)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Fecha',
        },
      },
    },
  };

  constructor() {
    // Effect to update chart when filtered progress changes
    effect(() => {
      const progress = this.filteredProgress();

      if (progress.length > 0) {
        const labels = progress.map((entry) =>
          new Date(entry.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
        );

        const weights = progress.map((entry) => entry.weight);
        const volumes = progress.map((entry) => entry.weight * entry.reps * entry.sets);

        this.lineChartData.set({
          labels: labels,
          datasets: [
            {
              label: 'Peso Máximo (kg)',
              data: weights,
              borderColor: '#FDB913',
              backgroundColor: 'rgba(253, 185, 19, 0.1)',
              tension: 0.3,
              fill: true,
            },
            {
              label: 'Volumen Total (kg)',
              data: volumes,
              borderColor: '#2C3E50',
              backgroundColor: 'rgba(44, 62, 80, 0.1)',
              tension: 0.3,
              fill: true,
            },
          ],
        });
      } else {
        this.lineChartData.set({ labels: [], datasets: [] });
      }
    });
  }

  onExerciseChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedExercise.set(select.value);
  }
}
