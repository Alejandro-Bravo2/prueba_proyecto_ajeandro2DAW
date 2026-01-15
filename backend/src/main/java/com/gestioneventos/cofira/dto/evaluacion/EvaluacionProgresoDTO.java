package com.gestioneventos.cofira.dto.evaluacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Main DTO for progress evaluation response.
 * Contains training metrics, nutrition metrics, and AI feedback.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluacionProgresoDTO {

    private Long id;

    private LocalDate fechaEvaluacion;

    private String tipoEvaluacion; // ENTRENAMIENTO, NUTRICION, INTEGRAL

    // Training summary (null if nutrition-only evaluation)
    private EntrenamientoResumenDTO entrenamientoResumen;

    // Nutrition summary (null if training-only evaluation)
    private NutricionResumenDTO nutricionResumen;

    // AI-generated feedback
    private String feedbackIA;

    @Builder.Default
    private List<String> recomendaciones = new ArrayList<>();

    @Builder.Default
    private List<String> logrosDestacados = new ArrayList<>();

    // Trend indicators
    private String tendenciaEntrenamiento; // MEJORANDO, ESTABLE, RETROCEDIENDO, PLATEAU

    private String tendenciaNutricion; // MEJORANDO, ESTABLE, RETROCEDIENDO
}
