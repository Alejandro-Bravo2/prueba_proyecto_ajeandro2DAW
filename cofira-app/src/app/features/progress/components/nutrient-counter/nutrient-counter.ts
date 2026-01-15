import { Component, input, computed, effect, signal, ChangeDetectionStrategy } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { NutrientData } from '../../services/progress.service';

@Component({
  selector: 'app-nutrient-counter',
  imports: [BaseChartDirective],
  templateUrl: './nutrient-counter.html',
  styleUrl: './nutrient-counter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NutrientCounter {
  // Input signal for nutrient data
  nutrientData = input<NutrientData | null>(null);

  // Computed signal to check if we have actual nutrient data (not just zeros)
  hasNutrientData = computed(() => {
    const data = this.nutrientData();
    if (!data) return false;
    return data.protein > 0 || data.carbs > 0 || data.fat > 0 || data.calories > 0;
  });

  // Computed signal for calorie percentage
  caloriePercentage = computed(() => {
    const data = this.nutrientData();
    if (!data || data.calorieGoal === 0) return 0;
    return Math.min(100, Math.round((data.calories / data.calorieGoal) * 100));
  });

  // Chart configuration for doughnut chart
  doughnutChartData = signal<ChartConfiguration<'doughnut'>['data']>({
    labels: [],
    datasets: [],
  });

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}g`;
          },
        },
      },
    },
  };

  constructor() {
    // Effect to update chart when nutrient data changes
    effect(() => {
      const data = this.nutrientData();

      if (data) {
        this.doughnutChartData.set({
          labels: ['Proteínas', 'Carbohidratos', 'Grasas'],
          datasets: [
            {
              data: [data.protein, data.carbs, data.fat],
              backgroundColor: [
                '#FDB913', // Yellow for protein
                '#2C3E50', // Dark gray for carbs
                '#7F8C8D', // Light gray for fats
              ],
              borderWidth: 2,
              borderColor: '#FFFFFF',
            },
          ],
        });
      } else {
        this.doughnutChartData.set({ labels: [], datasets: [] });
      }
    });
  }
}
