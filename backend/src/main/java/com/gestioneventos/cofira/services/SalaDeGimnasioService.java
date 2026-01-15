package com.gestioneventos.cofira.services;

import com.gestioneventos.cofira.dto.sala.CrearSalaDTO;
import com.gestioneventos.cofira.dto.sala.ModificarSalaDTO;
import com.gestioneventos.cofira.dto.sala.SalaDTO;
import com.gestioneventos.cofira.entities.SalaDeGimnasio;
import com.gestioneventos.cofira.exceptions.RecursoNoEncontradoException;
import com.gestioneventos.cofira.repositories.SalaDeGimnasioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalaDeGimnasioService {
    private static final String SALA_NO_ENCONTRADA = "Sala de gimnasio no encontrada con id ";

    private final SalaDeGimnasioRepository salaDeGimnasioRepository;

    public SalaDeGimnasioService(SalaDeGimnasioRepository salaDeGimnasioRepository) {
        this.salaDeGimnasioRepository = salaDeGimnasioRepository;
    }

    public List<SalaDTO> listarSalas() {
        return salaDeGimnasioRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public SalaDTO obtenerSala(Long id) {
        SalaDeGimnasio sala = salaDeGimnasioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(SALA_NO_ENCONTRADA + id));
        return convertirADTO(sala);
    }

    public SalaDTO crearSala(CrearSalaDTO dto) {
        validarFechas(dto.getFechaInicio(), dto.getFechaFin());
        
        SalaDeGimnasio sala = new SalaDeGimnasio();
        sala.setFechaInicio(dto.getFechaInicio());
        sala.setFechaFin(dto.getFechaFin());
        
        SalaDeGimnasio guardada = salaDeGimnasioRepository.save(sala);
        return convertirADTO(guardada);
    }

    public SalaDTO actualizarSala(Long id, ModificarSalaDTO dto) {
        SalaDeGimnasio sala = salaDeGimnasioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(SALA_NO_ENCONTRADA + id));

        if (dto.getFechaInicio() != null) {
            sala.setFechaInicio(dto.getFechaInicio());
        }
        if (dto.getFechaFin() != null) {
            sala.setFechaFin(dto.getFechaFin());
        }
        
        // Validar que después de actualizar las fechas sean coherentes
        if (sala.getFechaInicio() != null && sala.getFechaFin() != null) {
            validarFechas(sala.getFechaInicio(), sala.getFechaFin());
        }

        SalaDeGimnasio actualizada = salaDeGimnasioRepository.save(sala);
        return convertirADTO(actualizada);
    }

    public void eliminarSala(Long id) {
        SalaDeGimnasio sala = salaDeGimnasioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(SALA_NO_ENCONTRADA + id));
        salaDeGimnasioRepository.delete(sala);
    }

    private void validarFechas(java.time.LocalDate fechaInicio, java.time.LocalDate fechaFin) {
        if (fechaInicio != null && fechaFin != null && fechaInicio.isAfter(fechaFin)) {
            throw new IllegalArgumentException("La fecha de inicio no puede ser posterior a la fecha de fin");
        }
    }

    private SalaDTO convertirADTO(SalaDeGimnasio sala) {
        SalaDTO dto = new SalaDTO();
        dto.setId(sala.getId());
        dto.setFechaInicio(sala.getFechaInicio());
        dto.setFechaFin(sala.getFechaFin());
        return dto;
    }
}
