package com.gestioneventos.cofira.dto.alimento;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrearAlimentoDTO {
    @NotBlank(message = "El nombre del alimento no puede estar vacío")
    private String nombre;

    private List<String> ingredientes;
}
