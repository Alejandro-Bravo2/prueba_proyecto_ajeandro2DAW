import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, OnboardingRequest } from '../../../core/auth/auth.service';

interface OnboardingOption {
  value: string | number | boolean;
  label: string;
  description?: string;
  icon?: string;
}

interface OnboardingStep {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'slider' | 'date' | 'textarea' | 'number';
  options?: OnboardingOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
  required: boolean;
  condition?: (data: Record<string, unknown>) => boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  // === DATOS PERSONALES ===
  {
    id: 'gender',
    question: '¿Cuál es tu género?',
    type: 'single',
    required: true,
    options: [
      { value: 'MALE', label: 'Masculino', icon: '♂️' },
      { value: 'FEMALE', label: 'Femenino', icon: '♀️' },
      { value: 'OTHER', label: 'Otro / Prefiero no decir', icon: '⚧️' }
    ]
  },
  {
    id: 'birthDate',
    question: '¿Cuál es tu fecha de nacimiento?',
    type: 'date',
    required: true
  },
  {
    id: 'heightCm',
    question: '¿Cuál es tu altura?',
    type: 'slider',
    min: 140,
    max: 220,
    unit: 'cm',
    required: true
  },
  {
    id: 'currentWeightKg',
    question: '¿Cuál es tu peso actual?',
    type: 'slider',
    min: 40,
    max: 180,
    unit: 'kg',
    required: true
  },

  // === OBJETIVO ===
  {
    id: 'primaryGoal',
    question: '¿Cuál es tu objetivo principal?',
    type: 'single',
    required: true,
    options: [
      { value: 'LOSE_WEIGHT', label: 'Perder peso', description: 'Reducir grasa corporal', icon: '⚖️' },
      { value: 'GAIN_MUSCLE', label: 'Ganar músculo', description: 'Aumentar masa muscular', icon: '💪' },
      { value: 'MAINTAIN', label: 'Mantenerme', description: 'Conservar mi forma actual', icon: '🎯' },
      { value: 'IMPROVE_HEALTH', label: 'Mejorar salud', description: 'Bienestar general', icon: '❤️' }
    ]
  },
  {
    id: 'targetWeightKg',
    question: '¿Cuál es tu peso objetivo?',
    type: 'slider',
    min: 40,
    max: 180,
    unit: 'kg',
    required: false,
    condition: (data) => data['primaryGoal'] !== 'MAINTAIN'
  },

  // === ESTILO DE VIDA ===
  {
    id: 'activityLevel',
    question: '¿Cuál es tu nivel de actividad diaria?',
    type: 'single',
    required: true,
    options: [
      { value: 'SEDENTARY', label: 'Sedentario', description: 'Poco o ningún ejercicio, trabajo de oficina' },
      { value: 'LIGHTLY_ACTIVE', label: 'Ligeramente activo', description: 'Ejercicio ligero 1-3 días/semana' },
      { value: 'MODERATELY_ACTIVE', label: 'Moderadamente activo', description: 'Ejercicio moderado 3-5 días/semana' },
      { value: 'VERY_ACTIVE', label: 'Muy activo', description: 'Ejercicio intenso 6-7 días/semana' },
      { value: 'EXTRA_ACTIVE', label: 'Extremadamente activo', description: 'Atleta profesional o trabajo muy físico' }
    ]
  },
  {
    id: 'workType',
    question: '¿Qué tipo de trabajo realizas?',
    type: 'single',
    required: true,
    options: [
      { value: 'OFFICE_DESK', label: 'Oficina / Escritorio', description: 'Trabajo sentado la mayor parte del día', icon: '💻' },
      { value: 'STANDING', label: 'De pie', description: 'Trabajo de pie pero sin esfuerzo físico intenso', icon: '🧍' },
      { value: 'PHYSICAL_LABOR', label: 'Trabajo físico', description: 'Trabajo manual o que requiere esfuerzo físico', icon: '🔨' }
    ]
  },
  {
    id: 'sleepHoursAverage',
    question: '¿Cuántas horas duermes en promedio?',
    type: 'slider',
    min: 4,
    max: 12,
    step: 0.5,
    unit: 'horas',
    required: false
  },

