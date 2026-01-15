package com.gestioneventos.cofira.scheduler;

import com.gestioneventos.cofira.entities.Plan;
import com.gestioneventos.cofira.repositories.PlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PlanExpirationScheduler {

    private final PlanRepository planRepository;

    /**
     * Ejecuta cada hora para verificar y desactivar planes expirados.
     * Cron expression: segundo minuto hora dia-mes mes dia-semana
     * "0 0 * * * *" = cada hora en el minuto 0
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void verificarPlanesExpirados() {
        LocalDateTime ahora = LocalDateTime.now();
        log.debug("Ejecutando verificacion de planes expirados - {}", ahora);

        List<Plan> planesExpirados = planRepository
                .findBySubscripcionActivaAndFechaFinBefore(true, ahora);

        if (planesExpirados.isEmpty()) {
            log.debug("No se encontraron planes expirados");
            return;
        }

        log.info("Encontrados {} planes expirados para desactivar", planesExpirados.size());

        for (Plan plan : planesExpirados) {
            plan.setSubscripcionActiva(false);
            planRepository.save(plan);

            log.info("Plan {} del usuario {} desactivado por expiracion (fecha fin: {})",
                    plan.getId(),
                    plan.getUsuario() != null ? plan.getUsuario().getUsername() : "N/A",
                    plan.getFechaFin());
        }
    }

    /**
     * Ejecuta cada dia a las 00:00 para enviar recordatorios de expiracion proxima.
     * Este metodo puede usarse para notificaciones futuras.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void enviarRecordatoriosExpiracion() {
        LocalDateTime enTresDias = LocalDateTime.now().plusDays(3);
        LocalDateTime enUnDia = LocalDateTime.now().plusDays(1);

        List<Plan> planesProximosAExpirar = planRepository.findBySubscripcionActiva(true)
                .stream()
                .filter(plan -> plan.getFechaFin() != null &&
                        plan.getFechaFin().isAfter(LocalDateTime.now()) &&
                        plan.getFechaFin().isBefore(enTresDias))
                .toList();

        if (!planesProximosAExpirar.isEmpty()) {
            log.info("Hay {} planes proximos a expirar en los proximos 3 dias",
                    planesProximosAExpirar.size());
            // Aqui se podria implementar envio de emails de recordatorio
        }
    }
}
