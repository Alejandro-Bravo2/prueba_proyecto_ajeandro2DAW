package com.gestioneventos.cofira.dto.rutinaalimentacion;

import com.gestioneventos.cofira.dto.ai.IngredienteDTO;
import lombok.Data;
import java.util.List;

@Data
public class ComidaDTO {
    private Long id;
    private List<String> alimentos;
    private String descripcion;
    private Integer tiempoPreparacionMinutos;
    private Integer porciones;
    private String dificultad;
    private List<IngredienteDTO> ingredientes;
    private List<String> pasosPreparacion;
}
