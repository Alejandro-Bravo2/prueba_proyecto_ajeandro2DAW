package com.gestioneventos.cofira.dto.onboarding;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingResponseDTO {
    private Long userId;
    private String message;
    private Boolean isOnboarded;
    private LocalDateTime onboardingCompletedAt;
    private NutritionTargetsDTO nutritionTargets;
}
