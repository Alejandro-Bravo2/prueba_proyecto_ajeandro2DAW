package com.gestioneventos.cofira.api;

import com.gestioneventos.cofira.dto.rutinaalimentacion.CrearRutinaAlimentacionDTO;
import com.gestioneventos.cofira.dto.rutinaalimentacion.RutinaAlimentacionDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Tag(name = "Rutinas de Alimentación", description = "API para gestión de rutinas de alimentación semanales")
public interface RutinaAlimentacionControllerApi {

    @Operation(summary = "Listar todas las rutinas de alimentación", description = "Obtiene una lista de todas las rutinas de alimentación")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de rutinas obtenida exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = RutinaAlimentacionDTO.class)))
    })
    ResponseEntity<List<RutinaAlimentacionDTO>> listarRutinas();

    @Operation(summary = "Obtener rutina por ID", description = "Obtiene los detalles de una rutina de alimentación específica")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Rutina encontrada",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = RutinaAlimentacionDTO.class))),
        @ApiResponse(responseCode = "404", description = "Rutina no encontrada", content = @Content)
    })
    ResponseEntity<RutinaAlimentacionDTO> obtenerRutina(
        @Parameter(description = "ID de la rutina a obtener", required = true) @PathVariable Long id);

    @Operation(summary = "Crear una nueva rutina de alimentación", description = "Crea una nueva rutina de alimentación con 7 días")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Rutina creada exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = RutinaAlimentacionDTO.class))),
        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content)
    })
    ResponseEntity<RutinaAlimentacionDTO> crearRutina(
        @Parameter(description = "Datos de la rutina a crear", required = true) @RequestBody @Valid CrearRutinaAlimentacionDTO dto);

    @Operation(summary = "Eliminar una rutina de alimentación", description = "Elimina una rutina de alimentación existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Rutina eliminada exitosamente", content = @Content),
        @ApiResponse(responseCode = "404", description = "Rutina no encontrada", content = @Content)
    })
    ResponseEntity<?> eliminarRutina(
        @Parameter(description = "ID de la rutina a eliminar", required = true) @PathVariable Long id);
}
