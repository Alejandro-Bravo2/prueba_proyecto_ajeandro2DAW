package com.gestioneventos.cofira.enums;

import lombok.Getter;

@Getter
public enum MetodoPago {
    TARJETA("Tarjeta de credito/debito"),
    PAYPAL("PayPal"),
    BIZUM("Bizum");

    private final String descripcion;

    MetodoPago(String descripcion) {
        this.descripcion = descripcion;
    }
}