  // === ENTRENAMIENTO ===
  {
    id: 'fitnessLevel',
    question: '¿Cuál es tu nivel de experiencia en fitness?',
    type: 'single',
    required: true,
    options: [
      { value: 'BEGINNER', label: 'Principiante', description: 'Menos de 6 meses entrenando', icon: '🌱' },
      { value: 'INTERMEDIATE', label: 'Intermedio', description: '6 meses - 2 años', icon: '🌿' },
      { value: 'ADVANCED', label: 'Avanzado', description: 'Más de 2 años', icon: '🌳' }
    ]
  },
  {
    id: 'trainingDaysPerWeek',
    question: '¿Cuántos días puedes entrenar a la semana?',
    type: 'single',
    required: true,
    options: [
      { value: 2, label: '2 días', description: 'Entrenamiento mínimo' },
      { value: 3, label: '3 días', description: 'Equilibrio ideal' },
      { value: 4, label: '4 días', description: 'Progreso constante' },
      { value: 5, label: '5 días', description: 'Alto compromiso' },
      { value: 6, label: '6 días', description: 'Máxima dedicación' }
    ]
  },
  {
    id: 'sessionDurationMinutes',
    question: '¿Cuánto tiempo puedes dedicar por sesión?',
    type: 'single',
    required: false,
    options: [
      { value: 30, label: '30 minutos', description: 'Entrenamientos express' },
      { value: 45, label: '45 minutos', description: 'Sesiones equilibradas' },
      { value: 60, label: '1 hora', description: 'Entrenamientos completos' },
      { value: 90, label: '1.5 horas', description: 'Sesiones extensas' }
    ]
  },
  {
    id: 'preferredTrainingTime',
    question: '¿Cuándo prefieres entrenar?',
    type: 'single',
    required: false,
    options: [
      { value: 'MORNING', label: 'Mañana', description: 'Entre 6:00 y 12:00', icon: '🌅' },
      { value: 'AFTERNOON', label: 'Tarde', description: 'Entre 12:00 y 18:00', icon: '☀️' },
      { value: 'EVENING', label: 'Noche', description: 'Entre 18:00 y 22:00', icon: '🌙' },
      { value: 'FLEXIBLE', label: 'Flexible', description: 'Cualquier momento', icon: '🔄' }
    ]
  },
  {
    id: 'equipment',
    question: '¿Dónde vas a entrenar principalmente?',
    type: 'multiple',
    required: true,
    options: [
      { value: 'GYM', label: 'Gimnasio completo', description: 'Acceso a todo el equipo', icon: '🏋️' },
      { value: 'HOME', label: 'Casa con equipo', description: 'Mancuernas, bandas, etc.', icon: '🏠' },
      { value: 'MINIMAL', label: 'Solo peso corporal', description: 'Sin equipamiento', icon: '🤸' }
    ]
  },
  {
    id: 'injuries',
    question: '¿Tienes alguna lesión o limitación física?',
    type: 'multiple',
    required: false,
    options: [
      { value: 'NONE', label: 'Ninguna', description: 'Sin limitaciones' },
      { value: 'BACK', label: 'Espalda', description: 'Dolor lumbar o dorsal' },
      { value: 'KNEE', label: 'Rodillas', description: 'Problemas articulares' },
      { value: 'SHOULDER', label: 'Hombros', description: 'Lesiones de hombro' },
      { value: 'WRIST', label: 'Muñecas', description: 'Dolor en muñecas' },
      { value: 'ANKLE', label: 'Tobillos', description: 'Esguinces recurrentes' }
    ]
  },

  // === NUTRICIÓN ===
  {
    id: 'dietType',
    question: '¿Cuál es tu tipo de alimentación?',
    type: 'single',
    required: true,
    options: [
      { value: 'OMNIVORE', label: 'Omnívoro', description: 'Como de todo' },
      { value: 'VEGETARIAN', label: 'Vegetariano', description: 'Sin carne ni pescado' },
      { value: 'VEGAN', label: 'Vegano', description: 'Solo alimentos vegetales' },
      { value: 'PESCATARIAN', label: 'Pescetariano', description: 'Vegetariano + pescado' },
      { value: 'KETO', label: 'Keto', description: 'Bajo en carbohidratos' },
      { value: 'MEDITERRANEAN', label: 'Mediterránea', description: 'Dieta equilibrada' }
    ]
  },
  {
    id: 'mealsPerDay',
    question: '¿Cuántas comidas prefieres hacer al día?',
    type: 'single',
    required: false,
    options: [
      { value: 2, label: '2 comidas', description: 'Ayuno intermitente' },
      { value: 3, label: '3 comidas', description: 'Desayuno, almuerzo, cena' },
      { value: 4, label: '4 comidas', description: 'Incluye merienda' },
      { value: 5, label: '5 comidas', description: 'Comidas más pequeñas y frecuentes' }
    ]
  },
  {
    id: 'allergies',
    question: '¿Tienes alguna alergia o intolerancia alimentaria?',
    type: 'multiple',
    required: false,
    options: [
      { value: 'NONE', label: 'Ninguna', description: 'No tengo alergias' },
      { value: 'GLUTEN', label: 'Gluten', description: 'Celiaquía o sensibilidad' },
      { value: 'LACTOSE', label: 'Lactosa', description: 'Intolerancia a lácteos' },
      { value: 'NUTS', label: 'Frutos secos', description: 'Nueces, almendras, etc.' },
      { value: 'SHELLFISH', label: 'Mariscos', description: 'Crustáceos y moluscos' },
      { value: 'EGGS', label: 'Huevos', description: 'Alergia al huevo' },
      { value: 'SOY', label: 'Soja', description: 'Alergia a la soja' },
      { value: 'FISH', label: 'Pescado', description: 'Alergia al pescado' }
    ]
  },

