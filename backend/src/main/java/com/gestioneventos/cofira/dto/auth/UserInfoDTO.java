package com.gestioneventos.cofira.dto.auth;

import com.gestioneventos.cofira.enums.Rol;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Información del usuario autenticado")
public class UserInfoDTO {
    @Schema(description = "ID único del usuario", example = "1")
    private Long id;

    @Schema(description = "Nombre completo del usuario", example = "Juan Pérez")
    private String nombre;

    @Schema(description = "Nombre de usuario para login", example = "juanperez")
    private String username;

    @Schema(description = "Email del usuario", example = "juan@ejemplo.com")
    private String email;

    @Schema(description = "Rol del usuario", example = "USER")
    private Rol rol;

    @Schema(description = "Edad del usuario en años", example = "25")
    private Integer edad;

    @Schema(description = "Peso del usuario en kg", example = "75.5")
    private Double peso;

    @Schema(description = "Altura del usuario en metros", example = "1.75")
    private Double altura;
}
