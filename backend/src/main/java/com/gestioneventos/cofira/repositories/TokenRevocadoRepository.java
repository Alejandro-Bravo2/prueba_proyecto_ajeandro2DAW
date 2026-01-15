package com.gestioneventos.cofira.repositories;

import com.gestioneventos.cofira.entities.TokenRevocado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface TokenRevocadoRepository extends JpaRepository<TokenRevocado, Long> {
    Optional<TokenRevocado> findByJti(String jti);

    boolean existsByJti(String jti);

    @Modifying
    @Query("DELETE FROM TokenRevocado t WHERE t.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);
}
