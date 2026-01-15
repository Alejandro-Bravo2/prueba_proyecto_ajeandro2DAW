package com.gestioneventos.cofira.dto.rutinaalimentacion;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class CrearRutinaAlimentacionDTO {
    @NotNull(message = "La fecha de inicio no puede ser nula")
    private LocalDate fechaInicio;

    @NotNull(message = "Los días de alimentación no pueden ser nulos")
    private List<CrearDiaAlimentacionDTO> diasAlimentacion;
}
