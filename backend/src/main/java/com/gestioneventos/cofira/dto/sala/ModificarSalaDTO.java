package com.gestioneventos.cofira.dto.sala;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ModificarSalaDTO {
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
}
