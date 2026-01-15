package com.gestioneventos.cofira.dto.plan;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanDTO {
    private Long id;
    private Double precio;
    private Boolean subscripcionActiva;
    private Long usuarioId;
}
