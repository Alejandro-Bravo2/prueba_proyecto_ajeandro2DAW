package com.gestioneventos.cofira.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gestioneventos.cofira.dto.alimento.AlimentoDTO;
import com.gestioneventos.cofira.dto.alimento.CrearAlimentoDTO;
import com.gestioneventos.cofira.dto.alimento.ModificarAlimentoDTO;
import com.gestioneventos.cofira.entities.Alimento;
import com.gestioneventos.cofira.exceptions.RecursoNoEncontradoException;
import com.gestioneventos.cofira.repositories.AlimentoRepository;

@Service
public class AlimentoService {
    private static final String ALIMENTO_NO_ENCONTRADO = "Alimento no encontrado con id ";

    private final AlimentoRepository alimentoRepository;

    public AlimentoService(AlimentoRepository alimentoRepository) {
        this.alimentoRepository = alimentoRepository;
    }

    public List<AlimentoDTO> listarAlimentos(String nombre) {
        List<Alimento> alimentos;
        
        if (nombre != null && !nombre.trim().isEmpty()) {
            alimentos = alimentoRepository.findByNombreContainingIgnoreCase(nombre);
        } else {
            alimentos = alimentoRepository.findAll();
        }
        
        return alimentos.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public AlimentoDTO obtenerAlimento(Long id) {
        Alimento alimento = alimentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(ALIMENTO_NO_ENCONTRADO + id));
        return convertirADTO(alimento);
    }

    public AlimentoDTO crearAlimento(CrearAlimentoDTO dto) {
        Alimento alimento = new Alimento();
        alimento.setNombre(dto.getNombre());
        alimento.setIngredientes(dto.getIngredientes());

        Alimento guardado = alimentoRepository.save(alimento);
        return convertirADTO(guardado);
    }

    public AlimentoDTO actualizarAlimento(Long id, ModificarAlimentoDTO dto) {
        Alimento alimento = alimentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(ALIMENTO_NO_ENCONTRADO + id));

        if (dto.getNombre() != null) {
            alimento.setNombre(dto.getNombre());
        }
        if (dto.getIngredientes() != null) {
            alimento.setIngredientes(dto.getIngredientes());
        }

        Alimento actualizado = alimentoRepository.save(alimento);
        return convertirADTO(actualizado);
    }

    public void eliminarAlimento(Long id) {
        Alimento alimento = alimentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(ALIMENTO_NO_ENCONTRADO + id));
        alimentoRepository.delete(alimento);
    }

    private AlimentoDTO convertirADTO(Alimento alimento) {
        AlimentoDTO dto = new AlimentoDTO();
        dto.setId(alimento.getId());
        dto.setNombre(alimento.getNombre());
        dto.setIngredientes(alimento.getIngredientes());
        return dto;
    }
}
