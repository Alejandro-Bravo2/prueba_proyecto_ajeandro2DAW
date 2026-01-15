package com.gestioneventos.cofira.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestioneventos.cofira.api.EjerciciosControllerApi;
import com.gestioneventos.cofira.dto.ejercicios.CrearEjerciciosDTO;
import com.gestioneventos.cofira.dto.ejercicios.EjerciciosDTO;
import com.gestioneventos.cofira.dto.ejercicios.ModificarEjerciciosDTO;
import com.gestioneventos.cofira.services.EjerciciosService;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/ejercicios")
public class EjerciciosController implements EjerciciosControllerApi {

    private final EjerciciosService ejerciciosService;

    public EjerciciosController(EjerciciosService ejerciciosService) {
        this.ejerciciosService = ejerciciosService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EjerciciosDTO>> listarEjercicios() {
        List<EjerciciosDTO> ejercicios = ejerciciosService.listarEjercicios();
        return ResponseEntity.ok(ejercicios);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EjerciciosDTO> obtenerEjercicio(@PathVariable Long id) {
        EjerciciosDTO ejercicio = ejerciciosService.obtenerEjercicio(id);
        return ResponseEntity.ok(ejercicio);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EjerciciosDTO> crearEjercicio(@RequestBody @Valid CrearEjerciciosDTO dto) {
        EjerciciosDTO nuevoEjercicio = ejerciciosService.crearEjercicio(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoEjercicio);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EjerciciosDTO> actualizarEjercicio(@PathVariable Long id,
                                                             @RequestBody @Valid ModificarEjerciciosDTO dto) {
        EjerciciosDTO ejercicioActualizado = ejerciciosService.actualizarEjercicio(id, dto);
        return ResponseEntity.ok(ejercicioActualizado);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarEjercicio(@PathVariable Long id) {
        ejerciciosService.eliminarEjercicio(id);
        return ResponseEntity.noContent().build();
    }
}
