import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService, RegisterWithOnboardingRequest } from '../../../core/auth/auth.service';
import { AsyncValidatorsService } from '../../../shared/validators/async-validators.service';
import { passwordStrengthValidator } from '../../../shared/validators/password-strength.validator';
import { passwordMatchValidator } from '../../../shared/validators/cross-field.validators';
import { PasswordStrength } from '../../../shared/components/ui/password-strength/password-strength';
import { LoadingService } from '../../../core/services/loading.service';
import { ToastService } from '../../../core/services/toast.service';

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
    question: 'Cual es tu genero?',
    type: 'single',
    required: true,
    options: [
      { value: 'MALE', label: 'Masculino', icon: '' },
      { value: 'FEMALE', label: 'Femenino', icon: '' },
      { value: 'OTHER', label: 'Otro / Prefiero no decir', icon: '' }
    ]
  },
  {
    id: 'birthDate',
    question: 'Cual es tu fecha de nacimiento?',
    type: 'date',
    required: true
  },
  {
    id: 'heightCm',
    question: 'Cual es tu altura?',
    type: 'slider',
    min: 140,
    max: 220,
    unit: 'cm',
    required: true
  },
  {
    id: 'currentWeightKg',
    question: 'Cual es tu peso actual?',
    type: 'slider',
    min: 40,
    max: 180,
    unit: 'kg',
    required: true
  },

  // === OBJETIVO ===
  {
    id: 'primaryGoal',
    question: 'Cual es tu objetivo principal?',
    type: 'single',
    required: true,
    options: [
      { value: 'LOSE_WEIGHT', label: 'Perder peso', description: 'Reducir grasa corporal', icon: '' },
      { value: 'GAIN_MUSCLE', label: 'Ganar musculo', description: 'Aumentar masa muscular', icon: '' },
      { value: 'MAINTAIN', label: 'Mantenerme', description: 'Conservar mi forma actual', icon: '' },
      { value: 'IMPROVE_HEALTH', label: 'Mejorar salud', description: 'Bienestar general', icon: '' }
    ]
  },
  {
    id: 'targetWeightKg',
    question: 'Cual es tu peso objetivo?',
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
    question: 'Cual es tu nivel de actividad diaria?',
    type: 'single',
    required: true,
    options: [
      { value: 'SEDENTARY', label: 'Sedentario', description: 'Poco o ningun ejercicio, trabajo de oficina' },
      { value: 'LIGHTLY_ACTIVE', label: 'Ligeramente activo', description: 'Ejercicio ligero 1-3 dias/semana' },
      { value: 'MODERATELY_ACTIVE', label: 'Moderadamente activo', description: 'Ejercicio moderado 3-5 dias/semana' },
      { value: 'VERY_ACTIVE', label: 'Muy activo', description: 'Ejercicio intenso 6-7 dias/semana' },
      { value: 'EXTRA_ACTIVE', label: 'Extremadamente activo', description: 'Atleta profesional o trabajo muy fisico' }
    ]
  },
  {
    id: 'workType',
    question: 'Que tipo de trabajo realizas?',
    type: 'single',
    required: true,
    options: [
      { value: 'OFFICE_DESK', label: 'Oficina / Escritorio', description: 'Trabajo sentado la mayor parte del dia', icon: '' },
      { value: 'STANDING', label: 'De pie', description: 'Trabajo de pie pero sin esfuerzo fisico intenso', icon: '' },
      { value: 'PHYSICAL_LABOR', label: 'Trabajo fisico', description: 'Trabajo manual o que requiere esfuerzo fisico', icon: '' }
    ]
  },
  {
    id: 'sleepHoursAverage',
    question: 'Cuantas horas duermes en promedio?',
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
    question: 'Cual es tu nivel de experiencia en fitness?',
    type: 'single',
    required: true,
    options: [
      { value: 'BEGINNER', label: 'Principiante', description: 'Menos de 6 meses entrenando', icon: '' },
      { value: 'INTERMEDIATE', label: 'Intermedio', description: '6 meses - 2 anos', icon: '' },
      { value: 'ADVANCED', label: 'Avanzado', description: 'Mas de 2 anos', icon: '' }
    ]
  },
  {
    id: 'trainingDaysPerWeek',
    question: 'Cuantos dias puedes entrenar a la semana?',
    type: 'single',
    required: true,
    options: [
      { value: 2, label: '2 dias', description: 'Entrenamiento minimo' },
      { value: 3, label: '3 dias', description: 'Equilibrio ideal' },
      { value: 4, label: '4 dias', description: 'Progreso constante' },
      { value: 5, label: '5 dias', description: 'Alto compromiso' },
      { value: 6, label: '6 dias', description: 'Maxima dedicacion' }
    ]
  },
  {
    id: 'sessionDurationMinutes',
    question: 'Cuanto tiempo puedes dedicar por sesion?',
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
    question: 'Cuando prefieres entrenar?',
    type: 'single',
    required: false,
    options: [
      { value: 'MORNING', label: 'Manana', description: 'Entre 6:00 y 12:00', icon: '' },
      { value: 'AFTERNOON', label: 'Tarde', description: 'Entre 12:00 y 18:00', icon: '' },
      { value: 'EVENING', label: 'Noche', description: 'Entre 18:00 y 22:00', icon: '' },
      { value: 'FLEXIBLE', label: 'Flexible', description: 'Cualquier momento', icon: '' }
    ]
  },
  {
    id: 'equipment',
    question: 'Donde vas a entrenar principalmente?',
    type: 'multiple',
    required: true,
    options: [
      { value: 'GYM', label: 'Gimnasio completo', description: 'Acceso a todo el equipo', icon: '' },
      { value: 'HOME', label: 'Casa con equipo', description: 'Mancuernas, bandas, etc.', icon: '' },
      { value: 'MINIMAL', label: 'Solo peso corporal', description: 'Sin equipamiento', icon: '' }
    ]
  },
  {
    id: 'injuries',
    question: 'Tienes alguna lesion o limitacion fisica?',
    type: 'multiple',
    required: false,
    options: [
      { value: 'NONE', label: 'Ninguna', description: 'Sin limitaciones' },
      { value: 'BACK', label: 'Espalda', description: 'Dolor lumbar o dorsal' },
      { value: 'KNEE', label: 'Rodillas', description: 'Problemas articulares' },
      { value: 'SHOULDER', label: 'Hombros', description: 'Lesiones de hombro' },
      { value: 'WRIST', label: 'Munecas', description: 'Dolor en munecas' },
      { value: 'ANKLE', label: 'Tobillos', description: 'Esguinces recurrentes' }
    ]
  },

  // === NUTRICION ===
  {
    id: 'dietType',
    question: 'Cual es tu tipo de alimentacion?',
    type: 'single',
    required: true,
    options: [
      { value: 'OMNIVORE', label: 'Omnivoro', description: 'Como de todo' },
      { value: 'VEGETARIAN', label: 'Vegetariano', description: 'Sin carne ni pescado' },
      { value: 'VEGAN', label: 'Vegano', description: 'Solo alimentos vegetales' },
      { value: 'PESCATARIAN', label: 'Pescetariano', description: 'Vegetariano + pescado' },
      { value: 'KETO', label: 'Keto', description: 'Bajo en carbohidratos' },
      { value: 'MEDITERRANEAN', label: 'Mediterranea', description: 'Dieta equilibrada' }
    ]
  },
  {
    id: 'mealsPerDay',
    question: 'Cuantas comidas prefieres hacer al dia?',
    type: 'single',
    required: false,
    options: [
      { value: 2, label: '2 comidas', description: 'Ayuno intermitente' },
      { value: 3, label: '3 comidas', description: 'Desayuno, almuerzo, cena' },
      { value: 4, label: '4 comidas', description: 'Incluye merienda' },
      { value: 5, label: '5 comidas', description: 'Comidas mas pequenas y frecuentes' }
    ]
  },
  {
    id: 'allergies',
    question: 'Tienes alguna alergia o intolerancia alimentaria?',
    type: 'multiple',
    required: false,
    options: [
      { value: 'NONE', label: 'Ninguna', description: 'No tengo alergias' },
      { value: 'GLUTEN', label: 'Gluten', description: 'Celiaquia o sensibilidad' },
      { value: 'LACTOSE', label: 'Lactosa', description: 'Intolerancia a lacteos' },
      { value: 'NUTS', label: 'Frutos secos', description: 'Nueces, almendras, etc.' },
      { value: 'SHELLFISH', label: 'Mariscos', description: 'Crustaceos y moluscos' },
      { value: 'EGGS', label: 'Huevos', description: 'Alergia al huevo' },
      { value: 'SOY', label: 'Soja', description: 'Alergia a la soja' },
      { value: 'FISH', label: 'Pescado', description: 'Alergia al pescado' }
    ]
  },

  // === HISTORIAL MEDICO ===
  {
    id: 'medicalConditions',
    question: 'Tienes alguna condicion medica diagnosticada?',
    type: 'multiple',
    required: false,
    options: [
      { value: 'NONE', label: 'Ninguna', description: 'Sin condiciones medicas relevantes' },
      { value: 'DIABETES_TYPE1', label: 'Diabetes Tipo 1', description: 'Diabetes insulinodependiente' },
      { value: 'DIABETES_TYPE2', label: 'Diabetes Tipo 2', description: 'Diabetes no insulinodependiente' },
      { value: 'HYPERTENSION', label: 'Hipertension', description: 'Presion arterial alta' },
      { value: 'HEART_DISEASE', label: 'Enfermedad cardiaca', description: 'Problemas del corazon' },
      { value: 'HYPOTHYROIDISM', label: 'Hipotiroidismo', description: 'Tiroides hipoactiva' },
      { value: 'HYPERTHYROIDISM', label: 'Hipertiroidismo', description: 'Tiroides hiperactiva' },
      { value: 'PCOS', label: 'SOP', description: 'Sindrome de ovario poliquistico' },
      { value: 'INSULIN_RESISTANCE', label: 'Resistencia a insulina', description: 'Prediabetes o resistencia a insulina' }
    ]
  },
  {
    id: 'medications',
    question: 'Tomas algun medicamento actualmente?',
    type: 'textarea',
    placeholder: 'Escribe los medicamentos que tomas regularmente (opcional)',
    required: false
  },
  {
    id: 'previousSurgeries',
    question: 'Has tenido alguna cirugia relevante?',
    type: 'multiple',
    required: false,
    options: [
      { value: 'NONE', label: 'Ninguna', description: 'Sin cirugias relevantes' },
      { value: 'BARIATRIC', label: 'Bariatrica', description: 'Cirugia de reduccion de estomago' },
      { value: 'KNEE', label: 'Rodilla', description: 'Cirugia de rodilla' },
      { value: 'HIP', label: 'Cadera', description: 'Cirugia de cadera' },
      { value: 'BACK', label: 'Espalda', description: 'Cirugia de columna' },
      { value: 'SHOULDER', label: 'Hombro', description: 'Cirugia de hombro' },
      { value: 'HEART', label: 'Cardiaca', description: 'Cirugia del corazon' },
      { value: 'OTHER', label: 'Otra', description: 'Otra cirugia relevante' }
    ]
  },

  // === ESTADO REPRODUCTIVO (solo mujeres) ===
  {
    id: 'reproductiveStatus',
    question: 'Estas embarazada o en periodo de lactancia?',
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
  selector: 'app-signup-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PasswordStrength, RouterLink],
  templateUrl: './signup-wizard.html',
  styleUrl: './signup-wizard.scss'
})
export class SignupWizard {
  private router = inject(Router);
  private authService = inject(AuthService);
  private asyncValidators = inject(AsyncValidatorsService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

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

  // Signal to track form validity (needed for computed to react to form changes)
  registerFormValid = signal(false);
  registerFormPending = signal(false);

  // Registration form (last step)
  registerForm: FormGroup;

  constructor() {
    this.registerForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      username: new FormControl('',
        [Validators.required, Validators.minLength(3)],
        [this.asyncValidators.usernameUnique()]
      ),
      email: new FormControl('',
        [Validators.required, Validators.email],
        [this.asyncValidators.emailUnique()]
      ),
      password: new FormControl('', [Validators.required, passwordStrengthValidator()]),
      confirmPassword: new FormControl('', [Validators.required]),
      acceptTerms: new FormControl(false, [Validators.requiredTrue]),
    }, { validators: passwordMatchValidator('password', 'confirmPassword') });

