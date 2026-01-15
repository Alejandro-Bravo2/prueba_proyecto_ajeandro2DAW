package com.gestioneventos.cofira.dto.checkout;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequestDTO {

    @NotNull(message = "El tipo de plan es obligatorio")
    private String tipoPlan;

    @NotNull(message = "El metodo de pago es obligatorio")
    private String metodoPago;

    // Datos de tarjeta (solo si metodoPago = TARJETA)
    private String nombreTitular;
    private String numeroTarjeta;
    private String fechaExpiracion;
    private String cvv;

    // Datos de PayPal (solo si metodoPago = PAYPAL)
    private String emailPaypal;

    // Datos de Bizum (solo si metodoPago = BIZUM)
    private String telefonoBizum;
}
