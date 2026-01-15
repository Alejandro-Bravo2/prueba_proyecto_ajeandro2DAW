package com.gestioneventos.cofira.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gestioneventos.cofira.entities.UserProfile;
import com.gestioneventos.cofira.entities.Usuario;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    Optional<UserProfile> findByUsuario(Usuario usuario);

    Optional<UserProfile> findByUsuarioId(Long usuarioId);

    boolean existsByUsuarioId(Long usuarioId);
}
