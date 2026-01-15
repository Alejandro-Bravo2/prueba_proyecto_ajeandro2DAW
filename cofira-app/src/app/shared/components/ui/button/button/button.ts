import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primario' | 'secundario' | 'fantasma' | 'peligro';
type ButtonSize = 'pequeno' | 'mediano' | 'grande';
type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  @Input() variant: ButtonVariant = 'primario';
  @Input() size: ButtonSize = 'mediano';
  @Input() completo: boolean = false;
  @Input() disabled: boolean = false;
  @Input() type: ButtonType = 'button';

  @Output() clickEvent = new EventEmitter<Event>();

  onClick(event: Event): void {
    if (!this.disabled) {
      this.clickEvent.emit(event);
    }
  }

  get buttonClasses(): Record<string, boolean> {
    return {
      'boton--primario': this.variant === 'primario',
      'boton--secundario': this.variant === 'secundario',
      'boton--fantasma': this.variant === 'fantasma',
      'boton--peligro': this.variant === 'peligro',
      'boton--pequeno': this.size === 'pequeno',
      'boton--mediano': this.size === 'mediano',
      'boton--grande': this.size === 'grande',
      'boton--completo': this.completo,
    };
  }
}
