package com.gestioneventos.cofira.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import com.gestioneventos.cofira.dto.auth.AuthResponseDTO;
import com.gestioneventos.cofira.dto.auth.LoginRequestDTO;
import com.gestioneventos.cofira.dto.auth.RegisterRequestDTO;
import com.gestioneventos.cofira.dto.auth.UserInfoDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Autenticación", description = "API para autenticación y registro de usuarios")
public interface AuthControllerApi {

    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario y devuelve un token JWT")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login exitoso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponseDTO.class))),
        @ApiResponse(responseCode = "401", description = "Credenciales inválidas", content = @Content),
        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content)
    })
    ResponseEntity<AuthResponseDTO> login(
        @Parameter(description = "Credenciales de inicio de sesión", required = true)
        @Valid @RequestBody LoginRequestDTO loginRequest);

    @Operation(summary = "Registrar usuario", description = "Registra un nuevo usuario en el sistema y devuelve un token JWT")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Registro exitoso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Datos inválidos o email ya registrado", content = @Content)
    })
    ResponseEntity<AuthResponseDTO> register(
        @Parameter(description = "Datos de registro del nuevo usuario", required = true)
        @Valid @RequestBody RegisterRequestDTO registerRequest);

    @Operation(summary = "Obtener información del usuario actual",
               description = "Obtiene la información del usuario autenticado actualmente",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Información del usuario obtenida exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserInfoDTO.class))),
        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content)
    })
    ResponseEntity<UserInfoDTO> getCurrentUser();

    @Operation(summary = "Cerrar sesión",
               description = "Cierra la sesión del usuario actual e invalida el token",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logout exitoso", content = @Content),
        @ApiResponse(responseCode = "400", description = "Token no proporcionado", content = @Content),
        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content)
    })
    ResponseEntity<?> logout(
        @Parameter(description = "Token de autorización en el formato: Bearer {token}", required = true)
        @RequestHeader("Authorization") String authHeader);
}
