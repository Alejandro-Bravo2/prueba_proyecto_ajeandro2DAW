package com.gestioneventos.cofira.controllers;

import com.gestioneventos.cofira.dto.sala.CrearSalaDTO;
import com.gestioneventos.cofira.dto.sala.ModificarSalaDTO;
import com.gestioneventos.cofira.dto.sala.SalaDTO;
import com.gestioneventos.cofira.services.SalaDeGimnasioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salas")
public class SalaDeGimnasioController {

    private final SalaDeGimnasioService salaDeGimnasioService;

    @Autowired
    public SalaDeGimnasioController(SalaDeGimnasioService salaDeGimnasioService) {
        this.salaDeGimnasioService = salaDeGimnasioService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SalaDTO>> listarSalas() {
        List<SalaDTO> salas = salaDeGimnasioService.listarSalas();
        return ResponseEntity.ok(salas);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SalaDTO> obtenerSala(@PathVariable Long id) {
        SalaDTO sala = salaDeGimnasioService.obtenerSala(id);
        return ResponseEntity.ok(sala);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalaDTO> crearSala(@RequestBody @Valid CrearSalaDTO dto) {
        SalaDTO nuevaSala = salaDeGimnasioService.crearSala(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaSala);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalaDTO> actualizarSala(@PathVariable Long id,
                                                  @RequestBody @Valid ModificarSalaDTO dto) {
        SalaDTO salaActualizada = salaDeGimnasioService.actualizarSala(id, dto);
        return ResponseEntity.ok(salaActualizada);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarSala(@PathVariable Long id) {
        salaDeGimnasioService.eliminarSala(id);
        return ResponseEntity.noContent().build();
    }
}
