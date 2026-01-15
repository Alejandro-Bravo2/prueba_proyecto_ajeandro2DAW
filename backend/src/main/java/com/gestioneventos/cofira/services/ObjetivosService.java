package com.gestioneventos.cofira.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gestioneventos.cofira.dto.objetivos.CrearObjetivosDTO;
import com.gestioneventos.cofira.dto.objetivos.ModificarObjetivosDTO;
import com.gestioneventos.cofira.dto.objetivos.ObjetivosDTO;
import com.gestioneventos.cofira.entities.Objetivos;
import com.gestioneventos.cofira.entities.Usuario;
import com.gestioneventos.cofira.exceptions.RecursoNoEncontradoException;
import com.gestioneventos.cofira.repositories.ObjetivosRepository;
import com.gestioneventos.cofira.repositories.UsuarioRepository;

@Service
public class ObjetivosService {
    private static final String OBJETIVOS_NO_ENCONTRADOS = "Objetivos no encontrados con id ";
    private static final String USUARIO_NO_ENCONTRADO = "Usuario no encontrado con id ";

    private final ObjetivosRepository objetivosRepository;
    private final UsuarioRepository usuarioRepository;

    public ObjetivosService(ObjetivosRepository objetivosRepository, UsuarioRepository usuarioRepository) {
        this.objetivosRepository = objetivosRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<ObjetivosDTO> listarObjetivos() {
        return objetivosRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public ObjetivosDTO obtenerObjetivos(Long id) {
        Objetivos objetivos = objetivosRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(OBJETIVOS_NO_ENCONTRADOS + id));
        return convertirADTO(objetivos);
    }

    public ObjetivosDTO obtenerObjetivosPorUsuario(Long usuarioId) {
        Objetivos objetivos = objetivosRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Objetivos no encontrados para usuario con id " + usuarioId));
        return convertirADTO(objetivos);
    }

    public ObjetivosDTO crearObjetivos(CrearObjetivosDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RecursoNoEncontradoException(USUARIO_NO_ENCONTRADO + dto.getUsuarioId()));
        
        Objetivos objetivos = new Objetivos();
        objetivos.setListaObjetivos(dto.getListaObjetivos());
        objetivos.setUsuario(usuario);
        
        Objetivos guardados = objetivosRepository.save(objetivos);
        return convertirADTO(guardados);
    }

    public ObjetivosDTO actualizarObjetivos(Long id, ModificarObjetivosDTO dto) {
        Objetivos objetivos = objetivosRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(OBJETIVOS_NO_ENCONTRADOS + id));

        if (dto.getListaObjetivos() != null && !dto.getListaObjetivos().isEmpty()) {
            objetivos.setListaObjetivos(dto.getListaObjetivos());
        }

        Objetivos actualizado = objetivosRepository.save(objetivos);
        return convertirADTO(actualizado);
    }

    public void eliminarObjetivos(Long id) {
        Objetivos objetivos = objetivosRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(OBJETIVOS_NO_ENCONTRADOS + id));
        objetivosRepository.delete(objetivos);
    }

    private ObjetivosDTO convertirADTO(Objetivos objetivos) {
        ObjetivosDTO dto = new ObjetivosDTO();
        dto.setId(objetivos.getId());
        dto.setListaObjetivos(objetivos.getListaObjetivos());
        if (objetivos.getUsuario() != null) {
            dto.setUsuarioId(objetivos.getUsuario().getId());
        }
        return dto;
    }
}
