package com.gestioneventos.cofira.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngredienteDTO {
    private String nombre;
    private String cantidad;
    private String unidad;
    private Boolean opcional;
}
