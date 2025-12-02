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
  - **Comportamiento:** Configurado para aparecer en cada sesión (sin persistencia en localStorage) por solicitud del usuario.
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

### [02/12/2025] - AUDITORÍA Y LIMPIEZA DE FILTRADO FRONTEND

**Objetivo Crítico:**
Garantizar que la data fluya DIRECTAMENTE desde el RPC `search_tools_smart` hasta la UI sin manipulación en el cliente.

**Problema Detectado:**

- `Home.jsx` contenía una función `.filter()` (líneas 42-53) que RE-FILTRABA los resultados ya procesados por Supabase.
- Esto anulaba completamente la lógica de búsqueda inteligente del backend (tolerancia a typos, similitud difusa, etc.).

**Archivos Auditados:**

1. **`src/hooks/useTools.js`:**

   - ✅ **LIMPIO** - Los parámetros `search` y `category` se pasan correctamente al RPC.
   - ✅ Retorna la data cruda sin transformaciones.

2. **`src/pages/Home.jsx`:**
   - ❌ **CONTAMINADO** - Filtrado local detectado y eliminado.
   - ✅ **CORREGIDO** - Todas las referencias a `filteredTools` reemplazadas por `tools`.

**Cambios Realizados:**

- **Eliminado:** Bloque completo de filtrado local (13 líneas de código ilegal).
- **Reemplazado:** 4 referencias a `filteredTools` → `tools` en el JSX:
  - Contador de resultados (línea 240, 246)
  - Renderizado de tarjetas (línea 265)
  - Mensaje de "sin resultados" (línea 276)

**Resultado:**
✅ **Data Flow Puro:** Supabase RPC → React Query → UI (sin intermediarios).
✅ **Búsqueda Inteligente Activa:** Si el RPC dice que "Vaccum" coincide con "vacc", el frontend lo muestra sin cuestionar.

---

### [02/12/2025] - IMPLEMENTACIÓN DE PAGINACIÓN INFINITA MANUAL

**Objetivo:**
Eliminar el límite de 20 herramientas permitiendo cargar más resultados bajo demanda con un botón "Cargar más".

**Estrategia:**
Paginación infinita manual (sin scroll automático) usando `useInfiniteQuery` de React Query.

**Archivos Modificados:**

1. **`src/hooks/useTools.js`:**

   - ✅ Migrado de `useQuery` → `useInfiniteQuery`
   - ✅ Implementado `initialPageParam: 1`
   - ✅ Implementado `getNextPageParam`: Retorna `undefined` si la última página tiene < 20 items (fin de resultados)
   - ✅ Eliminado parámetro `page` del hook (ahora manejado internamente por React Query)

2. **`src/pages/Home.jsx`:**
   - ✅ Actualizado destructuring: `data`, `fetchNextPage`, `hasNextPage`, `isFetchingNextPage`
   - ✅ Creada variable `allTools = data?.pages.flat() || []` para aplanar las páginas
   - ✅ Reemplazadas todas las referencias `tools` → `allTools`
   - ✅ Agregado botón "Cargar más herramientas...":
     - Centrado y ancho
     - Solo visible si `hasNextPage === true`
     - Deshabilitado con spinner mientras carga (`isFetchingNextPage`)
     - Ejecuta `fetchNextPage()` al hacer clic

**Resultado:**
✅ **UX Mejorada:** Los usuarios pueden explorar todo el catálogo sin límites artificiales.
✅ **Performance Optimizada:** Solo se cargan 20 items a la vez, reduciendo carga inicial.
✅ **Feedback Visual:** Spinner y estado deshabilitado durante la carga de nuevas páginas.

---

### [02/12/2025] - MEJORA DE UI: STICKY HEADER

**Objetivo:**
Mejorar la usabilidad manteniendo el buscador y los filtros siempre visibles al hacer scroll.

**Cambios en `src/pages/Home.jsx`:**

- **Sticky Header:** Se aplicó `sticky top-0 z-10` al contenedor principal del encabezado.
- **Estilo Visual:** Fondo semitransparente `bg-slate-900/95` con `backdrop-blur-sm` para efecto moderno.
- **Ajuste de Espaciado:** Reducido el padding inferior (`pb-12` -> `pb-6`) y eliminado el margen negativo del grid de resultados para evitar solapamientos visuales.
- **Sombra:** Suavizada a `shadow-md` para separar sutilmente el header del contenido.

**Resultado:**
✅ Navegación más fluida y acceso constante a las herramientas de búsqueda.
