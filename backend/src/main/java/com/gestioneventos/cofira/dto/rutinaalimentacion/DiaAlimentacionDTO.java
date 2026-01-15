package com.gestioneventos.cofira.dto.rutinaalimentacion;

import lombok.Data;

@Data
public class DiaAlimentacionDTO {
    private Long id;
    private String diaSemana;
    private ComidaDTO desayuno;
    private ComidaDTO almuerzo;
    private ComidaDTO comida;
    private ComidaDTO merienda;
    private ComidaDTO cena;
}
