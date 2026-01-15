package com.gestioneventos.cofira.api;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.gestioneventos.cofira.dto.usuario.CrearUsuarioDTO;
import com.gestioneventos.cofira.dto.usuario.ModificarUsuarioDTO;
import com.gestioneventos.cofira.dto.usuario.UsuarioDetalleDTO;
import com.gestioneventos.cofira.dto.usuario.UsuarioListadoDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Usuarios", description = "API para gestión de usuarios")
public interface UsuarioControllerApi {

    @Operation(summary = "Listar usuarios", description = "Obtiene una lista paginada de usuarios con filtro opcional por nombre")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de usuarios obtenida exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class)))
    })
    ResponseEntity<Page<UsuarioListadoDTO>> listarUsuarios(
        @Parameter(description = "Filtro por nombre de usuario") @RequestParam(required = false) String nombre,
        @ParameterObject Pageable pageable);

    @Operation(summary = "Obtener usuario por ID", description = "Obtiene los detalles completos de un usuario específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario encontrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UsuarioDetalleDTO.class))),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content)
    })
    ResponseEntity<UsuarioDetalleDTO> obtenerUsuario(
        @Parameter(description = "ID del usuario a obtener", required = true) @PathVariable Long id);

    @Operation(summary = "Obtener usuario por email", description = "Obtiene los detalles completos de un usuario por su email")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario encontrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UsuarioDetalleDTO.class))),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content)
    })
    ResponseEntity<UsuarioDetalleDTO> obtenerUsuarioPorEmail(
        @Parameter(description = "Email del usuario a buscar", required = true) @RequestParam("email") String email);

    @Operation(summary = "Crear un nuevo usuario", description = "Crea un nuevo usuario en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario creado exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UsuarioDetalleDTO.class))),
        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content)
    })
    ResponseEntity<UsuarioDetalleDTO> crearUsuario(
        @Parameter(description = "Datos del usuario a crear", required = true) @RequestBody @Valid CrearUsuarioDTO crearUsuarioDTO);

    @Operation(summary = "Actualizar un usuario", description = "Actualiza la información de un usuario existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario actualizado exitosamente",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UsuarioDetalleDTO.class))),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content),
        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content)
    })
    ResponseEntity<UsuarioDetalleDTO> actualizarUsuario(
        @Parameter(description = "ID del usuario a actualizar", required = true) @PathVariable Long id,
        @Parameter(description = "Nuevos datos del usuario", required = true) @RequestBody @Valid ModificarUsuarioDTO modificarUsuarioDTO);

    @Operation(summary = "Eliminar un usuario", description = "Elimina un usuario existente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Usuario eliminado exitosamente", content = @Content),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content)
    })
    ResponseEntity<?> eliminarUsuario(
        @Parameter(description = "ID del usuario a eliminar", required = true) @PathVariable Long id);
}