  // === HISTORIAL MÉDICO ===
  {
    id: 'medicalConditions',
    question: '¿Tienes alguna condición médica diagnosticada?',
    type: 'multiple',
    required: false,
    options: [
      { value: 'NONE', label: 'Ninguna', description: 'Sin condiciones médicas relevantes' },
      { value: 'DIABETES_TYPE1', label: 'Diabetes Tipo 1', description: 'Diabetes insulinodependiente' },
      { value: 'DIABETES_TYPE2', label: 'Diabetes Tipo 2', description: 'Diabetes no insulinodependiente' },
      { value: 'HYPERTENSION', label: 'Hipertensión', description: 'Presión arterial alta' },
      { value: 'HEART_DISEASE', label: 'Enfermedad cardíaca', description: 'Problemas del corazón' },
      { value: 'HYPOTHYROIDISM', label: 'Hipotiroidismo', description: 'Tiroides hipoactiva' },
      { value: 'HYPERTHYROIDISM', label: 'Hipertiroidismo', description: 'Tiroides hiperactiva' },
      { value: 'PCOS', label: 'SOP', description: 'Síndrome de ovario poliquístico' },
      { value: 'INSULIN_RESISTANCE', label: 'Resistencia a insulina', description: 'Prediabetes o resistencia a insulina' }
    ]
  },
  {
    id: 'medications',
    question: '¿Tomas algún medicamento actualmente?',
    type: 'textarea',
    placeholder: 'Escribe los medicamentos que tomas regularmente (opcional)',
    required: false
  },
  {
    id: 'previousSurgeries',
    question: '¿Has tenido alguna cirugía relevante?',
    type: 'multiple',
    required: false,
    options: [
      { value: 'NONE', label: 'Ninguna', description: 'Sin cirugías relevantes' },
      { value: 'BARIATRIC', label: 'Bariátrica', description: 'Cirugía de reducción de estómago' },
      { value: 'KNEE', label: 'Rodilla', description: 'Cirugía de rodilla' },
      { value: 'HIP', label: 'Cadera', description: 'Cirugía de cadera' },
      { value: 'BACK', label: 'Espalda', description: 'Cirugía de columna' },
      { value: 'SHOULDER', label: 'Hombro', description: 'Cirugía de hombro' },
      { value: 'HEART', label: 'Cardíaca', description: 'Cirugía del corazón' },
      { value: 'OTHER', label: 'Otra', description: 'Otra cirugía relevante' }
    ]
  },

