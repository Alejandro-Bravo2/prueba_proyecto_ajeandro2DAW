package com.gestioneventos.cofira.enums;

public enum PrimaryGoal {
    LOSE_WEIGHT("Perder peso", "Reducir grasa corporal", -500),
    GAIN_MUSCLE("Ganar musculo", "Aumentar masa muscular", 300),
    MAINTAIN("Mantener", "Mantener peso actual", 0),
    IMPROVE_HEALTH("Mejorar salud", "Mejorar salud general", 0);

    private final String displayName;
    private final String description;
    private final int calorieAdjustment;

    PrimaryGoal(String displayName, String description, int calorieAdjustment) {
        this.displayName = displayName;
        this.description = description;
        this.calorieAdjustment = calorieAdjustment;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public int getCalorieAdjustment() {
        return calorieAdjustment;
    }
}
