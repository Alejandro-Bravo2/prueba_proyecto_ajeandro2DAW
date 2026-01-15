/**
 * Servicio de IA usando Ollama (modelos locales)
 *
 * Este servicio reemplaza OpenRouter para ejecutar modelos de IA localmente
 * sin necesidad de APIs externas. Usa modelos como qwen2.5 y llava.
 */

import {
  NutritionAnalysis,
  GeneratedWorkout,
  GoalEstimate,
  WorkoutGenerationRequest
} from '../types/index.js';
import { prisma } from '../index.js';

// Configuracion de Ollama
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const TEXT_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:1.5b';
const VISION_MODEL = process.env.OLLAMA_VISION_MODEL || 'llava:7b';

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  images?: string[];
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  eval_count?: number;
}

class OllamaService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = OLLAMA_HOST;
    console.log(`OllamaService inicializado con host: ${this.baseUrl}`);
  }

  /**
   * Hace una peticion al API de Ollama
   */
  private async makeRequest(
    messages: OllamaMessage[],
    model: string = TEXT_MODEL
  ): Promise<OllamaResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 2048
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${error}`);
      }

      const data = await response.json() as OllamaResponse;
      const durationMs = Date.now() - startTime;

      // Registrar interaccion para analytics
      await this.logInteraction(
        messages[messages.length - 1]?.content || '',
        data.message?.content || '',
        model,
        data.eval_count,
        durationMs
      );

      return data;
    } catch (error) {
      console.error('Error en peticion a Ollama:', error);
      throw error;
    }
  }

  /**
   * Registra las interacciones con la IA para analytics
   */
  private async logInteraction(
    prompt: string,
    response: string,
    model: string,
    tokens?: number,
    durationMs?: number
  ) {
    try {
      await prisma.aiInteraction.create({
        data: {
          type: 'CHAT',
          prompt: prompt.substring(0, 5000),
          response: response.substring(0, 10000),
          model,
          tokens,
          durationMs
        }
      });
    } catch (error) {
      console.error('Error al guardar interaccion IA:', error);
    }
  }

  /**
   * Limpia la respuesta JSON del modelo
   */
  private cleanJsonResponse(content: string): string {
    let cleaned = content.trim();

    // Eliminar bloques de codigo markdown
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }

    // Buscar el primer { o [ y el ultimo } o ]
    const jsonStart = Math.min(
      cleaned.indexOf('{') !== -1 ? cleaned.indexOf('{') : Infinity,
      cleaned.indexOf('[') !== -1 ? cleaned.indexOf('[') : Infinity
    );
    const jsonEndBrace = cleaned.lastIndexOf('}');
    const jsonEndBracket = cleaned.lastIndexOf(']');
    const jsonEnd = Math.max(jsonEndBrace, jsonEndBracket);

    if (jsonStart !== Infinity && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    return cleaned.trim();
  }

  /**
   * Analiza una imagen de comida usando el modelo de vision
   */
  async analyzeFood(imageBase64: string): Promise<NutritionAnalysis> {
    const systemPrompt = `Eres un nutricionista experto. Analiza la imagen de comida y responde SOLO con JSON valido.

Formato de respuesta (sin texto adicional, solo JSON):
{
  "name": "nombre del plato",
  "description": "descripcion breve",
  "calories": 350,
  "protein": 25.5,
  "carbs": 30.0,
  "fat": 15.0,
  "fiber": 5.0,
  "sugar": 8.0,
  "ingredients": ["ingrediente1", "ingrediente2"],
  "confidence": 85,
  "suggestions": ["sugerencia1"]
}`;

    const messages: OllamaMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: 'Analiza esta imagen de comida y dame la informacion nutricional en formato JSON.',
        images: [imageBase64]
      }
    ];

    try {
      const response = await this.makeRequest(messages, VISION_MODEL);
      const content = response.message?.content || '';
      const cleanedContent = this.cleanJsonResponse(content);
      const analysis = JSON.parse(cleanedContent) as NutritionAnalysis;
      return analysis;
    } catch (error) {
      console.error('Error al analizar comida:', error);
      // Devolver analisis mock si falla
      return this.getMockFoodAnalysis();
    }
  }

  /**
   * Genera un plan de entrenamiento personalizado
   */
  async generateWorkoutPlan(request: WorkoutGenerationRequest): Promise<GeneratedWorkout[]> {
    const systemPrompt = `Eres un entrenador personal experto. Genera un plan de entrenamiento semanal.

