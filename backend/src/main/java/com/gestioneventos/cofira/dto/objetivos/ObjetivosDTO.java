package com.gestioneventos.cofira.dto.objetivos;

import lombok.Data;

import java.util.List;

@Data
public class ObjetivosDTO {
    private Long id;
    private List<String> listaObjetivos;
    private Long usuarioId;
}
