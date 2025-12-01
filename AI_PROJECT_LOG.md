# AI PROJECT LOG - ToolFinder

## Estado Actual del Proyecto

- **Arquitectura:** React + Vite + Supabase.
- **Estrategia de Búsqueda:** Full Text Search (Server-Side) con tolerancia a errores (Typos).
- **Manejo de Estado:** TanStack Query (React Query) v5.
- **UX Actual:** Paginación Server-Side implementada (Pendiente: UI de Infinite Scroll).

---

## REGISTRO DE CAMBIOS (Bitácora Técnica)

### [01/12/2025] - MIGRACIÓN A ARQUITECTURA "SERVER-FIRST"

**Objetivo:** Eliminar el filtrado en cliente para soportar miles de herramientas con alto rendimiento.

**Backend (Supabase & SQL):**

- **Extensiones:** Activadas `pg_trgm` (Trigramas) y `unaccent`.
- **Índices:** Creado índice GIN `idx_tools_search_fuzzy` para búsqueda instantánea.
- **RPC `search_tools_smart`:** Implementada lógica de búsqueda que prioriza Part Number > Nombre exacto > Similitud difusa (corrige "vaccum" vs "vacuum").
- **RPC `get_distinct_categories`:** Función eficiente para listar categorías únicas.

**Frontend (React & Query):**

- **React Query:** Implementado `QueryClientProvider` con caché global.
- **Hooks Personalizados:**
  - `useTools`: Gestiona la búsqueda, paginación y caché de herramientas.
  - `useCategories`: Carga dinámica de filtros desde DB.
- **Refactorización `Home.jsx`:**
  - Eliminados todos los `useEffect` de carga manual.
  - Integración completa con los nuevos hooks.
  - UI reactiva con estados de carga (Loading Spinners).

**Correcciones de UI/UX:**

- **Sistema de Anuncios:** Implementado `SystemAnnouncement.jsx` (Banner Beta persistente con localStorage).
  - **Refinamiento:** Añadida firma personalizada ("Flex - Lead Developer") y mejorado el diseño visual.
  - **Persistencia:** Actualizada clave a `hide_beta_banner_2025_v2` para asegurar visualización tras cambios.
- **Kits:**
  - Corregido el modal de detalles: ahora muestra todas las herramientas del kit.
  - Agregado campo "Nombre" visible en las tarjetas del modal.
  - Conectado correctamente el evento `onClick` en las tarjetas.

---

### [01/12/2025] - MEJORA DE UX EN CONTADOR DE RESULTADOS

**Objetivo:**
Evitar la confusión del usuario sobre el tamaño de la base de datos debido al límite de paginación de 20 items.

**Archivo modificado:**

- `src/pages/Home.jsx` - Lógica de renderizado del badge de resultados.

**Cambios realizados:**
Implementada lógica condicional para el texto del contador:

1. **Estado Inicial:** "Explorando Catálogo Maestro (+2,700 herramientas)" cuando no hay filtros activos.
2. **Límite Alcanzado:** "Mostrando las primeras 20 coincidencias..." cuando los resultados igualan el límite de paginación.
3. **Búsqueda Exacta:** "{n} herramientas encontradas" para resultados menores a 20.

**Resultado:**
✅ UX más clara que comunica mejor la magnitud del catálogo y el contexto de los resultados mostrados.

---

## PRÓXIMOS PASOS (ROADMAP INMEDIATO)

1. **UX de Paginación:** Implementar "Infinite Scroll" o botón "Cargar más" en `Home.jsx` (Actualmente limitado a 20 items).
2. **Limpieza Final:** Eliminar cualquier filtrado residual en Javascript (`.filter`) para confiar 100% en el SQL.
3. **Visualización:** Mejorar el diseño de la tarjeta de herramienta para destacar el Part Number.
