package com.gestioneventos.cofira.dto.evaluacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO containing nutrition progress metrics summary.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NutricionResumenDTO {

    private Double caloriasPromedio; // daily average

    private Double caloriasMeta; // target calories

    private Double adherenciaCalorias; // % adherence to calorie goal

    private Double proteinasPromedio; // daily average grams

    private Double proteinasMeta; // target grams

    private Double adherenciaProteinas; // % adherence to protein goal

    private Double carbohidratosPromedio; // daily average grams

    private Double carbohidratosMeta; // target grams

    private Double grasasPromedio; // daily average grams

    private Double grasasMeta; // target grams

    private Double aguaPromedio; // daily average ml

    @Builder.Default
    private List<String> patronesDetectados = new ArrayList<>(); // detected patterns
}
