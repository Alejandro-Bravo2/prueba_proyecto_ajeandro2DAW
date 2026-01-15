package com.gestioneventos.cofira.entities;

import com.gestioneventos.cofira.enums.DiaSemana;
import jakarta.persistence.*;
import lombok.*;

import java.util.Objects;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaAlimentacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiaSemana diaSemana;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "desayuno_id")
    private Desayuno desayuno;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "almuerzo_id")
    private Almuerzo almuerzo;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "comida_id")
    private Comida comida;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "merienda_id")
    private Merienda merienda;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "cena_id")
    private Cena cena;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DiaAlimentacion that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
