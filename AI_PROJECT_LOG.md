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

### [02/12/2025] - REESTRUCTURACIÓN MASIVA DE BASE DE DATOS

**Objetivo:**
Eliminar la categoría genérica "General" y clasificar automáticamente las 2.700 herramientas usando patrones de nombres (Keywords).

**Acciones en Backend (SQL):**

- Ejecutado script de clasificación masiva basado en palabras clave (Inglés/Español).
- Creada taxonomía de 10 Super-Categorías estándar de aviación:
  1. Medición y Pruebas (Multímetros, Torques)
  2. Herramientas Especiales (Pines, Extractores)
  3. Herramientas Manuales (Llaves, Copas)
  4. GSE y Carga (Gatos, Eslingas)
  5. Fluidos y Neumática
  6. Kits y Contenedores
  7. Herramientas de Potencia
  8. Aviónica y Tecnología
  9. Acceso y Seguridad
  10. Consumibles

**Resultado:**

- ✅ **77% de la DB clasificada automáticamente.**
- Reducción de "General" de 2.700 items a ~640.
- UX inmediata: Ahora los filtros de categoría en el Home serán realmente útiles.

**Próximos Pasos:**

- Validar visualmente en el Frontend que los botones de categoría se rendericen bien (Sticky Header).
- Continuar con la mejora visual de las tarjetas (Smart Cards).

### [02/12/2025] - MEJORAS DE UX MÓVIL Y BRANDING

**Objetivo:**
Refinar la experiencia de uso en dispositivos móviles y proteger la identidad de marca contra traducciones automáticas.

**Cambios Realizados:**

1.  **Dismiss Keyboard on Scroll (`Home.jsx`):**

    - Implementado listener dual (`scroll` + `touchmove`).
    - Lógica inteligente: Solo hace `blur()` si el elemento activo es un INPUT.
    - **Resultado:** El teclado se oculta naturalmente al explorar, ampliando el área visible.

2.  **Protección de Marca (`SystemAnnouncement.jsx`):**
    - Aplicado atributo `translate="no"` y clase `notranslate` al nombre "Flex".
    - **Resultado:** Evita que Google Translate cambie "Flex" por "Doblar" o "Flexionar", manteniendo la firma profesional.

**Estado:**
✅ UX Móvil significativamente más fluida.
✅ Identidad visual protegida.

### [03/12/2025] - MEJORA DE VISTA DE LISTA: PRIORIZACIÓN DE PART NUMBER

**Objetivo:**
Reorganizar la Vista de Lista basándose en feedback de campo. Los operarios necesitan ver el Part Number (P/N) de forma prominente, ya que es más crítico que la categoría para identificación rápida de herramientas.

**Cambios en `src/pages/Home.jsx` (Componente `ToolListRow`):**

1. **Layout Reorganizado:**

   - **Izquierda:** Icono + Nombre (truncado si es largo)
   - **Centro/Derecha:** Part Number destacado con:
     - Fuente monoespaciada (`font-mono text-sm`)
     - Fondo gris suave (`bg-slate-50`)
     - Borde sutil (`border border-slate-200`)
     - Padding para mejor legibilidad (`px-2.5 py-1`)
     - Negrita para máxima visibilidad (`font-bold`)
   - **Derecha Extrema:** Botones de acción (Copiar, Agregar)

2. **Categoría Optimizada:**

   - Desktop: Texto pequeño debajo del nombre (`text-xs text-gray-400`)
   - Mobile: Mantenida debajo del nombre pero con menor prioridad visual

3. **Responsive Design:**
   - Part Number oculto en pantallas muy pequeñas (`hidden sm:block`)
   - Categoría adaptativa con clases `hidden md:inline-block` y `block md:hidden`

**Resultado:**
✅ Part Number ahora es el elemento visual más destacado en la lista.
✅ Mejor escaneabilidad para operarios en campo.
✅ Diseño responsive que mantiene usabilidad en móvil.

**[FIX CRÍTICO - 03/12/2025 10:50]:**

- **Problema detectado:** El Part Number estaba oculto en móviles (`hidden sm:block`), afectando al 80% de usuarios.
- **Solución implementada:**
  - **Móvil:** Layout en columna (`flex-col`) - Nombre arriba, P/N debajo (siempre visible)
  - **Desktop:** Layout horizontal (`md:flex-row`) - Nombre izquierda, P/N centro/derecha
  - **Categoría:** Oculta en móvil para priorizar el Part Number
- **Resultado:** ✅ Part Number ahora es 100% visible en todos los dispositivos.
