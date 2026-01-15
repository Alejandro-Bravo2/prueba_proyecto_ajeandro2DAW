# DOCUMENTO DE MEJORAS Y PROPUESTA DE SUBIDA DE NOTA  
## Desarrollo Web en Entorno Cliente (DWEC)  
### 2.º DAW – Junta de Andalucía  
**Fase 1: Arquitectura de Eventos y Manipulación del DOM**

---

## 1. OBJETIVO DEL DOCUMENTO

Este documento describe las **mejoras técnicas implementadas o planificadas** con el objetivo de **incrementar la calificación del proyecto**, alineando el desarrollo con los criterios de **máxima puntuación (9–10)** establecidos en la rúbrica oficial de la Fase 1 del módulo DWEC.

Las mejoras se estructuran **por bloques de evaluación**, indicando el impacto directo sobre la puntuación.

---

## 2. MEJORAS PROPUESTAS POR BLOQUES

---

## BLOQUE 1 · MANIPULACIÓN DEL DOM (CE6.c + CE6.d)

### 1.1 ViewChild y ElementRef

**Estado actual:**  
- Uso de `@ViewChild` y `ElementRef` en componentes de escenas canvas y modal.

**Mejoras aplicadas / previstas:**
- Implementación adicional de `@ViewChild + ElementRef` en:
  - Menú hamburguesa (referencia al botón toggle).
  - Componente Tabs (indicador activo).
  - Accordion (panel expandido).
- Acceso al DOM exclusivamente en `ngAfterViewInit()`.
- Documentación del propósito de cada acceso al DOM mediante comentarios.

**Impacto esperado:**  
Subida de **6 → 9/10** en el criterio 1.1.

---

### 1.2 Modificación dinámica de propiedades y estilos

**Estado actual:**  
- Manipulación directa del DOM (`style`, `classList`, `querySelector`) en algunos componentes.

**Mejoras aplicadas / previstas:**
- Sustitución de manipulación directa por `Renderer2`:
  - Uso de `setStyle`, `addClass`, `removeClass`.
  - Eliminación de `document.querySelector` en Tabs.
- Código SSR-safe conforme a buenas prácticas Angular.

**Impacto esperado:**  
Subida de **4 → 9/10** en el criterio 1.2.

---

### 1.3 Creación y eliminación de elementos del DOM

**Estado actual:**  
- Tooltip crea y elimina nodos dinámicamente usando DOM nativo.

**Mejoras aplicadas / previstas:**
- Refactorización de Tooltip para usar `Renderer2.createElement()` y `appendChild()`.
- Implementación adicional de creación/eliminación dinámica en:
  - Modal (backdrop generado dinámicamente).
  - Notificaciones temporales (toast).
- Limpieza completa en `ngOnDestroy()`.

**Impacto esperado:**  
Subida de **6 → 9/10** en el criterio 1.3.

---

## BLOQUE 2 · SISTEMA DE EVENTOS (CE6.e)

### 2.1 y 2.2 Event Binding y eventos específicos

**Estado actual:**  
- Amplio uso de eventos click, teclado, drag&drop y focus.

**Mejoras aplicadas / previstas:**
- Implementación explícita de:
  - `(keydown.arrowLeft / arrowRight)`
  - `(keydown.home / end)`
  - `(mouseenter)` y `(mouseleave)` en componentes UI.
- Normalización del uso del objeto `$event` en handlers.

**Impacto esperado:**  
Subida de **8 → 9/10** en los criterios 2.1 y 2.2.

---

### 2.3 Prevención y control de propagación

**Estado actual:**  
- Uso correcto de `preventDefault()` y `stopPropagation()` en varios contextos.

**Mejoras aplicadas / previstas:**
- Documentación explícita en código del motivo de cada prevención.
- Aplicación adicional de `preventDefault()` en formularios críticos.

**Impacto esperado:**  
Subida de **9 → 10/10** en el criterio 2.3.

---

### 2.4 Eventos globales con @HostListener

**Estado actual:**  
- Uso de `@HostListener` para `document:click` y `keydown.escape`.

**Mejoras aplicadas / previstas:**
- Implementación de `@HostListener('window:resize')` en:
  - Menú hamburguesa.
  - Componentes de layout.
- Eliminación progresiva de `addEventListener` manuales.

**Impacto esperado:**  
Subida de **8 → 9/10** en el criterio 2.4.

---

## BLOQUE 3 · COMPONENTES INTERACTIVOS (CE6.d + CE6.e)

### Menú hamburguesa
- Cierre con `ESC`.
- Cierre por click fuera mediante `ClickOutsideDirective`.
- Mejora de accesibilidad con `aria-controls`.

**Impacto esperado:** **6 → 8/10**

---

### Modal
- Añadir `role="dialog"` y `aria-modal="true"`.
- Implementar bloqueo real de scroll (`.modal-open { overflow: hidden; }`).
- Gestión básica de foco al abrir/cerrar.

**Impacto esperado:** **7 → 9/10**

---

### Accordion
- Navegación por teclado completa (ArrowUp/Down, Home, End).
- Modo “solo una sección abierta”.

**Impacto esperado:** **8 → 9/10**

---

### Tabs
- Navegación completa por teclado.
- Sustitución total de `document.querySelector` por `@ViewChildren`.

**Impacto esperado:** **8 → 9/10**

---

### Tooltip
- Delay configurable (300 ms).
- Animación fade-in/fade-out.
- Flecha visual y `aria-describedby`.

**Impacto esperado:** **7 → 9/10**

---

## BLOQUE 4 · THEME SWITCHER (CE6.e + CE6.h)

**Mejoras aplicadas / previstas:**
- Implementación de `matchMedia.addEventListener('change')`.
- Sincronización automática con cambios del sistema en tiempo real.

**Impacto esperado:**  
Subida de **9 → 10/10**.

---

## BLOQUE 5 · DOCUMENTACIÓN (CE6.a + CE6.h)

**Mejoras aplicadas / previstas:**
- Ampliación del diagrama de flujo usando formato Mermaid.
- Inclusión de eventos específicos del proyecto en el diagrama.
- Añadir `prefers-color-scheme` y `matchMedia` a la tabla de compatibilidad.

**Impacto esperado:**  
Subida de **27 → 29/30**.

---

## 3. RESUMEN DE IMPACTO EN LA NOTA

| Bloque | Nota actual | Nota estimada |
|------|------------|---------------|
| Bloque 1 | 16 / 30 | 27 / 30 |
| Bloque 2 | 33 / 40 | 37 / 40 |
| Bloque 3 | 36 / 50 | 44 / 50 |
| Bloque 4 | 9 / 10 | 10 / 10 |
| Bloque 5 | 27 / 30 | 29 / 30 |
| Bloque 6 | 9 / 10 | 9 / 10 |
| **TOTAL** | **130 / 170** | **156 / 170** |

**Nota final estimada:**  

