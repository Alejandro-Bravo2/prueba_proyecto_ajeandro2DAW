package com.gestioneventos.cofira.dto.evaluacion;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for logging a completed workout/exercise.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrarEntrenamientoDTO {

    @NotNull(message = "El ID del ejercicio es requerido")
    private Long ejercicioId;

    @NotNull(message = "La fecha es requerida")
    private LocalDate fecha;

    @NotNull(message = "Las series completadas son requeridas")
    @Positive(message = "Las series deben ser positivas")
    private Integer seriesCompletadas;

    @NotNull(message = "Las repeticiones completadas son requeridas")
    @Positive(message = "Las repeticiones deben ser positivas")
    private Integer repeticionesCompletadas;

    @NotNull(message = "El peso utilizado es requerido")
    @Positive(message = "El peso debe ser positivo")
    private Double pesoUtilizado;

    private Integer tiempoDescansoReal;

    private Integer duracionMinutos;

    private String nivelEsfuerzo; // FACIL, MODERADO, DIFICIL, MUY_DIFICIL

    private String notas;
}
