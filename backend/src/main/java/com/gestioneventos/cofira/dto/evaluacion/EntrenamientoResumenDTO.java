package com.gestioneventos.cofira.dto.evaluacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO containing training progress metrics summary.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntrenamientoResumenDTO {

    private Double volumenTotal; // kg (weight × reps × sets)

    private Double pesoMaximoPromedio; // average max weight lifted

    private Double mejoraFuerzaPorcentaje; // % improvement vs previous period

    private Integer entrenamientosCompletados;

    private Integer entrenamientosPlanificados;

    private Double consistenciaPorcentaje; // % adherence to plan

    private List<EjercicioProgresoDTO> ejerciciosDestacados; // top performing exercises

    @Builder.Default
    private Boolean hayPlateau = false;

    private String mensajePlateau; // explanation if plateau detected
}
