package com.gestioneventos.cofira.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import com.gestioneventos.cofira.dto.ejercicios.CrearEjerciciosDTO;
import com.gestioneventos.cofira.dto.ejercicios.EjerciciosDTO;
import com.gestioneventos.cofira.dto.ejercicios.ModificarEjerciciosDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Ejercicios", description = "API para gestión de ejercicios")
public interface EjerciciosControllerApi {

    @Operation(summary = "Listar todos los ejercicios", description = "Obtiene una lista de todos los ejercicios disponibles")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de ejercicios obtenida exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = EjerciciosDTO.class)))
    })
    ResponseEntity<List<EjerciciosDTO>> listarEjercicios();

    @Operation(summary = "Obtener ejercicio por ID", description = "Obtiene los detalles de un ejercicio específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Ejercicio encontrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = EjerciciosDTO.class))),
        @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content)
    })
    ResponseEntity<EjerciciosDTO> obtenerEjercicio(
        @Parameter(description = "ID del ejercicio a obtener", required = true) @PathVariable Long id);

    @Operation(summary = "Crear un nuevo ejercicio", description = "Crea un nuevo ejercicio en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Ejercicio creado exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = EjerciciosDTO.class))),
        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content)
    })
    ResponseEntity<EjerciciosDTO> crearEjercicio(
        @Parameter(description = "Datos del ejercicio a crear", required = true) @RequestBody @Valid CrearEjerciciosDTO dto);

    @Operation(summary = "Actualizar un ejercicio", description = "Actualiza la información de un ejercicio existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Ejercicio actualizado exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = EjerciciosDTO.class))),
        @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content),
        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content)
    })
    ResponseEntity<EjerciciosDTO> actualizarEjercicio(
        @Parameter(description = "ID del ejercicio a actualizar", required = true) @PathVariable Long id,
        @Parameter(description = "Nuevos datos del ejercicio", required = true) @RequestBody @Valid ModificarEjerciciosDTO dto);

    @Operation(summary = "Eliminar un ejercicio", description = "Elimina un ejercicio existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Ejercicio eliminado exitosamente", content = @Content),
        @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content)
    })
    ResponseEntity<?> eliminarEjercicio(
        @Parameter(description = "ID del ejercicio a eliminar", required = true) @PathVariable Long id);
}
