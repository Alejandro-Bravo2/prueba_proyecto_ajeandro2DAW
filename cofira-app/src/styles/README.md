# 📐 Arquitectura ITCSS de Cofira

Esta es la guía de la arquitectura CSS del proyecto Cofira, siguiendo la metodología **ITCSS (Inverted Triangle CSS)** con **Emulated Encapsulation** de Angular.

---

## 🎯 ¿Qué es ITCSS?

ITCSS organiza el CSS de **menos específico a más específico**, como un triángulo invertido:

```
        ┌────────────────┐
        │  00-settings   │  ← Variables (alcance amplio, baja especificidad)
        ├────────────────┤
        │   01-tools     │  ← Mixins y funciones
        ├────────────────┤
        │  02-generic    │  ← Reset/Normalize
        ├────────────────┤
        │  03-elements   │  ← Elementos HTML base (a, h1, p)
        ├────────────────┤
        │  04-layout     │  ← Grid, containers
        ├────────────────┤
        │ 05-components  │  ← Componentes reutilizables (.btn, .card)
        ├────────────────┤
        │ 06-utilities   │  ← Clases de utilidad (.mt-1, .text-center)
        └────────────────┘  ← (alcance estrecho, alta especificidad)
```

---

## 📂 Estructura de carpetas

```
src/styles/
├── 00-settings/
│   ├── _css-variables.scss  ← Variables CSS (--color-primary, etc.)
│   └── _variables.scss      ← Variables SCSS ($breakpoint-xs, etc.)
│
├── 01-tools/
│   └── _mixins.scss         ← Mixins reutilizables (@mixin flex-row, etc.)
│
├── 02-generic/
│   └── _reset.scss          ← Normalize/Reset CSS
│
├── 03-elements/
│   └── _links.scss          ← Estilos base de <a>
│
├── 04-layout/
│   └── _grid.scss           ← Sistema de grid
│
├── 05-components/
│   ├── _buttons.scss        ← Componentes de botones (.btn, .btn--primary)
│   ├── _inputs.scss         ← Componentes de inputs (.input, .input--search)
│   └── _cards.scss          ← Componentes de cards (.card)
│
└── 06-utilities/
    ├── _spacing.scss        ← Clases de espaciado (opcional)
    └── _text.scss           ← Clases de texto (opcional)
```

---

## 🔧 Cómo usar cada capa

### **00-settings: Variables**

Variables globales que se usan en todo el proyecto.

```scss
// _css-variables.scss
:root {
  --amarillo-normal: #ffd300;
  --gris-normal: #3f454c;
  --radius-xss: 0.5rem;
}

// _variables.scss
$breakpoint-xs: 640px;
$breakpoint-s: 768px;
```

**¿Cuándo usar?**

- Colores, tamaños, espaciados que se repiten
- Valores que pueden cambiar (ej: dark mode)

---

### **01-tools: Mixins**

Herramientas reutilizables que generan CSS.

```scss
// _mixins.scss
@mixin flex-row($gap: 1rem) {
  display: flex;
  flex-direction: row;
  gap: $gap;
}
```

**¿Cuándo usar?**

- Patrones CSS que se repiten
- Código complejo que necesitas reutilizar
- Funcionalidad con parámetros

**Cómo importar en componentes:**

```scss
// header.scss
@import "../../styles/01-tools/mixins";

.enlaces {
  @include flex-row(1.5rem);
}
```

---

### **02-generic: Reset**

Normaliza estilos entre navegadores.

```scss
// _reset.scss
body {
  margin: 0;
}
```

**No necesitas tocar esto** a menos que quieras cambiar el reset global.

---

### **03-elements: Elementos HTML base**

Estilos para elementos HTML sin clases.

```scss
// _links.scss
a {
  color: var(--text-primary);
  text-decoration: none;

  &:hover {
    color: var(--amarillo-normal);
  }
}
```

**¿Cuándo añadir aquí?**

- Estilos base para `<a>`, `<p>`, `<h1>`, etc.
- Estilos que quieres que hereden TODOS los elementos de ese tipo

---

### **04-layout: Estructura**

Sistemas de layout globales (grid, containers).

```scss
// _grid.scss
.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 2rem;
}
```

**¿Cuándo añadir aquí?**

