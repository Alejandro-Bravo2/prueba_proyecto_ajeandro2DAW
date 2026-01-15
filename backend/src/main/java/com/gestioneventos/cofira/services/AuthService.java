package com.gestioneventos.cofira.services;

import com.gestioneventos.cofira.dto.auth.AuthResponseDTO;
import com.gestioneventos.cofira.dto.auth.LoginRequestDTO;
import com.gestioneventos.cofira.dto.auth.RegisterRequestDTO;
import com.gestioneventos.cofira.dto.auth.RegisterWithOnboardingRequestDTO;
import com.gestioneventos.cofira.dto.auth.UserInfoDTO;
import com.gestioneventos.cofira.dto.onboarding.NutritionTargetsDTO;
import com.gestioneventos.cofira.entities.PasswordResetToken;
import com.gestioneventos.cofira.entities.TokenRevocado;
import com.gestioneventos.cofira.entities.UserProfile;
import com.gestioneventos.cofira.entities.Usuario;
import com.gestioneventos.cofira.enums.Rol;
import com.gestioneventos.cofira.repositories.UserProfileRepository;
import com.gestioneventos.cofira.exceptions.RecursoDuplicadoException;
import com.gestioneventos.cofira.exceptions.RecursoNoEncontradoException;
import com.gestioneventos.cofira.repositories.PasswordResetTokenRepository;
import com.gestioneventos.cofira.repositories.TokenRevocadoRepository;
import com.gestioneventos.cofira.repositories.UsuarioRepository;
import com.gestioneventos.cofira.security.JwtUtils;
import com.gestioneventos.cofira.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TokenRevocadoRepository tokenRevocadoRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private CalorieCalculationService calorieCalculationService;

    @Autowired
    private AIGenerationService aiGenerationService;

    private static final int CODE_LENGTH = 6;
    private static final int CODE_EXPIRATION_MINUTES = 15;

    public AuthResponseDTO login(LoginRequestDTO loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String roleString = userDetails.getAuthorities().stream()
                .findFirst()
                .map(item -> item.getAuthority().replace("ROLE_", ""))
                .orElse("");

        // Convertir el String a Rol enum
        Rol rol = roleString.equals("ADMIN") ? Rol.ADMIN : Rol.USER;

        // Obtener estado de onboarding
        Usuario usuario = usuarioRepository.findByUsername(userDetails.getUsername())
                .orElse(null);
        Boolean isOnboarded = usuario != null && Boolean.TRUE.equals(usuario.getIsOnboarded());

        return AuthResponseDTO.builder()
                .token(jwt)
                .type("Bearer")
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .rol(rol)
                .isOnboarded(isOnboarded)
                .build();
    }

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO registerRequest) {
        if (usuarioRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RecursoDuplicadoException("Error: El username ya está en uso!");
        }

        if (usuarioRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RecursoDuplicadoException("Error: El email ya está en uso!");
        }

        // Determinar el rol (por defecto USER si no se especifica o es inválido)
        Rol rol = Rol.USER;
        if (registerRequest.getRol() != null) {
            rol = registerRequest.getRol();
        }

        Usuario usuario = Usuario.builder()
                .nombre(registerRequest.getNombre())
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .rol(rol)
                .build();

        usuarioRepository.save(usuario);

        // Autenticar y generar token
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setUsername(registerRequest.getUsername());
        loginRequest.setPassword(registerRequest.getPassword());

        return login(loginRequest);
    }

    @Transactional
    public AuthResponseDTO registerWithOnboarding(RegisterWithOnboardingRequestDTO request) {
        // 1. Validar unicidad de username y email
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new RecursoDuplicadoException("Error: El username ya esta en uso!");
        }

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RecursoDuplicadoException("Error: El email ya esta en uso!");
        }

        // 2. Calcular objetivos nutricionales
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

        // 3. Crear Usuario con onboarding completado
        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(Rol.USER)
                .isOnboarded(true)
                .build();

        usuario = usuarioRepository.save(usuario);

        // 4. Crear UserProfile con todos los datos del onboarding
        UserProfile profile = UserProfile.builder()
                .usuario(usuario)
                // Datos basicos
                .gender(request.getGender())
                .birthDate(request.getBirthDate())
                .heightCm(request.getHeightCm())
                .currentWeightKg(request.getCurrentWeightKg())
                .targetWeightKg(request.getTargetWeightKg() != null ? request.getTargetWeightKg() : request.getCurrentWeightKg())
                // Actividad y estilo de vida
                .activityLevel(request.getActivityLevel())
                .workType(request.getWorkType())
                .sleepHoursAverage(request.getSleepHoursAverage())
                // Objetivos y entrenamiento
                .primaryGoal(request.getPrimaryGoal())
                .fitnessLevel(request.getFitnessLevel())
                .trainingDaysPerWeek(request.getTrainingDaysPerWeek())
                .sessionDurationMinutes(request.getSessionDurationMinutes())
                .preferredTrainingTime(request.getPreferredTrainingTime())
                // Nutricion
                .dietType(request.getDietType())
                .mealsPerDay(request.getMealsPerDay())
                .allergies(request.getAllergies())
                .injuries(request.getInjuries())
                .equipment(request.getEquipment())
                // Historial medico
                .medicalConditions(request.getMedicalConditions())
                .medications(request.getMedications())
                .previousSurgeries(request.getPreviousSurgeries())
                .isPregnant(request.getIsPregnant())
                .isBreastfeeding(request.getIsBreastfeeding())
                // Valores calculados
                .calculatedBMR(targets.getCalculatedBMR())
                .calculatedTDEE(targets.getCalculatedTDEE())
                .dailyCalorieTarget(targets.getDailyCalories())
                .proteinTargetGrams(targets.getProteinGrams())
                .carbsTargetGrams(targets.getCarbsGrams())
                .fatTargetGrams(targets.getFatGrams())
                .fiberTargetGrams(targets.getFiberGrams())
                // Timestamps
                .onboardingCompletedAt(java.time.LocalDateTime.now())
                .build();

        userProfileRepository.save(profile);

        // 5. Asociar perfil al usuario
        usuario.setUserProfile(profile);
        usuarioRepository.save(usuario);

        // 6. Generar planes personalizados con IA (async para no bloquear registro)
        try {
            aiGenerationService.generateWeeklyWorkoutPlan(profile);
            aiGenerationService.generateWeeklyMealPlan(profile);
        } catch (Exception e) {
            // Log error but don't fail registration
            // Plans can be generated later via the AI endpoints
            System.err.println("Error generating AI plans during registration: " + e.getMessage());
        }

        // 7. Autenticar y generar token
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setUsername(request.getUsername());
        loginRequest.setPassword(request.getPassword());

        return login(loginRequest);
    }

    public UserInfoDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Usuario usuario = usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        return UserInfoDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .username(usuario.getUsername())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .edad(usuario.getEdad())
                .peso(usuario.getPeso())
                .altura(usuario.getAltura())
                .build();
    }

    @Transactional
    public void logout(String token) {
        String jti = jwtUtils.getJtiFromJwtToken(token);
        LocalDateTime expiresAt = jwtUtils.getExpirationFromJwtToken(token)
                .toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        TokenRevocado tokenRevocado = TokenRevocado.builder()
                .jti(jti)
                .expiresAt(expiresAt)
                .revokedAt(LocalDateTime.now())
                .build();

        tokenRevocadoRepository.save(tokenRevocado);
    }

    @Transactional
    public void cleanupExpiredTokens() {
        tokenRevocadoRepository.deleteExpiredTokens(LocalDateTime.now());
    }

    @Transactional
    public void forgotPassword(String email) {
        // Buscar usuario por email (no lanzar excepcion si no existe por seguridad)
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);

        if (usuario == null) {
            // Por seguridad, no revelamos si el email existe o no
            // Simplemente no hacemos nada
            return;
        }

        // Eliminar tokens anteriores del usuario
        passwordResetTokenRepository.deleteByUsuario(usuario);

        // Generar codigo de 6 digitos
        String code = generateResetCode();

        // Crear token con expiracion de 15 minutos
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(code)
                .usuario(usuario)
                .expiresAt(LocalDateTime.now().plusMinutes(CODE_EXPIRATION_MINUTES))
                .build();

        passwordResetTokenRepository.save(resetToken);

        // Enviar email con codigo
        emailService.sendPasswordResetEmail(email, code);
    }

    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        // Buscar token valido
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenAndUsedFalse(code)
                .orElseThrow(() -> new RecursoNoEncontradoException("Codigo de verificacion invalido o expirado"));

        // Verificar que no ha expirado
        if (resetToken.isExpired()) {
            throw new RecursoNoEncontradoException("El codigo de verificacion ha expirado");
        }

        // Verificar que el email coincide
        if (!resetToken.getUsuario().getEmail().equalsIgnoreCase(email)) {
            throw new RecursoNoEncontradoException("Codigo de verificacion invalido");
        }

        // Actualizar contrasena
        Usuario usuario = resetToken.getUsuario();
        usuario.setPassword(passwordEncoder.encode(newPassword));
        usuarioRepository.save(usuario);

        // Marcar token como usado
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // Limpiar tokens expirados
        passwordResetTokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }

    private String generateResetCode() {
        SecureRandom random = new SecureRandom();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }
}
