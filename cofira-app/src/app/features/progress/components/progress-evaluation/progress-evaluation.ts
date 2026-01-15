import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressEvaluationStore } from '../../stores/progress-evaluation.store';

@Component({
  selector: 'app-progress-evaluation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-evaluation.html',
  styleUrl: './progress-evaluation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressEvaluation implements OnInit {
  readonly store = inject(ProgressEvaluationStore);

  readonly activeTab = signal<'training' | 'nutrition' | 'full'>('full');

  ngOnInit(): void {
    this.store.loadFullEvaluation();
  }

  setTab(tab: 'training' | 'nutrition' | 'full'): void {
    this.activeTab.set(tab);
    switch (tab) {
      case 'training':
        this.store.loadTrainingEvaluation();
        break;
      case 'nutrition':
        this.store.loadNutritionEvaluation();
        break;
      default:
        this.store.loadFullEvaluation();
    }
  }

  refresh(): void {
    this.store.refresh();
  }

  getTrendIcon(trend: string | null): string {
    switch (trend) {
      case 'MEJORANDO': return '↗';
      case 'ESTABLE': return '→';
      case 'RETROCEDIENDO': return '↘';
      case 'PLATEAU': return '⏸';
      default: return '?';
    }
  }

  getTrendText(trend: string | null): string {
    switch (trend) {
      case 'MEJORANDO': return 'Mejorando';
      case 'ESTABLE': return 'Estable';
      case 'RETROCEDIENDO': return 'Retrocediendo';
      case 'PLATEAU': return 'Plateau';
      default: return 'Sin datos';
    }
  }

  getTrendClass(trend: string | null): string {
    switch (trend) {
      case 'MEJORANDO': return 'trend--improving';
      case 'ESTABLE': return 'trend--stable';
      case 'RETROCEDIENDO': return 'trend--declining';
      case 'PLATEAU': return 'trend--plateau';
      default: return 'trend--unknown';
    }
  }

  getPatternText(pattern: string): string {
    switch (pattern) {
      case 'BAJO_CONSUMO_FRECUENTE': return 'Consumo bajo';
      case 'SOBRE_CONSUMO_FRECUENTE': return 'Consumo alto';
      case 'PROTEINAS_INSUFICIENTES': return 'Proteinas bajas';
      case 'HIDRATACION_BAJA': return 'Poca hidratacion';
      case 'SIN_DATOS_SUFICIENTES': return 'Datos insuficientes';
      default: return pattern;
    }
  }
}
