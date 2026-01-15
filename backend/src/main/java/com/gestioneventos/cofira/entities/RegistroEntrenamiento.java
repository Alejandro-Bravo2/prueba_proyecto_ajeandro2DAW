package com.gestioneventos.cofira.entities;

import com.gestioneventos.cofira.enums.NivelEsfuerzo;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Entity to track actual workout performance.
 * Records what the user actually did vs what was planned.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "registro_entrenamiento", indexes = {
    @Index(name = "idx_registro_entrenamiento_usuario_fecha", columnList = "usuario_id, fecha")
})
public class RegistroEntrenamiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @NotNull
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ejercicio_id", nullable = false)
    @NotNull
    private Ejercicios ejercicio;

    @NotNull
    @Column(nullable = false)
    private LocalDate fecha;

    @NotNull
    @Column(nullable = false)
    private Integer seriesCompletadas;

    @NotNull
    @Column(nullable = false)
    private Integer repeticionesCompletadas;

    @NotNull
    @Column(nullable = false)
    private Double pesoUtilizado; // kg

    private Integer tiempoDescansoReal; // seconds

    private Integer duracionMinutos;

    @Column(length = 500)
    private String notas;

    @Enumerated(EnumType.STRING)
    private NivelEsfuerzo nivelEsfuerzo;

    @Builder.Default
    private Boolean completado = true;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Calculate the total volume for this exercise log.
     * Volume = weight × reps × sets
     */
    public Double calcularVolumen() {
        return pesoUtilizado * repeticionesCompletadas * seriesCompletadas;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RegistroEntrenamiento that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