IMPORTANTE: Responde SOLO con un array JSON valido, sin texto adicional.

Cada entrenamiento debe tener esta estructura:
{
  "name": "Nombre del entrenamiento",
  "description": "Descripcion breve",
  "duration": 45,
  "difficulty": "MEDIUM",
  "muscleGroups": ["pecho", "triceps"],
  "workoutType": "STRENGTH",
  "exercises": [
    {
      "name": "Press de banca",
      "description": "Instrucciones",
      "sets": 3,
      "reps": "10-12",
      "restSeconds": 60,
      "muscleGroup": "pecho",
      "equipmentNeeded": "barra",
      "order": 1
    }
  ]
}`;

    const userPrompt = `Genera ${request.trainingDays} entrenamientos para la semana con estas preferencias:
- Objetivo: ${request.primaryGoal}
- Nivel: ${request.fitnessLevel}
- Duracion por sesion: ${request.sessionDuration} minutos
- Equipamiento: ${request.equipment.join(', ') || 'peso corporal'}
- Lesiones a evitar: ${request.injuries.length > 0 ? request.injuries.join(', ') : 'ninguna'}
${request.muscleGroupFocus ? `- Enfoque: ${request.muscleGroupFocus.join(', ')}` : ''}

Responde SOLO con el array JSON de entrenamientos.`;

    const messages: OllamaMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.makeRequest(messages, TEXT_MODEL);
      const content = response.message?.content || '';
      const cleanedContent = this.cleanJsonResponse(content);
      const workouts = JSON.parse(cleanedContent) as GeneratedWorkout[];
      return workouts;
    } catch (error) {
      console.error('Error al generar plan de entrenamiento:', error);
      // Devolver plan mock si falla
      return this.getMockWorkoutPlan(request.trainingDays);
    }
  }

  /**
   * Estima el progreso hacia un objetivo
   */
  async estimateGoalCompletion(
    goalType: string,
    targetValue: number,
    currentValue: number,
    startValue: number,
    startDate: Date,
    targetDate: Date,
    recentProgress: number[]
  ): Promise<GoalEstimate> {
    const daysSinceStart = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysToTarget = Math.floor((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const systemPrompt = `Eres un experto en fitness. Analiza el progreso y responde SOLO con JSON valido.

Formato:
{
  "estimatedDate": "2024-06-15",
  "weeklyRate": 0.5,
  "daysRemaining": 30,
  "status": "ON_TRACK",
  "progressPercentage": 45,
  "recommendations": ["recomendacion1", "recomendacion2"]
}

Status puede ser: ON_TRACK, AHEAD, BEHIND, AT_RISK`;

    const userPrompt = `Analiza este progreso:
- Tipo: ${goalType}
- Valor inicial: ${startValue}
- Valor actual: ${currentValue}
- Valor objetivo: ${targetValue}
- Dias transcurridos: ${daysSinceStart}
- Dias restantes: ${daysToTarget}
- Ultimos valores: ${recentProgress.join(', ')}

