package com.gestioneventos.cofira.repositories;

import com.gestioneventos.cofira.entities.SalaDeGimnasio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface SalaDeGimnasioRepository extends JpaRepository<SalaDeGimnasio, Long> {
    // Buscar salas activas en una fecha específica
    @Query("SELECT s FROM SalaDeGimnasio s WHERE s.fechaInicio <= :fecha AND s.fechaFin >= :fecha")
    List<SalaDeGimnasio> findSalasActivasEnFecha(LocalDate fecha);

    // Buscar salas por rango de fechas
    List<SalaDeGimnasio> findByFechaInicioBetween(LocalDate inicio, LocalDate fin);

    // Buscar salas que finalizaron
    List<SalaDeGimnasio> findByFechaFinBefore(LocalDate fecha);
}
