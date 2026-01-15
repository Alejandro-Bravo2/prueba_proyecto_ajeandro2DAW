import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CheckoutResponse, PlanInfo } from '../../models/checkout.model';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.scss'
})
export class PaymentSuccess {
  @Input() response: CheckoutResponse | null = null;
  @Input() planInfo: PlanInfo | null = null;
  @Output() irAlDashboard = new EventEmitter<void>();

  onIrAlDashboard(): void {
    this.irAlDashboard.emit();
  }
}
