import { Component, input, computed, inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ThemeService } from '../../../../core/services/theme.service';

export interface WeeklyData {
  day: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

@Component({
  selector: 'app-weekly-progress',
  standalone: true,
  imports: [BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './weekly-progress.html',
  styleUrl: './weekly-progress.scss',
})
export class WeeklyProgress {
  private readonly themeService = inject(ThemeService);

  readonly weeklyData = input.required<WeeklyData[]>();
  readonly calorieGoal = input<number>(2000);

  readonly activeTab = input<'calories' | 'protein' | 'carbs' | 'fat'>('calories');
  private activeTabSignal = this.activeTab;

  readonly Math = Math;

  readonly tabs = [
    { key: 'calories' as const, label: 'Calorías' },
    { key: 'protein' as const, label: 'Proteína' },
    { key: 'carbs' as const, label: 'Carbos' },
    { key: 'fat' as const, label: 'Grasas' },
  ];

  readonly currentUnit = computed(() => {
    return this.activeTab() === 'calories' ? 'kcal' : 'g';
  });

  readonly chartData = computed<ChartData<'bar'>>(() => {
    const data = this.weeklyData();
    const tab = this.activeTab();
    const isDark = this.themeService.currentTheme() === 'dark';

    const values = data.map(d => d[tab]);
    const colors = this.getColors(tab, isDark);

    return {
      labels: data.map(d => d.day),
      datasets: [{
        data: values,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }],
    };
  });

  readonly chartOptions = computed<ChartConfiguration<'bar'>['options']>(() => {
    const isDark = this.themeService.currentTheme() === 'dark';
    const textColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          titleColor: isDark ? '#ffffff' : '#000000',
          bodyColor: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor },
          border: { display: false },
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor },
          border: { display: false },
          beginAtZero: true,
        },
      },
      animation: {
        duration: 500,
        easing: 'easeOutQuart',
      },
    };
  });

  readonly averageValue = computed(() => {
    const data = this.weeklyData();
    const tab = this.activeTab();
    const sum = data.reduce((acc, d) => acc + d[tab], 0);
    return Math.round(sum / data.length);
  });

  readonly trend = computed(() => {
    const data = this.weeklyData();
    if (data.length < 2) return 0;

    const tab = this.activeTab();
    const midpoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midpoint).reduce((acc, d) => acc + d[tab], 0) / midpoint;
    const secondHalf = data.slice(midpoint).reduce((acc, d) => acc + d[tab], 0) / (data.length - midpoint);

    if (firstHalf === 0) return 0;
    return Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
  });

  setActiveTab(tab: 'calories' | 'protein' | 'carbs' | 'fat'): void {
    // In a real implementation, this would emit an output
    // For now, we just log it
    console.log('Tab changed to:', tab);
  }

  private getColors(tab: string, isDark: boolean): { bg: string; border: string } {
    const colors: Record<string, { light: { bg: string; border: string }; dark: { bg: string; border: string } }> = {
      calories: {
        light: { bg: 'rgba(0,0,0,0.1)', border: 'rgba(0,0,0,0.8)' },
        dark: { bg: 'rgba(255,255,255,0.15)', border: 'rgba(255,255,255,0.9)' },
      },
      protein: {
        light: { bg: 'rgba(37,99,235,0.2)', border: 'rgba(37,99,235,0.9)' },
        dark: { bg: 'rgba(96,165,250,0.25)', border: 'rgba(96,165,250,0.9)' },
      },
      carbs: {
        light: { bg: 'rgba(245,158,11,0.2)', border: 'rgba(245,158,11,0.9)' },
        dark: { bg: 'rgba(251,191,36,0.25)', border: 'rgba(251,191,36,0.9)' },
      },
      fat: {
        light: { bg: 'rgba(16,185,129,0.2)', border: 'rgba(16,185,129,0.9)' },
        dark: { bg: 'rgba(52,211,153,0.25)', border: 'rgba(52,211,153,0.9)' },
      },
    };

    return isDark ? colors[tab].dark : colors[tab].light;
  }
}
