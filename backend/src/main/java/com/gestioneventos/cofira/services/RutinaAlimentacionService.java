package com.gestioneventos.cofira.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gestioneventos.cofira.dto.ai.IngredienteDTO;
import com.gestioneventos.cofira.dto.rutinaalimentacion.*;
import com.gestioneventos.cofira.entities.*;
import com.gestioneventos.cofira.enums.DiaSemana;
import com.gestioneventos.cofira.exceptions.RecursoNoEncontradoException;
import com.gestioneventos.cofira.repositories.RutinaAlimentacionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RutinaAlimentacionService {
    private static final Logger logger = LoggerFactory.getLogger(RutinaAlimentacionService.class);
    private static final String RUTINA_NO_ENCONTRADA = "Rutina de alimentación no encontrada con id ";

    private final RutinaAlimentacionRepository rutinaAlimentacionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RutinaAlimentacionService(RutinaAlimentacionRepository rutinaAlimentacionRepository) {
        this.rutinaAlimentacionRepository = rutinaAlimentacionRepository;
    }

    public List<RutinaAlimentacionDTO> listarRutinas() {
        return rutinaAlimentacionRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public RutinaAlimentacionDTO obtenerRutina(Long id) {
        RutinaAlimentacion rutina = rutinaAlimentacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(RUTINA_NO_ENCONTRADA + id));
        return convertirADTO(rutina);
    }

    @Transactional
    public RutinaAlimentacionDTO crearRutina(CrearRutinaAlimentacionDTO dto) {
        RutinaAlimentacion rutina = new RutinaAlimentacion();
        rutina.setFechaInicio(dto.getFechaInicio());

        List<DiaAlimentacion> dias = dto.getDiasAlimentacion().stream()
                .map(this::convertirDiaAlimentacionDTOAEntidad)
                .collect(Collectors.toList());

        rutina.setDiasAlimentacion(dias);

        RutinaAlimentacion guardada = rutinaAlimentacionRepository.save(rutina);
        return convertirADTO(guardada);
    }

    @Transactional
    public void eliminarRutina(Long id) {
        RutinaAlimentacion rutina = rutinaAlimentacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(RUTINA_NO_ENCONTRADA + id));
        rutinaAlimentacionRepository.delete(rutina);
    }

    public RutinaAlimentacionDTO convertirADTO(RutinaAlimentacion rutina) {
        RutinaAlimentacionDTO dto = new RutinaAlimentacionDTO();
        dto.setId(rutina.getId());
        dto.setFechaInicio(rutina.getFechaInicio());

        if (rutina.getDiasAlimentacion() != null) {
            List<DiaAlimentacionDTO> diasDTO = rutina.getDiasAlimentacion().stream()
                    .map(this::convertirDiaAlimentacionADTO)
                    .collect(Collectors.toList());
            dto.setDiasAlimentacion(diasDTO);
        }

        return dto;
    }

    private DiaAlimentacionDTO convertirDiaAlimentacionADTO(DiaAlimentacion dia) {
        DiaAlimentacionDTO dto = new DiaAlimentacionDTO();
        dto.setId(dia.getId());
        dto.setDiaSemana(dia.getDiaSemana().name());
        dto.setDesayuno(convertirComidaADTO(dia.getDesayuno()));
        dto.setAlmuerzo(convertirComidaADTO(dia.getAlmuerzo()));
        dto.setComida(convertirComidaADTO(dia.getComida()));
        dto.setMerienda(convertirComidaADTO(dia.getMerienda()));
        dto.setCena(convertirComidaADTO(dia.getCena()));
        return dto;
    }

    private ComidaDTO convertirComidaADTO(Object comida) {
        if (comida == null) return null;

        ComidaDTO dto = new ComidaDTO();
        if (comida instanceof Desayuno d) {
            dto.setId(d.getId());
            dto.setAlimentos(d.getAlimentos());
            dto.setDescripcion(d.getDescripcion());
            dto.setTiempoPreparacionMinutos(d.getTiempoPreparacionMinutos());
            dto.setPorciones(d.getPorciones());
            dto.setDificultad(d.getDificultad());
            dto.setIngredientes(parseIngredientes(d.getIngredientesJson()));
            dto.setPasosPreparacion(d.getPasosPreparacion());
        } else if (comida instanceof Almuerzo a) {
            dto.setId(a.getId());
            dto.setAlimentos(a.getAlimentos());
            dto.setDescripcion(a.getDescripcion());
            dto.setTiempoPreparacionMinutos(a.getTiempoPreparacionMinutos());
            dto.setPorciones(a.getPorciones());
            dto.setDificultad(a.getDificultad());
            dto.setIngredientes(parseIngredientes(a.getIngredientesJson()));
            dto.setPasosPreparacion(a.getPasosPreparacion());
        } else if (comida instanceof Comida c) {
            dto.setId(c.getId());
            dto.setAlimentos(c.getAlimentos());
            dto.setDescripcion(c.getDescripcion());
            dto.setTiempoPreparacionMinutos(c.getTiempoPreparacionMinutos());
            dto.setPorciones(c.getPorciones());
            dto.setDificultad(c.getDificultad());
            dto.setIngredientes(parseIngredientes(c.getIngredientesJson()));
            dto.setPasosPreparacion(c.getPasosPreparacion());
        } else if (comida instanceof Merienda m) {
            dto.setId(m.getId());
            dto.setAlimentos(m.getAlimentos());
            dto.setDescripcion(m.getDescripcion());
            dto.setTiempoPreparacionMinutos(m.getTiempoPreparacionMinutos());
            dto.setPorciones(m.getPorciones());
            dto.setDificultad(m.getDificultad());
            dto.setIngredientes(parseIngredientes(m.getIngredientesJson()));
            dto.setPasosPreparacion(m.getPasosPreparacion());
        } else if (comida instanceof Cena c) {
            dto.setId(c.getId());
            dto.setAlimentos(c.getAlimentos());
            dto.setDescripcion(c.getDescripcion());
            dto.setTiempoPreparacionMinutos(c.getTiempoPreparacionMinutos());
            dto.setPorciones(c.getPorciones());
            dto.setDificultad(c.getDificultad());
            dto.setIngredientes(parseIngredientes(c.getIngredientesJson()));
            dto.setPasosPreparacion(c.getPasosPreparacion());
        }
        return dto;
    }

    private List<IngredienteDTO> parseIngredientes(List<String> ingredientesJson) {
        if (ingredientesJson == null || ingredientesJson.isEmpty()) {
            return new ArrayList<>();
        }

        List<IngredienteDTO> ingredientes = new ArrayList<>();
        for (String json : ingredientesJson) {
            try {
                IngredienteDTO ingrediente = objectMapper.readValue(json, IngredienteDTO.class);
                ingredientes.add(ingrediente);
            } catch (JsonProcessingException e) {
                logger.warn("Error parsing ingredient JSON: {}", e.getMessage());
            }
        }
        return ingredientes;
    }

    private DiaAlimentacion convertirDiaAlimentacionDTOAEntidad(CrearDiaAlimentacionDTO dto) {
        DiaAlimentacion dia = new DiaAlimentacion();
        dia.setDiaSemana(DiaSemana.valueOf(dto.getDiaSemana().toUpperCase()));

        if (dto.getDesayuno() != null) {
            Desayuno desayuno = new Desayuno();
            desayuno.setAlimentos(dto.getDesayuno().getAlimentos());
            dia.setDesayuno(desayuno);
        }

        if (dto.getAlmuerzo() != null) {
            Almuerzo almuerzo = new Almuerzo();
            almuerzo.setAlimentos(dto.getAlmuerzo().getAlimentos());
            dia.setAlmuerzo(almuerzo);
        }

        if (dto.getComida() != null) {
            Comida comida = new Comida();
            comida.setAlimentos(dto.getComida().getAlimentos());
            dia.setComida(comida);
        }

        if (dto.getMerienda() != null) {
            Merienda merienda = new Merienda();
            merienda.setAlimentos(dto.getMerienda().getAlimentos());
            dia.setMerienda(merienda);
        }

        if (dto.getCena() != null) {
            Cena cena = new Cena();
            cena.setAlimentos(dto.getCena().getAlimentos());
            dia.setCena(cena);
        }

        return dia;
    }
}
