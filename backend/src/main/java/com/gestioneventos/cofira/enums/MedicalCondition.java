package com.gestioneventos.cofira.enums;

public enum MedicalCondition {
    NONE("Ninguna"),
    DIABETES_TYPE1("Diabetes Tipo 1"),
    DIABETES_TYPE2("Diabetes Tipo 2"),
    HYPERTENSION("Hipertension"),
    HEART_DISEASE("Enfermedad cardiaca"),
    HYPOTHYROIDISM("Hipotiroidismo"),
    HYPERTHYROIDISM("Hipertiroidismo"),
    PCOS("Sindrome de ovario poliquistico"),
    INSULIN_RESISTANCE("Resistencia a la insulina"),
    CELIAC_DISEASE("Enfermedad celiaca"),
    KIDNEY_DISEASE("Enfermedad renal"),
    LIVER_DISEASE("Enfermedad hepatica");

    private final String displayName;

    MedicalCondition(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
