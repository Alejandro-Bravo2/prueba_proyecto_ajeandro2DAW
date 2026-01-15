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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gestioneventos.cofira.api.AlimentoControllerApi;
import com.gestioneventos.cofira.dto.alimento.AlimentoDTO;
import com.gestioneventos.cofira.dto.alimento.CrearAlimentoDTO;
import com.gestioneventos.cofira.dto.alimento.ModificarAlimentoDTO;
import com.gestioneventos.cofira.services.AlimentoService;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/alimentos")
public class AlimentoController implements AlimentoControllerApi {

    private final AlimentoService alimentoService;

    public AlimentoController(AlimentoService alimentoService) {
        this.alimentoService = alimentoService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AlimentoDTO>> listarAlimentos(
            @RequestParam(required = false) String nombre) {
        List<AlimentoDTO> alimentos = alimentoService.listarAlimentos(nombre);
        return ResponseEntity.ok(alimentos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AlimentoDTO> obtenerAlimento(@PathVariable Long id) {
        AlimentoDTO alimento = alimentoService.obtenerAlimento(id);
        return ResponseEntity.ok(alimento);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AlimentoDTO> crearAlimento(@RequestBody @Valid CrearAlimentoDTO dto) {
        AlimentoDTO nuevoAlimento = alimentoService.crearAlimento(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoAlimento);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AlimentoDTO> actualizarAlimento(@PathVariable Long id,
                                                          @RequestBody @Valid ModificarAlimentoDTO dto) {
        AlimentoDTO alimentoActualizado = alimentoService.actualizarAlimento(id, dto);
        return ResponseEntity.ok(alimentoActualizado);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarAlimento(@PathVariable Long id) {
        alimentoService.eliminarAlimento(id);
        return ResponseEntity.noContent().build();
    }
}
