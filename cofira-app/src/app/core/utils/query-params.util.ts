import { HttpParams } from '@angular/common/http';

/**
 * Clase Builder para construir query strings y HttpParams de forma fluida
 *
 * @example
 * ```typescript
 * // Crear query string
 * const queryString = new QueryParamsBuilder()
 *   .add('userId', 123)
 *   .add('date', '2025-12-13')
 *   .add('status', 'active')
 *   .build();
 * // Resultado: "?userId=123&date=2025-12-13&status=active"
 *
 * // Crear HttpParams
 * const params = new QueryParamsBuilder()
 *   .add('page', 1)
 *   .add('limit', 10)
 *   .toHttpParams();
 * // Usar en HTTP request: this.http.get(url, { params })
 *
 * // Con arrays
 * const queryString = new QueryParamsBuilder()
 *   .addArray('tags', ['angular', 'typescript', 'rxjs'])
 *   .build();
 * // Resultado: "?tags[0]=angular&tags[1]=typescript&tags[2]=rxjs"
 *
 * // Ignorar valores null/undefined
 * const queryString = new QueryParamsBuilder()
 *   .add('name', 'John')
 *   .add('age', null)  // Se ignora
 *   .add('city', undefined)  // Se ignora
 *   .build();
 * // Resultado: "?name=John"
 * ```
 */
export class QueryParamsBuilder {
  private params: Record<string, string | number | boolean> = {};

  /**
   * Añade un parámetro al builder
   *
   * @param key - Clave del parámetro
   * @param value - Valor del parámetro (null/undefined se ignoran)
   * @returns this para encadenamiento fluido
   */
  add(key: string, value: string | number | boolean | null | undefined): this {
    if (value !== null && value !== undefined) {
      this.params[key] = value;
    }
    return this;
  }

  /**
   * Añade un array de valores como parámetros indexados
   *
   * @param key - Clave base del parámetro
   * @param values - Array de valores
   * @returns this para encadenamiento fluido
   *
   * @example
   * ```typescript
   * builder.addArray('tags', ['a', 'b', 'c']);
   * // Genera: tags[0]=a&tags[1]=b&tags[2]=c
   * ```
   */
  addArray(key: string, values: (string | number)[]): this {
    values.forEach((value, index) => {
      this.params[`${key}[${index}]`] = value;
    });
    return this;
  }

  /**
   * Añade un array de valores como parámetros repetidos
   *
   * @param key - Clave del parámetro (repetida para cada valor)
   * @param values - Array de valores
   * @returns this para encadenamiento fluido
   *
   * @example
   * ```typescript
   * builder.addArrayRepeated('tags', ['a', 'b', 'c']);
   * // Genera: tags=a&tags=b&tags=c
   * ```
   */
  addArrayRepeated(key: string, values: (string | number)[]): this {
    // Para HttpParams, Angular maneja automáticamente parámetros repetidos
    // Aquí guardamos como array en un formato especial
    values.forEach((value, index) => {
      this.params[`${key}_${index}`] = value;
    });
    return this;
  }

  /**
   * Añade múltiples parámetros desde un objeto
   *
   * @param params - Objeto con pares clave-valor
   * @returns this para encadenamiento fluido
   *
   * @example
   * ```typescript
   * builder.addObject({
   *   userId: 123,
   *   status: 'active',
   *   verified: true
   * });
   * ```
   */
  addObject(params: Record<string, string | number | boolean | null | undefined>): this {
    Object.entries(params).forEach(([key, value]) => {
      this.add(key, value);
    });
    return this;
  }

  /**
   * Añade un parámetro condicionalmente
   *
   * @param condition - Condición que debe cumplirse para añadir el parámetro
   * @param key - Clave del parámetro
   * @param value - Valor del parámetro
   * @returns this para encadenamiento fluido
   *
   * @example
   * ```typescript
   * builder.addIf(user.isAdmin, 'adminMode', true);
   * ```
   */
  addIf(
    condition: boolean,
    key: string,
    value: string | number | boolean
  ): this {
    if (condition) {
      this.add(key, value);
    }
    return this;
  }

  /**
   * Construye el query string completo con el prefijo '?'
   *
   * @returns Query string (ej: "?key1=value1&key2=value2") o cadena vacía si no hay parámetros
   */
  build(): string {
    const queryString = Object.entries(this.params)
      .map(([key, value]) => {
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(String(value));
        return `${encodedKey}=${encodedValue}`;
      })
      .join('&');

    return queryString ? `?${queryString}` : '';
  }

  /**
   * Construye el query string sin el prefijo '?'
   *
   * @returns Query string sin '?' (ej: "key1=value1&key2=value2") o cadena vacía
   */
  buildWithoutPrefix(): string {
    return this.build().slice(1);
  }

  /**
   * Convierte los parámetros a HttpParams de Angular
   *
   * @returns HttpParams configurado con los parámetros
   *
   * @example
   * ```typescript
   * const params = builder.toHttpParams();
   * this.http.get('/api/users', { params }).subscribe(...);
   * ```
   */
  toHttpParams(): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(this.params).forEach(([key, value]) => {
      httpParams = httpParams.set(key, String(value));
    });

    return httpParams;
  }

  /**
   * Convierte los parámetros a un objeto plano
   *
   * @returns Objeto con los parámetros
   */
  toObject(): Record<string, string | number | boolean> {
    return { ...this.params };
  }

  /**
   * Limpia todos los parámetros
   *
   * @returns this para encadenamiento fluido
   */
  clear(): this {
    this.params = {};
    return this;
  }

  /**
   * Verifica si tiene parámetros
   *
   * @returns true si tiene al menos un parámetro
   */
  hasParams(): boolean {
    return Object.keys(this.params).length > 0;
  }

  /**
   * Obtiene el número de parámetros
   *
   * @returns Número de parámetros
   */
  count(): number {
    return Object.keys(this.params).length;
  }
}
