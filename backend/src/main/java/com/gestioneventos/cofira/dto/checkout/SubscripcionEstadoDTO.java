package com.gestioneventos.cofira.dto.checkout;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscripcionEstadoDTO {
    private Boolean activa;
    private String tipoPlan;
    private String nombrePlan;
    private Double precio;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private Integer diasRestantes;
    private String metodoPago;
    private String ultimosDigitosTarjeta;
}
