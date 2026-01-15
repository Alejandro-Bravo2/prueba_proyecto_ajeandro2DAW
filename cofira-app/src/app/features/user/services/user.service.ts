import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { LoadingService } from '../../../core/services/loading.service';
import { RutinaAlimentacionDTO } from '../../nutrition/services/nutrition.service';
import { RutinaEjercicioDTO } from '../../training/services/training.service';

// DTOs que coinciden con el backend
export interface UsuarioDetalleDTO {
  id: number;
  nombre: string;
  username: string;
  email: string;
  rol: 'USER' | 'ADMIN';
  edad: number;
  peso: number;
  altura: number;
  alimentosFavoritos: string[];
  alergias: string[];
  rutinaAlimentacion?: RutinaAlimentacionDTO;
  rutinaEjercicio?: RutinaEjercicioDTO;
}

export interface UsuarioListadoDTO {
  id: number;
  nombre: string;
  email: string;
  rol: 'USER' | 'ADMIN';
}

export interface CrearUsuarioDTO {
  nombre: string;
  username: string;
  email: string;
  password: string;
  edad?: number;
  peso?: number;
  altura?: number;
  alimentosFavoritos?: string[];
  alergias?: string[];
}

export interface ModificarUsuarioDTO {
  nombre?: string;
  username?: string;
  email?: string;
  password?: string;
  edad?: number;
  peso?: number;
  altura?: number;
  alimentosFavoritos?: string[];
  alergias?: string[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Interface legacy para compatibilidad
interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseHttpService {
  private readonly API_URL = 'usuarios';

  constructor(http: HttpClient, loadingService: LoadingService) {
    super(http, loadingService);
  }

  /**
   * Listar usuarios con paginación
   */
  listarUsuarios(nombre?: string, page: number = 0, size: number = 10): Observable<PageResponse<UsuarioListadoDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    return this.get<PageResponse<UsuarioListadoDTO>>(this.API_URL, { params });
  }

  /**
   * Obtener usuario por ID
   */
  obtenerUsuario(id: number): Observable<UsuarioDetalleDTO> {
    return this.get<UsuarioDetalleDTO>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtener usuario por email
   */
  obtenerUsuarioPorEmail(email: string): Observable<UsuarioDetalleDTO> {
    const params = new HttpParams().set('email', email);
    return this.get<UsuarioDetalleDTO>(`${this.API_URL}/email`, { params });
  }

  /**
   * Crear un nuevo usuario
   */
  crearUsuario(dto: CrearUsuarioDTO): Observable<UsuarioDetalleDTO> {
    return this.post<UsuarioDetalleDTO>(this.API_URL, dto);
  }

  /**
   * Actualizar un usuario
   */
  actualizarUsuario(id: number, dto: ModificarUsuarioDTO): Observable<UsuarioDetalleDTO> {
    return this.put<UsuarioDetalleDTO>(`${this.API_URL}/${id}`, dto);
  }

  /**
   * Eliminar un usuario
   */
  eliminarUsuario(id: number): Observable<void> {
    return this.delete<void>(`${this.API_URL}/${id}`);
  }

  // Métodos legacy para compatibilidad
  getUserById(id: string): Observable<User> {
    return this.get<User>(`users/${id}`);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.put<User>(`users/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.delete<void>(`users/${id}`);
  }
}
