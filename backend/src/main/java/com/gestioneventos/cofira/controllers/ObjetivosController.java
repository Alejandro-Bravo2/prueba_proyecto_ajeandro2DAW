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

import com.gestioneventos.cofira.api.ObjetivosControllerApi;
import com.gestioneventos.cofira.dto.objetivos.CrearObjetivosDTO;
import com.gestioneventos.cofira.dto.objetivos.ModificarObjetivosDTO;
import com.gestioneventos.cofira.dto.objetivos.ObjetivosDTO;
import com.gestioneventos.cofira.services.ObjetivosService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/objetivos")
public class ObjetivosController implements ObjetivosControllerApi {

    private final ObjetivosService objetivosService;

    public ObjetivosController(ObjetivosService objetivosService) {
        this.objetivosService = objetivosService;
    }

    @GetMapping
    public ResponseEntity<List<ObjetivosDTO>> listarObjetivos() {
        List<ObjetivosDTO> objetivos = objetivosService.listarObjetivos();
        return ResponseEntity.ok(objetivos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ObjetivosDTO> obtenerObjetivos(@PathVariable Long id) {
        ObjetivosDTO objetivos = objetivosService.obtenerObjetivos(id);
        return ResponseEntity.ok(objetivos);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<ObjetivosDTO> obtenerObjetivosPorUsuario(@PathVariable Long usuarioId) {
        ObjetivosDTO objetivos = objetivosService.obtenerObjetivosPorUsuario(usuarioId);
        return ResponseEntity.ok(objetivos);
    }

    @PostMapping
    public ResponseEntity<ObjetivosDTO> crearObjetivos(@RequestBody @Valid CrearObjetivosDTO dto) {
        ObjetivosDTO nuevosObjetivos = objetivosService.crearObjetivos(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevosObjetivos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ObjetivosDTO> actualizarObjetivos(@PathVariable Long id,
                                                           @RequestBody @Valid ModificarObjetivosDTO dto) {
        ObjetivosDTO objetivosActualizados = objetivosService.actualizarObjetivos(id, dto);
        return ResponseEntity.ok(objetivosActualizados);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarObjetivos(@PathVariable Long id) {
        objetivosService.eliminarObjetivos(id);
        return ResponseEntity.noContent().build();
    }
}
