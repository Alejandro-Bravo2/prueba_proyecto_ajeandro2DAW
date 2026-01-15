package com.gestioneventos.cofira.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gestioneventos.cofira.dto.ai.*;
import com.gestioneventos.cofira.entities.*;
import com.gestioneventos.cofira.enums.DiaSemana;
import com.gestioneventos.cofira.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIGenerationService {

    private static final Logger logger = LoggerFactory.getLogger(AIGenerationService.class);

    @Value("${openrouter.api.url}")
    private String apiUrl;

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.model}")
    private String model;

    @Value("${openrouter.model.fallback}")
    private String fallbackModel;

    @Autowired
    private RutinaEjercicioRepository rutinaEjercicioRepository;

    @Autowired
    private RutinaAlimentacionRepository rutinaAlimentacionRepository;

    @Autowired
    private EjerciciosRepository ejerciciosRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public RutinaEjercicio generateWeeklyWorkoutPlan(UserProfile profile) {
        String prompt = buildWorkoutPrompt(profile);
        String response = callOpenRouterAPI(prompt);

        if (response == null || response.isEmpty()) {
            logger.error("No response from AI for workout plan");
            return createDefaultWorkoutPlan(profile);
        }

        try {
            return parseWorkoutResponse(response, profile);
        } catch (Exception e) {
            logger.error("Error parsing workout response: {}", e.getMessage());
            return createDefaultWorkoutPlan(profile);
        }
    }

    @Transactional
    public RutinaAlimentacion generateWeeklyMealPlan(UserProfile profile) {
        String prompt = buildMealPrompt(profile);
        String response = callOpenRouterAPI(prompt);

        if (response == null || response.isEmpty()) {
            logger.error("No response from AI for meal plan");
            return createDefaultMealPlan(profile);
        }

        try {
            return parseMealResponse(response, profile);
        } catch (Exception e) {
            logger.error("Error parsing meal response: {}", e.getMessage());
            return createDefaultMealPlan(profile);
        }
    }

    public FoodAnalysisDTO analyzeFood(String base64Image) {
        String prompt = buildFoodAnalysisPrompt(base64Image);
        String response = callOpenRouterAPI(prompt);

        if (response == null || response.isEmpty()) {
            return createDefaultFoodAnalysis();
        }

        try {
            return parseFoodAnalysisResponse(response);
        } catch (Exception e) {
            logger.error("Error parsing food analysis: {}", e.getMessage());
            return createDefaultFoodAnalysis();
        }
    }

    private String buildWorkoutPrompt(UserProfile profile) {
        int age = Period.between(profile.getBirthDate(), LocalDate.now()).getYears();

        StringBuilder prompt = new StringBuilder();
        prompt.append("Eres un entrenador personal profesional. Genera una rutina de ejercicios semanal personalizada.\n\n");
        prompt.append("DATOS DEL USUARIO:\n");
        prompt.append("- Genero: ").append(profile.getGender()).append("\n");
        prompt.append("- Edad: ").append(age).append(" anos\n");
        prompt.append("- Peso actual: ").append(profile.getCurrentWeightKg()).append(" kg\n");
        prompt.append("- Altura: ").append(profile.getHeightCm()).append(" cm\n");
        prompt.append("- Objetivo principal: ").append(translateGoal(profile.getPrimaryGoal())).append("\n");
        prompt.append("- Nivel de fitness: ").append(profile.getFitnessLevel()).append("\n");
        prompt.append("- Nivel de actividad: ").append(profile.getActivityLevel()).append("\n");
        prompt.append("- Dias de entrenamiento por semana: ").append(profile.getTrainingDaysPerWeek()).append("\n");
        prompt.append("- Duracion por sesion: ").append(profile.getSessionDurationMinutes()).append(" minutos\n");
        prompt.append("- Equipamiento disponible: ").append(profile.getEquipment() != null ? String.join(", ", profile.getEquipment()) : "GYM").append("\n");

        if (profile.getInjuries() != null && !profile.getInjuries().isEmpty()) {
            prompt.append("- Lesiones/limitaciones: ").append(String.join(", ", profile.getInjuries())).append("\n");
        }

        prompt.append("\nRESPONDE SOLO CON UN JSON VALIDO sin markdown ni texto adicional. El formato debe ser:\n");
        prompt.append("{\n");
        prompt.append("  \"dias\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"diaSemana\": \"LUNES\",\n");
        prompt.append("      \"ejercicios\": [\n");
        prompt.append("        {\n");
        prompt.append("          \"nombre\": \"Press de banca\",\n");
        prompt.append("          \"series\": 4,\n");
        prompt.append("          \"repeticiones\": 10,\n");
        prompt.append("          \"descansoSegundos\": 90,\n");
        prompt.append("          \"descripcion\": \"1. Acuestate en el banco con los pies firmemente apoyados en el suelo. 2. Agarra la barra con las manos separadas algo mas que el ancho de los hombros. 3. Baja la barra controladamente hasta tocar el pecho a la altura de los pezones. 4. Empuja la barra hacia arriba extendiendo los brazos sin bloquear los codos. 5. Manten los omoplatos retraidos y el pecho elevado durante todo el movimiento. 6. Respira: inhala al bajar, exhala al subir.\",\n");
        prompt.append("          \"grupoMuscular\": \"Pecho\"\n");
        prompt.append("        }\n");
        prompt.append("      ]\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}\n");
        prompt.append("\nIMPORTANTE SOBRE LA DESCRIPCION:\n");
        prompt.append("- La descripcion debe ser una GUIA DE TECNICA DETALLADA paso a paso (4-6 pasos numerados).\n");
        prompt.append("- Incluye posicion inicial del cuerpo, agarre, movimiento concentrico y excentrico.\n");
        prompt.append("- Menciona la respiracion correcta (cuando inhalar y exhalar).\n");
        prompt.append("- Indica errores comunes a evitar y consejos de forma correcta.\n");
        prompt.append("- NO uses descripciones genericas como 'Ejercicio para pecho'. Se especifico.\n");
        prompt.append("\nGenera ejercicios para ").append(profile.getTrainingDaysPerWeek()).append(" dias. ");
        prompt.append("Usa dias de semana validos: LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO.");

        return prompt.toString();
    }

    private String buildMealPrompt(UserProfile profile) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Eres un nutricionista y chef profesional. Genera un plan de comidas semanal personalizado con recetas detalladas.\n\n");
        prompt.append("DATOS DEL USUARIO:\n");
        prompt.append("- Calorias diarias objetivo: ").append(Math.round(profile.getDailyCalorieTarget())).append(" kcal\n");
        prompt.append("- Proteinas objetivo: ").append(Math.round(profile.getProteinTargetGrams())).append("g\n");
        prompt.append("- Carbohidratos objetivo: ").append(Math.round(profile.getCarbsTargetGrams())).append("g\n");
        prompt.append("- Grasas objetivo: ").append(Math.round(profile.getFatTargetGrams())).append("g\n");
        prompt.append("- Tipo de dieta: ").append(profile.getDietType()).append("\n");
        prompt.append("- Comidas por dia: ").append(profile.getMealsPerDay()).append("\n");

        if (profile.getAllergies() != null && !profile.getAllergies().isEmpty()) {
            prompt.append("- Alergias/intolerancias: ").append(String.join(", ", profile.getAllergies())).append("\n");
        }

        if (profile.getMedicalConditions() != null && !profile.getMedicalConditions().isEmpty()) {
            prompt.append("- Condiciones medicas: ").append(String.join(", ", profile.getMedicalConditions())).append("\n");
        }

        prompt.append("\nRESPONDE SOLO CON UN JSON VALIDO sin markdown ni texto adicional. El formato debe ser:\n");
        prompt.append("{\n");
        prompt.append("  \"dias\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"diaSemana\": \"LUNES\",\n");
        prompt.append("      \"desayuno\": {\n");
        prompt.append("        \"alimentos\": [\"Avena con leche\", \"Platano\"],\n");
        prompt.append("        \"descripcion\": \"Desayuno energetico y nutritivo\",\n");
        prompt.append("        \"tiempoPreparacionMinutos\": 10,\n");
        prompt.append("        \"porciones\": 1,\n");
        prompt.append("        \"dificultad\": \"FACIL\",\n");
        prompt.append("        \"ingredientes\": [\n");
        prompt.append("          {\"nombre\": \"Avena\", \"cantidad\": \"50\", \"unidad\": \"g\", \"opcional\": false},\n");
        prompt.append("          {\"nombre\": \"Leche\", \"cantidad\": \"200\", \"unidad\": \"ml\", \"opcional\": false}\n");
        prompt.append("        ],\n");
        prompt.append("        \"pasosPreparacion\": [\n");
        prompt.append("          \"Calentar la leche en un cazo\",\n");
        prompt.append("          \"Anadir la avena y cocinar 5 minutos\",\n");
        prompt.append("          \"Servir y decorar con el platano\"\n");
        prompt.append("        ]\n");
        prompt.append("      },\n");
        prompt.append("      \"almuerzo\": { ... },\n");
        prompt.append("      \"comida\": { ... },\n");
        prompt.append("      \"merienda\": { ... },\n");
        prompt.append("      \"cena\": { ... }\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}\n");
        prompt.append("\nIMPORTANTE:\n");
        prompt.append("- Genera comidas para 7 dias: LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO.\n");
        prompt.append("- Cada comida (desayuno, almuerzo, comida, merienda, cena) debe tener TODOS los campos del ejemplo.\n");
        prompt.append("- dificultad puede ser: FACIL, MEDIA o DIFICIL.\n");
        prompt.append("- Los ingredientes deben incluir cantidad, unidad y si son opcionales.\n");
        prompt.append("- Los pasos de preparacion deben ser claros y detallados (3-6 pasos por receta).\n");

        return prompt.toString();
    }

    private String buildFoodAnalysisPrompt(String base64Image) {
        return "Analiza esta imagen de comida y proporciona informacion nutricional estimada.\n\n" +
               "RESPONDE SOLO CON UN JSON VALIDO sin markdown:\n" +
               "{\n" +
               "  \"nombreComida\": \"Nombre del plato\",\n" +
               "  \"descripcion\": \"Descripcion breve\",\n" +
               "  \"porcion\": \"Tamano estimado\",\n" +
               "  \"calorias\": 500,\n" +
               "  \"proteinas\": 30,\n" +
               "  \"carbohidratos\": 50,\n" +
               "  \"grasas\": 20,\n" +
               "  \"fibra\": 5,\n" +
               "  \"ingredientes\": [\"ingrediente1\", \"ingrediente2\"],\n" +
               "  \"confianza\": 0.85\n" +
               "}";
    }

    private String callOpenRouterAPI(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("HTTP-Referer", "https://cofira.app");
            headers.set("X-Title", "COFIRA App");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);

            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            messages.add(message);

            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 4000);
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode choices = root.get("choices");
                if (choices != null && choices.isArray() && choices.size() > 0) {
                    JsonNode content = choices.get(0).get("message").get("content");
                    if (content != null) {
                        return cleanJsonResponse(content.asText());
                    }
                }
            }

            logger.warn("Trying fallback model...");
            return callWithFallbackModel(prompt);

        } catch (Exception e) {
            logger.error("Error calling OpenRouter API: {}", e.getMessage());
            return callWithFallbackModel(prompt);
        }
    }

    private String callWithFallbackModel(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", fallbackModel);

            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            messages.add(message);

            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 4000);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode choices = root.get("choices");
                if (choices != null && choices.isArray() && choices.size() > 0) {
                    return cleanJsonResponse(choices.get(0).get("message").get("content").asText());
                }
            }
        } catch (Exception e) {
            logger.error("Fallback model also failed: {}", e.getMessage());
        }
        return null;
    }

    private String cleanJsonResponse(String response) {
        if (response == null) return null;

        response = response.trim();
        if (response.startsWith("```json")) {
            response = response.substring(7);
        }
        if (response.startsWith("```")) {
            response = response.substring(3);
        }
        if (response.endsWith("```")) {
            response = response.substring(0, response.length() - 3);
        }
        return response.trim();
    }

    private RutinaEjercicio parseWorkoutResponse(String response, UserProfile profile) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(response);
        JsonNode diasNode = root.get("dias");

        List<DiaEjercicio> diasEjercicio = new ArrayList<>();

        if (diasNode != null && diasNode.isArray()) {
            for (JsonNode diaNode : diasNode) {
                String diaSemanaStr = diaNode.get("diaSemana").asText();
                DiaSemana diaSemana = DiaSemana.valueOf(diaSemanaStr.toUpperCase());

                List<Ejercicios> ejerciciosList = new ArrayList<>();
                JsonNode ejerciciosNode = diaNode.get("ejercicios");

                if (ejerciciosNode != null && ejerciciosNode.isArray()) {
                    for (JsonNode ejNode : ejerciciosNode) {
                        Ejercicios ejercicio = Ejercicios.builder()
                            .nombreEjercicio(ejNode.get("nombre").asText())
                            .series(ejNode.get("series").asInt())
                            .repeticiones(ejNode.get("repeticiones").asInt())
                            .tiempoDescansoSegundos(ejNode.has("descansoSegundos") ? ejNode.get("descansoSegundos").asInt() : 60)
                            .descripcion(ejNode.has("descripcion") ? ejNode.get("descripcion").asText() : "")
                            .grupoMuscular(ejNode.has("grupoMuscular") ? ejNode.get("grupoMuscular").asText() : "General")
                            .build();

                        ejercicio = ejerciciosRepository.save(ejercicio);
                        ejerciciosList.add(ejercicio);
                    }
                }

                DiaEjercicio diaEjercicio = DiaEjercicio.builder()
                    .diaSemana(diaSemana)
                    .ejercicios(ejerciciosList)
                    .build();

                diasEjercicio.add(diaEjercicio);
            }
        }

        RutinaEjercicio rutina = RutinaEjercicio.builder()
            .fechaInicio(LocalDate.now())
            .diasEjercicio(diasEjercicio)
            .build();

        return rutinaEjercicioRepository.save(rutina);
    }

    private RutinaAlimentacion parseMealResponse(String response, UserProfile profile) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(response);
        JsonNode diasNode = root.get("dias");

        List<DiaAlimentacion> diasAlimentacion = new ArrayList<>();

        if (diasNode != null && diasNode.isArray()) {
            for (JsonNode diaNode : diasNode) {
                String diaSemanaStr = diaNode.get("diaSemana").asText();
                DiaSemana diaSemana = DiaSemana.valueOf(diaSemanaStr.toUpperCase());

                DiaAlimentacion.DiaAlimentacionBuilder builder = DiaAlimentacion.builder()
                    .diaSemana(diaSemana);

                // Parse each meal type with full recipe details
                if (diaNode.has("desayuno")) {
                    builder.desayuno(parseDesayuno(diaNode.get("desayuno")));
                }

                if (diaNode.has("almuerzo")) {
                    builder.almuerzo(parseAlmuerzo(diaNode.get("almuerzo")));
                }

                if (diaNode.has("comida")) {
                    builder.comida(parseComida(diaNode.get("comida")));
                }

                if (diaNode.has("merienda")) {
                    builder.merienda(parseMerienda(diaNode.get("merienda")));
                }

                if (diaNode.has("cena")) {
                    builder.cena(parseCena(diaNode.get("cena")));
                }

                diasAlimentacion.add(builder.build());
            }
        }

        RutinaAlimentacion rutina = RutinaAlimentacion.builder()
            .fechaInicio(LocalDate.now())
            .diasAlimentacion(diasAlimentacion)
            .build();

        return rutinaAlimentacionRepository.save(rutina);
    }

    private Desayuno parseDesayuno(JsonNode node) {
        Desayuno.DesayunoBuilder builder = Desayuno.builder();
        parseMealCommon(node, builder::alimentos, builder::descripcion, builder::tiempoPreparacionMinutos,
            builder::porciones, builder::dificultad, builder::ingredientesJson, builder::pasosPreparacion);
        return builder.build();
    }

    private Almuerzo parseAlmuerzo(JsonNode node) {
        Almuerzo.AlmuerzoBuilder builder = Almuerzo.builder();
        parseMealCommon(node, builder::alimentos, builder::descripcion, builder::tiempoPreparacionMinutos,
            builder::porciones, builder::dificultad, builder::ingredientesJson, builder::pasosPreparacion);
        return builder.build();
    }

    private Comida parseComida(JsonNode node) {
        Comida.ComidaBuilder builder = Comida.builder();
        parseMealCommon(node, builder::alimentos, builder::descripcion, builder::tiempoPreparacionMinutos,
            builder::porciones, builder::dificultad, builder::ingredientesJson, builder::pasosPreparacion);
        return builder.build();
    }

    private Merienda parseMerienda(JsonNode node) {
        Merienda.MeriendaBuilder builder = Merienda.builder();
        parseMealCommon(node, builder::alimentos, builder::descripcion, builder::tiempoPreparacionMinutos,
            builder::porciones, builder::dificultad, builder::ingredientesJson, builder::pasosPreparacion);
        return builder.build();
    }

    private Cena parseCena(JsonNode node) {
        Cena.CenaBuilder builder = Cena.builder();
        parseMealCommon(node, builder::alimentos, builder::descripcion, builder::tiempoPreparacionMinutos,
            builder::porciones, builder::dificultad, builder::ingredientesJson, builder::pasosPreparacion);
        return builder.build();
    }

    private void parseMealCommon(JsonNode node,
                                  java.util.function.Consumer<List<String>> alimentosSetter,
                                  java.util.function.Consumer<String> descripcionSetter,
                                  java.util.function.Consumer<Integer> tiempoSetter,
                                  java.util.function.Consumer<Integer> porcionesSetter,
                                  java.util.function.Consumer<String> dificultadSetter,
                                  java.util.function.Consumer<List<String>> ingredientesSetter,
                                  java.util.function.Consumer<List<String>> pasosSetter) {
        if (node == null) return;

        // Handle both old format (array) and new format (object)
        if (node.isArray()) {
            // Old format: just an array of food names
            alimentosSetter.accept(parseAlimentosArray(node));
        } else if (node.isObject()) {
            // New format: object with recipe details
            if (node.has("alimentos")) {
                alimentosSetter.accept(parseAlimentosArray(node.get("alimentos")));
            }
            if (node.has("descripcion")) {
                descripcionSetter.accept(node.get("descripcion").asText());
            }
            if (node.has("tiempoPreparacionMinutos")) {
                tiempoSetter.accept(node.get("tiempoPreparacionMinutos").asInt());
            }
            if (node.has("porciones")) {
                porcionesSetter.accept(node.get("porciones").asInt());
            }
            if (node.has("dificultad")) {
                dificultadSetter.accept(node.get("dificultad").asText());
            }
            if (node.has("ingredientes") && node.get("ingredientes").isArray()) {
                List<String> ingredientesJson = new ArrayList<>();
                for (JsonNode ing : node.get("ingredientes")) {
                    try {
                        ingredientesJson.add(objectMapper.writeValueAsString(ing));
                    } catch (JsonProcessingException e) {
                        logger.warn("Error serializing ingredient: {}", e.getMessage());
                    }
                }
                ingredientesSetter.accept(ingredientesJson);
            }
            if (node.has("pasosPreparacion") && node.get("pasosPreparacion").isArray()) {
                List<String> pasos = new ArrayList<>();
                for (JsonNode paso : node.get("pasosPreparacion")) {
                    pasos.add(paso.asText());
                }
                pasosSetter.accept(pasos);
            }
        }
    }

    private List<String> parseAlimentosArray(JsonNode node) {
        List<String> alimentos = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode item : node) {
                alimentos.add(item.asText());
            }
        }
        return alimentos;
    }

    private FoodAnalysisDTO parseFoodAnalysisResponse(String response) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(response);

        FoodAnalysisDTO analysis = new FoodAnalysisDTO();
        analysis.setNombreComida(root.has("nombreComida") ? root.get("nombreComida").asText() : "Comida desconocida");
        analysis.setDescripcion(root.has("descripcion") ? root.get("descripcion").asText() : "");
        analysis.setPorcion(root.has("porcion") ? root.get("porcion").asText() : "1 porcion");
        analysis.setCalorias(root.has("calorias") ? root.get("calorias").asInt() : 0);
        analysis.setProteinas(root.has("proteinas") ? root.get("proteinas").asDouble() : 0);
        analysis.setCarbohidratos(root.has("carbohidratos") ? root.get("carbohidratos").asDouble() : 0);
        analysis.setGrasas(root.has("grasas") ? root.get("grasas").asDouble() : 0);
        analysis.setFibra(root.has("fibra") ? root.get("fibra").asDouble() : 0);
        analysis.setConfianza(root.has("confianza") ? root.get("confianza").asDouble() : 0.5);

        if (root.has("ingredientes") && root.get("ingredientes").isArray()) {
            List<String> ingredientes = new ArrayList<>();
            for (JsonNode ing : root.get("ingredientes")) {
                ingredientes.add(ing.asText());
            }
            analysis.setIngredientes(ingredientes);
        }

        return analysis;
    }

    private String translateGoal(com.gestioneventos.cofira.enums.PrimaryGoal goal) {
        if (goal == null) return "Mantener forma fisica";
        return switch (goal) {
            case LOSE_WEIGHT -> "Perder peso";
            case GAIN_MUSCLE -> "Ganar musculo";
            case MAINTAIN -> "Mantener forma fisica";
            case IMPROVE_HEALTH -> "Mejorar salud general";
        };
    }

    private RutinaEjercicio createDefaultWorkoutPlan(UserProfile profile) {
        List<DiaEjercicio> dias = new ArrayList<>();
        int trainingDays = profile.getTrainingDaysPerWeek() != null ? profile.getTrainingDaysPerWeek() : 3;
        DiaSemana[] diasSemana = {DiaSemana.LUNES, DiaSemana.MIERCOLES, DiaSemana.VIERNES, DiaSemana.MARTES, DiaSemana.JUEVES, DiaSemana.SABADO};

        for (int i = 0; i < Math.min(trainingDays, diasSemana.length); i++) {
            List<Ejercicios> ejercicios = new ArrayList<>();
            ejercicios.add(ejerciciosRepository.save(Ejercicios.builder()
                .nombreEjercicio("Sentadillas")
                .series(3).repeticiones(12)
                .tiempoDescansoSegundos(60)
                .descripcion("1. Coloca los pies separados al ancho de los hombros con las puntas ligeramente hacia afuera. 2. Manten la espalda recta y el pecho elevado durante todo el movimiento. 3. Baja flexionando rodillas y caderas como si fueras a sentarte, hasta que los muslos queden paralelos al suelo. 4. Asegurate de que las rodillas sigan la direccion de los pies y no sobrepasen las puntas. 5. Empuja desde los talones para volver a la posicion inicial. 6. Respira: inhala al bajar, exhala al subir.")
                .grupoMuscular("Piernas")
                .build()));
            ejercicios.add(ejerciciosRepository.save(Ejercicios.builder()
                .nombreEjercicio("Flexiones")
                .series(3).repeticiones(10)
                .tiempoDescansoSegundos(60)
                .descripcion("1. Coloca las manos en el suelo separadas algo mas que el ancho de los hombros. 2. Extiende las piernas hacia atras manteniendo el cuerpo en linea recta desde la cabeza hasta los talones. 3. Activa el core para evitar que la cadera suba o baje. 4. Baja el cuerpo flexionando los codos hasta que el pecho casi toque el suelo. 5. Empuja hacia arriba extendiendo los brazos completamente. 6. Respira: inhala al bajar, exhala al subir. Evita arquear la espalda baja.")
                .grupoMuscular("Pecho")
                .build()));
            ejercicios.add(ejerciciosRepository.save(Ejercicios.builder()
                .nombreEjercicio("Plancha")
                .series(3).repeticiones(30)
                .tiempoDescansoSegundos(45)
                .descripcion("1. Apoya los antebrazos en el suelo con los codos directamente debajo de los hombros. 2. Extiende las piernas hacia atras apoyandote en las puntas de los pies. 3. Manten el cuerpo completamente recto formando una linea desde la cabeza hasta los talones. 4. Activa el abdomen como si fueras a recibir un golpe en el estomago. 5. No dejes que la cadera suba ni baje - manten la posicion neutra. 6. Respira de forma controlada durante todo el ejercicio, sin contener la respiracion.")
                .grupoMuscular("Core")
                .build()));

            dias.add(DiaEjercicio.builder()
                .diaSemana(diasSemana[i])
                .ejercicios(ejercicios)
                .build());
        }

        return rutinaEjercicioRepository.save(RutinaEjercicio.builder()
            .fechaInicio(LocalDate.now())
            .diasEjercicio(dias)
            .build());
    }

    private RutinaAlimentacion createDefaultMealPlan(UserProfile profile) {
        List<DiaAlimentacion> dias = new ArrayList<>();
        DiaSemana[] diasSemana = DiaSemana.values();

        for (DiaSemana dia : diasSemana) {
            DiaAlimentacion diaAlimentacion = DiaAlimentacion.builder()
                .diaSemana(dia)
                .desayuno(Desayuno.builder()
                    .alimentos(Arrays.asList("Avena con leche", "Platano", "Miel"))
                    .descripcion("Desayuno energetico con carbohidratos complejos y frutas")
                    .tiempoPreparacionMinutos(10)
                    .porciones(1)
                    .dificultad("FACIL")
                    .ingredientesJson(Arrays.asList(
                        "{\"nombre\":\"Avena\",\"cantidad\":\"50\",\"unidad\":\"g\",\"opcional\":false}",
                        "{\"nombre\":\"Leche\",\"cantidad\":\"200\",\"unidad\":\"ml\",\"opcional\":false}",
                        "{\"nombre\":\"Platano\",\"cantidad\":\"1\",\"unidad\":\"unidad\",\"opcional\":false}",
                        "{\"nombre\":\"Miel\",\"cantidad\":\"1\",\"unidad\":\"cucharada\",\"opcional\":true}"
                    ))
                    .pasosPreparacion(Arrays.asList(
                        "Calentar la leche en un cazo a fuego medio",
                        "Anadir la avena y cocinar 5 minutos removiendo",
                        "Cortar el platano en rodajas",
                        "Servir la avena y decorar con el platano",
                        "Anadir miel al gusto"
                    ))
                    .build())
                .almuerzo(Almuerzo.builder()
                    .alimentos(Arrays.asList("Ensalada cesar", "Pollo a la plancha", "Pan integral"))
                    .descripcion("Almuerzo ligero con proteinas y vegetales")
                    .tiempoPreparacionMinutos(20)
                    .porciones(1)
                    .dificultad("FACIL")
                    .ingredientesJson(Arrays.asList(
                        "{\"nombre\":\"Lechuga romana\",\"cantidad\":\"100\",\"unidad\":\"g\",\"opcional\":false}",
                        "{\"nombre\":\"Pechuga de pollo\",\"cantidad\":\"150\",\"unidad\":\"g\",\"opcional\":false}",
                        "{\"nombre\":\"Pan integral\",\"cantidad\":\"2\",\"unidad\":\"rebanadas\",\"opcional\":false}",
                        "{\"nombre\":\"Queso parmesano\",\"cantidad\":\"30\",\"unidad\":\"g\",\"opcional\":true}"
                    ))
                    .pasosPreparacion(Arrays.asList(
                        "Lavar y cortar la lechuga",
                        "Cocinar el pollo a la plancha con sal y pimienta",
                        "Cortar el pollo en tiras",
                        "Mezclar la lechuga con el pollo",
                        "Servir con el pan integral"
                    ))
                    .build())
                .comida(Comida.builder()
                    .alimentos(Arrays.asList("Arroz integral", "Verduras salteadas", "Pechuga de pollo"))
                    .descripcion("Comida equilibrada con proteinas, carbohidratos y fibra")
                    .tiempoPreparacionMinutos(30)
                    .porciones(1)
                    .dificultad("MEDIA")
                    .ingredientesJson(Arrays.asList(
                        "{\"nombre\":\"Arroz integral\",\"cantidad\":\"80\",\"unidad\":\"g\",\"opcional\":false}",
                        "{\"nombre\":\"Pechuga de pollo\",\"cantidad\":\"150\",\"unidad\":\"g\",\"opcional\":false}",
                        "{\"nombre\":\"Brocoli\",\"cantidad\":\"100\",\"unidad\":\"g\",\"opcional\":false}",
                        "{\"nombre\":\"Zanahoria\",\"cantidad\":\"1\",\"unidad\":\"unidad\",\"opcional\":false}",
                        "{\"nombre\":\"Aceite de oliva\",\"cantidad\":\"1\",\"unidad\":\"cucharada\",\"opcional\":false}"
                    ))
                    .pasosPreparacion(Arrays.asList(
                        "Cocinar el arroz integral segun las instrucciones",
                        "Cortar las verduras en trozos pequenos",
                        "Saltear las verduras en aceite de oliva",
                        "Cocinar el pollo a la plancha",
                        "Servir el arroz con las verduras y el pollo"
                    ))
                    .build())
                .merienda(Merienda.builder()
                    .alimentos(Arrays.asList("Yogur natural", "Frutos secos"))
                    .descripcion("Merienda saludable con proteinas y grasas buenas")
                    .tiempoPreparacionMinutos(5)
                    .porciones(1)
                    .dificultad("FACIL")
                    .ingredientesJson(Arrays.asList(
                        "{\"nombre\":\"Yogur natural\",\"cantidad\":\"150\",\"unidad\":\"g\",\"opcional\":false}",
                        "{\"nombre\":\"Almendras\",\"cantidad\":\"20\",\"unidad\":\"g\",\"opcional\":false}",
                        "{\"nombre\":\"Nueces\",\"cantidad\":\"15\",\"unidad\":\"g\",\"opcional\":true}"
                    ))
                    .pasosPreparacion(Arrays.asList(
                        "Servir el yogur en un bol",
                        "Anadir los frutos secos por encima",
                        "Mezclar y disfrutar"
                    ))
                    .build())
                .cena(Cena.builder()
                    .alimentos(Arrays.asList("Salmon al horno", "Ensalada verde"))
                    .descripcion("Cena ligera rica en omega-3 y vitaminas")
                    .tiempoPreparacionMinutos(25)
                    .porciones(1)
                    .dificultad("MEDIA")
                    .ingredientesJson(Arrays.asList(
                        "{\"nombre\":\"Salmon fresco\",\"cantidad\":\"180\",\"unidad\":\"g\",\"opcional\":false}",
                        "{\"nombre\":\"Limon\",\"cantidad\":\"1\",\"unidad\":\"unidad\",\"opcional\":false}",
                        "{\"nombre\":\"Lechuga mixta\",\"cantidad\":\"80\",\"unidad\":\"g\",\"opcional\":false}",
                        "{\"nombre\":\"Tomate cherry\",\"cantidad\":\"50\",\"unidad\":\"g\",\"opcional\":true}",
                        "{\"nombre\":\"Aceite de oliva\",\"cantidad\":\"1\",\"unidad\":\"cucharada\",\"opcional\":false}"
                    ))
                    .pasosPreparacion(Arrays.asList(
                        "Precalentar el horno a 180 grados",
                        "Condimentar el salmon con limon, sal y pimienta",
                        "Hornear el salmon durante 15-20 minutos",
                        "Preparar la ensalada con la lechuga y tomates",
                        "Aliñar con aceite de oliva",
                        "Servir el salmon con la ensalada"
                    ))
                    .build())
                .build();

            dias.add(diaAlimentacion);
        }

        return rutinaAlimentacionRepository.save(RutinaAlimentacion.builder()
            .fechaInicio(LocalDate.now())
            .diasAlimentacion(dias)
            .build());
    }

    private FoodAnalysisDTO createDefaultFoodAnalysis() {
        FoodAnalysisDTO analysis = new FoodAnalysisDTO();
        analysis.setNombreComida("Comida no identificada");
        analysis.setDescripcion("No se pudo analizar la imagen");
        analysis.setPorcion("Desconocida");
        analysis.setCalorias(0);
        analysis.setProteinas(0.0);
        analysis.setCarbohidratos(0.0);
        analysis.setGrasas(0.0);
        analysis.setFibra(0.0);
        analysis.setConfianza(0.0);
        analysis.setIngredientes(new ArrayList<>());
        return analysis;
    }

    @Transactional
    public void regenerateAllUserPlans() {
        List<UserProfile> profiles = userProfileRepository.findAll();
        for (UserProfile profile : profiles) {
            try {
                generateWeeklyWorkoutPlan(profile);
                generateWeeklyMealPlan(profile);
                logger.info("Regenerated plans for user: {}", profile.getUsuario().getUsername());
            } catch (Exception e) {
                logger.error("Failed to regenerate plans for user {}: {}",
                    profile.getUsuario().getUsername(), e.getMessage());
            }
        }
    }
}
