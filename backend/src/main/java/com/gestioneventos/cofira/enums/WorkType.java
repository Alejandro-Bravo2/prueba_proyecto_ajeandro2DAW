package com.gestioneventos.cofira.enums;

public enum WorkType {
    OFFICE_DESK("Oficina/Escritorio", "Trabajo sedentario en escritorio"),
    STANDING("De pie", "Trabajo de pie (vendedor, profesor, etc.)"),
    PHYSICAL_LABOR("Trabajo fisico", "Trabajo que requiere esfuerzo fisico (construccion, etc.)");

    private final String displayName;
    private final String description;

    WorkType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
