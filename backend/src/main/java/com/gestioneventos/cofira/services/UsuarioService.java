package com.gestioneventos.cofira.services;

import com.gestioneventos.cofira.dto.usuario.CrearUsuarioDTO;
import com.gestioneventos.cofira.dto.usuario.ModificarUsuarioDTO;
import com.gestioneventos.cofira.dto.usuario.UsuarioDetalleDTO;
import com.gestioneventos.cofira.dto.usuario.UsuarioListadoDTO;
import com.gestioneventos.cofira.entities.Usuario;
import com.gestioneventos.cofira.enums.Rol;
import com.gestioneventos.cofira.exceptions.RecursoDuplicadoException;
import com.gestioneventos.cofira.exceptions.RecursoNoEncontradoException;
import com.gestioneventos.cofira.repositories.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {
    private static final String USUARIO_NO_ENCONTRADO = "Usuario no encontrado con id ";

    private final UsuarioRepository usuarioRepository;
    private final RutinaAlimentacionService rutinaAlimentacionService;
    private final RutinaEjercicioService rutinaEjercicioService;

    public UsuarioService(UsuarioRepository usuarioRepository,
                         RutinaAlimentacionService rutinaAlimentacionService,
                         RutinaEjercicioService rutinaEjercicioService) {
        this.usuarioRepository = usuarioRepository;
        this.rutinaAlimentacionService = rutinaAlimentacionService;
        this.rutinaEjercicioService = rutinaEjercicioService;
    }

    public Page<UsuarioListadoDTO> listarUsuarios(String nombre, Pageable pageable) {
        Page<Usuario> usuarios = (nombre != null)
                ? usuarioRepository.findByNombreContainingIgnoreCase(nombre, pageable)
                : usuarioRepository.findAll(pageable);
        return usuarios.map(this::convertirAUsuarioListadoDTO);
    }

    public UsuarioDetalleDTO obtenerUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(USUARIO_NO_ENCONTRADO + id));
        return convertirAUsuarioDetalleDTO(usuario);
    }

    public UsuarioDetalleDTO obtenerUsuarioByEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con email " + email));
        return convertirAUsuarioDetalleDTO(usuario);
    }

    public UsuarioDetalleDTO obtenerUsuarioByUsername(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con username " + username));
        return convertirAUsuarioDetalleDTO(usuario);
    }

    public UsuarioDetalleDTO crearUsuario(CrearUsuarioDTO crearUsuarioDTO) {
        if (usuarioRepository.findByEmail(crearUsuarioDTO.getEmail()).isPresent()) {
            throw new RecursoDuplicadoException("El email " + crearUsuarioDTO.getEmail() + " ya está en uso.");
        }
        if (usuarioRepository.findByUsername(crearUsuarioDTO.getUsername()).isPresent()) {
            throw new RecursoDuplicadoException("El username " + crearUsuarioDTO.getUsername() + " ya está en uso.");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(crearUsuarioDTO.getNombre());
        usuario.setUsername(crearUsuarioDTO.getUsername());
        usuario.setEmail(crearUsuarioDTO.getEmail());
        usuario.setPassword(crearUsuarioDTO.getPassword()); // Nota: debería hashearse
        
        // Establecer el rol (si se proporciona, sino usar el default USER)
        if (crearUsuarioDTO.getRol() != null) {
            usuario.setRol(crearUsuarioDTO.getRol());
        }
        
        usuario.setEdad(crearUsuarioDTO.getEdad());
        usuario.setPeso(crearUsuarioDTO.getPeso());
        usuario.setAltura(crearUsuarioDTO.getAltura());
        usuario.setAlimentosFavoritos(crearUsuarioDTO.getAlimentosFavoritos());
        usuario.setAlergias(crearUsuarioDTO.getAlergias());

        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        return convertirAUsuarioDetalleDTO(usuarioGuardado);
    }

    public UsuarioDetalleDTO actualizarUsuario(Long id, ModificarUsuarioDTO modificarUsuarioDTO) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(USUARIO_NO_ENCONTRADO + id));

        if (modificarUsuarioDTO.getNombre() != null) {
            usuario.setNombre(modificarUsuarioDTO.getNombre());
        }
        if (modificarUsuarioDTO.getEmail() != null) {
            usuario.setEmail(modificarUsuarioDTO.getEmail());
        }
        if (modificarUsuarioDTO.getPassword() != null) {
            usuario.setPassword(modificarUsuarioDTO.getPassword());
        }
        if (modificarUsuarioDTO.getEdad() != null) {
            usuario.setEdad(modificarUsuarioDTO.getEdad());
        }
        if (modificarUsuarioDTO.getPeso() != null) {
            usuario.setPeso(modificarUsuarioDTO.getPeso());
        }
        if (modificarUsuarioDTO.getAltura() != null) {
            usuario.setAltura(modificarUsuarioDTO.getAltura());
        }
        if (modificarUsuarioDTO.getAlimentosFavoritos() != null) {
            usuario.setAlimentosFavoritos(modificarUsuarioDTO.getAlimentosFavoritos());
        }
        if (modificarUsuarioDTO.getAlergias() != null) {
            usuario.setAlergias(modificarUsuarioDTO.getAlergias());
        }

        Usuario usuarioActualizado = usuarioRepository.save(usuario);
        return convertirAUsuarioDetalleDTO(usuarioActualizado);
    }

    public void eliminarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(USUARIO_NO_ENCONTRADO + id));
        usuarioRepository.delete(usuario);
    }

    public Usuario obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(USUARIO_NO_ENCONTRADO + id));
    }

    public List<Usuario> obtenerUsuariosPorRangoEdad(Integer edadMin, Integer edadMax) {
        return usuarioRepository.findByEdadBetween(edadMin, edadMax);
    }

    public List<Usuario> obtenerUsuariosConPlanActivo() {
        return usuarioRepository.findUsuariosConPlanActivo();
    }

    private UsuarioDetalleDTO convertirAUsuarioDetalleDTO(Usuario usuario) {
        UsuarioDetalleDTO dto = new UsuarioDetalleDTO();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setUsername(usuario.getUsername());
        dto.setEmail(usuario.getEmail());
        dto.setRol(usuario.getRol());
        dto.setEdad(usuario.getEdad());
        dto.setPeso(usuario.getPeso());
        dto.setAltura(usuario.getAltura());
        dto.setAlimentosFavoritos(usuario.getAlimentosFavoritos());
        dto.setAlergias(usuario.getAlergias());

        if (usuario.getRutinaAlimentacion() != null) {
            dto.setRutinaAlimentacion(
                rutinaAlimentacionService.convertirADTO(usuario.getRutinaAlimentacion())
            );
        }

        if (usuario.getRutinaEjercicio() != null) {
            dto.setRutinaEjercicio(
                rutinaEjercicioService.convertirADTO(usuario.getRutinaEjercicio())
            );
        }

        return dto;
    }

    private UsuarioListadoDTO convertirAUsuarioListadoDTO(Usuario usuario) {
        UsuarioListadoDTO dto = new UsuarioListadoDTO();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setEmail(usuario.getEmail());
        return dto;
    }
}
