package com.gestioneventos.cofira.dto.rutinaejercicio;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CrearDiaEjercicioDTO {
    @NotNull(message = "El día de la semana no puede ser nulo")
    private String diaSemana;

    @NotNull(message = "La lista de IDs de ejercicios no puede ser nula")
    private List<Long> ejerciciosIds;
}
