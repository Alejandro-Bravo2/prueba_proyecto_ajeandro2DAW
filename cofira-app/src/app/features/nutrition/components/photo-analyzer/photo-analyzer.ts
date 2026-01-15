import { Component, signal, output, inject } from '@angular/core';
import { NutritionAIService, FoodAnalysis } from '../../services/nutrition-ai.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-photo-analyzer',
  standalone: true,
  imports: [],
  templateUrl: './photo-analyzer.html',
  styleUrl: './photo-analyzer.scss',
})
export class PhotoAnalyzer {
  private readonly aiService = inject(NutritionAIService);
  private readonly toastService = inject(ToastService);

  readonly isDragging = signal(false);
  readonly previewUrl = signal<string | null>(null);
  readonly isAnalyzing = signal(false);
  readonly analysis = signal<FoodAnalysis | null>(null);

  readonly foodAnalyzed = output<FoodAnalysis>();
  readonly foodConfirmed = output<FoodAnalysis>();

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.processFile(input.files[0]);
    }
  }

  private processFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.toastService.error('Por favor, selecciona una imagen válida');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
      this.analyzeImage(file);
    };
    reader.readAsDataURL(file);
  }

  private analyzeImage(file: File): void {
    this.isAnalyzing.set(true);
    this.analysis.set(null);

    this.aiService.analyzeFood(file).subscribe({
      next: (result) => {
        this.analysis.set(result.analysis);
        this.foodAnalyzed.emit(result.analysis);
        this.isAnalyzing.set(false);
      },
      error: (err) => {
        console.error('Error analyzing food:', err);
        this.toastService.error('Error al analizar la imagen');
        this.isAnalyzing.set(false);
      },
    });
  }

  confirmAnalysis(): void {
    const currentAnalysis = this.analysis();
    if (currentAnalysis) {
      this.foodConfirmed.emit(currentAnalysis);
      this.toastService.success('Comida añadida a tu diario');
      this.reset();
    }
  }

  reset(): void {
    this.previewUrl.set(null);
    this.analysis.set(null);
  }
}
