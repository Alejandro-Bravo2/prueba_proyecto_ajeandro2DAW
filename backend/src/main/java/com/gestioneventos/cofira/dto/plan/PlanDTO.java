package com.gestioneventos.cofira.dto.plan;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanDTO {
    private Long id;
    private Double precio;
    private Boolean subscripcionActiva;
    private Long usuarioId;
    private String tipoPlan;
    private String nombrePlan;
    private String metodoPago;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private Integer diasRestantes;
}
