package com.gestioneventos.cofira.enums;

/**
 * Represents the trend direction of user progress.
 * Used in progress evaluations to indicate improvement or decline.
 */
public enum TendenciaProgreso {
    MEJORANDO,      // Positive trend - user is improving
    ESTABLE,        // Stable - no significant change
    RETROCEDIENDO,  // Negative trend - user is declining
    PLATEAU         // Stalled progress - no improvement for extended period
}
