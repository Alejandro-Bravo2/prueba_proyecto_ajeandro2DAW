import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TrainingService, EjerciciosDTO } from '../../services/training.service';

/**
 * Componente de detalle de ejercicio
 * Muestra información detallada de un ejercicio específico usando parámetros de ruta
 *
 * @example
 * Ruta: /entrenamiento/:id
 * Uso: this.router.navigate(['/entrenamiento', exerciseId]);
 */
@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exercise-detail.html',
  styleUrl: './exercise-detail.scss',
})
export class ExerciseDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private trainingService = inject(TrainingService);

  // Estado reactivo
  exercise = signal<EjerciciosDTO | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  exerciseId = signal<number | null>(null);

  ngOnInit(): void {
    // Suscribirse a los cambios de parámetros para rutas dinámicas
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.exerciseId.set(Number(id));
        this.loadExercise(Number(id));
      } else {
        this.error.set('ID de ejercicio no proporcionado');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Carga los datos del ejercicio desde el servicio
   */
  private loadExercise(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.trainingService.obtenerEjercicio(id).subscribe({
      next: (exercise) => {
        this.exercise.set(exercise);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar ejercicio:', err);
        this.error.set('No se pudo cargar el ejercicio. Es posible que no exista.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Navega de vuelta a la lista de entrenamiento
   */
  goBack(): void {
    this.router.navigate(['/entrenamiento']);
  }

  /**
   * Navega al siguiente ejercicio
   */
  goToNextExercise(): void {
    const currentId = this.exerciseId();
    if (currentId) {
      this.router.navigate(['/entrenamiento', currentId + 1]);
    }
  }

  /**
   * Navega al ejercicio anterior
   */
  goToPreviousExercise(): void {
    const currentId = this.exerciseId();
    if (currentId && currentId > 1) {
      this.router.navigate(['/entrenamiento', currentId - 1]);
    }
  }

  /**
   * Obtiene el color según el grupo muscular
   */
  getMuscleGroupColor(group: string): string {
    const colors: Record<string, string> = {
      'Pecho': '#e74c3c',
      'Espalda': '#3498db',
      'Piernas': '#2ecc71',
      'Hombros': '#f39c12',
      'Brazos': '#9b59b6',
      'Core': '#1abc9c',
      'Cardio': '#e91e63'
    };
    return colors[group] || '#6c757d';
  }
}
