package com.gestioneventos.cofira.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecetaDTO {
    private String nombrePlato;
    private String descripcion;
    private Integer tiempoPreparacionMinutos;
    private Integer porciones;
    private String dificultad;
    private List<IngredienteDTO> ingredientes;
    private List<String> pasosPreparacion;
}
