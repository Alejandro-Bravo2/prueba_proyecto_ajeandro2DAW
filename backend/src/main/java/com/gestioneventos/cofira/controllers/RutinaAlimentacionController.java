package com.gestioneventos.cofira.controllers;

import com.gestioneventos.cofira.api.RutinaAlimentacionControllerApi;
import com.gestioneventos.cofira.dto.rutinaalimentacion.CrearRutinaAlimentacionDTO;
import com.gestioneventos.cofira.dto.rutinaalimentacion.RutinaAlimentacionDTO;
import com.gestioneventos.cofira.services.RutinaAlimentacionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rutinas-alimentacion")
public class RutinaAlimentacionController implements RutinaAlimentacionControllerApi {

    private final RutinaAlimentacionService rutinaAlimentacionService;

    public RutinaAlimentacionController(RutinaAlimentacionService rutinaAlimentacionService) {
        this.rutinaAlimentacionService = rutinaAlimentacionService;
    }

    @GetMapping
    public ResponseEntity<List<RutinaAlimentacionDTO>> listarRutinas() {
        List<RutinaAlimentacionDTO> rutinas = rutinaAlimentacionService.listarRutinas();
        return ResponseEntity.ok(rutinas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RutinaAlimentacionDTO> obtenerRutina(@PathVariable Long id) {
        RutinaAlimentacionDTO rutina = rutinaAlimentacionService.obtenerRutina(id);
        return ResponseEntity.ok(rutina);
    }

    @PostMapping
    public ResponseEntity<RutinaAlimentacionDTO> crearRutina(@RequestBody @Valid CrearRutinaAlimentacionDTO dto) {
        RutinaAlimentacionDTO nuevaRutina = rutinaAlimentacionService.crearRutina(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaRutina);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarRutina(@PathVariable Long id) {
        rutinaAlimentacionService.eliminarRutina(id);
        return ResponseEntity.noContent().build();
    }
}
