package com.gestioneventos.cofira.services;

import java.time.LocalDate;
import java.time.Period;

import org.springframework.stereotype.Service;

import com.gestioneventos.cofira.dto.onboarding.NutritionTargetsDTO;
import com.gestioneventos.cofira.enums.ActivityLevel;
import com.gestioneventos.cofira.enums.Gender;
import com.gestioneventos.cofira.enums.PrimaryGoal;

@Service
public class CalorieCalculationService {

    /**
     * Calcula el Metabolismo Basal (BMR) usando la formula Mifflin-St Jeor
     *
     * Hombres: BMR = (10 x peso en kg) + (6.25 x altura en cm) - (5 x edad) + 5
     * Mujeres: BMR = (10 x peso en kg) + (6.25 x altura en cm) - (5 x edad) - 161
     *
     * @param gender Genero del usuario
     * @param weightKg Peso en kilogramos
     * @param heightCm Altura en centimetros
     * @param age Edad en anos
     * @return BMR en calorias/dia
     */
    public double calculateBMR(Gender gender, double weightKg, double heightCm, int age) {
        double baseBMR = (10 * weightKg) + (6.25 * heightCm) - (5 * age);

        if (gender == Gender.MALE) {
            return baseBMR + 5;
        } else {
            // Para FEMALE y OTHER usamos la formula femenina (mas conservadora)
            return baseBMR - 161;
        }
    }

    /**
     * Calcula el Gasto Energetico Total Diario (TDEE)
     * TDEE = BMR x multiplicador de actividad
     *
     * @param bmr Metabolismo Basal
     * @param activityLevel Nivel de actividad
     * @return TDEE en calorias/dia
     */
    public double calculateTDEE(double bmr, ActivityLevel activityLevel) {
        return bmr * activityLevel.getMultiplier();
    }

    /**
     * Calcula la edad a partir de la fecha de nacimiento
     *
     * @param birthDate Fecha de nacimiento
     * @return Edad en anos
     */
    public int calculateAge(LocalDate birthDate) {
        return Period.between(birthDate, LocalDate.now()).getYears();
    }

    /**
     * Calcula todos los objetivos nutricionales basados en el perfil del usuario
     *
     * @param gender Genero
     * @param weightKg Peso actual en kg
     * @param heightCm Altura en cm
     * @param birthDate Fecha de nacimiento
     * @param activityLevel Nivel de actividad
     * @param goal Objetivo principal
     * @param isPregnant Si esta embarazada
     * @param isBreastfeeding Si esta lactando
     * @return DTO con todos los objetivos calculados
     */
    public NutritionTargetsDTO calculateNutritionTargets(
            Gender gender,
            double weightKg,
            double heightCm,
            LocalDate birthDate,
            ActivityLevel activityLevel,
            PrimaryGoal goal,
            Boolean isPregnant,
            Boolean isBreastfeeding) {

        int age = calculateAge(birthDate);
        double bmr = calculateBMR(gender, weightKg, heightCm, age);
        double tdee = calculateTDEE(bmr, activityLevel);

        // Ajustar calorias segun objetivo
        double dailyCalories = tdee + goal.getCalorieAdjustment();

        // Ajustes especiales para embarazo y lactancia
        if (Boolean.TRUE.equals(isPregnant)) {
            dailyCalories += 300; // Segundo/tercer trimestre
        }
        if (Boolean.TRUE.equals(isBreastfeeding)) {
            dailyCalories += 500;
        }

        // Asegurar minimo saludable de calorias
        dailyCalories = Math.max(dailyCalories, gender == Gender.MALE ? 1500 : 1200);

        // Calcular macronutrientes
        double proteinGrams = calculateProtein(weightKg, goal);
        double fatGrams = calculateFat(dailyCalories);
        double carbsGrams = calculateCarbs(dailyCalories, proteinGrams, fatGrams);
        double fiberGrams = calculateFiber(dailyCalories);

        return NutritionTargetsDTO.builder()
                .calculatedBMR(Math.round(bmr * 100.0) / 100.0)
                .calculatedTDEE(Math.round(tdee * 100.0) / 100.0)
                .dailyCalories((double) Math.round(dailyCalories))
                .proteinGrams((double) Math.round(proteinGrams))
                .carbsGrams((double) Math.round(carbsGrams))
                .fatGrams((double) Math.round(fatGrams))
                .fiberGrams((double) Math.round(fiberGrams))
                .build();
    }

    /**
     * Calcula gramos de proteina recomendados
     * - Perder peso: 1.6-2.0g/kg (alto para preservar musculo)
     * - Ganar musculo: 1.8-2.2g/kg (alto para sintesis muscular)
     * - Mantener/Salud: 1.2-1.6g/kg
     */
    private double calculateProtein(double weightKg, PrimaryGoal goal) {
        double proteinPerKg;
        switch (goal) {
            case LOSE_WEIGHT:
                proteinPerKg = 1.8; // Alto para preservar musculo durante deficit
                break;
            case GAIN_MUSCLE:
                proteinPerKg = 2.0; // Alto para sintesis muscular
                break;
            case MAINTAIN:
            case IMPROVE_HEALTH:
            default:
                proteinPerKg = 1.4; // Moderado
                break;
        }
        return weightKg * proteinPerKg;
    }

    /**
     * Calcula gramos de grasa recomendados (25% de calorias totales)
     * Minimo 0.5g/kg para funcion hormonal
     */
    private double calculateFat(double dailyCalories) {
        double fatKcal = dailyCalories * 0.25;
        return fatKcal / 9; // 9 kcal por gramo de grasa
    }

    /**
     * Calcula gramos de carbohidratos (calorias restantes)
     */
    private double calculateCarbs(double dailyCalories, double proteinGrams, double fatGrams) {
        double proteinKcal = proteinGrams * 4;
        double fatKcal = fatGrams * 9;
        double carbsKcal = dailyCalories - proteinKcal - fatKcal;
        return Math.max(carbsKcal / 4, 50); // Minimo 50g para funcion cerebral
    }

    /**
     * Calcula gramos de fibra recomendados (14g por cada 1000 kcal)
     */
    private double calculateFiber(double dailyCalories) {
        double fiber = (dailyCalories / 1000) * 14;
        return Math.min(fiber, 50); // Maximo 50g para evitar problemas digestivos
    }
}
