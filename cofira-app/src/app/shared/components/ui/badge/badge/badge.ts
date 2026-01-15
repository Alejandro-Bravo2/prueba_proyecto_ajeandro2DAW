import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeColor = 'red' | 'yellow' | 'blue' | 'green' | 'gray';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class Badge {
  @Input() label = '';
  @Input() color: BadgeColor = 'gray'; // Default color
  @Input() closable = false;

  @Output() closed = new EventEmitter<void>();

  onClose(): void {
    if (this.closable) {
      this.closed.emit();
    }
  }

  get badgeClasses(): Record<string, boolean> {
    return {
      [`badge--${this.color}`]: true,
    };
  }
}
