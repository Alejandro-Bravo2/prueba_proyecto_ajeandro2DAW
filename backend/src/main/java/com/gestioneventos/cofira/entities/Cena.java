package com.gestioneventos.cofira.entities;

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
public class Cena {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection
    @CollectionTable(name = "cena_alimentos", joinColumns = @JoinColumn(name = "cena_id"))
    @Column(name = "alimento")
    private List<String> alimentos;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private Integer tiempoPreparacionMinutos;

    private Integer porciones;

    private String dificultad;

    @ElementCollection
    @CollectionTable(name = "cena_ingredientes", joinColumns = @JoinColumn(name = "cena_id"))
    @Column(name = "ingrediente", columnDefinition = "TEXT")
    private List<String> ingredientesJson;

    @ElementCollection
    @CollectionTable(name = "cena_pasos", joinColumns = @JoinColumn(name = "cena_id"))
    @Column(name = "paso", columnDefinition = "TEXT")
    @OrderColumn(name = "paso_orden")
    private List<String> pasosPreparacion;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Cena cena)) return false;
        return Objects.equals(id, cena.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
