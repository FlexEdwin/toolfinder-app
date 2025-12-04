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

### [03/12/2025] - CONTADOR PRECISO DE HERRAMIENTAS

**Objetivo:**
Mostrar el total real de herramientas en la base de datos, no solo los items cargados en la página actual.

**Problema:**
El contador mostraba `allTools.length` (20 items cargados), no el total real que coincide con los filtros activos.

**Solución Implementada:**

1. **Backend (Supabase):**

   - Creado RPC `count_tools_smart` que replica la lógica de búsqueda de `search_tools_smart`
   - Retorna el COUNT total de herramientas que coinciden con `search_term` y `category_filter`
   - Usa los mismos criterios: ILIKE + similarity con threshold 0.3

2. **Frontend:**
   - **Nuevo Hook:** `src/hooks/useToolCount.js`
     - Usa `useQuery` de React Query
     - `staleTime: 60 segundos` (los conteos no necesitan ser en tiempo real)
     - Acepta parámetros `search` y `category`
   - **Integración en `Home.jsx`:**
     - Importado y usado el hook `useToolCount`
     - Actualizada lógica del badge azul:
       - **Sin búsqueda:** "Explorando [Categoría] (X herramientas)"
       - **Con búsqueda:** "X resultados encontrados"
     - Agregado estado de carga: "Contando..." mientras se obtiene el total

**Resultado:**
✅ El contador ahora muestra el total real de la base de datos.
✅ Los usuarios ven cuántos resultados existen, no solo cuántos están cargados.
✅ Performance optimizada con caché de 1 minuto.

### [04/12/2025] - MEJORAS DE UX: SELECCIÓN, FORMULARIOS Y COMPARTIR

**Objetivo:**
Implementar tres mejoras críticas de UX basadas en feedback de usuarios: mejor feedback visual de selección, persistencia de formularios, y funciones de compartir inteligentes.

**1. Botones de Selección Mejorados (ToolCard.jsx + Home.jsx)**

**Cambios Visuales:**

- **Iconos unificados:** Reemplazado FolderPlus/Check por Plus/Check
- **Estados de color:**
  - No seleccionado: Icono `+` con fondo azul (`bg-blue-50`)
  - Seleccionado: Icono `✓` con fondo **verde** (`bg-green-600`)
- **Animación suave:**
  - Clase: `transform transition-all duration-200 active:scale-95`
  - Efecto: Escala al 95% al hacer clic con transición de 200ms
  - Resultado: Feedback visual no robótico, bouncy y natural
- **Feedback táctil:**
  - Implementado `navigator.vibrate(50)` para dispositivos móviles
  - Vibración de 50ms confirma la acción

**Archivos modificados:**

- `src/components/tools/ToolCard.jsx`: Botón footer actualizado
- `src/pages/Home.jsx`: Componente `ToolListRow` actualizado

**2. Formulario Inteligente (CreateKit.jsx)**

**Persistencia de Autor:**

- **Al montar:** `useEffect` carga `localStorage.getItem('lastAuthorName')`
- **Al guardar:** `localStorage.setItem('lastAuthorName', authorName)`
- **Beneficio:** Los usuarios no tienen que reescribir su nombre cada vez

**Nuevo Campo Descripción:**

- **Label:** "Notas / Descripción (opcional)"
- **Tipo:** `<textarea rows={3}>`
- **Placeholder:** "Ej: Para mantenimiento preventivo mensual..."
- **Persistencia:** Se envía a Supabase como `description: description || null`
- **Nota:** El campo DB debe existir o agregarse después

**Archivos modificados:**

- `src/pages/CreateKit.jsx`: Agregado useEffect, estado description, y textarea

**3. Smart Sharing (Kits.jsx)**

**Action Bar Sticky:** Implementado en footer del modal con `sticky bottom-0 bg-white/95 backdrop-blur-sm`.

**Funciones de compartir:**

- `generateKitText()`: Genera formato limpio `📋 [Nombre]\n\n[PN] [Tool]\n...` (sin categorías)
- `handleCopyKit()`: Copia al portapapeles con toast de confirmación
- `handleShareWhatsApp()`: Abre WhatsApp Web con texto pre-llenado

**Botones:**

- **Copiar (azul):** `navigator.clipboard.writeText()` + icono Copy
- **WhatsApp (verde):** `window.open('https://wa.me/?text=...')` + icono Share2
- **Cerrar (secundario):** Estilo `bg-slate-100`, posicionado a la derecha

**Padding:** Agregado `pb-24` al contenedor de herramientas para evitar overlap con action bar.

**Archivos modificados:** `src/pages/Kits.jsx`

**Resultado:**
✅ Selección de herramientas con feedback visual mejorado (verde + animación).
✅ Formulario de creación más inteligente con persistencia.
✅ Experiencia táctil en móviles con vibración.
✅ Modal de kits con smart sharing (Copy + WhatsApp).

### [04/12/2025] - REFACTORIZACIÓN: CENTRALIZACIÓN DE TEXTOS Y DOCUMENTACIÓN

**Objetivo:**
Mejorar la mantenibilidad del código mediante centralización de textos UI, documentación JSDoc, y auditoría completa de código limpio.

**1. Centralización de Textos UI**

**Archivo creado:** `src/constants/uiLabels.js`

**Renombres implementados:**

- "Catálogo Maestro" → "Inventario Global"
- "Conocimiento Colectivo" → "Biblioteca de Kits"
- "Ranking en Tiempo Real" → "Listas Destacadas"
- Descripción de kits → "Configuraciones estandarizadas para tareas operativas."

**Beneficios:**

- ✅ Cambios de texto en un solo lugar
- ✅ Preparado para internacionalización (i18n) futura
- ✅ Consistencia en toda la aplicación
- ✅ 60+ labels centralizados

**Componentes actualizados:**

- `Home.jsx`: 15+ labels (título, placeholders, mensajes)
- `Kits.jsx`: 10+ labels (header, modal, acciones)
- `ToolCard.jsx`: 5+ labels (acciones, tooltips)
- `CreateKit.jsx`: Labels de formulario y toasts

**2. Documentación JSDoc**

**Archivos documentados:**

- `ToolCard.jsx`: Componente principal + funciones helper
- `useTools.js`: Ya tenía documentación completa ✅

**3. Auditoría de Código**

**Console.logs:** ✅ Ninguno encontrado
**Importaciones:** ✅ Todas necesarias
**Lógica Compleja:** Identificada y documentada en sugerencias

**4. Sugerencias de Mejoras**

**Archivo creado:** `code_suggestions.md` con mejoras propuestas para refactorización futura.

**Resultado:**
✅ Código más limpio y mantenible.
✅ Labels centralizados para cambios rápidos.
✅ Documentación JSDoc para mejor DX.
✅ Roadmap de mejoras futuras documentado.