- Grids reutilizables
- Contenedores globales
- Estructura de página

---

### **05-components: Componentes reutilizables** ⭐

Componentes que se usan en **varios lugares** de la app.

```scss
// _buttons.scss
.btn {
  @include flex-center;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-xss);
  cursor: pointer;
}

.btn--primary {
  background: var(--amarillo-normal);
}

.btn--secondary {
  background: var(--gris-normal);
}
```

**¿Cuándo añadir aquí?**

- Componentes que usas en 3+ lugares
- Estilos base que varían (botones, cards, inputs)

**Cómo usar en HTML:**

```html
<button class="btn btn--primary">Inscríbete</button>
<button class="btn btn--secondary">Cancelar</button>
```

---

### **06-utilities: Clases de utilidad** (Opcional)

Clases que hacen UNA cosa específica.

```scss
// _spacing.scss
.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mt-3 { margin-top: 1.5rem; }
```

**Solo usa esto si lo necesitas**. En proyectos pequeños, no es necesario.

---

## 🎨 Metodología Híbrida: ITCSS + Emulated

Angular usa **Emulated Encapsulation**, lo que significa que los estilos de componentes están **aislados**.

### **Estilos globales (ITCSS)**

Van en `src/styles/`:

- Botones reutilizables
- Inputs reutilizables
- Cards reutilizables

### **Estilos específicos del componente**

Van en el `.scss` del componente:

- Layout específico del header
- Estilos únicos de ese componente

---

## 📝 Ejemplo: Header Component

**header.scss** (estilos específicos):

```scss
@import "../../styles/01-tools/mixins";

nav {
  @include flex-between;
  background: var(--gris-normal);
  padding: 0 6rem;
}

.boton_inscribete {
  // Estilos específicos del botón del header
  @include flex-center;
  width: 9.125rem;
  background: var(--amarillo-normal);
}
```

**Comentarios en el código:**

```scss
.boton_inscribete {
  // Hereda concepto de .btn--primary de styles/05-components/_buttons.scss
  // pero con medidas específicas del header
  @include flex-center;
  width: 9.125rem; // Específico del header
}
```

---

## ✅ Reglas de oro

1. **Variables CSS** (`--nombre`) → NO necesitas importar, están disponibles globalmente
2. **Mixins** (`@mixin`) → SÍ necesitas importar con `@import`
3. **Componentes globales** → Usa en `src/styles/05-components/`
4. **Estilos específicos** → Usa en el `.scss` del componente
5. **Nunca uses `@extend`** → Angular + SCSS + ViewEncapsulation puede causar problemas

---

## 🚀 Cómo añadir un nuevo componente global

### 1. Crear el archivo en `05-components/`

```bash
touch src/styles/05-components/_modals.scss
```

### 2. Escribir el componente

```scss
// _modals.scss
.modal {
  @include center-absolute;
  background: white;
  border-radius: var(--radius-m);
  padding: 2rem;
  box-shadow: var(--shadow-xl);
}

.modal--large {
  width: 80%;
  max-width: 800px;
}
```

### 3. Importar en `styles.scss`

```scss
// styles.scss
@import 'styles/05-components/modals';
```

### 4. Usar en tu HTML

```html
<div class="modal modal--large">
  <h2>Título del modal</h2>
  <p>Contenido...</p>
</div>
```

---

## 📚 Recursos útiles

- **ITCSS**: https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/
- **BEM Naming**: https://getbem.com/
- **CSS Variables**: https://developer.mozilla.org/es/docs/Web/CSS/Using_CSS_custom_properties

---

## 🎯 Resumen rápido

| Capa              | Qué va aquí               | Importar en componentes?       |
|-------------------|---------------------------|--------------------------------|
| **00-settings**   | Variables                 | NO (CSS vars) / SÍ (SCSS vars) |
| **01-tools**      | Mixins                    | SÍ                             |
| **02-generic**    | Reset                     | NO                             |
| **03-elements**   | Estilos base HTML         | NO                             |
| **04-layout**     | Grid, containers          | NO                             |
| **05-components** | Componentes reutilizables | NO (usar clases en HTML)       |
| **06-utilities**  | Clases de utilidad        | NO                             |

---

**¿Dudas?** Consulta este README o pregunta al equipo.
