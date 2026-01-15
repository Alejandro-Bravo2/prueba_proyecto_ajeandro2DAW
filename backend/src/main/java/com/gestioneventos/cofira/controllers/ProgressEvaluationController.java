package com.gestioneventos.cofira.controllers;

import com.gestioneventos.cofira.dto.evaluacion.*;
import com.gestioneventos.cofira.entities.RegistroEntrenamiento;
import com.gestioneventos.cofira.entities.RegistroNutricion;
import com.gestioneventos.cofira.entities.Usuario;
import com.gestioneventos.cofira.repositories.UsuarioRepository;
import com.gestioneventos.cofira.services.ProgressEvaluationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progress-evaluation")
@Tag(name = "Progress Evaluation", description = "Endpoints for progress tracking and AI-powered evaluation")
public class ProgressEvaluationController {

    @Autowired
    private ProgressEvaluationService evaluationService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // ==========================================
    // WORKOUT LOGGING
    // ==========================================

    @PostMapping("/training/log")
    @Operation(summary = "Log a completed workout/exercise")
    public ResponseEntity<?> logWorkout(@Valid @RequestBody RegistrarEntrenamientoDTO dto) {
        Long usuarioId = getCurrentUserId();
        if (usuarioId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario no autenticado"));
        }

        RegistroEntrenamiento registro = evaluationService.registrarEntrenamiento(usuarioId, dto);

        // Trigger async evaluation
        evaluationService.evaluateTrainingProgressAsync(usuarioId);

        return ResponseEntity.ok(Map.of(
            "message", "Entrenamiento registrado correctamente",
            "id", registro.getId(),
            "volumen", registro.calcularVolumen()
        ));
    }

