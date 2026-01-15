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

import com.gestioneventos.cofira.api.PlanControllerApi;
import com.gestioneventos.cofira.dto.plan.CrearPlanDTO;
import com.gestioneventos.cofira.dto.plan.ModificarPlanDTO;
import com.gestioneventos.cofira.dto.plan.PlanDTO;
import com.gestioneventos.cofira.services.PlanService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/planes")
public class PlanController implements PlanControllerApi {

    private final PlanService planService;

    public PlanController(PlanService planService) {
        this.planService = planService;
    }

    @GetMapping
    public ResponseEntity<List<PlanDTO>> listarPlanes() {
        List<PlanDTO> planes = planService.listarPlanes();
        return ResponseEntity.ok(planes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanDTO> obtenerPlan(@PathVariable Long id) {
        PlanDTO plan = planService.obtenerPlan(id);
        return ResponseEntity.ok(plan);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<PlanDTO> obtenerPlanPorUsuario(@PathVariable Long usuarioId) {
        PlanDTO plan = planService.obtenerPlanPorUsuario(usuarioId);
        return ResponseEntity.ok(plan);
    }

    @PostMapping
    public ResponseEntity<PlanDTO> crearPlan(@RequestBody @Valid CrearPlanDTO dto) {
        PlanDTO nuevoPlan = planService.crearPlan(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPlan);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanDTO> actualizarPlan(@PathVariable Long id,
                                                   @RequestBody @Valid ModificarPlanDTO dto) {
        PlanDTO planActualizado = planService.actualizarPlan(id, dto);
        return ResponseEntity.ok(planActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPlan(@PathVariable Long id) {
        planService.eliminarPlan(id);
        return ResponseEntity.noContent().build();
    }
}
