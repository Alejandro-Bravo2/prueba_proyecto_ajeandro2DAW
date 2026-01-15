import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente que muestra un indicador visual de la fortaleza de una contraseña
 *
 * @example
 * ```html
 * <input type="password" formControlName="password" />
 * <app-password-strength
 *   [password]="registerForm.get('password')?.value || ''"
 * />
 * ```
 */
@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './password-strength.html',
  styleUrl: './password-strength.scss'
})
export class PasswordStrength {
  /**
   * La contraseña a evaluar
   */
  password = input<string>('');

  /**
   * Mostrar lista de requisitos
   */
  showRequirements = input<boolean>(true);

  /**
   * Fortaleza calculada de la contraseña (0-4)
   */
  strength = computed(() => this.calculateStrength(this.password()));

  /**
   * Etiqueta descriptiva de la fortaleza
   */
  strengthLabel = computed(() => {
    const labels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
    return labels[this.strength()];
  });

  /**
   * Clase CSS para el label basada en la fortaleza
   */
  labelClass = computed(() => {
    const classes = ['', 'weak', 'fair', 'good', 'strong'];
    return `c-password-strength__label--${classes[this.strength()]}`;
  });

  /**
   * Verifica si cumple el requisito de longitud mínima
   */
  hasMinLength = computed(() => this.password().length >= 12);

  /**
   * Verifica si tiene mayúsculas y minúsculas
   */
  hasUpperLower = computed(() => {
    const pwd = this.password();
    return /[a-z]/.test(pwd) && /[A-Z]/.test(pwd);
  });

  /**
   * Verifica si tiene al menos un número
   */
  hasNumber = computed(() => /\d/.test(this.password()));

  /**
   * Verifica si tiene al menos un símbolo especial
   */
  hasSpecialChar = computed(() => /[^a-zA-Z\d]/.test(this.password()));

  /**
   * Calcula la fortaleza de la contraseña
   * @param password - La contraseña a evaluar
   * @returns Nivel de fortaleza (0-4)
   */
  private calculateStrength(password: string): number {
    if (!password) return 0;

    let score = 0;

    // Longitud
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Complejidad de caracteres
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    // Convertir score (0-6) a nivel (0-4)
    // 0-1: 0 (ninguna)
    // 2-3: 1 (débil)
    // 4: 2 (regular)
    // 5: 3 (buena)
    // 6: 4 (fuerte)
    if (score <= 1) return 0;
    if (score <= 3) return 1;
    if (score === 4) return 2;
    if (score === 5) return 3;
    return 4;
  }
}
