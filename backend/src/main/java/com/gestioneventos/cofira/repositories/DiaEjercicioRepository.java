package com.gestioneventos.cofira.repositories;

import com.gestioneventos.cofira.entities.DiaEjercicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiaEjercicioRepository extends JpaRepository<DiaEjercicio, Long> {
}
