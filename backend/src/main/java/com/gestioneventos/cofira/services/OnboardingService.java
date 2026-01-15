package com.gestioneventos.cofira.services;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gestioneventos.cofira.dto.onboarding.NutritionTargetsDTO;
import com.gestioneventos.cofira.dto.onboarding.OnboardingRequestDTO;
import com.gestioneventos.cofira.dto.onboarding.OnboardingResponseDTO;
import com.gestioneventos.cofira.entities.UserProfile;
import com.gestioneventos.cofira.entities.Usuario;
import com.gestioneventos.cofira.exceptions.ResourceNotFoundException;
import com.gestioneventos.cofira.repositories.UserProfileRepository;
import com.gestioneventos.cofira.repositories.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final UserProfileRepository userProfileRepository;
    private final UsuarioRepository usuarioRepository;
    private final CalorieCalculationService calorieCalculationService;

    @Transactional
    public OnboardingResponseDTO completeOnboarding(Long usuarioId, OnboardingRequestDTO request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Calcular objetivos nutricionales
        NutritionTargetsDTO targets = calorieCalculationService.calculateNutritionTargets(
                request.getGender(),
                request.getCurrentWeightKg(),
                request.getHeightCm(),
                request.getBirthDate(),
                request.getActivityLevel(),
                request.getPrimaryGoal(),
                request.getIsPregnant(),
                request.getIsBreastfeeding()
        );

        // Crear o actualizar perfil
        UserProfile profile = userProfileRepository.findByUsuarioId(usuarioId)
                .orElse(UserProfile.builder().usuario(usuario).build());

        // Actualizar datos basicos
        profile.setGender(request.getGender());
        profile.setBirthDate(request.getBirthDate());
        profile.setHeightCm(request.getHeightCm());
        profile.setCurrentWeightKg(request.getCurrentWeightKg());
        profile.setTargetWeightKg(request.getTargetWeightKg());

        // Actividad y estilo de vida
        profile.setActivityLevel(request.getActivityLevel());
        profile.setWorkType(request.getWorkType());
        profile.setSleepHoursAverage(request.getSleepHoursAverage());

        // Objetivos y entrenamiento
        profile.setPrimaryGoal(request.getPrimaryGoal());
        profile.setFitnessLevel(request.getFitnessLevel());
        profile.setTrainingDaysPerWeek(request.getTrainingDaysPerWeek());
        profile.setSessionDurationMinutes(request.getSessionDurationMinutes());
        profile.setPreferredTrainingTime(request.getPreferredTrainingTime());

        // Nutricion
        profile.setDietType(request.getDietType());
        profile.setMealsPerDay(request.getMealsPerDay());
        profile.setAllergies(request.getAllergies());
        profile.setInjuries(request.getInjuries());
        profile.setEquipment(request.getEquipment());

        // Historial medico
        profile.setMedicalConditions(request.getMedicalConditions());
        profile.setMedications(request.getMedications());
        profile.setPreviousSurgeries(request.getPreviousSurgeries());
        profile.setIsPregnant(request.getIsPregnant());
        profile.setIsBreastfeeding(request.getIsBreastfeeding());

        // Valores calculados
        profile.setCalculatedBMR(targets.getCalculatedBMR());
        profile.setCalculatedTDEE(targets.getCalculatedTDEE());
        profile.setDailyCalorieTarget(targets.getDailyCalories());
        profile.setProteinTargetGrams(targets.getProteinGrams());
        profile.setCarbsTargetGrams(targets.getCarbsGrams());
        profile.setFatTargetGrams(targets.getFatGrams());
        profile.setFiberTargetGrams(targets.getFiberGrams());

        // Marcar como completado
        LocalDateTime now = LocalDateTime.now();
        profile.setOnboardingCompletedAt(now);
        userProfileRepository.save(profile);

        // Actualizar usuario
        usuario.setIsOnboarded(true);
        usuario.setUserProfile(profile);
        usuarioRepository.save(usuario);

        return OnboardingResponseDTO.builder()
                .userId(usuarioId)
                .message("Onboarding completado exitosamente")
                .isOnboarded(true)
                .onboardingCompletedAt(now)
                .nutritionTargets(targets)
                .build();
    }

    @Transactional(readOnly = true)
    public NutritionTargetsDTO getNutritionTargets(Long usuarioId) {
        UserProfile profile = userProfileRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de usuario no encontrado. Complete el onboarding primero."));

        return NutritionTargetsDTO.builder()
                .calculatedBMR(profile.getCalculatedBMR())
                .calculatedTDEE(profile.getCalculatedTDEE())
                .dailyCalories(profile.getDailyCalorieTarget())
                .proteinGrams(profile.getProteinTargetGrams())
                .carbsGrams(profile.getCarbsTargetGrams())
                .fatGrams(profile.getFatTargetGrams())
                .fiberGrams(profile.getFiberTargetGrams())
                .build();
    }

    @Transactional
    public OnboardingResponseDTO updateProfile(Long usuarioId, OnboardingRequestDTO request) {
        // Reutilizar la logica de completeOnboarding para actualizar
        return completeOnboarding(usuarioId, request);
    }

    @Transactional(readOnly = true)
    public boolean isOnboardingComplete(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .map(u -> Boolean.TRUE.equals(u.getIsOnboarded()))
                .orElse(false);
    }
}
