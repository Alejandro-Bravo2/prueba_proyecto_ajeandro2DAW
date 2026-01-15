package com.gestioneventos.cofira.dto.usuario;

import java.util.List;

import com.gestioneventos.cofira.enums.Rol;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrearUsuarioDTO {
    @NotBlank(message = "El nombre no puede estar vacío")
    private String nombre;

    @NotBlank(message = "El username no puede estar vacío")
    private String username;

    @NotBlank(message = "El email no puede estar vacío")
    @Email(message = "El email debe ser válido")
    private String email;

    @NotBlank(message = "La contraseña no puede estar vacía")
    private String password;

    private Rol rol;
    private Integer edad;
    private Double peso;
    private Double altura;
    private List<String> alimentosFavoritos;
    private List<String> alergias;
}
