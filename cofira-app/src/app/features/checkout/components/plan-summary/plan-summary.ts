import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanInfo } from '../../models/checkout.model';

@Component({
  selector: 'app-plan-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plan-summary.html',
  styleUrl: './plan-summary.scss'
})
export class PlanSummary {
  @Input() planInfo: PlanInfo | null = null;
  @Output() continuar = new EventEmitter<void>();

  onContinuar(): void {
    this.continuar.emit();
  }
}
