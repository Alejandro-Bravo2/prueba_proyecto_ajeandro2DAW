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
public class CheckoutResponseDTO {
    private Long planId;
    private String tipoPlan;
    private Double precio;
    private String metodoPago;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private Boolean exitoso;
    private String mensaje;
    private String transaccionId;
}
