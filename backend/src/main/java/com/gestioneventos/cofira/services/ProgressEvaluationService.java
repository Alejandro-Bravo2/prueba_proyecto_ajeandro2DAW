package com.gestioneventos.cofira.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gestioneventos.cofira.dto.evaluacion.*;
import com.gestioneventos.cofira.entities.*;
import com.gestioneventos.cofira.enums.*;
import com.gestioneventos.cofira.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProgressEvaluationService {

    private static final Logger logger = LoggerFactory.getLogger(ProgressEvaluationService.class);
    private static final double IMPROVEMENT_THRESHOLD = 1.0; // 1% improvement threshold
    private static final int PLATEAU_WEEKS = 3; // Weeks without improvement to consider plateau

    @Autowired
    private RegistroEntrenamientoRepository entrenamientoRepo;

    @Autowired
    private RegistroNutricionRepository nutricionRepo;

    @Autowired
    private EvaluacionProgresoRepository evaluacionRepo;

    @Autowired
    private UserProfileRepository userProfileRepo;

    @Autowired
    private UsuarioRepository usuarioRepo;

    @Autowired
    private EjerciciosRepository ejerciciosRepo;

    @Autowired
    private AIFeedbackService aiFeedbackService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==========================================
    // WORKOUT LOGGING
    // ==========================================

    @Transactional
    public RegistroEntrenamiento registrarEntrenamiento(Long usuarioId, RegistrarEntrenamientoDTO dto) {
        Usuario usuario = usuarioRepo.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Ejercicios ejercicio = ejerciciosRepo.findById(dto.getEjercicioId())
            .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        NivelEsfuerzo nivelEsfuerzo = null;
        if (dto.getNivelEsfuerzo() != null && !dto.getNivelEsfuerzo().isEmpty()) {
            try {
                nivelEsfuerzo = NivelEsfuerzo.valueOf(dto.getNivelEsfuerzo());
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid nivel esfuerzo: {}", dto.getNivelEsfuerzo());
            }
        }

        RegistroEntrenamiento registro = RegistroEntrenamiento.builder()
            .usuario(usuario)
            .ejercicio(ejercicio)
            .fecha(dto.getFecha())
            .seriesCompletadas(dto.getSeriesCompletadas())
            .repeticionesCompletadas(dto.getRepeticionesCompletadas())
            .pesoUtilizado(dto.getPesoUtilizado())
            .tiempoDescansoReal(dto.getTiempoDescansoReal())
            .duracionMinutos(dto.getDuracionMinutos())
            .nivelEsfuerzo(nivelEsfuerzo)
            .notas(dto.getNotas())
            .completado(true)
            .build();

        return entrenamientoRepo.save(registro);
    }

    public List<RegistroEntrenamiento> getWorkoutHistory(Long usuarioId, LocalDate from, LocalDate to) {
        return entrenamientoRepo.findByUsuarioIdAndFechaBetween(usuarioId, from, to);
    }

    // ==========================================
    // NUTRITION LOGGING
    // ==========================================

    @Transactional
    public RegistroNutricion registrarNutricion(Long usuarioId, RegistrarNutricionDTO dto) {
        Usuario usuario = usuarioRepo.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        TipoComida tipoComida;
        try {
            tipoComida = TipoComida.valueOf(dto.getTipoComida());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Tipo de comida invalido: " + dto.getTipoComida());
        }

        RegistroNutricion registro = RegistroNutricion.builder()
            .usuario(usuario)
            .fecha(dto.getFecha())
            .tipoComida(tipoComida)
            .caloriasConsumidas(dto.getCaloriasConsumidas())
            .proteinasConsumidas(dto.getProteinasConsumidas())
            .carbohidratosConsumidos(dto.getCarbohidratosConsumidos())
            .grasasConsumidas(dto.getGrasasConsumidas())
            .fibraConsumida(dto.getFibraConsumida())
            .aguaConsumidaMl(dto.getAguaConsumidaMl())
            .descripcionComida(dto.getDescripcionComida())
            .esComidaPlaneada(dto.getEsComidaPlaneada() != null ? dto.getEsComidaPlaneada() : false)
            .build();

        return nutricionRepo.save(registro);
    }

    public List<RegistroNutricion> getNutritionHistory(Long usuarioId, LocalDate from, LocalDate to) {
        return nutricionRepo.findByUsuarioIdAndFechaBetween(usuarioId, from, to);
    }

    // ==========================================
    // TRAINING EVALUATION
    // ==========================================

    @Transactional
    public EvaluacionProgresoDTO evaluateTrainingProgress(Long usuarioId) {
        UserProfile profile = getUserProfile(usuarioId);
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(7);
        LocalDate prevWeekStart = today.minusDays(14);

        // Get current and previous week data
        List<RegistroEntrenamiento> currentWeek = entrenamientoRepo
            .findByUsuarioIdAndFechaBetween(usuarioId, weekStart, today);
        List<RegistroEntrenamiento> previousWeek = entrenamientoRepo
            .findByUsuarioIdAndFechaBetween(usuarioId, prevWeekStart, weekStart);

        // Calculate metrics
        EntrenamientoResumenDTO resumen = calculateTrainingMetrics(currentWeek, previousWeek, profile);

        // Detect plateau
        boolean hasPlateau = detectPlateau(usuarioId);
        resumen.setHayPlateau(hasPlateau);
        if (hasPlateau) {
            resumen.setMensajePlateau("No se ha detectado mejora significativa en las ultimas " + PLATEAU_WEEKS + " semanas");
        }

        // Determine trend
        TendenciaProgreso trend = determineTrendTraining(resumen);

        // Generate AI feedback
        String feedback = aiFeedbackService.generateTrainingFeedback(resumen, profile, trend);

        // Build and save evaluation
        EvaluacionProgreso evaluation = buildTrainingEvaluation(usuarioId, resumen, trend, feedback);
        evaluation = evaluacionRepo.save(evaluation);

        return mapToDTO(evaluation, resumen, null);
    }

    private EntrenamientoResumenDTO calculateTrainingMetrics(
            List<RegistroEntrenamiento> current,
            List<RegistroEntrenamiento> previous,
            UserProfile profile) {

        // Volume calculation
        double currentVolume = current.stream()
            .mapToDouble(RegistroEntrenamiento::calcularVolumen)
            .sum();

        double previousVolume = previous.stream()
            .mapToDouble(RegistroEntrenamiento::calcularVolumen)
            .sum();

        // Max weight average
        double maxWeight = current.stream()
            .mapToDouble(RegistroEntrenamiento::getPesoUtilizado)
            .max().orElse(0.0);

        // Improvement percentage
        double improvement = previousVolume > 0
            ? ((currentVolume - previousVolume) / previousVolume) * 100
            : 0.0;

        // Consistency
        int completed = (int) current.stream()
            .map(r -> r.getFecha())
            .distinct()
            .count();

        int planned = profile.getTrainingDaysPerWeek() != null
            ? profile.getTrainingDaysPerWeek()
            : completed;

        double consistency = planned > 0 ? ((double) completed / planned) * 100 : 0;

        // Top exercises progress
        List<EjercicioProgresoDTO> topExercises = calculateTopExercisesProgress(
            current, previous, profile.getUsuario().getId());

        return EntrenamientoResumenDTO.builder()
            .volumenTotal(Math.round(currentVolume * 100.0) / 100.0)
            .pesoMaximoPromedio(Math.round(maxWeight * 100.0) / 100.0)
            .mejoraFuerzaPorcentaje(Math.round(improvement * 100.0) / 100.0)
            .entrenamientosCompletados(completed)
            .entrenamientosPlanificados(planned)
            .consistenciaPorcentaje(Math.round(consistency * 100.0) / 100.0)
            .ejerciciosDestacados(topExercises)
            .hayPlateau(false)
            .build();
    }

    private List<EjercicioProgresoDTO> calculateTopExercisesProgress(
            List<RegistroEntrenamiento> current,
            List<RegistroEntrenamiento> previous,
            Long usuarioId) {

        // Group by exercise
        Map<Long, List<RegistroEntrenamiento>> currentByExercise = current.stream()
            .collect(Collectors.groupingBy(r -> r.getEjercicio().getId()));

        Map<Long, List<RegistroEntrenamiento>> previousByExercise = previous.stream()
            .collect(Collectors.groupingBy(r -> r.getEjercicio().getId()));

        List<EjercicioProgresoDTO> progress = new ArrayList<>();

        for (Map.Entry<Long, List<RegistroEntrenamiento>> entry : currentByExercise.entrySet()) {
            Long exerciseId = entry.getKey();
            List<RegistroEntrenamiento> currentLogs = entry.getValue();
            List<RegistroEntrenamiento> previousLogs = previousByExercise.getOrDefault(exerciseId, Collections.emptyList());

            if (currentLogs.isEmpty()) continue;

            RegistroEntrenamiento sample = currentLogs.get(0);

            double currentMax = currentLogs.stream()
                .mapToDouble(RegistroEntrenamiento::getPesoUtilizado)
                .max().orElse(0);

            double previousMax = previousLogs.stream()
                .mapToDouble(RegistroEntrenamiento::getPesoUtilizado)
                .max().orElse(0);

            double currentVol = currentLogs.stream()
                .mapToDouble(RegistroEntrenamiento::calcularVolumen)
                .sum();

            double previousVol = previousLogs.stream()
                .mapToDouble(RegistroEntrenamiento::calcularVolumen)
                .sum();

            double improvement = previousMax > 0
                ? ((currentMax - previousMax) / previousMax) * 100
                : 0;

            TendenciaProgreso trend = improvement > IMPROVEMENT_THRESHOLD
                ? TendenciaProgreso.MEJORANDO
                : improvement < -IMPROVEMENT_THRESHOLD
                    ? TendenciaProgreso.RETROCEDIENDO
                    : TendenciaProgreso.ESTABLE;

            progress.add(EjercicioProgresoDTO.builder()
                .ejercicioId(exerciseId)
                .nombreEjercicio(sample.getEjercicio().getNombreEjercicio())
                .grupoMuscular(sample.getEjercicio().getGrupoMuscular())
                .pesoActual(currentMax)
                .pesoAnterior(previousMax)
                .mejoraPorcentaje(Math.round(improvement * 100.0) / 100.0)
                .volumenActual(currentVol)
                .volumenAnterior(previousVol)
                .tendencia(trend.name())
                .registrosSemana(currentLogs.size())
                .build());
        }

        // Sort by improvement (best first) and take top 5
        return progress.stream()
            .sorted((a, b) -> Double.compare(b.getMejoraPorcentaje(), a.getMejoraPorcentaje()))
            .limit(5)
            .collect(Collectors.toList());
    }

    private boolean detectPlateau(Long usuarioId) {
        List<EvaluacionProgreso> recentEvals = evaluacionRepo
            .findTop3ByUsuarioIdOrderByFechaEvaluacionDesc(usuarioId);

        if (recentEvals.size() < PLATEAU_WEEKS) return false;

        return recentEvals.stream()
            .allMatch(e -> e.getTendenciaEntrenamiento() == TendenciaProgreso.ESTABLE
                || (e.getMejoraFuerzaPorcentaje() != null && e.getMejoraFuerzaPorcentaje() < IMPROVEMENT_THRESHOLD));
    }

    private TendenciaProgreso determineTrendTraining(EntrenamientoResumenDTO resumen) {
        if (resumen.getHayPlateau()) {
            return TendenciaProgreso.PLATEAU;
        }

        double improvement = resumen.getMejoraFuerzaPorcentaje();

        if (improvement > IMPROVEMENT_THRESHOLD) {
            return TendenciaProgreso.MEJORANDO;
        } else if (improvement < -IMPROVEMENT_THRESHOLD) {
            return TendenciaProgreso.RETROCEDIENDO;
        }
        return TendenciaProgreso.ESTABLE;
    }

    // ==========================================
    // NUTRITION EVALUATION
    // ==========================================

    @Transactional
    public EvaluacionProgresoDTO evaluateNutritionProgress(Long usuarioId) {
        UserProfile profile = getUserProfile(usuarioId);
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(7);

        List<RegistroNutricion> records = nutricionRepo
            .findByUsuarioIdAndFechaBetween(usuarioId, weekStart, today);

        NutricionResumenDTO resumen = calculateNutritionMetrics(records, profile);
        TendenciaProgreso trend = determineTrendNutrition(resumen, profile);
        String feedback = aiFeedbackService.generateNutritionFeedback(resumen, profile, trend);

        EvaluacionProgreso evaluation = buildNutritionEvaluation(usuarioId, resumen, trend, feedback);
        evaluation = evaluacionRepo.save(evaluation);

        return mapToDTO(evaluation, null, resumen);
    }

    private NutricionResumenDTO calculateNutritionMetrics(
            List<RegistroNutricion> records,
            UserProfile profile) {

        if (records.isEmpty()) {
            return NutricionResumenDTO.builder()
                .caloriasMeta(profile.getDailyCalorieTarget())
                .proteinasMeta(profile.getProteinTargetGrams())
                .carbohidratosMeta(profile.getCarbsTargetGrams())
                .grasasMeta(profile.getFatTargetGrams())
                .patronesDetectados(List.of("SIN_DATOS_SUFICIENTES"))
                .build();
        }

        // Count distinct days
        int days = (int) records.stream()
            .map(RegistroNutricion::getFecha)
            .distinct()
            .count();

        days = Math.max(days, 1);

        // Sum totals
        double totalCalorias = records.stream()
            .filter(r -> r.getCaloriasConsumidas() != null)
            .mapToDouble(RegistroNutricion::getCaloriasConsumidas)
            .sum();

        double totalProteinas = records.stream()
            .filter(r -> r.getProteinasConsumidas() != null)
            .mapToDouble(RegistroNutricion::getProteinasConsumidas)
            .sum();

        double totalCarbs = records.stream()
            .filter(r -> r.getCarbohidratosConsumidos() != null)
            .mapToDouble(RegistroNutricion::getCarbohidratosConsumidos)
            .sum();

        double totalGrasas = records.stream()
            .filter(r -> r.getGrasasConsumidas() != null)
            .mapToDouble(RegistroNutricion::getGrasasConsumidas)
            .sum();

        double totalAgua = records.stream()
            .filter(r -> r.getAguaConsumidaMl() != null)
            .mapToDouble(RegistroNutricion::getAguaConsumidaMl)
            .sum();

        // Averages
        double avgCalorias = totalCalorias / days;
        double avgProteinas = totalProteinas / days;
        double avgCarbs = totalCarbs / days;
        double avgGrasas = totalGrasas / days;
        double avgAgua = totalAgua / days;

        // Targets
        double targetCalorias = profile.getDailyCalorieTarget() != null ? profile.getDailyCalorieTarget() : 2000;
        double targetProteinas = profile.getProteinTargetGrams() != null ? profile.getProteinTargetGrams() : 100;
        double targetCarbs = profile.getCarbsTargetGrams() != null ? profile.getCarbsTargetGrams() : 250;
        double targetGrasas = profile.getFatTargetGrams() != null ? profile.getFatTargetGrams() : 65;

        // Adherence (100% = perfect, lower or higher = off target)
        double adherenciaCalorias = targetCalorias > 0
            ? Math.max(0, 100 - Math.abs((avgCalorias - targetCalorias) / targetCalorias * 100))
            : 0;

        double adherenciaProteinas = targetProteinas > 0
            ? Math.min(100, (avgProteinas / targetProteinas) * 100)
            : 0;

        // Detect patterns
        List<String> patterns = detectNutritionPatterns(records, profile);

        return NutricionResumenDTO.builder()
            .caloriasPromedio((double) Math.round(avgCalorias))
            .caloriasMeta(targetCalorias)
            .adherenciaCalorias(Math.round(adherenciaCalorias * 10.0) / 10.0)
            .proteinasPromedio(Math.round(avgProteinas * 10.0) / 10.0)
            .proteinasMeta(targetProteinas)
            .adherenciaProteinas(Math.round(adherenciaProteinas * 10.0) / 10.0)
            .carbohidratosPromedio(Math.round(avgCarbs * 10.0) / 10.0)
            .carbohidratosMeta(targetCarbs)
            .grasasPromedio(Math.round(avgGrasas * 10.0) / 10.0)
            .grasasMeta(targetGrasas)
            .aguaPromedio((double) Math.round(avgAgua))
            .patronesDetectados(patterns)
            .build();
    }

    private List<String> detectNutritionPatterns(List<RegistroNutricion> records, UserProfile profile) {
        List<String> patterns = new ArrayList<>();

        if (records.isEmpty()) {
            patterns.add("SIN_DATOS_SUFICIENTES");
            return patterns;
        }

        double targetCalorias = profile.getDailyCalorieTarget() != null ? profile.getDailyCalorieTarget() : 2000;
        double targetProteinas = profile.getProteinTargetGrams() != null ? profile.getProteinTargetGrams() : 100;

        // Group by date
        Map<LocalDate, Double> caloriasPorDia = records.stream()
            .filter(r -> r.getCaloriasConsumidas() != null)
            .collect(Collectors.groupingBy(
                RegistroNutricion::getFecha,
                Collectors.summingDouble(RegistroNutricion::getCaloriasConsumidas)
            ));

        long daysUnderTarget = caloriasPorDia.values().stream()
            .filter(cal -> cal < targetCalorias * 0.8)
            .count();

        long daysOverTarget = caloriasPorDia.values().stream()
            .filter(cal -> cal > targetCalorias * 1.2)
            .count();

        if (daysUnderTarget > caloriasPorDia.size() / 2) {
            patterns.add("BAJO_CONSUMO_FRECUENTE");
        }

        if (daysOverTarget > caloriasPorDia.size() / 2) {
            patterns.add("SOBRE_CONSUMO_FRECUENTE");
        }

        // Protein check
        double avgProteinas = records.stream()
            .filter(r -> r.getProteinasConsumidas() != null)
            .mapToDouble(RegistroNutricion::getProteinasConsumidas)
            .average().orElse(0);

        if (avgProteinas < targetProteinas * 0.7) {
            patterns.add("PROTEINAS_INSUFICIENTES");
        }

        // Water check (2000ml recommended daily)
        double avgAgua = records.stream()
            .filter(r -> r.getAguaConsumidaMl() != null)
            .mapToDouble(RegistroNutricion::getAguaConsumidaMl)
            .average().orElse(0);

        if (avgAgua < 1500) {
            patterns.add("HIDRATACION_BAJA");
        }

        return patterns;
    }

    private TendenciaProgreso determineTrendNutrition(NutricionResumenDTO resumen, UserProfile profile) {
        double adherencia = resumen.getAdherenciaCalorias() != null ? resumen.getAdherenciaCalorias() : 0;
        double adherenciaProteinas = resumen.getAdherenciaProteinas() != null ? resumen.getAdherenciaProteinas() : 0;

        // Good adherence = improving
        if (adherencia >= 85 && adherenciaProteinas >= 80) {
            return TendenciaProgreso.MEJORANDO;
        } else if (adherencia >= 70 || adherenciaProteinas >= 70) {
            return TendenciaProgreso.ESTABLE;
        }
        return TendenciaProgreso.RETROCEDIENDO;
    }

    // ==========================================
    // FULL EVALUATION
    // ==========================================

    @Transactional
    public EvaluacionProgresoDTO evaluateFullProgress(Long usuarioId) {
        EvaluacionProgresoDTO trainingEval = evaluateTrainingProgress(usuarioId);
        EvaluacionProgresoDTO nutritionEval = evaluateNutritionProgress(usuarioId);

        // Merge evaluations
        return EvaluacionProgresoDTO.builder()
            .fechaEvaluacion(LocalDate.now())
            .tipoEvaluacion(TipoEvaluacion.INTEGRAL.name())
            .entrenamientoResumen(trainingEval.getEntrenamientoResumen())
            .nutricionResumen(nutritionEval.getNutricionResumen())
            .feedbackIA(trainingEval.getFeedbackIA() + "\n\n" + nutritionEval.getFeedbackIA())
            .recomendaciones(mergeRecommendations(trainingEval.getRecomendaciones(), nutritionEval.getRecomendaciones()))
            .logrosDestacados(mergeAchievements(trainingEval.getLogrosDestacados(), nutritionEval.getLogrosDestacados()))
            .tendenciaEntrenamiento(trainingEval.getTendenciaEntrenamiento())
            .tendenciaNutricion(nutritionEval.getTendenciaNutricion())
            .build();
    }

    @Async
    public void evaluateTrainingProgressAsync(Long usuarioId) {
        try {
            evaluateTrainingProgress(usuarioId);
        } catch (Exception e) {
            logger.error("Error in async training evaluation for user {}: {}", usuarioId, e.getMessage());
        }
    }

    @Async
    public void evaluateNutritionProgressAsync(Long usuarioId) {
        try {
            evaluateNutritionProgress(usuarioId);
        } catch (Exception e) {
            logger.error("Error in async nutrition evaluation for user {}: {}", usuarioId, e.getMessage());
        }
    }

    // ==========================================
    // EVALUATION HISTORY
    // ==========================================

    public List<EvaluacionProgresoDTO> getEvaluationHistory(Long usuarioId, int limit) {
        Page<EvaluacionProgreso> page = evaluacionRepo
            .findByUsuarioIdOrderByFechaEvaluacionDesc(usuarioId, PageRequest.of(0, limit));

        return page.getContent().stream()
            .map(e -> mapToDTO(e, null, null))
            .collect(Collectors.toList());
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private UserProfile getUserProfile(Long usuarioId) {
        return userProfileRepo.findByUsuarioId(usuarioId)
            .orElseThrow(() -> new RuntimeException("UserProfile no encontrado para usuario: " + usuarioId));
    }

    private EvaluacionProgreso buildTrainingEvaluation(
            Long usuarioId,
            EntrenamientoResumenDTO resumen,
            TendenciaProgreso trend,
            String feedback) {

        Usuario usuario = usuarioRepo.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<String> recommendations = extractRecommendations(feedback);
        List<String> achievements = extractAchievements(feedback);

        return EvaluacionProgreso.builder()
            .usuario(usuario)
            .fechaEvaluacion(LocalDate.now())
            .tipoEvaluacion(TipoEvaluacion.ENTRENAMIENTO)
            .volumenTotalSemana(resumen.getVolumenTotal())
            .pesoMaximoPromedio(resumen.getPesoMaximoPromedio())
            .mejoraFuerzaPorcentaje(resumen.getMejoraFuerzaPorcentaje())
            .entrenamientosCompletados(resumen.getEntrenamientosCompletados())
            .entrenamientosPlanificados(resumen.getEntrenamientosPlanificados())
            .consistenciaEntrenamiento(resumen.getConsistenciaPorcentaje())
            .tendenciaEntrenamiento(trend)
            .hayPlateau(resumen.getHayPlateau())
            .feedbackIA(feedback)
            .recomendaciones(serializeList(recommendations))
            .logrosDestacados(serializeList(achievements))
            .build();
    }

    private EvaluacionProgreso buildNutritionEvaluation(
            Long usuarioId,
            NutricionResumenDTO resumen,
            TendenciaProgreso trend,
            String feedback) {

        Usuario usuario = usuarioRepo.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<String> recommendations = extractRecommendations(feedback);
        List<String> achievements = extractAchievements(feedback);

        return EvaluacionProgreso.builder()
            .usuario(usuario)
            .fechaEvaluacion(LocalDate.now())
            .tipoEvaluacion(TipoEvaluacion.NUTRICION)
            .caloriasPromedioSemana(resumen.getCaloriasPromedio())
            .adherenciaCaloriasPorcentaje(resumen.getAdherenciaCalorias())
            .proteinasPromedioSemana(resumen.getProteinasPromedio())
            .adherenciaProteinasPorcentaje(resumen.getAdherenciaProteinas())
            .carbohidratosPromedioSemana(resumen.getCarbohidratosPromedio())
            .grasasPromedioSemana(resumen.getGrasasPromedio())
            .aguaPromedioSemana(resumen.getAguaPromedio())
            .tendenciaNutricion(trend)
            .patronesDetectados(serializeList(resumen.getPatronesDetectados()))
            .feedbackIA(feedback)
            .recomendaciones(serializeList(recommendations))
            .logrosDestacados(serializeList(achievements))
            .build();
    }

    private EvaluacionProgresoDTO mapToDTO(
            EvaluacionProgreso entity,
            EntrenamientoResumenDTO entrenamientoResumen,
            NutricionResumenDTO nutricionResumen) {

        return EvaluacionProgresoDTO.builder()
            .id(entity.getId())
            .fechaEvaluacion(entity.getFechaEvaluacion())
            .tipoEvaluacion(entity.getTipoEvaluacion().name())
            .entrenamientoResumen(entrenamientoResumen)
            .nutricionResumen(nutricionResumen)
            .feedbackIA(entity.getFeedbackIA())
            .recomendaciones(deserializeList(entity.getRecomendaciones()))
            .logrosDestacados(deserializeList(entity.getLogrosDestacados()))
            .tendenciaEntrenamiento(entity.getTendenciaEntrenamiento() != null
                ? entity.getTendenciaEntrenamiento().name() : null)
            .tendenciaNutricion(entity.getTendenciaNutricion() != null
                ? entity.getTendenciaNutricion().name() : null)
            .build();
    }

    private String serializeList(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private List<String> deserializeList(String json) {
        if (json == null || json.isEmpty()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return new ArrayList<>();
        }
    }

    private List<String> extractRecommendations(String feedback) {
        // Simple extraction - in real implementation could use AI parsing
        List<String> recs = new ArrayList<>();
        if (feedback != null && feedback.contains("recomendacion")) {
            recs.add("Sigue las indicaciones del feedback personalizado");
        }
        return recs;
    }

    private List<String> extractAchievements(String feedback) {
        List<String> achievements = new ArrayList<>();
        if (feedback != null && (feedback.contains("mejora") || feedback.contains("logro"))) {
            achievements.add("Progreso detectado esta semana");
        }
        return achievements;
    }

    private List<String> mergeRecommendations(List<String> r1, List<String> r2) {
        List<String> merged = new ArrayList<>();
        if (r1 != null) merged.addAll(r1);
        if (r2 != null) merged.addAll(r2);
        return merged.stream().distinct().limit(5).collect(Collectors.toList());
    }

    private List<String> mergeAchievements(List<String> a1, List<String> a2) {
        List<String> merged = new ArrayList<>();
        if (a1 != null) merged.addAll(a1);
        if (a2 != null) merged.addAll(a2);
        return merged.stream().distinct().limit(5).collect(Collectors.toList());
    }
}
