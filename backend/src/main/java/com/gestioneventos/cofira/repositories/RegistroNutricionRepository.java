package com.gestioneventos.cofira.repositories;

import com.gestioneventos.cofira.entities.RegistroNutricion;
import com.gestioneventos.cofira.enums.TipoComida;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RegistroNutricionRepository extends JpaRepository<RegistroNutricion, Long> {

    // Find all nutrition logs for a user within a date range
    List<RegistroNutricion> findByUsuarioIdAndFechaBetween(
            Long usuarioId, LocalDate fechaInicio, LocalDate fechaFin);

    // Find nutrition logs for a specific date
    List<RegistroNutricion> findByUsuarioIdAndFecha(Long usuarioId, LocalDate fecha);

    // Find nutrition logs by meal type within a date range
    List<RegistroNutricion> findByUsuarioIdAndTipoComidaAndFechaBetween(
            Long usuarioId, TipoComida tipoComida, LocalDate fechaInicio, LocalDate fechaFin);

    // Calculate average daily calories for a date range
    @Query("SELECT AVG(dailyTotal) FROM (" +
           "SELECT SUM(r.caloriasConsumidas) as dailyTotal " +
           "FROM RegistroNutricion r " +
           "WHERE r.usuario.id = :usuarioId AND r.fecha BETWEEN :fechaInicio AND :fechaFin " +
           "GROUP BY r.fecha)")
    Double calcularCaloriasPromedioDiario(
            @Param("usuarioId") Long usuarioId,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin);

    // Get total calories per day for a user (returns list of [fecha, totalCalorias])
    @Query("SELECT r.fecha, SUM(r.caloriasConsumidas) " +
           "FROM RegistroNutricion r " +
           "WHERE r.usuario.id = :usuarioId AND r.fecha BETWEEN :fechaInicio AND :fechaFin " +
           "GROUP BY r.fecha ORDER BY r.fecha")
    List<Object[]> getCaloriasPorDia(
            @Param("usuarioId") Long usuarioId,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin);

    // Calculate sum of macros for a date range
    @Query("SELECT SUM(r.proteinasConsumidas), SUM(r.carbohidratosConsumidos), SUM(r.grasasConsumidas), SUM(r.fibraConsumida), SUM(r.aguaConsumidaMl) " +
           "FROM RegistroNutricion r " +
           "WHERE r.usuario.id = :usuarioId AND r.fecha BETWEEN :fechaInicio AND :fechaFin")
    Object[] sumarMacros(
            @Param("usuarioId") Long usuarioId,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin);

    // Count distinct days with nutrition logs
    @Query("SELECT COUNT(DISTINCT r.fecha) FROM RegistroNutricion r " +
           "WHERE r.usuario.id = :usuarioId AND r.fecha BETWEEN :fechaInicio AND :fechaFin")
    Integer countDiasConRegistros(
            @Param("usuarioId") Long usuarioId,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin);
}
