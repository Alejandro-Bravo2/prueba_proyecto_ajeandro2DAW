package com.gestioneventos.cofira.repositories;

import com.gestioneventos.cofira.entities.EvaluacionProgreso;
import com.gestioneventos.cofira.enums.TipoEvaluacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EvaluacionProgresoRepository extends JpaRepository<EvaluacionProgreso, Long> {

    // Find the latest evaluation for a user
    Optional<EvaluacionProgreso> findTopByUsuarioIdOrderByFechaEvaluacionDesc(Long usuarioId);

    // Find the latest evaluation of a specific type for a user
    Optional<EvaluacionProgreso> findTopByUsuarioIdAndTipoEvaluacionOrderByFechaEvaluacionDesc(
            Long usuarioId, TipoEvaluacion tipoEvaluacion);

    // Find the last N evaluations for a user (for plateau detection)
    List<EvaluacionProgreso> findTop3ByUsuarioIdOrderByFechaEvaluacionDesc(Long usuarioId);

    // Find evaluations within a date range
    List<EvaluacionProgreso> findByUsuarioIdAndFechaEvaluacionBetween(
            Long usuarioId, LocalDate fechaInicio, LocalDate fechaFin);

    // Find evaluation history for a user with pagination
    Page<EvaluacionProgreso> findByUsuarioIdOrderByFechaEvaluacionDesc(Long usuarioId, Pageable pageable);

    // Find evaluations by type with pagination
    Page<EvaluacionProgreso> findByUsuarioIdAndTipoEvaluacionOrderByFechaEvaluacionDesc(
            Long usuarioId, TipoEvaluacion tipoEvaluacion, Pageable pageable);

    // Check if an evaluation exists for today
    boolean existsByUsuarioIdAndFechaEvaluacion(Long usuarioId, LocalDate fechaEvaluacion);

    // Find evaluation for a specific date
    Optional<EvaluacionProgreso> findByUsuarioIdAndFechaEvaluacion(Long usuarioId, LocalDate fechaEvaluacion);
}
