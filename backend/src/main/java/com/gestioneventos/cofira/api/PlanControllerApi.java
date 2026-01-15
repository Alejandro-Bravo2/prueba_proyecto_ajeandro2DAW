package com.gestioneventos.cofira.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import com.gestioneventos.cofira.dto.plan.CrearPlanDTO;
import com.gestioneventos.cofira.dto.plan.ModificarPlanDTO;
import com.gestioneventos.cofira.dto.plan.PlanDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Planes", description = "API para gestión de planes de entrenamiento y alimentación")
public interface PlanControllerApi {

    @Operation(summary = "Listar todos los planes", description = "Obtiene una lista de todos los planes disponibles")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de planes obtenida exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = PlanDTO.class)))
    })
    ResponseEntity<List<PlanDTO>> listarPlanes();

    @Operation(summary = "Obtener plan por ID", description = "Obtiene los detalles de un plan específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Plan encontrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = PlanDTO.class))),
        @ApiResponse(responseCode = "404", description = "Plan no encontrado", content = @Content)
    })
    ResponseEntity<PlanDTO> obtenerPlan(
        @Parameter(description = "ID del plan a obtener", required = true) @PathVariable Long id);

    @Operation(summary = "Obtener plan por usuario", description = "Obtiene el plan asociado a un usuario específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Plan del usuario encontrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = PlanDTO.class))),
        @ApiResponse(responseCode = "404", description = "Plan no encontrado para el usuario", content = @Content)
    })
    ResponseEntity<PlanDTO> obtenerPlanPorUsuario(
        @Parameter(description = "ID del usuario", required = true) @PathVariable Long usuarioId);

    @Operation(summary = "Crear un nuevo plan", description = "Crea un nuevo plan de entrenamiento y alimentación")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Plan creado exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = PlanDTO.class))),
        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content)
    })
    ResponseEntity<PlanDTO> crearPlan(
        @Parameter(description = "Datos del plan a crear", required = true) @RequestBody @Valid CrearPlanDTO dto);

    @Operation(summary = "Actualizar un plan", description = "Actualiza la información de un plan existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Plan actualizado exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = PlanDTO.class))),
        @ApiResponse(responseCode = "404", description = "Plan no encontrado", content = @Content),
        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content)
    })
    ResponseEntity<PlanDTO> actualizarPlan(
        @Parameter(description = "ID del plan a actualizar", required = true) @PathVariable Long id,
        @Parameter(description = "Nuevos datos del plan", required = true) @RequestBody @Valid ModificarPlanDTO dto);

    @Operation(summary = "Eliminar un plan", description = "Elimina un plan existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Plan eliminado exitosamente", content = @Content),
        @ApiResponse(responseCode = "404", description = "Plan no encontrado", content = @Content)
    })
    ResponseEntity<?> eliminarPlan(
        @Parameter(description = "ID del plan a eliminar", required = true) @PathVariable Long id);
}
