package com.gestioneventos.cofira.dto.rutinaalimentacion;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CrearDiaAlimentacionDTO {
    @NotNull(message = "El día de la semana no puede ser nulo")
    private String diaSemana;

    private CrearComidaDTO desayuno;
    private CrearComidaDTO almuerzo;
    private CrearComidaDTO comida;
    private CrearComidaDTO merienda;
    private CrearComidaDTO cena;
}
