# PROJECT CONTEXT: ToolFinder App

## 1. Estado del Proyecto

**Fase Actual:** Inicio de FASE 3 (Gestión de Kits y Flujos de Trabajo).
**Fases Completadas:**

- Fase 1: Core Tecnológico (Búsqueda Server-Side, React Query).
- Fase 2: UX Móvil y Visualización (List View, Sticky Headers, Data Cleaning).

## 2. Base de Datos (Supabase)

**Estado:** SANITIZADA Y CATEGORIZADA.

- **Limpieza:** Se eliminaron sufijos `-AV` y duplicados. Trigger `clean_part_number` activo.
- **Categorías:** Migración masiva de "General" a 10 Super-Categorías (Medición, GSE, Aviónica, etc.).
- **Búsqueda:** RPC `search_tools_smart` con sensibilidad 0.3 (Alta precisión).

## 3. Frontend (React + Vite)

- **Vistas:** Toggle entre Grid (Exploración) y List (Compacta/Técnica).
- **Responsive:**
  - List View: Layout adaptativo (Columna en móvil para priorizar Part Number).
  - Sticky Header: Buscador siempre visible.
  - Keyboard Dismiss: El teclado se oculta al hacer scroll.
- **Componentes Clave:** `ToolCard` (Grid) y `ToolListRow` (Lista).

## 4. Próximos Pasos (Roadmap Fase 3)

1.  **Optimización de Kits:** Mejorar el flujo de "Agregar a Kit" (Feedback visual, contador flotante).
2.  **Kits Públicos:** Asegurar que los kits creados sean visibles y clonables por otros usuarios.
3.  **Detalle de Herramienta:** Mejorar el Modal de detalles (integrar imágenes si las hubiera en el futuro).

## 5. Reglas de Negocio Vigentes

- El **Part Number** es el dato más crítico para el operario.
- La interfaz debe ser **Mobile-First** (80% uso en celular).
- Búsqueda tolerante a fallos pero estricta con basura (0.3 threshold).
