package com.gestioneventos.cofira.entities;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gestioneventos.cofira.enums.ActivityLevel;
import com.gestioneventos.cofira.enums.Gender;
import com.gestioneventos.cofira.enums.PrimaryGoal;
import com.gestioneventos.cofira.enums.WorkType;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "user_profile")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    // Basic Physical Data
    @Enumerated(EnumType.STRING)
    private Gender gender;

    private LocalDate birthDate;

    private Double heightCm;

    private Double currentWeightKg;

    private Double targetWeightKg;

    // Activity & Lifestyle
    @Enumerated(EnumType.STRING)
    private ActivityLevel activityLevel;

    @Enumerated(EnumType.STRING)
    private WorkType workType;

    private Double sleepHoursAverage;

    // Goals & Training
    @Enumerated(EnumType.STRING)
    private PrimaryGoal primaryGoal;

    private String fitnessLevel;

    private Integer trainingDaysPerWeek;

    private Integer sessionDurationMinutes;

    private String preferredTrainingTime;

    // Nutrition
    private String dietType;

    private Integer mealsPerDay;

    @ElementCollection
    @CollectionTable(name = "user_profile_allergies", joinColumns = @JoinColumn(name = "user_profile_id"))
    @Column(name = "allergy")
    private List<String> allergies;

    @ElementCollection
    @CollectionTable(name = "user_profile_injuries", joinColumns = @JoinColumn(name = "user_profile_id"))
    @Column(name = "injury")
    private List<String> injuries;

    @ElementCollection
    @CollectionTable(name = "user_profile_equipment", joinColumns = @JoinColumn(name = "user_profile_id"))
    @Column(name = "equipment")
    private List<String> equipment;

    // Medical History
    @ElementCollection
    @CollectionTable(name = "user_profile_medical_conditions", joinColumns = @JoinColumn(name = "user_profile_id"))
    @Column(name = "condition")
    private List<String> medicalConditions;

    @Column(length = 1000)
    private String medications;

    @ElementCollection
    @CollectionTable(name = "user_profile_surgeries", joinColumns = @JoinColumn(name = "user_profile_id"))
    @Column(name = "surgery")
    private List<String> previousSurgeries;

    @Builder.Default
    private Boolean isPregnant = false;

    @Builder.Default
    private Boolean isBreastfeeding = false;

    // Calculated Values (updated when profile changes)
    private Double calculatedBMR;

    private Double calculatedTDEE;

    private Double dailyCalorieTarget;

    private Double proteinTargetGrams;

    private Double carbsTargetGrams;

    private Double fatTargetGrams;

    private Double fiberTargetGrams;

    // Timestamps
    private LocalDateTime onboardingCompletedAt;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserProfile that = (UserProfile) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
