package com.gestioneventos.cofira.entities;

import com.gestioneventos.cofira.enums.TipoComida;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Entity to track actual nutrition/meals consumed.
 * Records what the user actually ate vs the meal plan.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "registro_nutricion", indexes = {
    @Index(name = "idx_registro_nutricion_usuario_fecha", columnList = "usuario_id, fecha")
})
public class RegistroNutricion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @NotNull
    private Usuario usuario;

    @NotNull
    @Column(nullable = false)
    private LocalDate fecha;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoComida tipoComida;

    private Double caloriasConsumidas;

    private Double proteinasConsumidas; // grams

    private Double carbohidratosConsumidos; // grams

    private Double grasasConsumidas; // grams

    private Double fibraConsumida; // grams

    private Double aguaConsumidaMl; // milliliters

    @Column(length = 500)
    private String descripcionComida;

    @Builder.Default
    private Boolean esComidaPlaneada = false;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Calculate total macros in calories.
     * Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
     */
    public Double calcularCaloriasDeMacros() {
        double proteinas = proteinasConsumidas != null ? proteinasConsumidas * 4 : 0;
        double carbos = carbohidratosConsumidos != null ? carbohidratosConsumidos * 4 : 0;
        double grasas = grasasConsumidas != null ? grasasConsumidas * 9 : 0;
        return proteinas + carbos + grasas;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RegistroNutricion that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
