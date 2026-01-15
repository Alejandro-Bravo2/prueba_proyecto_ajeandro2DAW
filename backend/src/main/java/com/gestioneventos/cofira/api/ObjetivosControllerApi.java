package com.gestioneventos.cofira.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import com.gestioneventos.cofira.dto.objetivos.CrearObjetivosDTO;
import com.gestioneventos.cofira.dto.objetivos.ModificarObjetivosDTO;
import com.gestioneventos.cofira.dto.objetivos.ObjetivosDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Objetivos", description = "API para gestión de objetivos de usuarios")
public interface ObjetivosControllerApi {

    @Operation(summary = "Listar todos los objetivos", description = "Obtiene una lista de todos los objetivos disponibles")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de objetivos obtenida exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ObjetivosDTO.class)))
    })
    ResponseEntity<List<ObjetivosDTO>> listarObjetivos();

    @Operation(summary = "Obtener objetivos por ID", description = "Obtiene los detalles de objetivos específicos")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Objetivos encontrados",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ObjetivosDTO.class))),
        @ApiResponse(responseCode = "404", description = "Objetivos no encontrados", content = @Content)
    })
    ResponseEntity<ObjetivosDTO> obtenerObjetivos(
        @Parameter(description = "ID de los objetivos a obtener", required = true) @PathVariable Long id);

    @Operation(summary = "Obtener objetivos por usuario", description = "Obtiene los objetivos asociados a un usuario específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Objetivos del usuario encontrados",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ObjetivosDTO.class))),
        @ApiResponse(responseCode = "404", description = "Objetivos no encontrados para el usuario", content = @Content)
    })
    ResponseEntity<ObjetivosDTO> obtenerObjetivosPorUsuario(
        @Parameter(description = "ID del usuario", required = true) @PathVariable Long usuarioId);

    @Operation(summary = "Crear nuevos objetivos", description = "Crea nuevos objetivos para un usuario")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Objetivos creados exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ObjetivosDTO.class))),
        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content)
    })
    ResponseEntity<ObjetivosDTO> crearObjetivos(
        @Parameter(description = "Datos de los objetivos a crear", required = true) @RequestBody @Valid CrearObjetivosDTO dto);

    @Operation(summary = "Actualizar objetivos", description = "Actualiza la información de objetivos existentes")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Objetivos actualizados exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ObjetivosDTO.class))),
        @ApiResponse(responseCode = "404", description = "Objetivos no encontrados", content = @Content),
        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content)
    })
    ResponseEntity<ObjetivosDTO> actualizarObjetivos(
        @Parameter(description = "ID de los objetivos a actualizar", required = true) @PathVariable Long id,
        @Parameter(description = "Nuevos datos de los objetivos", required = true) @RequestBody @Valid ModificarObjetivosDTO dto);

    @Operation(summary = "Eliminar objetivos", description = "Elimina objetivos existentes")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Objetivos eliminados exitosamente", content = @Content),
        @ApiResponse(responseCode = "404", description = "Objetivos no encontrados", content = @Content)
    })
    ResponseEntity<?> eliminarObjetivos(
        @Parameter(description = "ID de los objetivos a eliminar", required = true) @PathVariable Long id);
}
