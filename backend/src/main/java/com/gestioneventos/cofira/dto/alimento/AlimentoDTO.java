package com.gestioneventos.cofira.dto.alimento;

import lombok.Data;

import java.util.List;

@Data
public class AlimentoDTO {
    private Long id;
    private String nombre;
    private List<String> ingredientes;
}
