# PROJECT CONTEXT: ToolFinder

> **Documento técnico para LLMs**: Este archivo proporciona contexto completo del proyecto, arquitectura actual, y decisiones técnicas para facilitar colaboración con IA en futuras sesiones.

---

## 1. Estado Actual del Proyecto

**Fase:** ✅ PRODUCCIÓN v1.0 (TODAS LAS FASES COMPLETADAS)  
**Status:** 🚀 SISTEMA ESTABLE - Deployment Ready

### Roadmap Completado

- **✅ Fase 1**: Core Tecnológico (Server-Side Search, React Query)
- **✅ Fase 2**: Data Cleaning & Visualización (List View, Sticky Headers, Infinite Scroll)
- **✅ Fase 3**: Smart K its (Selection UX, WhatsApp Share, Form Persistence)
- **✅ Fase 4**: PWA & Images (Service Worker, Supabase Storage, Offline Mode)
- **✅ Fase 5**: Mobile UX Optimization & Data Resilience
  - Ultra-compact cards (3+ rows visible)
  - Real progress counter
  - **Cart persistence** (localStorage auto-save)
  - **Error handling** (friendly UI + retry button)
  - **Grid/List toggle** (fully functional)

---

## 2. Base de Datos (Supabase PostgreSQL)

### Estado: SANITIZADA, CATEGORIZADA Y OPTIMIZADA

