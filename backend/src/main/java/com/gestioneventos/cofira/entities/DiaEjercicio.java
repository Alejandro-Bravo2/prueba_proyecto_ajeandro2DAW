package com.gestioneventos.cofira.entities;

import com.gestioneventos.cofira.enums.DiaSemana;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.Objects;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaEjercicio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiaSemana diaSemana;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "dia_ejercicio_ejercicios",
        joinColumns = @JoinColumn(name = "dia_ejercicio_id"),
        inverseJoinColumns = @JoinColumn(name = "ejercicio_id")
    )
    private List<Ejercicios> ejercicios;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DiaEjercicio that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
