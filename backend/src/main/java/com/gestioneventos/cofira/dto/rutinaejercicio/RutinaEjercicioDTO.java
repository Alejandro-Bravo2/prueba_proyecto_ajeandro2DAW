package com.gestioneventos.cofira.dto.rutinaejercicio;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class RutinaEjercicioDTO {
    private Long id;
    private LocalDate fechaInicio;
    private List<DiaEjercicioDTO> diasEjercicio;
}
