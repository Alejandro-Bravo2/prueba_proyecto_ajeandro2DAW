package com.gestioneventos.cofira.dto.sala;

import lombok.Data;

import java.time.LocalDate;

@Data
public class SalaDTO {
    private Long id;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
}
