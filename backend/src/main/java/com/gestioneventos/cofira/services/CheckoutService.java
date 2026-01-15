package com.gestioneventos.cofira.services;

import com.gestioneventos.cofira.dto.checkout.CheckoutRequestDTO;
import com.gestioneventos.cofira.dto.checkout.CheckoutResponseDTO;
import com.gestioneventos.cofira.dto.checkout.SubscripcionEstadoDTO;
import com.gestioneventos.cofira.entities.Plan;
import com.gestioneventos.cofira.entities.Usuario;
import com.gestioneventos.cofira.enums.MetodoPago;
import com.gestioneventos.cofira.enums.TipoPlan;
import com.gestioneventos.cofira.repositories.PlanRepository;
import com.gestioneventos.cofira.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckoutService {

    private final PlanRepository planRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public CheckoutResponseDTO procesarPago(CheckoutRequestDTO request) {
        // Obtener usuario actual
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Parsear enums
        TipoPlan tipoPlan;
        MetodoPago metodoPago;
        try {
            tipoPlan = TipoPlan.valueOf(request.getTipoPlan().toUpperCase());
            metodoPago = MetodoPago.valueOf(request.getMetodoPago().toUpperCase());
        } catch (IllegalArgumentException e) {
            return CheckoutResponseDTO.builder()
                    .exitoso(false)
                    .mensaje("Tipo de plan o metodo de pago invalido")
                    .build();
        }

        // Simular delay de procesamiento (para efecto visual en frontend)
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Generar ID de transaccion simulado
        String transaccionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Calcular fechas
        LocalDateTime fechaInicio = LocalDateTime.now();
        LocalDateTime fechaFin = fechaInicio.plusDays(tipoPlan.getDuracionDias());

        // Extraer ultimos 4 digitos de tarjeta si aplica
        String ultimosDigitos = null;
        if (metodoPago == MetodoPago.TARJETA && request.getNumeroTarjeta() != null) {
            String numeroLimpio = request.getNumeroTarjeta().replaceAll("\\s", "");
            if (numeroLimpio.length() >= 4) {
                ultimosDigitos = numeroLimpio.substring(numeroLimpio.length() - 4);
            }
        }

        // Buscar plan existente o crear nuevo
        Optional<Plan> planExistente = planRepository.findByUsuarioId(usuario.getId());
        Plan plan;

        if (planExistente.isPresent()) {
            // Actualizar plan existente
            plan = planExistente.get();
            plan.setPrecio(tipoPlan.getPrecio());
            plan.setSubscripcionActiva(true);
            plan.setTipoPlan(tipoPlan);
            plan.setMetodoPago(metodoPago);
            plan.setFechaInicio(fechaInicio);
            plan.setFechaFin(fechaFin);
            plan.setUltimosDigitosTarjeta(ultimosDigitos);
            plan.setTransaccionId(transaccionId);
        } else {
            // Crear nuevo plan
            plan = Plan.builder()
                    .precio(tipoPlan.getPrecio())
                    .subscripcionActiva(true)
                    .tipoPlan(tipoPlan)
                    .metodoPago(metodoPago)
                    .fechaInicio(fechaInicio)
                    .fechaFin(fechaFin)
                    .ultimosDigitosTarjeta(ultimosDigitos)
                    .transaccionId(transaccionId)
                    .usuario(usuario)
                    .build();
        }

        planRepository.save(plan);
        log.info("Plan {} procesado exitosamente para usuario {} - Transaccion: {}",
                tipoPlan.name(), username, transaccionId);

        return CheckoutResponseDTO.builder()
                .planId(plan.getId())
                .tipoPlan(tipoPlan.name())
                .precio(tipoPlan.getPrecio())
                .metodoPago(metodoPago.name())
                .fechaInicio(fechaInicio)
                .fechaFin(fechaFin)
                .exitoso(true)
                .mensaje("Pago procesado exitosamente. Bienvenido a " + tipoPlan.getNombre() + "!")
                .transaccionId(transaccionId)
                .build();
    }

    @Transactional
    public void cancelarSubscripcion() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Plan plan = planRepository.findByUsuarioIdAndSubscripcionActiva(usuario.getId(), true)
                .orElseThrow(() -> new RuntimeException("No tienes una subscripcion activa"));

        plan.setSubscripcionActiva(false);
        planRepository.save(plan);

        log.info("Subscripcion cancelada para usuario {}", username);
    }

    public SubscripcionEstadoDTO obtenerEstadoSubscripcion() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Optional<Plan> planOptional = planRepository.findByUsuarioId(usuario.getId());

        if (planOptional.isEmpty()) {
            return SubscripcionEstadoDTO.builder()
                    .activa(false)
                    .build();
        }

        Plan plan = planOptional.get();

        // Calcular dias restantes
        Integer diasRestantes = 0;
        if (plan.getSubscripcionActiva() && plan.getFechaFin() != null) {
            long dias = ChronoUnit.DAYS.between(LocalDateTime.now(), plan.getFechaFin());
            diasRestantes = Math.max(0, (int) dias);
        }

        return SubscripcionEstadoDTO.builder()
                .activa(plan.getSubscripcionActiva())
                .tipoPlan(plan.getTipoPlan() != null ? plan.getTipoPlan().name() : null)
                .nombrePlan(plan.getTipoPlan() != null ? plan.getTipoPlan().getNombre() : null)
                .precio(plan.getPrecio())
                .fechaInicio(plan.getFechaInicio())
                .fechaFin(plan.getFechaFin())
                .diasRestantes(diasRestantes)
                .metodoPago(plan.getMetodoPago() != null ? plan.getMetodoPago().name() : null)
                .ultimosDigitosTarjeta(plan.getUltimosDigitosTarjeta())
                .build();
    }
}