Responde SOLO con JSON.`;

    const messages: OllamaMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.makeRequest(messages, TEXT_MODEL);
      const content = response.message?.content || '';
      const cleanedContent = this.cleanJsonResponse(content);
      const estimate = JSON.parse(cleanedContent) as GoalEstimate;
      estimate.estimatedDate = new Date(estimate.estimatedDate);
      return estimate;
    } catch (error) {
      console.error('Error al estimar objetivo:', error);
      // Devolver estimacion mock si falla
      return this.getMockGoalEstimate(currentValue, targetValue, startValue, daysToTarget);
    }
  }

  /**
   * Analisis de comida mock para fallback
   */
  private getMockFoodAnalysis(): NutritionAnalysis {
    return {
      name: 'Plato analizado',
      description: 'Analisis aproximado basado en la imagen',
      calories: 400,
      protein: 25,
      carbs: 35,
      fat: 18,
      fiber: 5,
      sugar: 6,
      ingredients: ['proteina', 'carbohidratos', 'verduras'],
      confidence: 70,
      suggestions: ['Considera añadir mas verduras', 'Buena fuente de proteinas']
    };
  }

  /**
   * Plan de entrenamiento mock para fallback
   */
  private getMockWorkoutPlan(days: number): GeneratedWorkout[] {
    const workoutTemplates = [
      {
        name: 'Entrenamiento de Tren Superior',
        description: 'Trabaja pecho, espalda y brazos',
        duration: 45,
        difficulty: 'MEDIUM',
        muscleGroups: ['pecho', 'espalda', 'brazos'],
        workoutType: 'STRENGTH',
        exercises: [
          { name: 'Flexiones', description: 'Manos a la altura de los hombros', sets: 3, reps: '10-15', restSeconds: 60, muscleGroup: 'pecho', equipmentNeeded: null, order: 1 },
          { name: 'Remo con mancuerna', description: 'Una mano apoyada en banco', sets: 3, reps: '12', restSeconds: 60, muscleGroup: 'espalda', equipmentNeeded: 'mancuerna', order: 2 },
          { name: 'Curl de biceps', description: 'Movimiento controlado', sets: 3, reps: '12', restSeconds: 45, muscleGroup: 'biceps', equipmentNeeded: 'mancuerna', order: 3 }
        ]
      },
      {
        name: 'Entrenamiento de Tren Inferior',
        description: 'Trabaja piernas y gluteos',
        duration: 45,
        difficulty: 'MEDIUM',
        muscleGroups: ['cuadriceps', 'isquiotibiales', 'gluteos'],
        workoutType: 'STRENGTH',
        exercises: [
          { name: 'Sentadillas', description: 'Espalda recta, rodillas no pasan puntas', sets: 4, reps: '12-15', restSeconds: 60, muscleGroup: 'cuadriceps', equipmentNeeded: null, order: 1 },
          { name: 'Zancadas', description: 'Paso largo, rodilla a 90 grados', sets: 3, reps: '10 cada pierna', restSeconds: 60, muscleGroup: 'cuadriceps', equipmentNeeded: null, order: 2 },
          { name: 'Puente de gluteos', description: 'Aprieta gluteos arriba', sets: 3, reps: '15', restSeconds: 45, muscleGroup: 'gluteos', equipmentNeeded: null, order: 3 }
        ]
      },
      {
        name: 'Cardio y Core',
        description: 'Quema calorias y fortalece abdominales',
        duration: 30,
        difficulty: 'MEDIUM',
        muscleGroups: ['core', 'cardio'],
        workoutType: 'CARDIO',
        exercises: [
          { name: 'Burpees', description: 'Movimiento completo con salto', sets: 3, reps: '10', restSeconds: 45, muscleGroup: 'full body', equipmentNeeded: null, order: 1 },
          { name: 'Plancha', description: 'Mantener posicion', sets: 3, reps: '30s', restSeconds: 30, muscleGroup: 'core', equipmentNeeded: null, order: 2 },
          { name: 'Mountain climbers', description: 'Rodillas al pecho alternando', sets: 3, reps: '20 cada lado', restSeconds: 30, muscleGroup: 'core', equipmentNeeded: null, order: 3 }
        ]
      }
    ];

    const result: GeneratedWorkout[] = [];
    for (let i = 0; i < days; i++) {
      result.push(workoutTemplates[i % workoutTemplates.length]);
    }
    return result;
  }

  /**
   * Estimacion de objetivo mock para fallback
   */
  private getMockGoalEstimate(
    currentValue: number,
    targetValue: number,
    startValue: number,
    daysToTarget: number
  ): GoalEstimate {
    const totalProgress = targetValue - startValue;
    const currentProgress = currentValue - startValue;
    const progressPercentage = totalProgress !== 0 ? Math.round((currentProgress / totalProgress) * 100) : 0;

    let status: 'ON_TRACK' | 'AHEAD' | 'BEHIND' | 'AT_RISK' = 'ON_TRACK';
    if (progressPercentage > 60) status = 'AHEAD';
    else if (progressPercentage < 30) status = 'AT_RISK';
    else if (progressPercentage < 40) status = 'BEHIND';

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysToTarget);

    return {
      estimatedDate,
      weeklyRate: Math.abs(currentProgress / 4),
      daysRemaining: daysToTarget,
      status,
      progressPercentage: Math.max(0, Math.min(100, progressPercentage)),
      recommendations: [
        'Mantén la consistencia en tus entrenamientos',
        'Asegúrate de descansar lo suficiente',
        'Ajusta tu alimentación según tus objetivos'
      ]
    };
  }
}

export const ollamaService = new OllamaService();