#### Extensiones Activas

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;     -- Trigram similarity search
CREATE EXTENSION IF NOT EXISTS unaccent;    -- Accent normalization
```

#### Índices Implementados

```sql
CREATE INDEX idx_tools_search_fuzzy ON tools
USING GIN (to_tsvector('spanish', name || ' ' || part_number || ' ' || COALESCE(keywords, '')));
```

#### Tablas Principales

**`tools`** (2,700+ registros)

- `id` (uuid, PK)
- `name` (text) - Nombre de herramienta
- `part_number` (text, UNIQUE) - P/N sanitizado (sin `-AV`)
- `category` (text) - Una de 10 super-categorías
- `specs` (text, nullable) - Especificaciones técnicas
- `keywords` (text, nullable) - Términos de búsqueda adicionales
- `image_url` (text, nullable) - **NUEVO**: URL a Supabase Storage
- `created_at` (timestamp)

**`kits`** (Compartidos públicamente)

- `id` (uuid, PK)
- `name` (text) - Nombre del kit
- `author` (text) - Nombre del creador
- `description` (text) - **NUEVO**: Descripción del propósito
- `tool_ids` (uuid[]) - Array de IDs de herramientas
- `created_at` (timestamp)

#### Triggers Activos

```sql
CREATE TRIGGER clean_part_number_trigger
BEFORE INSERT OR UPDATE ON tools
FOR EACH ROW
EXECUTE FUNCTION clean_part_number();
```

**Función**: Elimina sufijos `-AV`, normaliza espacios, convierte a mayúsculas.

#### RPCs Personalizadas

**1. `search_tools_smart`**

```sql
search_tools_smart(
  search_term text DEFAULT '',
  category_filter text DEFAULT 'Todas',
  page integer DEFAULT 1,
  limit_count integer DEFAULT 20
) RETURNS SETOF tools
```

- Usa `similarity(part_number, search_term) > 0.3` (pg_trgm)
- Prioriza coincidencias exactas en Part Number
- Fallback a FTS en `name` y `keywords`
- Paginación server-side

**2. `count_tools_smart`**

```sql
count_tools_smart(
  search_term text DEFAULT '',
  category_filter text DEFAULT 'Todas'
) RETURNS bigint
```

- Retorna el total de resultados sin límite de paginación
- Usado para el contador "Mostrando X de Y"

**3. `get_distinct_categories`**

```sql
get_distinct_categories() RETURNS TABLE(category text, tool_count bigint)
```

- Lista única de categorías con conteo
- Cache en React Query (staleTime: 5 min)

#### Categorización (10 Super-Categorías)

1. Medición y Pruebas
2. Herramientas Especiales
3. Herramientas Manuales
4. GSE y Carga
5. Fluidos y Neumática
6. Kits y Contenedores
7. Herramientas de Potencia
8. Aviónica y Tecnología
9. Acceso y Seguridad
10. Consumibles

**Cobertura**: 77% de herramientas clasificadas automáticamente vía keywords

---

## 3. Arquitectura Frontend

### Estructura de Componentes

```
src/components/tools/
├── ToolCard.jsx              # Vista Grid (ultra-compacta en móvil)
│   ├── Badge de categoría en flujo normal
│   ├── Imagen h-24 (móvil) / h-48 (desktop)
│   ├── Iconos h-8 (móvil) / h-48 (desktop)
│   └── Footer con botones h-8 fijos
├── ToolListRow.jsx           # Vista List (P/N prominente)
├── ToolFormModal.jsx         # CRUD Admin (Smart Category Dropdown + P/N validation)
└── CategoryManagerModal.jsx  # Renombrado de categorías
```

### Custom Hooks

**`useTools.js`** (Infinite Query)

```javascript
export function useTools({ search, category }) {
  return useInfiniteQuery({
    queryKey: ["tools", search, category],
    queryFn: ({ pageParam = 1 }) =>
      searchToolsSmart(search, category, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.length === 20 ? lastPage + 1 : undefined,
  });
}
```

- Cache stale time: 1 minuto
- Refetch on window focus: habilitado
- Data flattening: `data?.pages.flat()`

**`useToolCount.js`** (Total Count)

```javascript
export function useToolCount({ search, category }) {
  return useQuery({
    queryKey: ["toolCount", search, category],
    queryFn: () => countToolsSmart(search, category),
    staleTime: 30000, // 30 segundos
  });
}
```

**`useCategories.js`** (Category Filter)

```javascript
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getDistinctCategories,
    staleTime: 300000, // 5 minutos
    gcTime: 600000, // 10 minutos
  });
}
```

### Context Providers

**`AuthContext`**: Supabase session management

- `user`: Usuario actual (null si anónimo)
- `signOut()`: Logout function

**`KitContext`**: Selection state with **localStorage auto-persistence**

- `selectedTools`: Array de herramientas seleccionadas
- **Inicialización**: Lee de `localStorage.getItem('toolfinder_cart')` al montar
- **Auto-save**: `useEffect` guarda automáticamente en localStorage cada vez que cambia
- **Error handling**: Try-catch en lectura/escritura con fallback a `[]`
- `toggleTool(tool)`: Add/remove con haptic feedback
- `clearKit()`: Vacía el carrito
- `count`: Número de selecciones
- **Resultado**: Carrito persiste entre recargas de página

### Sistema de Constantes (`uiLabels.js`)

```javascript
export default {
  HOME_TITLE: "Inventario Global",
  RESULTS_EXPLORING: "Explorando",
  TOOL_ACTION_COPY: "Copiar P/N",
  // ... 20+ strings centralizados
};
```

**Propósito**: Facilitar i18n futura y mantener consistencia textual

---

## 4. Reglas de Negocio Vigentes

### UX Principles

1. **Mobile-First**: Diseño optimizado para pantallas pequeñas

   - Tarjetas ultra-compactas (p-2 en móvil, p-4 en desktop)
   - Tipografía reducida (text-xs, text-[10px])
   - Botones h-8 fijos para consistencia táctil

2. **Part Number es Rey**

   - Siempre visible con `font-mono` y `select-all`
   - Prioridad en búsqueda (similarity > 0.3 en P/N antes que FTS)
   - Validación de unicidad en BD

3. **Vista Lista como Default**

   - Nuevos usuarios ven `viewMode: 'list'`
   - Persistencia en localStorage
   - Mayor densidad de información (ideal para trabajo técnico)

4. **Contador de Progreso Real**
   - Badge muestra: "Mostrando {loaded} de {total} herramientas"
   - Usa `allTools.length` (cliente) vs `totalCount` (servidor)
   - Elimina confusión sobre tamaño del catálogo

### Performance Rules

- **Zero Client-Side Filtering**: Todo filtrado delegado a Supabase RPCs
- **Infinite Pagination**: Carga de 20 items por página
- **Image Lazy Loading**: Solo cargar imágenes visibles
- **Service Worker**: Cache-first para assets, Network-first para API

### Security

- **RLS Policies**: Solo admin puede CRUD herramientas
- **Kits Públicos**: Cualquiera puede crear/editar (sin auth requerido)
- **Sanitización**: Trigger limpia P/N automáticamente

---

## 5. PWA Configuration

### Manifest (`public/manifest.json`)

```json
{
  "name": "ToolFinder",
  "short_name": "ToolFinder",
  "theme_color": "#0f172a",
  "background_color": "#f8fafc",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [
    /* 192x192, 512x512 */
  ]
}
```

### Service Worker Strategy

- **Static Assets**: Cache-First (HTML, CSS, JS, Icons)
- **API Calls**: Network-First con fallback (Supabase RPC)
- **Images**: Cache-First con expiration (Supabase Storage)

---

## 6. Decisiones Técnicas Clave

### ¿Por qué no useQuery simple?

**Decisión**: `useInfiniteQuery` para paginación manual  
**Razón**: Catálogo de 2,700+ items requiere carga incremental

### ¿Por qué localStorage para viewMode?

**Decisión**: Persistir preferencia Grid/List sin backend  
**Razón**: Optimización UX sin complejidad de user preferences table

### ¿Por qué no Virtual Scroller?

**Decisión**: Infinite pagination manual con botón "Cargar más"  
**Razón**: Mayor control del usuario sobre datos cargados (mejor para móvil)

### ¿Por qué badge en flujo normal vs absolute?

**Decisión**: Badge de categoría dentro del flujo del DOM  
**Razón**: evitar obstrucción de imágenes (UX > espacio vertical)

---

## 7. Próximos Pasos Sugeridos (Post-v1.0)

- [ ] **A11y Audit**: ARIA labels, keyboard navigation
- [ ] **i18n**: Implementar react-i18next (strings ya centralizados)
- [ ] **Analytics**: Integrar Plausible/Posthog (búsquedas frecuentes)
- [ ] **Export Kits**: Generar PDF de kit para impresión

---

## 8. Dependencias Clave Instaladas (Package.json Snapshot)

- `react`: ^19.0
- `vite`: ^7.0
- `@tanstack/react-query`: ^5.0 (Gestión de estado asíncrono)
- `lucide-react`: Iconos
- `sonner`: Notificaciones
- `@supabase/supabase-js`: Cliente DB
- `vite-plugin-pwa`: Progressive Web App
- `tailwindcss`: Estilos

---

**Última Actualización**: 13/12/2025  
**Mantenedor**: Flex - Lead Developer
