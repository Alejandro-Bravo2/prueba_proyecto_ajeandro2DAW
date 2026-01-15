package com.gestioneventos.cofira.repositories;

import com.gestioneventos.cofira.entities.DiaAlimentacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiaAlimentacionRepository extends JpaRepository<DiaAlimentacion, Long> {
}
