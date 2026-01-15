package com.gestioneventos.cofira.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gestioneventos.cofira.dto.plan.CrearPlanDTO;
import com.gestioneventos.cofira.dto.plan.ModificarPlanDTO;
import com.gestioneventos.cofira.dto.plan.PlanDTO;
import com.gestioneventos.cofira.entities.Plan;
import com.gestioneventos.cofira.entities.Usuario;
import com.gestioneventos.cofira.exceptions.RecursoNoEncontradoException;
import com.gestioneventos.cofira.repositories.PlanRepository;
import com.gestioneventos.cofira.repositories.UsuarioRepository;

@Service
public class PlanService {
    private static final String PLAN_NO_ENCONTRADO = "Plan no encontrado con id ";
    private static final String USUARIO_NO_ENCONTRADO = "Usuario no encontrado con id ";

    private final PlanRepository planRepository;
    private final UsuarioRepository usuarioRepository;

    public PlanService(PlanRepository planRepository, UsuarioRepository usuarioRepository) {
        this.planRepository = planRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<PlanDTO> listarPlanes() {
        return planRepository.findAll().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public PlanDTO obtenerPlan(Long id) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(PLAN_NO_ENCONTRADO + id));
        return convertirADTO(plan);
    }

    public PlanDTO obtenerPlanPorUsuario(Long usuarioId) {
        Plan plan = planRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan no encontrado para usuario con id " + usuarioId));
        return convertirADTO(plan);
    }

    public PlanDTO crearPlan(CrearPlanDTO dto) {
        // Validar que el usuario existe
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RecursoNoEncontradoException(USUARIO_NO_ENCONTRADO + dto.getUsuarioId()));

        Plan plan = new Plan();
        plan.setPrecio(dto.getPrecio());
        plan.setSubscripcionActiva(dto.getSubscripcionActiva());
        plan.setUsuario(usuario);

        Plan planGuardado = planRepository.save(plan);
        return convertirADTO(planGuardado);
    }

    public PlanDTO actualizarPlan(Long id, ModificarPlanDTO dto) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(PLAN_NO_ENCONTRADO + id));

        if (dto.getPrecio() != null) {
            plan.setPrecio(dto.getPrecio());
        }
        if (dto.getSubscripcionActiva() != null) {
            plan.setSubscripcionActiva(dto.getSubscripcionActiva());
        }
        if (dto.getUsuarioId() != null) {
            Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(USUARIO_NO_ENCONTRADO + dto.getUsuarioId()));
            plan.setUsuario(usuario);
        }

        Plan planActualizado = planRepository.save(plan);
        return convertirADTO(planActualizado);
    }

    public void eliminarPlan(Long id) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(PLAN_NO_ENCONTRADO + id));
        planRepository.delete(plan);
    }

    private PlanDTO convertirADTO(Plan plan) {
        PlanDTO dto = new PlanDTO();
        dto.setId(plan.getId());
        dto.setPrecio(plan.getPrecio());
        dto.setSubscripcionActiva(plan.getSubscripcionActiva());
        if (plan.getUsuario() != null) {
            dto.setUsuarioId(plan.getUsuario().getId());
        }
        return dto;
    }
}
