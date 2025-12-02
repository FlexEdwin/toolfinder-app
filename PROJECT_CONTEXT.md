# PROJECT CONTEXT: ToolFinder App

## 1. Resumen Técnico

Aplicación React + Supabase para búsqueda de herramientas.
**Estado:** FASE 1 COMPLETADA. Arquitectura Server-Side consolidada.
**Arquitectura:** React 19 + Vite + TanStack Query v5 + Supabase RPCs.

## 2. Base de Datos (Supabase)

- **Búsqueda:** RPC `search_tools_smart` (FTS + Trigram + Tolerancia a Typos).
- **Categorías:** RPC `get_distinct_categories`.
- **Índices:** `idx_tools_search_fuzzy` (GIN).

## 3. Frontend (React)

- **Data Fetching:** `useInfiniteQuery` (React Query) para paginación manual.
- **Hooks:**
  - `useTools.js`: Gestiona búsqueda y paginación infinita (flattening de páginas).
  - `useCategories.js`: Carga categorías.
- **Flujo de Datos:** Directo DB -> UI. **Prohibido** usar `.filter()` en cliente para búsqueda.

## 4. UI/UX Actual

- **Home:** Barra de búsqueda, Filtros de Categoría, Lista de Tarjetas, Botón "Cargar más".
- **Kits:** Creación y visualización de listas de herramientas.
- **Feedback:** Skeletons de carga, Spinners, Toasts (Sonner).

## 5. PRÓXIMOS PASOS (FASE 2: UX MOBILE)

1. **Sticky Header:** La barra de búsqueda desaparece al hacer scroll. Debe ser fija en móviles.
2. **Visual Hierarchy:** Mejorar el diseño de la tarjeta para que el Part Number sea el protagonista.
3. **Kit Floating Action:** Facilitar el acceso al "Carrito/Kit" mientras se explora.