    @GetMapping("/training/history")
    @Operation(summary = "Get workout history for a date range")
    public ResponseEntity<List<Map<String, Object>>> getWorkoutHistory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        Long usuarioId = getCurrentUserId();
        if (usuarioId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<RegistroEntrenamiento> registros = evaluationService.getWorkoutHistory(usuarioId, from, to);

        List<Map<String, Object>> result = registros.stream()
            .map(r -> Map.ofEntries(
                Map.entry("id", (Object) r.getId()),
                Map.entry("fecha", r.getFecha().toString()),
                Map.entry("ejercicioId", r.getEjercicio().getId()),
                Map.entry("nombreEjercicio", r.getEjercicio().getNombreEjercicio()),
                Map.entry("grupoMuscular", r.getEjercicio().getGrupoMuscular() != null ? r.getEjercicio().getGrupoMuscular() : ""),
                Map.entry("seriesCompletadas", r.getSeriesCompletadas()),
                Map.entry("repeticionesCompletadas", r.getRepeticionesCompletadas()),
                Map.entry("pesoUtilizado", r.getPesoUtilizado()),
                Map.entry("volumen", r.calcularVolumen()),
                Map.entry("nivelEsfuerzo", r.getNivelEsfuerzo() != null ? r.getNivelEsfuerzo().name() : ""),
                Map.entry("notas", r.getNotas() != null ? r.getNotas() : "")
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/training/exercise/{ejercicioId}/progress")
    @Operation(summary = "Get strength progress for a specific exercise")
    public ResponseEntity<EjercicioProgresoDTO> getExerciseProgress(@PathVariable Long ejercicioId) {
        Long usuarioId = getCurrentUserId();
        if (usuarioId == null) {
            return ResponseEntity.badRequest().build();
        }

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(7);
        LocalDate prevWeekStart = today.minusDays(14);

        List<RegistroEntrenamiento> current = evaluationService.getWorkoutHistory(usuarioId, weekStart, today)
            .stream()
            .filter(r -> r.getEjercicio().getId().equals(ejercicioId))
            .collect(Collectors.toList());

        List<RegistroEntrenamiento> previous = evaluationService.getWorkoutHistory(usuarioId, prevWeekStart, weekStart)
            .stream()
            .filter(r -> r.getEjercicio().getId().equals(ejercicioId))
            .collect(Collectors.toList());

        if (current.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        RegistroEntrenamiento sample = current.get(0);

        double currentMax = current.stream()
            .mapToDouble(RegistroEntrenamiento::getPesoUtilizado)
            .max().orElse(0);

        double previousMax = previous.stream()
            .mapToDouble(RegistroEntrenamiento::getPesoUtilizado)
            .max().orElse(0);

        double improvement = previousMax > 0
            ? ((currentMax - previousMax) / previousMax) * 100
            : 0;

        EjercicioProgresoDTO dto = EjercicioProgresoDTO.builder()
            .ejercicioId(ejercicioId)
            .nombreEjercicio(sample.getEjercicio().getNombreEjercicio())
            .grupoMuscular(sample.getEjercicio().getGrupoMuscular())
            .pesoActual(currentMax)
            .pesoAnterior(previousMax)
            .mejoraPorcentaje(Math.round(improvement * 100.0) / 100.0)
            .registrosSemana(current.size())
            .tendencia(improvement > 1 ? "MEJORANDO" : improvement < -1 ? "RETROCEDIENDO" : "ESTABLE")
            .build();

        return ResponseEntity.ok(dto);
    }

    // ==========================================
    // NUTRITION LOGGING
    // ==========================================

    @PostMapping("/nutrition/log")
    @Operation(summary = "Log a meal/nutrition entry")
    public ResponseEntity<?> logNutrition(@Valid @RequestBody RegistrarNutricionDTO dto) {
        Long usuarioId = getCurrentUserId();
        if (usuarioId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario no autenticado"));
        }

        RegistroNutricion registro = evaluationService.registrarNutricion(usuarioId, dto);

        // Trigger async evaluation
        evaluationService.evaluateNutritionProgressAsync(usuarioId);

        return ResponseEntity.ok(Map.of(
            "message", "Nutricion registrada correctamente",
            "id", registro.getId()
        ));
    }

    @GetMapping("/nutrition/history")
    @Operation(summary = "Get nutrition history for a date range")
    public ResponseEntity<List<Map<String, Object>>> getNutritionHistory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        Long usuarioId = getCurrentUserId();
        if (usuarioId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<RegistroNutricion> registros = evaluationService.getNutritionHistory(usuarioId, from, to);

        List<Map<String, Object>> result = registros.stream()
            .map(r -> Map.of(
                "id", (Object) r.getId(),
                "fecha", r.getFecha().toString(),
                "tipoComida", r.getTipoComida().name(),
                "caloriasConsumidas", r.getCaloriasConsumidas() != null ? r.getCaloriasConsumidas() : 0,
                "proteinasConsumidas", r.getProteinasConsumidas() != null ? r.getProteinasConsumidas() : 0,
                "carbohidratosConsumidos", r.getCarbohidratosConsumidos() != null ? r.getCarbohidratosConsumidos() : 0,
                "grasasConsumidas", r.getGrasasConsumidas() != null ? r.getGrasasConsumidas() : 0,
                "descripcionComida", r.getDescripcionComida() != null ? r.getDescripcionComida() : ""
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/nutrition/daily-summary")
    @Operation(summary = "Get nutrition summary for a specific date")
    public ResponseEntity<Map<String, Object>> getDailyNutritionSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        Long usuarioId = getCurrentUserId();
        if (usuarioId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<RegistroNutricion> registros = evaluationService.getNutritionHistory(usuarioId, date, date);

        double totalCalorias = registros.stream()
            .filter(r -> r.getCaloriasConsumidas() != null)
            .mapToDouble(RegistroNutricion::getCaloriasConsumidas)
            .sum();

        double totalProteinas = registros.stream()
            .filter(r -> r.getProteinasConsumidas() != null)
            .mapToDouble(RegistroNutricion::getProteinasConsumidas)
            .sum();

        double totalCarbs = registros.stream()
            .filter(r -> r.getCarbohidratosConsumidos() != null)
            .mapToDouble(RegistroNutricion::getCarbohidratosConsumidos)
            .sum();

        double totalGrasas = registros.stream()
            .filter(r -> r.getGrasasConsumidas() != null)
            .mapToDouble(RegistroNutricion::getGrasasConsumidas)
            .sum();

        return ResponseEntity.ok(Map.of(
            "fecha", date.toString(),
            "totalCalorias", totalCalorias,
            "totalProteinas", totalProteinas,
            "totalCarbohidratos", totalCarbs,
            "totalGrasas", totalGrasas,
            "registros", registros.size()
        ));
    }

    // ==========================================
    // EVALUATIONS
    // ==========================================

    @GetMapping("/evaluate/training")
    @Operation(summary = "Get current training progress evaluation")
    public ResponseEntity<EvaluacionProgresoDTO> evaluateTraining() {
        Long usuarioId = getCurrentUserId();
        if (usuarioId == null) {
            return ResponseEntity.badRequest().build();
        }

        EvaluacionProgresoDTO evaluation = evaluationService.evaluateTrainingProgress(usuarioId);
        return ResponseEntity.ok(evaluation);
    }

    @GetMapping("/evaluate/nutrition")
    @Operation(summary = "Get current nutrition progress evaluation")
    public ResponseEntity<EvaluacionProgresoDTO> evaluateNutrition() {
        Long usuarioId = getCurrentUserId();
        if (usuarioId == null) {
            return ResponseEntity.badRequest().build();
        }

        EvaluacionProgresoDTO evaluation = evaluationService.evaluateNutritionProgress(usuarioId);
        return ResponseEntity.ok(evaluation);
    }

    @GetMapping("/evaluate/full")
    @Operation(summary = "Get full progress evaluation (training + nutrition)")
    public ResponseEntity<EvaluacionProgresoDTO> evaluateFull() {
        Long usuarioId = getCurrentUserId();
        if (usuarioId == null) {
            return ResponseEntity.badRequest().build();
        }

        EvaluacionProgresoDTO evaluation = evaluationService.evaluateFullProgress(usuarioId);
        return ResponseEntity.ok(evaluation);
    }

    @GetMapping("/evaluate/history")
    @Operation(summary = "Get evaluation history")
    public ResponseEntity<List<EvaluacionProgresoDTO>> getEvaluationHistory(
            @RequestParam(defaultValue = "10") int limit) {

        Long usuarioId = getCurrentUserId();
        if (usuarioId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<EvaluacionProgresoDTO> history = evaluationService.getEvaluationHistory(usuarioId, limit);
        return ResponseEntity.ok(history);
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username).orElse(null);
        return usuario != null ? usuario.getId() : null;
    }
}
