import {
  OpenRouterMessage,
  OpenRouterResponse,
  NutritionAnalysis,
  GeneratedWorkout,
  GoalEstimate,
  WorkoutGenerationRequest
} from '../types/index.js';
import { prisma } from '../index.js';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const VISION_MODEL = 'anthropic/claude-3.5-sonnet';
const TEXT_MODEL = 'anthropic/claude-3.5-sonnet';

class OpenRouterService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Warning: OPENROUTER_API_KEY is not set');
    }
  }

  private async makeRequest(
    messages: OpenRouterMessage[],
    model: string = TEXT_MODEL
  ): Promise<OpenRouterResponse> {
    const startTime = Date.now();

    const response = await fetch(OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': process.env.CORS_ORIGIN || 'http://localhost:4200',
        'X-Title': 'Cofira Fitness App'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as OpenRouterResponse;
    const durationMs = Date.now() - startTime;

    // Log interaction for analytics
    await this.logInteraction(
      messages[messages.length - 1]?.content?.toString() || '',
      data.choices[0]?.message?.content || '',
      model,
      data.usage?.total_tokens,
      durationMs
    );

    return data;
  }

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
      console.error('Failed to log AI interaction:', error);
    }
  }

  async analyzeFood(imageBase64: string): Promise<NutritionAnalysis> {
    const systemPrompt = `Eres un experto nutricionista y analista de alimentos. Analiza la imagen de comida proporcionada y proporciona información nutricional precisa.

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin bloques de código.

El JSON debe tener exactamente esta estructura:
{
  "name": "nombre del plato en español",
  "description": "breve descripción del plato",
  "calories": número_entero,
  "protein": número_decimal,
  "carbs": número_decimal,
  "fat": número_decimal,
  "fiber": número_decimal,
  "sugar": número_decimal,
  "ingredients": ["ingrediente1", "ingrediente2"],
  "confidence": número_0_a_100,
  "suggestions": ["sugerencia1", "sugerencia2"]
}

Todas las cantidades nutricionales son por porción estimada visible en la imagen.
Las calorías deben ser un número entero.
Proteínas, carbohidratos, grasas, fibra y azúcar en gramos (decimales).
La confianza es un porcentaje de 0 a 100 indicando qué tan seguro estás del análisis.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          },
          {
            type: 'text',
            text: 'Analiza esta imagen de comida y proporciona la información nutricional en formato JSON.'
          }
        ]
      }
    ];

    const response = await this.makeRequest(messages, VISION_MODEL);
    const content = response.choices[0]?.message?.content || '';

    try {
      // Clean the response in case there's any markdown
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.slice(7);
      }
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.slice(0, -3);
      }

      const analysis = JSON.parse(cleanedContent) as NutritionAnalysis;
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse nutrition analysis:', content);
      throw new Error('Failed to parse AI response for nutrition analysis');
    }
  }

  async generateWorkoutPlan(request: WorkoutGenerationRequest): Promise<GeneratedWorkout[]> {
    const systemPrompt = `Eres un entrenador personal experto con años de experiencia creando rutinas de entrenamiento personalizadas.

IMPORTANTE: Responde ÚNICAMENTE con un array JSON válido, sin texto adicional, sin markdown.

Genera un plan de entrenamiento semanal basado en las preferencias del usuario. Cada workout debe tener esta estructura:
{
  "name": "Nombre del entrenamiento",
  "description": "Descripción breve",
  "duration": número_minutos,
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "muscleGroups": ["grupo1", "grupo2"],
  "workoutType": "STRENGTH" | "CARDIO" | "HIIT" | "FLEXIBILITY" | "MIXED",
  "exercises": [
    {
      "name": "Nombre del ejercicio",
      "description": "Instrucciones breves",
      "sets": número,
      "reps": "12" o "8-12" o "30s",
      "restSeconds": número,
      "muscleGroup": "grupo muscular principal",
      "equipmentNeeded": "equipo necesario o null",
      "order": número_orden
    }
  ]
}

Consideraciones importantes:
- Adapta los ejercicios al nivel de fitness del usuario
- Evita ejercicios que afecten las lesiones indicadas
- Usa solo el equipamiento disponible
- Distribuye los grupos musculares de forma equilibrada en la semana
- Incluye calentamiento y enfriamiento en la duración`;

    const userPrompt = `Genera un plan de entrenamiento con las siguientes preferencias:
- Objetivo principal: ${request.primaryGoal}
- Nivel de fitness: ${request.fitnessLevel}
- Días de entrenamiento por semana: ${request.trainingDays}
- Duración por sesión: ${request.sessionDuration} minutos
- Equipamiento disponible: ${request.equipment.join(', ') || 'Solo peso corporal'}
- Lesiones/limitaciones a evitar: ${request.injuries.length > 0 ? request.injuries.join(', ') : 'Ninguna'}
${request.muscleGroupFocus ? `- Enfoque en: ${request.muscleGroupFocus.join(', ')}` : ''}

Genera exactamente ${request.trainingDays} entrenamientos para la semana.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.makeRequest(messages, TEXT_MODEL);
    const content = response.choices[0]?.message?.content || '';

    try {
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.slice(7);
      }
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.slice(0, -3);
      }

      const workouts = JSON.parse(cleanedContent) as GeneratedWorkout[];
      return workouts;
    } catch (parseError) {
      console.error('Failed to parse workout plan:', content);
      throw new Error('Failed to parse AI response for workout generation');
    }
  }

  async estimateGoalCompletion(
    goalType: string,
    targetValue: number,
    currentValue: number,
    startValue: number,
    startDate: Date,
    targetDate: Date,
    recentProgress: number[]
  ): Promise<GoalEstimate> {
    const systemPrompt = `Eres un experto en fitness y análisis de datos de salud. Analiza el progreso hacia un objetivo y proporciona estimaciones precisas.

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido.

{
  "estimatedDate": "YYYY-MM-DD",
  "weeklyRate": número_decimal,
  "daysRemaining": número_entero,
  "status": "ON_TRACK" | "AHEAD" | "BEHIND" | "AT_RISK",
  "progressPercentage": número_0_a_100,
  "recommendations": ["recomendación1", "recomendación2", "recomendación3"]
}`;

    const daysSinceStart = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysToTarget = Math.floor((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const totalChange = currentValue - startValue;
    const remainingChange = targetValue - currentValue;

    const userPrompt = `Analiza este progreso hacia un objetivo:
- Tipo de objetivo: ${goalType}
- Valor inicial: ${startValue}
- Valor actual: ${currentValue}
- Valor objetivo: ${targetValue}
- Días transcurridos: ${daysSinceStart}
- Días restantes hasta la fecha objetivo: ${daysToTarget}
- Progreso reciente (últimos valores): ${recentProgress.join(', ')}

Calcula la tasa de cambio semanal, estima cuándo se alcanzará el objetivo realmente, y proporciona recomendaciones específicas.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.makeRequest(messages, TEXT_MODEL);
    const content = response.choices[0]?.message?.content || '';

    try {
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.slice(7);
      }
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.slice(0, -3);
      }

      const estimate = JSON.parse(cleanedContent) as GoalEstimate;
      estimate.estimatedDate = new Date(estimate.estimatedDate);
      return estimate;
    } catch (parseError) {
      console.error('Failed to parse goal estimate:', content);
      throw new Error('Failed to parse AI response for goal estimation');
    }
  }
}

export const openRouterService = new OpenRouterService();
