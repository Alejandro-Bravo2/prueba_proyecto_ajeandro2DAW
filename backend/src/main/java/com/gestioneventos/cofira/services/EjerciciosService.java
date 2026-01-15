package com.gestioneventos.cofira.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gestioneventos.cofira.dto.ejercicios.CrearEjerciciosDTO;
import com.gestioneventos.cofira.dto.ejercicios.EjerciciosDTO;
import com.gestioneventos.cofira.dto.ejercicios.ModificarEjerciciosDTO;
import com.gestioneventos.cofira.entities.Ejercicios;
import com.gestioneventos.cofira.exceptions.RecursoNoEncontradoException;
import com.gestioneventos.cofira.repositories.EjerciciosRepository;

@Service
public class EjerciciosService {
    private static final String EJERCICIO_NO_ENCONTRADO = "Ejercicio no encontrado con id ";

    private final EjerciciosRepository ejerciciosRepository;

    public EjerciciosService(EjerciciosRepository ejerciciosRepository) {
        this.ejerciciosRepository = ejerciciosRepository;
    }

    public List<EjerciciosDTO> listarEjercicios() {
        return ejerciciosRepository.findAll().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public EjerciciosDTO obtenerEjercicio(Long id) {
        Ejercicios ejercicio = ejerciciosRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(EJERCICIO_NO_ENCONTRADO + id));
        return convertirADTO(ejercicio);
    }

    public EjerciciosDTO crearEjercicio(CrearEjerciciosDTO dto) {
        Ejercicios ejercicio = new Ejercicios();
        ejercicio.setNombreEjercicio(dto.getNombreEjercicio());
        ejercicio.setSeries(dto.getSeries());
        ejercicio.setRepeticiones(dto.getRepeticiones());
        ejercicio.setTiempoDescansoSegundos(dto.getTiempoDescansoSegundos());
        ejercicio.setDescripcion(dto.getDescripcion());
        ejercicio.setGrupoMuscular(dto.getGrupoMuscular());

        Ejercicios ejercicioGuardado = ejerciciosRepository.save(ejercicio);
        return convertirADTO(ejercicioGuardado);
    }

    public EjerciciosDTO actualizarEjercicio(Long id, ModificarEjerciciosDTO dto) {
        Ejercicios ejercicio = ejerciciosRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(EJERCICIO_NO_ENCONTRADO + id));

        if (dto.getNombreEjercicio() != null) {
            ejercicio.setNombreEjercicio(dto.getNombreEjercicio());
        }
        if (dto.getSeries() != null) {
            ejercicio.setSeries(dto.getSeries());
        }
        if (dto.getRepeticiones() != null) {
            ejercicio.setRepeticiones(dto.getRepeticiones());
        }
        if (dto.getTiempoDescansoSegundos() != null) {
            ejercicio.setTiempoDescansoSegundos(dto.getTiempoDescansoSegundos());
        }
        if (dto.getDescripcion() != null) {
            ejercicio.setDescripcion(dto.getDescripcion());
        }
        if (dto.getGrupoMuscular() != null) {
            ejercicio.setGrupoMuscular(dto.getGrupoMuscular());
        }

        Ejercicios ejercicioActualizado = ejerciciosRepository.save(ejercicio);
        return convertirADTO(ejercicioActualizado);
    }

    public void eliminarEjercicio(Long id) {
        Ejercicios ejercicio = ejerciciosRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(EJERCICIO_NO_ENCONTRADO + id));
        ejerciciosRepository.delete(ejercicio);
    }

    private EjerciciosDTO convertirADTO(Ejercicios ejercicio) {
        EjerciciosDTO dto = new EjerciciosDTO();
        dto.setId(ejercicio.getId());
        dto.setNombreEjercicio(ejercicio.getNombreEjercicio());
        dto.setSeries(ejercicio.getSeries());
        dto.setRepeticiones(ejercicio.getRepeticiones());
        dto.setTiempoDescansoSegundos(ejercicio.getTiempoDescansoSegundos());
        dto.setDescripcion(ejercicio.getDescripcion());
        dto.setGrupoMuscular(ejercicio.getGrupoMuscular());
        return dto;
    }
}
