import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NutritionService, Meal, FoodItem } from '../../services/nutrition.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-add-meal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-meal-form.html',
  styleUrl: './add-meal-form.scss',
})
export class AddMealForm {
  private formBuilder = inject(FormBuilder);
  private nutritionService = inject(NutritionService);
  private toastService = inject(ToastService);

  // Output event when meal is added
  mealAdded = output<Meal>();

  // Signal for form visibility
  showForm = signal(false);
  isSubmitting = signal(false);

  mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  mealForm = this.formBuilder.group({
    mealType: ['breakfast', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    foods: this.formBuilder.array([this.createFoodItem()]),
  });

  get foods() {
    return this.mealForm.get('foods') as FormArray;
  }

  createFoodItem() {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      quantity: ['', Validators.required],
      calories: [0, [Validators.required, Validators.min(0)]],
      protein: [0, [Validators.required, Validators.min(0)]],
      carbs: [0, [Validators.required, Validators.min(0)]],
      fat: [0, [Validators.required, Validators.min(0)]],
      fiber: [0, [Validators.required, Validators.min(0)]],
      icon: ['🍽️'],
    });
  }

  addFood() {
    this.foods.push(this.createFoodItem());
  }

  removeFood(index: number) {
    if (this.foods.length > 1) {
      this.foods.removeAt(index);
    }
  }

  toggleForm() {
    this.showForm.update((value) => !value);
    if (!this.showForm()) {
      this.mealForm.reset({
        mealType: 'breakfast',
        date: new Date().toISOString().split('T')[0],
      });
      this.foods.clear();
      this.foods.push(this.createFoodItem());
    }
  }

  onSubmit() {
    if (this.mealForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      const userId = this.getUserId();
      if (!userId) {
        this.toastService.error('Usuario no autenticado');
        this.isSubmitting.set(false);
        return;
      }

      const formValue = this.mealForm.value;
      const foodsData = formValue.foods as FoodItem[];

      // Calculate totals
      const totalCalories = foodsData.reduce((sum, food) => sum + (food.calories || 0), 0);
      const totalProtein = foodsData.reduce((sum, food) => sum + (food.protein || 0), 0);
      const totalCarbs = foodsData.reduce((sum, food) => sum + (food.carbs || 0), 0);
      const totalFat = foodsData.reduce((sum, food) => sum + (food.fat || 0), 0);
      const totalFiber = foodsData.reduce((sum, food) => sum + (food.fiber || 0), 0);

      const mealData: Omit<Meal, 'id'> = {
        userId,
        date: formValue.date || new Date().toISOString().split('T')[0],
        mealType: formValue.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        foods: foodsData,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        totalFiber,
      };

      this.nutritionService.addMeal(mealData).subscribe({
        next: (meal) => {
          this.toastService.success('Comida agregada exitosamente');
          this.mealAdded.emit(meal);
          this.toggleForm();
          this.isSubmitting.set(false);
        },
        error: (err) => {
          console.error('Error adding meal:', err);
          this.toastService.error('Error al agregar la comida');
          this.isSubmitting.set(false);
        },
      });
    } else {
      this.mealForm.markAllAsTouched();
    }
  }

  private getUserId(): string | null {
    const user = localStorage.getItem('currentUser');
    if (user) {
      return JSON.parse(user).id;
    }
    return null;
  }
}
