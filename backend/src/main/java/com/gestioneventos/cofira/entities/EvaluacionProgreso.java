package com.gestioneventos.cofira.entities;

import com.gestioneventos.cofira.enums.TendenciaProgreso;
import com.gestioneventos.cofira.enums.TipoEvaluacion;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Entity to store progress evaluation results.
 * Contains metrics, trends, and AI-generated feedback.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "evaluacion_progreso", indexes = {
    @Index(name = "idx_evaluacion_progreso_usuario_fecha", columnList = "usuario_id, fecha_evaluacion DESC")
})
public class EvaluacionProgreso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @NotNull
    private Usuario usuario;

    @NotNull
    @Column(nullable = false)
    private LocalDate fechaEvaluacion;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoEvaluacion tipoEvaluacion;

    // ==========================================
    // TRAINING METRICS
    // ==========================================

    private Double volumenTotalSemana; // kg (weight x reps x sets)

    private Double pesoMaximoPromedio; // average max weight lifted

    private Double mejoraFuerzaPorcentaje; // % improvement vs previous period

    private Integer entrenamientosCompletados;

    private Integer entrenamientosPlanificados;

    private Double consistenciaEntrenamiento; // % adherence to plan

    @Enumerated(EnumType.STRING)
    private TendenciaProgreso tendenciaEntrenamiento;

    @Builder.Default
    private Boolean hayPlateau = false;

    // ==========================================
    // NUTRITION METRICS
    // ==========================================

    private Double caloriasPromedioSemana;

    private Double adherenciaCaloriasPorcentaje;

    private Double proteinasPromedioSemana;

    private Double adherenciaProteinasPorcentaje;

    private Double carbohidratosPromedioSemana;

    private Double grasasPromedioSemana;

    private Double aguaPromedioSemana;

    @Enumerated(EnumType.STRING)
    private TendenciaProgreso tendenciaNutricion;

    @Column(length = 500)
    private String patronesDetectados; // JSON array of patterns

    // ==========================================
    // AI-GENERATED FEEDBACK
    // ==========================================

    @Column(length = 2000)
    private String feedbackIA;

    @Column(length = 1000)
    private String recomendaciones; // JSON array of recommendations

    @Column(length = 500)
    private String logrosDestacados; // JSON array of achievements

    // ==========================================
    // TIMESTAMPS
    // ==========================================

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof EvaluacionProgreso that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
