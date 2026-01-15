package com.gestioneventos.cofira.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.gestioneventos.cofira.dto.alimento.AlimentoDTO;
import com.gestioneventos.cofira.dto.alimento.CrearAlimentoDTO;
import com.gestioneventos.cofira.dto.alimento.ModificarAlimentoDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Alimentos", description = "API para gestión de alimentos")
public interface AlimentoControllerApi {

    @Operation(summary = "Listar todos los alimentos", 
               description = "Obtiene una lista de todos los alimentos disponibles. Opcionalmente se puede filtrar por nombre.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de alimentos obtenida exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlimentoDTO.class)))
    })
    ResponseEntity<List<AlimentoDTO>> listarAlimentos(
        @Parameter(description = "Nombre del alimento para filtrar (opcional)", required = false) 
        @RequestParam(required = false) String nombre);

    @Operation(summary = "Obtener alimento por ID", description = "Obtiene los detalles de un alimento específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Alimento encontrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlimentoDTO.class))),
        @ApiResponse(responseCode = "404", description = "Alimento no encontrado", content = @Content)
    })
    ResponseEntity<AlimentoDTO> obtenerAlimento(
        @Parameter(description = "ID del alimento a obtener", required = true) @PathVariable Long id);

    @Operation(summary = "Crear un nuevo alimento", description = "Crea un nuevo alimento en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Alimento creado exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlimentoDTO.class))),
        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content)
    })
    ResponseEntity<AlimentoDTO> crearAlimento(
        @Parameter(description = "Datos del alimento a crear", required = true) @RequestBody @Valid CrearAlimentoDTO dto);

    @Operation(summary = "Actualizar un alimento", description = "Actualiza la información de un alimento existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Alimento actualizado exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AlimentoDTO.class))),
        @ApiResponse(responseCode = "404", description = "Alimento no encontrado", content = @Content),
        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content)
    })
    ResponseEntity<AlimentoDTO> actualizarAlimento(
        @Parameter(description = "ID del alimento a actualizar", required = true) @PathVariable Long id,
        @Parameter(description = "Nuevos datos del alimento", required = true) @RequestBody @Valid ModificarAlimentoDTO dto);

    @Operation(summary = "Eliminar un alimento", description = "Elimina un alimento existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Alimento eliminado exitosamente", content = @Content),
        @ApiResponse(responseCode = "404", description = "Alimento no encontrado", content = @Content)
    })
    ResponseEntity<?> eliminarAlimento(
        @Parameter(description = "ID del alimento a eliminar", required = true) @PathVariable Long id);
}
