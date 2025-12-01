# AI PROJECT LOG - ToolFinder

## Estado Actual del Proyecto

- **Arquitectura:** React + Vite + Supabase.
- **Estrategia de Búsqueda:** Transición de "RPC simple" a "Full Text Search con Vector".
- **UX:** Transición de Paginación a Infinite Scroll Virtualizado.
- **Estado:** Implementando React Query para caché.

---

## REGISTRO DE CAMBIOS

### [FECHA ACTUAL] - INICIO DE REFACTORIZACIÓN (FASE 1)

**Objetivo:** Centralizar la búsqueda en el servidor y preparar el frontend para alto rendimiento.

**Cambios Planificados (Pending):**

1. [DB] Crear índice `search_vector` en tabla `tools` para búsqueda inteligente.
2. [DB] Mejorar RPC `search_tools_partial` para aceptar filtros de categoría y usar FTS (Full Text Search).
3. ~~[FRONT] Instalar TanStack Query para caché y manejo de estado.~~ ✅ **COMPLETADO**
4. ~~[FRONT] Crear hook `useTools` para separar la lógica de la vista.~~ ✅ **COMPLETADO**

---

### [01/12/2024] - REACT QUERY INTEGRADO

**Archivos modificados:**

- `src/main.jsx` - Configurado QueryClientProvider global
- `src/hooks/useTools.js` - Nuevo hook personalizado

**Resumen técnico:**

- Instalado `@tanstack/react-query` y `@tanstack/react-query-devtools`
- Configurado QueryClient con staleTime de 5 minutos
- Creado hook `useTools` que:
  - Acepta parámetros: `{ search, category, page }`
  - Llama a `search_tools_smart` RPC (pendiente de crear en DB)
  - Usa `keepPreviousData` para transiciones suaves entre páginas
  - Retorna `{ tools, totalResults }` con estados de loading/error automáticos

**Próximos pasos:**

- Migrar `Home.jsx` para usar el nuevo hook `useTools` ✅ **COMPLETADO**

---

### [01/12/2024] - HOME.JSX MIGRADO A REACT QUERY

**Archivos modificados:**

- `src/pages/Home.jsx` - Refactorización completa
- `src/hooks/useTools.js` - Ajuste de estructura de retorno

**Resumen técnico:**

- **Eliminado código legacy:**
  - `useState` para `tools`, `loading`, `totalResults`, `allTools`
  - `useEffect` con debounce manual
  - Función `fetchTools` y `fetchAllToolsForCategories`
  - Importación directa de `supabaseClient` (ahora solo en el hook)
- **Integrado React Query:**
  - Hook `useTools` con destructuración: `{ data: tools = [], isLoading, isError, error }`
  - Uso de `queryClient.invalidateQueries` para refrescar datos después de CRUD
  - Manejo automático de loading/error states
  - Caché inteligente con `keepPreviousData` para transiciones suaves
- **Mejoras UX:**
  - Componente de error amigable con `AlertCircle`
  - Loading spinner en el input de búsqueda
  - Sin parpadeos al cambiar de página

**Resultado:**

- Reducción de ~470 líneas a ~400 líneas
- Lógica de fetching centralizada en el hook
- Código más limpio y mantenible

---

### [01/12/2024] - HOOK USECATEGORIES CREADO

**Archivos creados:**

- `src/hooks/useCategories.js` - Nuevo hook para categorías

**Resumen técnico:**

- Hook dedicado para obtener categorías distintas
- Llama a RPC `get_distinct_categories` (pendiente de crear en Supabase)
- Configurado con `staleTime` de 24 horas (las categorías rara vez cambian)
- Retorna `{ data: categories, isLoading }`

**Próximos pasos CRÍTICOS:**

1. Crear función RPC `get_distinct_categories` en Supabase
2. Crear función RPC `search_tools_smart` en Supabase
3. Una vez creadas las RPCs, actualizar `Home.jsx` para usar ambos hooks

---

### [01/12/2024] - HOME.JSX REESCRITO CON AMBOS HOOKS

**Archivos modificados:**

- `src/pages/Home.jsx` - Reescritura completa sin errores de sintaxis

**Resumen técnico:**

- **Integración de hooks:**
  - `useTools` para obtener herramientas
  - `useCategories` para obtener categorías dinámicas
  - `useQueryClient` para invalidación de queries
- **UI de Categorías:**
  - Botón "Todas" fijo al inicio
  - Categorías dinámicas con `.map(cat => cat.category)`
  - Loading state: "Cargando filtros..." mientras `loadingCats === true`
- **CRUD corregido:**
  - `handleSaveTool` con try/catch correctamente cerrado
  - Invalidación de `['tools']` después de guardar/eliminar
  - Invalidación de `['categories']` si se crea nueva categoría
- **Filtrado temporal:**
  - Filtrado local en memoria hasta que RPCs estén listas
  - Mantiene funcionalidad actual sin romper la app

**Estado actual:**

- ✅ Sintaxis correcta, sin errores
- ✅ Hooks integrados correctamente
- ⚠️ Pendiente: Crear RPCs en Supabase para funcionalidad completa
