# Tests y Coverage - COFIRA App

## Ejecutar Tests

### Tests con Coverage (Recomendado)

```bash
npm run test:coverage
```

Este comando ejecuta todos los tests en modo headless y genera un reporte de coverage.

### Tests en modo watch

```bash
npm run test:watch
```

Ejecuta los tests en modo interactivo con coverage en tiempo real.

### Tests básicos

```bash
npm test
```

Ejecuta los tests en modo interactivo sin coverage.

## Coverage Actual

**Último reporte:**

- **Statements:** 45.1% (401/889)
- **Branches:** 34.09% (60/176)
- **Functions:** 30.37% (96/316)
- **Lines:** 44.98% (377/838)

**Estado:** ✅ Coverage > 45% alcanzado

## Estructura de Tests

### Tests de Servicios (Core)

- ✅ `auth.service.spec.ts` - Autenticación completa

  - Login con credenciales válidas/inválidas
  - Registro de usuarios
  - Gestión de tokens
  - Logout y limpieza de sesión

- ✅ `theme.service.spec.ts` - Gestión de temas

  - Toggle entre light/dark
  - Persistencia en localStorage
  - Inicialización desde sistema

- ✅ `loading.service.spec.ts` - Estado de carga
  - Show/Hide loading
  - Estado reactivo con observables

### Tests de Guards

- ✅ `auth-guard.spec.ts` - Protección de rutas
  - Redirección cuando no autenticado
  - Acceso cuando autenticado

### Tests de Interceptors

- ✅ `auth.interceptor.spec.ts` - Headers de autenticación
- ✅ `error.interceptor.spec.ts` - Manejo de errores HTTP
- ✅ `loading.interceptor.spec.ts` - Estado de carga automático
- ✅ `logging.interceptor.spec.ts` - Logging de peticiones

### Tests de Componentes Compartidos

- ✅ `header.spec.ts` - Navegación principal

  - Toggle de menú móvil
  - Toggle de tema
  - Logout
  - Estado de autenticación

- ✅ `footer.spec.ts` - Pie de página
- ✅ `loading-spinner.spec.ts` - Spinner de carga
- ✅ `modal.spec.ts` - Sistema de modales
- ✅ `toast-container.spec.ts` - Notificaciones
- ✅ `breadcrumbs.spec.ts` - Migas de pan

### Tests de Componentes UI

- ✅ `button.spec.ts` - Botones reutilizables
- ✅ `input.spec.ts` - Inputs de formulario
- ✅ `checkbox.spec.ts` - Checkboxes
- ✅ `radio-button.spec.ts` - Radio buttons
- ✅ `dropdown.spec.ts` - Desplegables
- ✅ `calendar.spec.ts` - Selector de fecha

### Tests de Features

#### Nutrition

- ✅ `nutrient-counter.spec.ts` - Contador de macros con gráfico
- ✅ `daily-menu.spec.ts` - Menú diario
- ✅ `add-meal-form.spec.ts` - Formulario de comidas

#### Training

- ✅ `weekly-table.spec.ts` - Tabla de ejercicios
- ✅ `exercise-row.spec.ts` - Fila de ejercicio
- ✅ `progress-card.spec.ts` - Tarjeta de progreso

#### Progress

- ✅ `strength-gain-chart.spec.ts` - Gráfico de fuerza
- ✅ `add-progress-form.spec.ts` - Formulario de progreso

### Tests de Validadores

- ✅ `password-strength.validator.spec.ts` - Validación de contraseña
- ✅ `spanish-formats.validator.spec.ts` - Formatos españoles (DNI, teléfono)
- ✅ `cross-field.validators.spec.ts` - Validadores cruzados
- ✅ `async-validators.service.spec.ts` - Validadores asíncronos

## Cómo Mejorar el Coverage

### Áreas con bajo coverage:

1. **Componentes de Features** - Añadir más tests de integración
2. **Branches** (34%) - Añadir tests para casos edge
3. **Funciones** (30%) - Testear métodos privados indirectamente

### Tips para escribir tests:

```typescript
// 1. Test básico de creación
it('should create', () => {
  expect(component).toBeTruthy();
});

// 2. Test de inputs
it('should accept input values', () => {
  TestBed.runInInjectionContext(() => {
    fixture.componentRef.setInput('data', mockData);
    expect(component.data()).toEqual(mockData);
  });
});

// 3. Test de outputs
it('should emit event on click', (done) => {
  component.clicked.subscribe((value) => {
    expect(value).toBe(true);
    done();
  });
  component.handleClick();
});

// 4. Test de servicios con HTTP
it('should fetch data', (done) => {
  service.getData().subscribe((data) => {
    expect(data).toEqual(mockData);
    done();
  });

  const req = httpMock.expectOne('/api/data');
  req.flush(mockData);
});
```

## Ver Reporte Detallado

Después de ejecutar `npm run test:coverage`, abre:

```
coverage/cofira-app/index.html
```

Este archivo HTML muestra:

- Coverage por archivo
- Líneas cubiertas/no cubiertas
- Branches no testeados
- Funciones sin testear

## Continuous Integration

Los tests se ejecutan automáticamente en CI/CD con:

```bash
npm run test:coverage
```

Si el coverage baja de 40%, el build falla.
