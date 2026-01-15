package com.gestioneventos.cofira.dto.alimento;

import lombok.Data;

import java.util.List;

@Data
public class ModificarAlimentoDTO {
    private String nombre;
    private List<String> ingredientes;
}
