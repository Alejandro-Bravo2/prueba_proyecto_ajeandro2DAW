package com.gestioneventos.cofira.dto.ejercicios;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CrearEjerciciosDTO {
    @NotBlank(message = "El nombre del ejercicio no puede estar vacío")
    private String nombreEjercicio;

    @NotNull(message = "El número de series no puede ser nulo")
    private Integer series;

    @NotNull(message = "El número de repeticiones no puede ser nulo")
    private Integer repeticiones;

    private Integer tiempoDescansoSegundos;
    private String descripcion;
    private String grupoMuscular;
}
