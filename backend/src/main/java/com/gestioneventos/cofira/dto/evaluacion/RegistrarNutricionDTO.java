package com.gestioneventos.cofira.dto.evaluacion;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for logging a meal/nutrition entry.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrarNutricionDTO {

    @NotNull(message = "La fecha es requerida")
    private LocalDate fecha;

    @NotNull(message = "El tipo de comida es requerido")
    private String tipoComida; // DESAYUNO, ALMUERZO, COMIDA, MERIENDA, CENA

    private Double caloriasConsumidas;

    private Double proteinasConsumidas;

    private Double carbohidratosConsumidos;

    private Double grasasConsumidas;

    private Double fibraConsumida;

    private Double aguaConsumidaMl;

    private String descripcionComida;

    @Builder.Default
    private Boolean esComidaPlaneada = false;
}
