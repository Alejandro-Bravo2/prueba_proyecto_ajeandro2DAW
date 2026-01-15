package com.gestioneventos.cofira.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gestioneventos.cofira.dto.evaluacion.EntrenamientoResumenDTO;
import com.gestioneventos.cofira.dto.evaluacion.NutricionResumenDTO;
import com.gestioneventos.cofira.entities.UserProfile;
import com.gestioneventos.cofira.enums.TendenciaProgreso;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Service for generating AI-powered personalized feedback for progress evaluation.
 * Uses OpenRouter API to generate contextual recommendations.
 */
@Service
public class AIFeedbackService {

    private static final Logger logger = LoggerFactory.getLogger(AIFeedbackService.class);

    @Value("${openrouter.api.url}")
    private String apiUrl;

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.model}")
    private String model;

    @Value("${openrouter.model.fallback}")
    private String fallbackModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generate personalized training feedback using AI.
     */
    public String generateTrainingFeedback(
            EntrenamientoResumenDTO resumen,
            UserProfile profile,
            TendenciaProgreso trend) {

        String prompt = buildTrainingFeedbackPrompt(resumen, profile, trend);
        String response = callOpenRouterAPI(prompt);

        if (response == null || response.isEmpty()) {
            return generateDefaultTrainingFeedback(resumen, trend);
        }

        return cleanResponse(response);
    }

    /**
     * Generate personalized nutrition feedback using AI.
     */
    public String generateNutritionFeedback(
            NutricionResumenDTO resumen,
            UserProfile profile,
            TendenciaProgreso trend) {

        String prompt = buildNutritionFeedbackPrompt(resumen, profile, trend);
        String response = callOpenRouterAPI(prompt);

        if (response == null || response.isEmpty()) {
            return generateDefaultNutritionFeedback(resumen, trend);
        }

        return cleanResponse(response);
    }

    private String buildTrainingFeedbackPrompt(
            EntrenamientoResumenDTO resumen,
            UserProfile profile,
            TendenciaProgreso trend) {

        StringBuilder prompt = new StringBuilder();
        prompt.append("Eres un entrenador personal experto. Genera feedback personalizado breve (maximo 3 parrafos cortos).\n\n");
        prompt.append("DATOS DEL PROGRESO SEMANAL:\n");
        prompt.append("- Volumen total: ").append(String.format("%.1f", resumen.getVolumenTotal())).append(" kg\n");
        prompt.append("- Mejora vs semana anterior: ").append(String.format("%.1f", resumen.getMejoraFuerzaPorcentaje())).append("%\n");
        prompt.append("- Entrenamientos completados: ").append(resumen.getEntrenamientosCompletados())
              .append("/").append(resumen.getEntrenamientosPlanificados()).append("\n");
        prompt.append("- Consistencia: ").append(String.format("%.0f", resumen.getConsistenciaPorcentaje())).append("%\n");
        prompt.append("- Tendencia: ").append(trend.name()).append("\n");

        if (resumen.getHayPlateau() != null && resumen.getHayPlateau()) {
            prompt.append("- ALERTA: Se ha detectado un plateau (sin mejoras significativas en las ultimas semanas)\n");
        }

        prompt.append("\nPERFIL DEL USUARIO:\n");
        prompt.append("- Objetivo: ").append(translateGoal(profile.getPrimaryGoal())).append("\n");
        prompt.append("- Nivel fitness: ").append(profile.getFitnessLevel() != null ? profile.getFitnessLevel() : "INTERMEDIO").append("\n");

        prompt.append("\nGENERA (en espanol, tono motivador pero profesional):\n");
        prompt.append("1. Un reconocimiento breve de los logros de la semana (si los hay)\n");
        prompt.append("2. Una observacion concisa sobre el progreso actual\n");
        prompt.append("3. Una recomendacion accionable y especifica para la proxima semana\n");

        if (resumen.getHayPlateau() != null && resumen.getHayPlateau()) {
            prompt.append("\nSi hay plateau, sugiere estrategias para superarlo:\n");
            prompt.append("- Variacion en repeticiones/series\n");
            prompt.append("- Cambio de ejercicios\n");
            prompt.append("- Semana de descarga (deload)\n");
        }

        prompt.append("\nRespuesta directa sin formato JSON, solo texto natural.");

        return prompt.toString();
    }

    private String buildNutritionFeedbackPrompt(
            NutricionResumenDTO resumen,
            UserProfile profile,
            TendenciaProgreso trend) {

        StringBuilder prompt = new StringBuilder();
        prompt.append("Eres un nutricionista experto. Genera feedback personalizado breve (maximo 3 parrafos cortos).\n\n");
        prompt.append("DATOS DE NUTRICION (promedio diario):\n");
        prompt.append("- Calorias: ").append(String.format("%.0f", resumen.getCaloriasPromedio()))
              .append(" / ").append(String.format("%.0f", resumen.getCaloriasMeta())).append(" kcal\n");
        prompt.append("- Adherencia calorica: ").append(String.format("%.0f", resumen.getAdherenciaCalorias())).append("%\n");
        prompt.append("- Proteinas: ").append(String.format("%.1f", resumen.getProteinasPromedio()))
              .append(" / ").append(String.format("%.1f", resumen.getProteinasMeta())).append(" g\n");
        prompt.append("- Adherencia proteinas: ").append(String.format("%.0f", resumen.getAdherenciaProteinas())).append("%\n");
        prompt.append("- Tendencia general: ").append(trend.name()).append("\n");

        if (resumen.getPatronesDetectados() != null && !resumen.getPatronesDetectados().isEmpty()) {
            prompt.append("- Patrones detectados: ").append(String.join(", ", resumen.getPatronesDetectados())).append("\n");
        }

        prompt.append("\nPERFIL DEL USUARIO:\n");
        prompt.append("- Objetivo: ").append(translateGoal(profile.getPrimaryGoal())).append("\n");
        prompt.append("- Tipo dieta: ").append(profile.getDietType() != null ? profile.getDietType() : "REGULAR").append("\n");

        prompt.append("\nGENERA (en espanol, tono educativo y motivador):\n");
        prompt.append("1. Resumen breve del estado nutricional de la semana\n");
        prompt.append("2. Areas de mejora identificadas (si las hay)\n");
        prompt.append("3. Una recomendacion practica y especifica\n");

        if (resumen.getPatronesDetectados() != null) {
            for (String pattern : resumen.getPatronesDetectados()) {
                switch (pattern) {
                    case "BAJO_CONSUMO_FRECUENTE":
                        prompt.append("\nEl usuario tiene bajo consumo calorico frecuente. Sugiere snacks saludables.\n");
                        break;
                    case "SOBRE_CONSUMO_FRECUENTE":
                        prompt.append("\nEl usuario tiene sobre consumo frecuente. Sugiere control de porciones.\n");
                        break;
                    case "PROTEINAS_INSUFICIENTES":
                        prompt.append("\nEl usuario no consume suficientes proteinas. Sugiere fuentes de proteina.\n");
                        break;
                    case "HIDRATACION_BAJA":
                        prompt.append("\nEl usuario no bebe suficiente agua. Recuerda la importancia de la hidratacion.\n");
                        break;
                }
            }
        }

        prompt.append("\nRespuesta directa sin formato JSON, solo texto natural.");

        return prompt.toString();
    }

    private String callOpenRouterAPI(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("HTTP-Referer", "https://cofira.app");
            headers.set("X-Title", "COFIRA Progress Evaluation");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);

            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            messages.add(message);

            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 500); // Short feedback
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode choices = root.get("choices");
                if (choices != null && choices.isArray() && choices.size() > 0) {
                    JsonNode content = choices.get(0).get("message").get("content");
                    if (content != null) {
                        return content.asText();
                    }
                }
            }

            logger.warn("Primary model failed, trying fallback...");
            return callWithFallbackModel(prompt);

        } catch (Exception e) {
            logger.error("Error calling OpenRouter API for feedback: {}", e.getMessage());
            return callWithFallbackModel(prompt);
        }
    }

    private String callWithFallbackModel(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", fallbackModel);

            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            messages.add(message);

            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 500);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode choices = root.get("choices");
                if (choices != null && choices.isArray() && choices.size() > 0) {
                    return choices.get(0).get("message").get("content").asText();
                }
            }
        } catch (Exception e) {
            logger.error("Fallback model also failed: {}", e.getMessage());
        }
        return null;
    }

    private String cleanResponse(String response) {
        if (response == null) return "";
        // Remove any markdown code blocks if present
        response = response.trim();
        if (response.startsWith("```")) {
            int endIndex = response.indexOf("```", 3);
            if (endIndex > 0) {
                response = response.substring(3, endIndex).trim();
            }
        }
        return response;
    }

    private String translateGoal(com.gestioneventos.cofira.enums.PrimaryGoal goal) {
        if (goal == null) return "Mantener forma fisica";
        return switch (goal) {
            case LOSE_WEIGHT -> "Perder peso";
            case GAIN_MUSCLE -> "Ganar musculo";
            case MAINTAIN -> "Mantener forma fisica";
            case IMPROVE_HEALTH -> "Mejorar salud general";
        };
    }

    private String generateDefaultTrainingFeedback(EntrenamientoResumenDTO resumen, TendenciaProgreso trend) {
        StringBuilder feedback = new StringBuilder();

        // Achievement
        if (resumen.getConsistenciaPorcentaje() >= 80) {
            feedback.append("Excelente consistencia esta semana, completando ")
                   .append(resumen.getEntrenamientosCompletados())
                   .append(" de ")
                   .append(resumen.getEntrenamientosPlanificados())
                   .append(" entrenamientos planificados. ");
        } else if (resumen.getEntrenamientosCompletados() > 0) {
            feedback.append("Has completado ")
                   .append(resumen.getEntrenamientosCompletados())
                   .append(" entrenamientos esta semana. ");
        }

        // Progress observation
        switch (trend) {
            case MEJORANDO:
                feedback.append("Tu volumen de entrenamiento ha aumentado un ")
                       .append(String.format("%.1f", resumen.getMejoraFuerzaPorcentaje()))
                       .append("%, lo cual indica una buena progresion. ");
                break;
            case ESTABLE:
                feedback.append("Tu rendimiento se mantiene estable. ");
                break;
            case RETROCEDIENDO:
                feedback.append("Se ha detectado una ligera disminucion en el rendimiento. ");
                break;
            case PLATEAU:
                feedback.append("Se ha detectado un estancamiento en tu progreso. ");
                break;
        }

        // Recommendation
        if (trend == TendenciaProgreso.PLATEAU) {
            feedback.append("Considera variar tus ejercicios o ajustar las repeticiones/series para superar este plateau.");
        } else if (resumen.getConsistenciaPorcentaje() < 70) {
            feedback.append("Intenta mantener mayor consistencia la proxima semana para optimizar tus resultados.");
        } else {
            feedback.append("Sigue con el buen trabajo y considera incrementar gradualmente la intensidad.");
        }

        return feedback.toString();
    }

    private String generateDefaultNutritionFeedback(NutricionResumenDTO resumen, TendenciaProgreso trend) {
        StringBuilder feedback = new StringBuilder();

        // Summary
        feedback.append("Esta semana has consumido un promedio de ")
               .append(String.format("%.0f", resumen.getCaloriasPromedio()))
               .append(" calorias diarias");

        if (resumen.getCaloriasMeta() != null && resumen.getCaloriasMeta() > 0) {
            feedback.append(" de tu objetivo de ")
                   .append(String.format("%.0f", resumen.getCaloriasMeta()))
                   .append(" kcal");
        }
        feedback.append(". ");

        // Areas of improvement
        if (resumen.getPatronesDetectados() != null) {
            for (String pattern : resumen.getPatronesDetectados()) {
                switch (pattern) {
                    case "BAJO_CONSUMO_FRECUENTE":
                        feedback.append("Se detecta un consumo por debajo del objetivo con frecuencia. ");
                        break;
                    case "SOBRE_CONSUMO_FRECUENTE":
                        feedback.append("El consumo calorico supera el objetivo varios dias. ");
                        break;
                    case "PROTEINAS_INSUFICIENTES":
                        feedback.append("La ingesta de proteinas esta por debajo de lo recomendado. ");
                        break;
                    case "HIDRATACION_BAJA":
                        feedback.append("La hidratacion es insuficiente. ");
                        break;
                }
            }
        }

        // Recommendation
        if (resumen.getAdherenciaProteinas() != null && resumen.getAdherenciaProteinas() < 70) {
            feedback.append("Intenta incorporar mas fuentes de proteina como pollo, pescado, legumbres o huevos.");
        } else if (resumen.getAdherenciaCalorias() != null && resumen.getAdherenciaCalorias() < 70) {
            feedback.append("Ajusta tus porciones para acercarte mas a tu objetivo calorico.");
        } else {
            feedback.append("Mantén estos habitos alimenticios y sigue registrando tus comidas.");
        }

        return feedback.toString();
    }
}
