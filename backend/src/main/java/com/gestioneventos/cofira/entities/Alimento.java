package com.gestioneventos.cofira.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;
import java.util.Objects;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alimento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre del alimento no puede estar vacío")
    @Column(nullable = false)
    private String nombre;

    @ElementCollection
    @CollectionTable(name = "ingredientes_alimento", joinColumns = @JoinColumn(name = "alimento_id"))
    @Column(name = "ingrediente")
    private List<String> ingredientes;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Alimento alimento)) return false;
        return Objects.equals(id, alimento.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
