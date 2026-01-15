package com.gestioneventos.cofira.dto.rutinaalimentacion;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class RutinaAlimentacionDTO {
    private Long id;
    private LocalDate fechaInicio;
    private List<DiaAlimentacionDTO> diasAlimentacion;
}
