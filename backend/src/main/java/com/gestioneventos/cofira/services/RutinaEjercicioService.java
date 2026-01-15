package com.gestioneventos.cofira.services;

import com.gestioneventos.cofira.dto.ejercicios.EjerciciosDTO;
import com.gestioneventos.cofira.dto.rutinaejercicio.*;
import com.gestioneventos.cofira.entities.DiaEjercicio;
import com.gestioneventos.cofira.entities.Ejercicios;
import com.gestioneventos.cofira.entities.RutinaEjercicio;
import com.gestioneventos.cofira.enums.DiaSemana;
import com.gestioneventos.cofira.exceptions.RecursoNoEncontradoException;
import com.gestioneventos.cofira.repositories.EjerciciosRepository;
import com.gestioneventos.cofira.repositories.RutinaEjercicioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RutinaEjercicioService {
    private static final String RUTINA_NO_ENCONTRADA = "Rutina de ejercicio no encontrada con id ";
    private static final String EJERCICIO_NO_ENCONTRADO = "Ejercicio no encontrado con id ";

    private final RutinaEjercicioRepository rutinaEjercicioRepository;
    private final EjerciciosRepository ejerciciosRepository;

    public RutinaEjercicioService(RutinaEjercicioRepository rutinaEjercicioRepository,
                                  EjerciciosRepository ejerciciosRepository) {
        this.rutinaEjercicioRepository = rutinaEjercicioRepository;
        this.ejerciciosRepository = ejerciciosRepository;
    }

    public List<RutinaEjercicioDTO> listarRutinas() {
        return rutinaEjercicioRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public RutinaEjercicioDTO obtenerRutina(Long id) {
        RutinaEjercicio rutina = rutinaEjercicioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(RUTINA_NO_ENCONTRADA + id));
        return convertirADTO(rutina);
    }

    @Transactional
    public RutinaEjercicioDTO crearRutina(CrearRutinaEjercicioDTO dto) {
        RutinaEjercicio rutina = new RutinaEjercicio();
        rutina.setFechaInicio(dto.getFechaInicio());

        List<DiaEjercicio> dias = dto.getDiasEjercicio().stream()
                .map(this::convertirDiaEjercicioDTOAEntidad)
                .collect(Collectors.toList());

        rutina.setDiasEjercicio(dias);

        RutinaEjercicio guardada = rutinaEjercicioRepository.save(rutina);
        return convertirADTO(guardada);
    }

    @Transactional
    public void eliminarRutina(Long id) {
        RutinaEjercicio rutina = rutinaEjercicioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(RUTINA_NO_ENCONTRADA + id));
        rutinaEjercicioRepository.delete(rutina);
    }

    public RutinaEjercicioDTO convertirADTO(RutinaEjercicio rutina) {
        RutinaEjercicioDTO dto = new RutinaEjercicioDTO();
        dto.setId(rutina.getId());
        dto.setFechaInicio(rutina.getFechaInicio());

        if (rutina.getDiasEjercicio() != null) {
            List<DiaEjercicioDTO> diasDTO = rutina.getDiasEjercicio().stream()
                    .map(this::convertirDiaEjercicioADTO)
                    .collect(Collectors.toList());
            dto.setDiasEjercicio(diasDTO);
        }

        return dto;
    }

    private DiaEjercicioDTO convertirDiaEjercicioADTO(DiaEjercicio dia) {
        DiaEjercicioDTO dto = new DiaEjercicioDTO();
        dto.setId(dia.getId());
        dto.setDiaSemana(dia.getDiaSemana().name());

        if (dia.getEjercicios() != null) {
            List<EjerciciosDTO> ejerciciosDTO = dia.getEjercicios().stream()
                    .map(this::convertirEjercicioADTO)
                    .collect(Collectors.toList());
            dto.setEjercicios(ejerciciosDTO);
        }

        return dto;
    }

    private EjerciciosDTO convertirEjercicioADTO(Ejercicios ejercicio) {
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

    private DiaEjercicio convertirDiaEjercicioDTOAEntidad(CrearDiaEjercicioDTO dto) {
        DiaEjercicio dia = new DiaEjercicio();
        dia.setDiaSemana(DiaSemana.valueOf(dto.getDiaSemana().toUpperCase()));

        if (dto.getEjerciciosIds() != null && !dto.getEjerciciosIds().isEmpty()) {
            List<Ejercicios> ejercicios = dto.getEjerciciosIds().stream()
                    .map(id -> ejerciciosRepository.findById(id)
                            .orElseThrow(() -> new RecursoNoEncontradoException(EJERCICIO_NO_ENCONTRADO + id)))
                    .collect(Collectors.toList());
            dia.setEjercicios(ejercicios);
        }

        return dia;
    }
}
