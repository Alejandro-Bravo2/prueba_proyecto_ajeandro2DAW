package com.gestioneventos.cofira.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequestDTO {

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email no es valido")
    private String email;

    @NotBlank(message = "El codigo de verificacion es obligatorio")
    @Size(min = 6, max = 6, message = "El codigo debe tener 6 digitos")
    private String code;

    @NotBlank(message = "La nueva contrasena es obligatoria")
    @Size(min = 12, message = "La contrasena debe tener al menos 12 caracteres")
    private String newPassword;
}
