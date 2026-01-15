package com.gestioneventos.cofira.dto.plan;

import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModificarPlanDTO {

    @Positive(message = "El precio debe ser positivo")
    private Double precio;

    private Boolean subscripcionActiva;

    @Positive(message = "El ID del usuario debe ser positivo")
    private Long usuarioId;
}
