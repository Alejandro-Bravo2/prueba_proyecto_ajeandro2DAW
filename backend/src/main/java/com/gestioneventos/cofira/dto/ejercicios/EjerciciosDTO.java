package com.gestioneventos.cofira.dto.ejercicios;

import lombok.Data;

@Data
public class EjerciciosDTO {
    private Long id;
    private String nombreEjercicio;
    private Integer series;
    private Integer repeticiones;
    private Integer tiempoDescansoSegundos;
    private String descripcion;
    private String grupoMuscular;
}
