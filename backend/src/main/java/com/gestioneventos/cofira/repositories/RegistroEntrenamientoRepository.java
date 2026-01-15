package com.gestioneventos.cofira.repositories;

import com.gestioneventos.cofira.entities.RegistroEntrenamiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RegistroEntrenamientoRepository extends JpaRepository<RegistroEntrenamiento, Long> {

    // Find all training logs for a user within a date range
    List<RegistroEntrenamiento> findByUsuarioIdAndFechaBetween(
            Long usuarioId, LocalDate fechaInicio, LocalDate fechaFin);

    // Find all training logs for a user, ordered by date descending
    List<RegistroEntrenamiento> findByUsuarioIdOrderByFechaDesc(Long usuarioId);

    // Find all training logs for a specific exercise within a date range
    List<RegistroEntrenamiento> findByUsuarioIdAndEjercicioIdAndFechaBetween(
            Long usuarioId, Long ejercicioId, LocalDate fechaInicio, LocalDate fechaFin);

    // Find the maximum weight used for a specific exercise by a user
    @Query("SELECT MAX(r.pesoUtilizado) FROM RegistroEntrenamiento r " +
           "WHERE r.usuario.id = :usuarioId AND r.ejercicio.id = :ejercicioId")
    Double findMaxPesoByUsuarioAndEjercicio(
            @Param("usuarioId") Long usuarioId,
            @Param("ejercicioId") Long ejercicioId);

    // Calculate total volume for a user within a date range
    @Query("SELECT SUM(r.pesoUtilizado * r.repeticionesCompletadas * r.seriesCompletadas) " +
           "FROM RegistroEntrenamiento r " +
           "WHERE r.usuario.id = :usuarioId AND r.fecha BETWEEN :fechaInicio AND :fechaFin")
    Double calcularVolumenTotal(
            @Param("usuarioId") Long usuarioId,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin);

    // Count completed trainings in a date range
    @Query("SELECT COUNT(DISTINCT r.fecha) FROM RegistroEntrenamiento r " +
           "WHERE r.usuario.id = :usuarioId AND r.fecha BETWEEN :fechaInicio AND :fechaFin AND r.completado = true")
    Integer countDiasEntrenamientoCompletados(
            @Param("usuarioId") Long usuarioId,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin);

    // Get distinct exercise IDs for a user
    @Query("SELECT DISTINCT r.ejercicio.id FROM RegistroEntrenamiento r WHERE r.usuario.id = :usuarioId")
    List<Long> findDistinctEjercicioIdsByUsuarioId(@Param("usuarioId") Long usuarioId);
}
