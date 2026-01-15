package com.gestioneventos.cofira.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gestioneventos.cofira.enums.MetodoPago;
import com.gestioneventos.cofira.enums.TipoPlan;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Plan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private Double precio;

    @NotNull
    private Boolean subscripcionActiva;

    @Enumerated(EnumType.STRING)
    private TipoPlan tipoPlan;

    @Enumerated(EnumType.STRING)
    private MetodoPago metodoPago;

    private LocalDateTime fechaInicio;

    private LocalDateTime fechaFin;

    private String ultimosDigitosTarjeta;

    private String transaccionId;

    @OneToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Plan plan)) return false;
        return Objects.equals(id, plan.id) &&
                Objects.equals(usuario, plan.usuario);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, usuario);
    }
}
