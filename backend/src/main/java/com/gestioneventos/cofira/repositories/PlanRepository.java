package com.gestioneventos.cofira.repositories;

import com.gestioneventos.cofira.entities.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PlanRepository extends JpaRepository<Plan, Long> {
    // Buscar plan por usuario
    Optional<Plan> findByUsuarioId(Long usuarioId);

    // Buscar planes activos
    List<Plan> findBySubscripcionActiva(Boolean activa);

    // Buscar planes activos que han expirado
    List<Plan> findBySubscripcionActivaAndFechaFinBefore(Boolean activa, LocalDateTime fecha);

    // Buscar plan activo por usuario
    Optional<Plan> findByUsuarioIdAndSubscripcionActiva(Long usuarioId, Boolean activa);

    // Buscar planes por rango de precio
    List<Plan> findByPrecioBetween(Double precioMin, Double precioMax);

    // Buscar planes por precio mínimo
    List<Plan> findByPrecioGreaterThanEqual(Double precio);

    // Buscar planes por precio máximo
    List<Plan> findByPrecioLessThanEqual(Double precio);
}
