package com.gestioneventos.cofira.dto.evaluacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO containing progress data for a specific exercise.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EjercicioProgresoDTO {

    private Long ejercicioId;

    private String nombreEjercicio;

    private String grupoMuscular;

    private Double pesoActual; // current max weight

    private Double pesoAnterior; // previous period max weight

    private Double mejoraPorcentaje; // % improvement

    private Double volumenActual; // current period total volume

    private Double volumenAnterior; // previous period total volume

    private String tendencia; // MEJORANDO, ESTABLE, RETROCEDIENDO, PLATEAU

    private Integer registrosSemana; // number of logs this week
}
