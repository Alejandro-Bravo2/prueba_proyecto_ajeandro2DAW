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
public class FoodAnalysisDTO {
    private String nombreComida;
    private String descripcion;
    private String porcion;
    private Integer calorias;
    private Double proteinas;
    private Double carbohidratos;
    private Double grasas;
    private Double fibra;
    private List<String> ingredientes;
    private Double confianza;
}
