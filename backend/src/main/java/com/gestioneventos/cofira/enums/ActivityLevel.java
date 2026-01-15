package com.gestioneventos.cofira.enums;

public enum ActivityLevel {
    SEDENTARY(1.2, "Sedentario", "Trabajo de escritorio, poco o nada de ejercicio"),
    LIGHTLY_ACTIVE(1.375, "Ligeramente activo", "Ejercicio ligero 1-3 dias/semana"),
    MODERATELY_ACTIVE(1.55, "Moderadamente activo", "Ejercicio moderado 3-5 dias/semana"),
    VERY_ACTIVE(1.725, "Muy activo", "Ejercicio intenso 6-7 dias/semana"),
    EXTRA_ACTIVE(1.9, "Extremadamente activo", "Atleta profesional o trabajo muy fisico");

    private final double multiplier;
    private final String displayName;
    private final String description;

    ActivityLevel(double multiplier, String displayName, String description) {
        this.multiplier = multiplier;
        this.displayName = displayName;
        this.description = description;
    }

    public double getMultiplier() {
        return multiplier;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
