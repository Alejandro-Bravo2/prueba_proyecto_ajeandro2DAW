package com.gestioneventos.cofira.dto.auth;

import java.time.LocalDate;
import java.util.List;

import com.gestioneventos.cofira.enums.ActivityLevel;
import com.gestioneventos.cofira.enums.Gender;
import com.gestioneventos.cofira.enums.PrimaryGoal;
import com.gestioneventos.cofira.enums.WorkType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterWithOnboardingRequestDTO {

    // ========== DATOS DE REGISTRO ==========

    @NotBlank(message = "El nombre no puede estar vacio")
    private String nombre;

    @NotBlank(message = "El username no puede estar vacio")
    private String username;

    @NotBlank(message = "El email no puede estar vacio")
    @Email(message = "El email debe ser valido")
    private String email;

    @NotBlank(message = "La contrasena no puede estar vacia")
    private String password;

    // ========== DATOS DE ONBOARDING ==========

    // Basic Physical Data
    @NotNull(message = "El genero es obligatorio")
    private Gender gender;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    @Past(message = "La fecha de nacimiento debe ser en el pasado")
    private LocalDate birthDate;

    @NotNull(message = "La altura es obligatoria")
    @Min(value = 100, message = "La altura minima es 100 cm")
    @Max(value = 250, message = "La altura maxima es 250 cm")
    private Double heightCm;

    @NotNull(message = "El peso actual es obligatorio")
    @Min(value = 30, message = "El peso minimo es 30 kg")
    @Max(value = 300, message = "El peso maximo es 300 kg")
    private Double currentWeightKg;

    @Min(value = 30, message = "El peso objetivo minimo es 30 kg")
    @Max(value = 300, message = "El peso objetivo maximo es 300 kg")
    private Double targetWeightKg;

    // Activity & Lifestyle
    @NotNull(message = "El nivel de actividad es obligatorio")
    private ActivityLevel activityLevel;

    @NotNull(message = "El tipo de trabajo es obligatorio")
    private WorkType workType;

    @Min(value = 3, message = "El minimo de horas de sueno es 3")
    @Max(value = 14, message = "El maximo de horas de sueno es 14")
    private Double sleepHoursAverage;

    // Goals & Training
    @NotNull(message = "El objetivo principal es obligatorio")
    private PrimaryGoal primaryGoal;

    @NotNull(message = "El nivel de fitness es obligatorio")
    private String fitnessLevel;

    @NotNull(message = "Los dias de entrenamiento son obligatorios")
    @Min(value = 0, message = "Minimo 0 dias de entrenamiento")
    @Max(value = 7, message = "Maximo 7 dias de entrenamiento")
    private Integer trainingDaysPerWeek;

    @Min(value = 15, message = "Minimo 15 minutos por sesion")
    @Max(value = 180, message = "Maximo 180 minutos por sesion")
    private Integer sessionDurationMinutes;

    private String preferredTrainingTime;

    // Nutrition
    @NotNull(message = "El tipo de dieta es obligatorio")
    private String dietType;

    @Min(value = 1, message = "Minimo 1 comida al dia")
    @Max(value = 8, message = "Maximo 8 comidas al dia")
    private Integer mealsPerDay;

    private List<String> allergies;

    private List<String> injuries;

    private List<String> equipment;

    // Medical History
    private List<String> medicalConditions;

    private String medications;

    private List<String> previousSurgeries;

    @Builder.Default
    private Boolean isPregnant = false;

    @Builder.Default
    private Boolean isBreastfeeding = false;
}
