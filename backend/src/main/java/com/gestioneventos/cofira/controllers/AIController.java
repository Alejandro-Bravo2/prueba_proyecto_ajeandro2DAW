package com.gestioneventos.cofira.controllers;

import com.gestioneventos.cofira.dto.ai.FoodAnalysisDTO;
import com.gestioneventos.cofira.dto.rutinaejercicio.RutinaEjercicioDTO;
import com.gestioneventos.cofira.dto.rutinaalimentacion.RutinaAlimentacionDTO;
import com.gestioneventos.cofira.entities.RutinaAlimentacion;
import com.gestioneventos.cofira.entities.RutinaEjercicio;
import com.gestioneventos.cofira.entities.UserProfile;
import com.gestioneventos.cofira.entities.Usuario;
import com.gestioneventos.cofira.repositories.UserProfileRepository;
import com.gestioneventos.cofira.repositories.UsuarioRepository;
import com.gestioneventos.cofira.services.AIGenerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Generation", description = "Endpoints for AI-powered workout and meal plan generation")
public class AIController {

    @Autowired
    private AIGenerationService aiGenerationService;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/generate-workout-plan")
    @Operation(summary = "Generate personalized weekly workout plan")
    public ResponseEntity<?> generateWorkoutPlan() {
        UserProfile profile = getCurrentUserProfile();
        if (profile == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User profile not found"));
        }

        RutinaEjercicio rutina = aiGenerationService.generateWeeklyWorkoutPlan(profile);
        return ResponseEntity.ok(Map.of(
            "message", "Workout plan generated successfully",
            "rutinaId", rutina.getId()
        ));
    }

    @PostMapping("/generate-meal-plan")
    @Operation(summary = "Generate personalized weekly meal plan")
    public ResponseEntity<?> generateMealPlan() {
        UserProfile profile = getCurrentUserProfile();
        if (profile == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User profile not found"));
        }

        RutinaAlimentacion rutina = aiGenerationService.generateWeeklyMealPlan(profile);
        return ResponseEntity.ok(Map.of(
            "message", "Meal plan generated successfully",
            "rutinaId", rutina.getId()
        ));
    }

    @PostMapping("/analyze-food")
    @Operation(summary = "Analyze food image and return nutritional information")
    public ResponseEntity<FoodAnalysisDTO> analyzeFood(@RequestBody Map<String, String> request) {
        String base64Image = request.get("image");
        if (base64Image == null || base64Image.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        FoodAnalysisDTO analysis = aiGenerationService.analyzeFood(base64Image);
        return ResponseEntity.ok(analysis);
    }

    @PostMapping("/regenerate-plans")
    @Operation(summary = "Regenerate both workout and meal plans for current user")
    public ResponseEntity<?> regeneratePlans() {
        UserProfile profile = getCurrentUserProfile();
        if (profile == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User profile not found"));
        }

        RutinaEjercicio workoutPlan = aiGenerationService.generateWeeklyWorkoutPlan(profile);
        RutinaAlimentacion mealPlan = aiGenerationService.generateWeeklyMealPlan(profile);

        return ResponseEntity.ok(Map.of(
            "message", "Plans regenerated successfully",
            "workoutPlanId", workoutPlan.getId(),
            "mealPlanId", mealPlan.getId()
        ));
    }

    private UserProfile getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username).orElse(null);
        if (usuario == null) {
            return null;
        }

        return userProfileRepository.findByUsuarioId(usuario.getId()).orElse(null);
    }
}
