package com.gestioneventos.cofira.repositories;

import com.gestioneventos.cofira.entities.Objetivos;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ObjetivosRepository extends JpaRepository<Objetivos, Long> {
    Optional<Objetivos> findByUsuarioId(Long usuarioId);
}
