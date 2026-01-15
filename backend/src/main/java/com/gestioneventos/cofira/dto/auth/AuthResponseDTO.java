package com.gestioneventos.cofira.dto.auth;

import com.gestioneventos.cofira.enums.Rol;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private Rol rol;
    @Builder.Default
    private Boolean isOnboarded = false;
}
