package com.gestioneventos.cofira.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Objects;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ejercicios {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private String nombreEjercicio;

    @NotNull
    @Column(nullable = false)
    private Integer series;

    @NotNull
    @Column(nullable = false)
    private Integer repeticiones;

    @Column
    private Integer tiempoDescansoSegundos;

    @Column
    private String descripcion;

    @Column
    private String grupoMuscular;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Ejercicios ejercicio)) return false;
        return Objects.equals(id, ejercicio.id) &&
                Objects.equals(nombreEjercicio, ejercicio.nombreEjercicio);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, nombreEjercicio);
    }
}