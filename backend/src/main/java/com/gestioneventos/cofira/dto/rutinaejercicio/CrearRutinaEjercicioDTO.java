package com.gestioneventos.cofira.dto.rutinaejercicio;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class CrearRutinaEjercicioDTO {
    @NotNull(message = "La fecha de inicio no puede ser nula")
    private LocalDate fechaInicio;

    @NotNull(message = "Los días de ejercicio no pueden ser nulos")
    private List<CrearDiaEjercicioDTO> diasEjercicio;
}