  // === ESTADO REPRODUCTIVO (solo mujeres) ===
  {
    id: 'reproductiveStatus',
    question: '¿Estás embarazada o en periodo de lactancia?',
    type: 'single',
    required: true,
    condition: (data) => data['gender'] === 'FEMALE',
    options: [
      { value: 'NONE', label: 'No', description: 'Ninguna de las anteriores' },
      { value: 'PREGNANT', label: 'Embarazada', description: 'Actualmente embarazada' },
      { value: 'BREASTFEEDING', label: 'Lactancia', description: 'Actualmente en periodo de lactancia' }
    ]
  }
];

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss'
})
export class OnboardingComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  // State
  currentStepIndex = signal(0);
  formData = signal<Record<string, unknown>>({
    heightCm: 170,
    currentWeightKg: 70,
    targetWeightKg: 70,
    sleepHoursAverage: 7,
    mealsPerDay: 3
  });
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  // Max birth date (must be at least 16 years old)
  maxBirthDate = new Date(new Date().setFullYear(new Date().getFullYear() - 16))
    .toISOString()
    .split('T')[0];

  // Computed
  steps = computed(() => {
    const data = this.formData();
    return ONBOARDING_STEPS.filter(step => {
      if (!step.condition) return true;
      return step.condition(data);
    });
  });

  currentStep = computed(() => this.steps()[this.currentStepIndex()]);
  totalSteps = computed(() => this.steps().length);
  progress = computed(() => ((this.currentStepIndex() + 1) / this.totalSteps()) * 100);

  isFirstStep = computed(() => this.currentStepIndex() === 0);
  isLastStep = computed(() => this.currentStepIndex() === this.totalSteps() - 1);

  canProceed = computed(() => {
    const step = this.currentStep();
    const data = this.formData();

    if (!step.required) return true;

    const value = data[step.id];
    if (step.type === 'multiple') {
      return Array.isArray(value) && value.length > 0;
    }
    return value !== undefined && value !== null && value !== '';
  });

  // Methods
  selectOption(stepId: string, value: unknown, isMultiple: boolean) {
    const current = this.formData();

    if (isMultiple) {
      const currentValues = (current[stepId] as unknown[]) || [];

      // Handle "NONE" selection
      if (value === 'NONE') {
        this.formData.set({ ...current, [stepId]: ['NONE'] });
        return;
      }

      // Remove "NONE" if selecting other options
      const filteredValues = currentValues.filter(v => v !== 'NONE');

      if (filteredValues.includes(value)) {
        this.formData.set({
          ...current,
          [stepId]: filteredValues.filter(v => v !== value)
        });
      } else {
        this.formData.set({
          ...current,
          [stepId]: [...filteredValues, value]
        });
      }
    } else {
      this.formData.set({ ...current, [stepId]: value });
    }
  }

  isSelected(stepId: string, value: unknown): boolean {
    const data = this.formData();
    const stepData = data[stepId];

    if (Array.isArray(stepData)) {
      return stepData.includes(value);
    }
    return stepData === value;
  }

  updateSliderValue(stepId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    this.formData.set({ ...this.formData(), [stepId]: value });
  }

  updateTextValue(stepId: string, event: Event) {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.formData.set({ ...this.formData(), [stepId]: input.value });
  }

  updateDateValue(stepId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.set({ ...this.formData(), [stepId]: input.value });
  }

  nextStep() {
    if (!this.canProceed()) return;

    if (this.isLastStep()) {
      this.submit();
    } else {
      this.currentStepIndex.update(i => i + 1);
    }
  }

  previousStep() {
    if (!this.isFirstStep()) {
      this.currentStepIndex.update(i => i - 1);
    }
  }

  async submit() {
    this.isSubmitting.set(true);
    this.error.set(null);

    try {
      const data = this.formData();

      // Parse reproductive status
      const reproductiveStatus = data['reproductiveStatus'] as string;
      const isPregnant = reproductiveStatus === 'PREGNANT';
      const isBreastfeeding = reproductiveStatus === 'BREASTFEEDING';

      // Build payload matching OnboardingRequest interface
      const payload: OnboardingRequest = {
        gender: data['gender'] as 'MALE' | 'FEMALE' | 'OTHER',
        birthDate: data['birthDate'] as string,
        heightCm: data['heightCm'] as number,
        currentWeightKg: data['currentWeightKg'] as number,
        targetWeightKg: (data['targetWeightKg'] || data['currentWeightKg']) as number,
        activityLevel: data['activityLevel'] as OnboardingRequest['activityLevel'],
        workType: data['workType'] as OnboardingRequest['workType'],
        sleepHoursAverage: data['sleepHoursAverage'] as number,
        primaryGoal: data['primaryGoal'] as OnboardingRequest['primaryGoal'],
        fitnessLevel: data['fitnessLevel'] as string,
        trainingDaysPerWeek: data['trainingDaysPerWeek'] as number,
        sessionDurationMinutes: data['sessionDurationMinutes'] as number,
        preferredTrainingTime: data['preferredTrainingTime'] as string,
        dietType: data['dietType'] as string,
        mealsPerDay: (data['mealsPerDay'] as number) || 3,
        allergies: this.normalizeArray(data['allergies']),
        injuries: this.normalizeArray(data['injuries']),
        equipment: this.normalizeArray(data['equipment']),
        medicalConditions: this.normalizeArray(data['medicalConditions']),
        medications: (data['medications'] as string) || undefined,
        previousSurgeries: this.normalizeArray(data['previousSurgeries']),
        isPregnant: isPregnant,
        isBreastfeeding: isBreastfeeding
      };

      await this.authService.completeOnboarding(payload);
      this.router.navigate(['/']);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Error al guardar los datos');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private normalizeArray(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.filter(v => v !== 'NONE').map(v => String(v));
    }
    return [];
  }
}