    // Subscribe to form status changes to update signals
    this.registerForm.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.registerFormValid.set(this.registerForm.valid);
        this.registerFormPending.set(this.registerForm.pending);
      });
  }

  // Max birth date (must be at least 16 years old)
  maxBirthDate = new Date(new Date().setFullYear(new Date().getFullYear() - 16))
    .toISOString()
    .split('T')[0];

  // Computed - filter steps based on conditions
  onboardingSteps = computed(() => {
    const data = this.formData();
    return ONBOARDING_STEPS.filter(step => {
      if (!step.condition) return true;
      return step.condition(data);
    });
  });

  // Total steps = onboarding steps + 1 (registration)
  totalSteps = computed(() => this.onboardingSteps().length + 1);

  // Current onboarding step (or null if on registration step)
  currentOnboardingStep = computed(() => {
    const idx = this.currentStepIndex();
    const steps = this.onboardingSteps();
    return idx < steps.length ? steps[idx] : null;
  });

  // Is this the registration step?
  isRegistrationStep = computed(() => {
    return this.currentStepIndex() >= this.onboardingSteps().length;
  });

  progress = computed(() => ((this.currentStepIndex() + 1) / this.totalSteps()) * 100);
  isFirstStep = computed(() => this.currentStepIndex() === 0);
  isLastStep = computed(() => this.currentStepIndex() === this.totalSteps() - 1);

  // Can proceed to next step?
  canProceed = computed(() => {
    if (this.isRegistrationStep()) {
      // Use signals to track form state so computed reacts to changes
      return this.registerFormValid() && !this.registerFormPending();
    }

    const step = this.currentOnboardingStep();
    if (!step) return true;

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
    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);
    this.loadingService.show();

    try {
      const onboardingData = this.formData();
      const registerData = this.registerForm.value;

      // Build combined payload
      const payload = this.buildPayload(onboardingData, registerData);

      await this.authService.registerWithOnboarding(payload);

      this.loadingService.hide();
      this.toastService.success('Registro completado. Bienvenido a COFIRA!');
      this.router.navigate(['/']);
    } catch (err: unknown) {
      this.loadingService.hide();
      const errorMessage = err instanceof Error ? err.message : 'Error al completar el registro';
      this.error.set(errorMessage);
      this.toastService.error('Error en el registro. Intentalo de nuevo.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private buildPayload(onboardingData: Record<string, unknown>, registerData: Record<string, string>): RegisterWithOnboardingRequest {
    // Parse reproductive status
    const reproductiveStatus = onboardingData['reproductiveStatus'] as string;
    const isPregnant = reproductiveStatus === 'PREGNANT';
    const isBreastfeeding = reproductiveStatus === 'BREASTFEEDING';

    return {
      // Registration data
      nombre: registerData['name'],
      username: registerData['username'],
      email: registerData['email'],
      password: registerData['password'],

      // Onboarding data
      gender: onboardingData['gender'] as string,
      birthDate: onboardingData['birthDate'] as string,
      heightCm: onboardingData['heightCm'] as number,
      currentWeightKg: onboardingData['currentWeightKg'] as number,
      targetWeightKg: (onboardingData['targetWeightKg'] || onboardingData['currentWeightKg']) as number,
      activityLevel: onboardingData['activityLevel'] as string,
      workType: onboardingData['workType'] as string,
      sleepHoursAverage: onboardingData['sleepHoursAverage'] as number | undefined,
      primaryGoal: onboardingData['primaryGoal'] as string,
      fitnessLevel: onboardingData['fitnessLevel'] as string,
      trainingDaysPerWeek: onboardingData['trainingDaysPerWeek'] as number,
      sessionDurationMinutes: onboardingData['sessionDurationMinutes'] as number | undefined,
      preferredTrainingTime: onboardingData['preferredTrainingTime'] as string | undefined,
      dietType: onboardingData['dietType'] as string,
      mealsPerDay: (onboardingData['mealsPerDay'] as number) || 3,
      allergies: this.normalizeArray(onboardingData['allergies']),
      injuries: this.normalizeArray(onboardingData['injuries']),
      equipment: this.normalizeArray(onboardingData['equipment']),
      medicalConditions: this.normalizeArray(onboardingData['medicalConditions']),
      medications: (onboardingData['medications'] as string) || null,
      previousSurgeries: this.normalizeArray(onboardingData['previousSurgeries']),
      isPregnant,
      isBreastfeeding
    };
  }

  private normalizeArray(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.filter(v => v !== 'NONE').map(v => String(v));
    }
    return [];
  }
}
