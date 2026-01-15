package com.gestioneventos.cofira.dto.objetivos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CrearObjetivosDTO {
    @NotNull(message = "La lista de objetivos no puede ser nula")
    private List<String> listaObjetivos;

    @NotNull(message = "El ID del usuario no puede ser nulo")
    private Long usuarioId;
}
