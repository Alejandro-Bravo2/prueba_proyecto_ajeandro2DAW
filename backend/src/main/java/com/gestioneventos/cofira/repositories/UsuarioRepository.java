package com.gestioneventos.cofira.repositories;

import com.gestioneventos.cofira.entities.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Búsqueda por email
    Optional<Usuario> findByEmail(String email);

    // Búsqueda por username
    Optional<Usuario> findByUsername(String username);

    // Verificar si existe username
    boolean existsByUsername(String username);

    // Verificar si existe email
    boolean existsByEmail(String email);

    // Búsqueda por nombre con paginación
    Page<Usuario> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);

    // Búsqueda por rango de edad
    List<Usuario> findByEdadBetween(Integer edadMin, Integer edadMax);

    // Búsqueda por peso mínimo
    List<Usuario> findByPesoGreaterThanEqual(Double peso);

    // Búsqueda por altura mínima
    List<Usuario> findByAlturaGreaterThanEqual(Double altura);

    // Usuarios con plan activo (Query JPQL con JOIN para evitar NPE)
    @Query("SELECT u FROM Usuario u JOIN u.plan p WHERE p.subscripcionActiva = true")
    List<Usuario> findUsuariosConPlanActivo();
}
