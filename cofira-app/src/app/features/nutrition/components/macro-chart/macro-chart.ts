import { Component, input, computed, effect, inject } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ThemeService } from '../../../../core/services/theme.service';

export interface MacroData {
  current: number;
  goal: number;
  unit: string;
}

@Component({
  selector: 'app-macro-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './macro-chart.html',
  styleUrl: './macro-chart.scss',
})
export class MacroChart {
  private readonly themeService = inject(ThemeService);

  readonly label = input.required<string>();
  readonly data = input.required<MacroData>();
  readonly color = input<string>('#000000');

  readonly percentage = computed(() => {
    const d = this.data();
    return Math.min((d.current / d.goal) * 100, 100);
  });

  readonly displayValue = computed(() => {
    return Math.round(this.percentage());
  });

  readonly chartData = computed<ChartData<'doughnut'>>(() => {
    const d = this.data();
    const remaining = Math.max(d.goal - d.current, 0);
    const isDark = this.themeService.currentTheme() === 'dark';

    return {
      datasets: [{
        data: [d.current, remaining],
        backgroundColor: [
          this.color(),
          isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        ],
        borderWidth: 0,
        borderRadius: 20,
        spacing: 2,
      }],
    };
  });

  readonly chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
  };

  // Accessibility
  readonly ariaLabel = computed(() => {
    const d = this.data();
    return `${this.label()}: ${d.current} de ${d.goal} ${d.unit}, ${this.displayValue()}% completado`;
  });

  // Dynamic gradient based on color
  readonly barGradient = computed(() => {
    const baseColor = this.color();
    return `linear-gradient(90deg, ${baseColor} 0%, ${this.lightenColor(baseColor, 20)} 100%)`;
  });

  constructor() {
    // React to theme changes
    effect(() => {
      this.themeService.currentTheme();
      // Trigger chart update
    });
  }

  private lightenColor(color: string, percent: number): string {
    // Simple color lightening for gradient
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }
}
