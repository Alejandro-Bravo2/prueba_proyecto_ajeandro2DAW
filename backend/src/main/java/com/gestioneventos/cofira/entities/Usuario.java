package com.gestioneventos.cofira.entities;

import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gestioneventos.cofira.enums.Rol;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String nombre;

    @NotNull
    @Column(unique = true)
    private String username;

    @NotNull
    @Column(unique = true)
    @Email
    private String email;

    @NotNull
    private String password;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Rol rol = Rol.USER;

    @Builder.Default
    private Boolean isOnboarded = false;

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UserProfile userProfile;

    private Integer edad;
    private Double peso;
    private Double altura;

    @ElementCollection
    @CollectionTable(name = "usuario_alimentos_favoritos", joinColumns = @JoinColumn(name = "usuario_id"))
    @Column(name = "alimento_favorito")
    private List<String> alimentosFavoritos;

    @ElementCollection
    @CollectionTable(name = "usuario_alergias", joinColumns = @JoinColumn(name = "usuario_id"))
    @Column(name = "alergia")
    private List<String> alergias;

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL)
    private Objetivos objetivos;

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL)
    private Plan plan;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "rutina_alimentacion_id")
    private RutinaAlimentacion rutinaAlimentacion;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "rutina_ejercicio_id")
    private RutinaEjercicio rutinaEjercicio;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Usuario usuario = (Usuario) o;
        return Objects.equals(id, usuario.id) &&
                Objects.equals(email, usuario.email);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, email);
    }
}
