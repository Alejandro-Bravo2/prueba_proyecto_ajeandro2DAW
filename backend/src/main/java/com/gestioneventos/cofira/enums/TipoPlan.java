package com.gestioneventos.cofira.enums;

import lombok.Getter;

@Getter
public enum TipoPlan {
    INDIVIDUAL(9.0, 30, "Individual", "Para empezar"),
    MENSUAL(19.0, 30, "Mensual", "Mas popular"),
    ANUAL(199.0, 365, "Anual", "Mejor valor");

    private final Double precio;
    private final Integer duracionDias;
    private final String nombre;
    private final String descripcion;

    TipoPlan(Double precio, Integer duracionDias, String nombre, String descripcion) {
        this.precio = precio;
        this.duracionDias = duracionDias;
        this.nombre = nombre;
        this.descripcion = descripcion;
    }
}
