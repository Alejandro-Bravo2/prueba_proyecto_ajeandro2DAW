package com.gestioneventos.cofira.repositories;

import com.gestioneventos.cofira.entities.Ejercicios;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EjerciciosRepository extends JpaRepository<Ejercicios, Long> {
    // Buscar ejercicios por nombre
    List<Ejercicios> findByNombreEjercicioContainingIgnoreCase(String nombre);

    // Buscar ejercicios por número de series
    List<Ejercicios> findBySeriesGreaterThanEqual(Integer series);

    // Buscar ejercicios por número de repeticiones
    List<Ejercicios> findByRepeticionesGreaterThanEqual(Integer repeticiones);

    // Buscar ejercicios por series y repeticiones específicas
    List<Ejercicios> findBySeriesAndRepeticiones(Integer series, Integer repeticiones);
}
