package com.gestioneventos.cofira.controllers;

import com.gestioneventos.cofira.dto.checkout.CheckoutRequestDTO;
import com.gestioneventos.cofira.dto.checkout.CheckoutResponseDTO;
import com.gestioneventos.cofira.dto.checkout.SubscripcionEstadoDTO;
import com.gestioneventos.cofira.services.CheckoutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
@Tag(name = "Checkout", description = "Endpoints para procesamiento de pagos y subscripciones")
public class CheckoutController {

    private final CheckoutService checkoutService;

    @PostMapping("/procesar")
    @Operation(summary = "Procesar pago de subscripcion",
            description = "Procesa el pago simulado para activar una subscripcion premium")
    public ResponseEntity<CheckoutResponseDTO> procesarPago(
            @RequestBody @Valid CheckoutRequestDTO request
    ) {
        CheckoutResponseDTO response = checkoutService.procesarPago(request);

        if (!response.getExitoso()) {
            return ResponseEntity.badRequest().body(response);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/cancelar")
    @Operation(summary = "Cancelar subscripcion",
            description = "Cancela la subscripcion activa del usuario actual")
    public ResponseEntity<Map<String, String>> cancelarSubscripcion() {
        try {
            checkoutService.cancelarSubscripcion();
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Subscripcion cancelada exitosamente",
                    "estado", "cancelada"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/estado")
    @Operation(summary = "Obtener estado de subscripcion",
            description = "Retorna el estado actual de la subscripcion del usuario")
    public ResponseEntity<SubscripcionEstadoDTO> obtenerEstadoSubscripcion() {
        SubscripcionEstadoDTO estado = checkoutService.obtenerEstadoSubscripcion();
        return ResponseEntity.ok(estado);
    }
}
