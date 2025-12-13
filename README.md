Archivo: README.md
(Profesionalizado para cualquier dev que entre)
code
Markdown

# 🛠️ ToolFinder

La herramienta definitiva para la gestión y búsqueda inteligente de equipamiento técnico en almacenes.

## 🚀 Características Principales

- **Búsqueda Inteligente:** Encuentra herramientas por nombre, P/N o descripción, tolerando errores ortográficos (Fuzzy Search).
- **Gestión de Kits:** Crea listas de herramientas para tareas repetitivas (ej: "Kit Cambio de Rueda").
- **Catálogo Dinámico:** Filtrado por categorías en tiempo real.
- **Rendimiento:** Arquitectura optimizada con React Query y Supabase RPC.

## 🛠 Stack Tecnológico

- **Core:** React 19, Vite.
- **Estilos:** TailwindCSS, Lucide Icons.
- **Data Fetching:** TanStack Query (v5).
- **Backend:** Supabase (PostgreSQL).
- **Database Features:** `pg_trgm` (Trigrams), Full Text Search, Custom RPCs.

## 📂 Estructura del Proyecto

````bash
src/
├── components/   # UI Components (Cards, Modals)
├── hooks/        # Custom Hooks (useTools, useCategories)
├── lib/          # Supabase Client config
├── pages/        # Vistas principales (Home, Kits)
└── context/      # Auth & Global Context
⚡ Instalación y Setup
Clonar repositorio:
code
Bash
git clone <repo-url>
Instalar dependencias:
code
Bash
npm install
Variables de Entorno (.env.local):
code
Env
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_key
Correr en desarrollo:
code
Bash
npm run dev
🔍 Estado del Desarrollo
Actualmente en Fase de Refactorización de Búsqueda.
El frontend consume funciones RPC avanzadas (search_tools_smart) para delegar el filtrado a la base de datos.
code
Code
---

### 3. Archivo: `PROJECT_CONTEXT.md`
*(CRUCIAL: Este es el que le pasarás a la IA mañana para que sepa dónde quedamos)*

```markdown
# PROJECT CONTEXT: ToolFinder App

## 1. Resumen Técnico
Aplicación React + Supabase para búsqueda de herramientas.
Acabamos de migrar de una búsqueda cliente (JS filter) a una búsqueda servidor (Postgres FTS + Trigram).

## 2. Estado de la Base de Datos (Supabase)
Hemos ejecutado SQLs avanzados. Las siguientes funciones y extensiones YA EXISTEN:
- **Extensiones:** `unaccent`, `pg_trgm`.
- **Índices:** `idx_tools_search_fuzzy` (GIN index).
- **RPC `get_distinct_categories`:** Devuelve lista única de categorías.
- **RPC `search_tools_smart`:**
    - Recibe: `search_term`, `category_filter`, `page`, `limit`.
    - Lógica: Usa `set_limit(0.1)` para alta tolerancia a typos. Busca en `part_number`, `name` y `keywords`.

## 3. Estado del Frontend
- **Librería:** `@tanstack/react-query` instalada y configurada.
- **Hooks:**
    - `useTools.js`: Consume la búsqueda.
    - `useCategories.js`: Consume las categorías.
- **Home.jsx:** Refactorizado para usar estos hooks.

## 4. BUG ACTUAL / TAREA PENDIENTE (PRIORIDAD ALTA)
**Problema:** La búsqueda de "vacc" encuentra "vaccum" (typo) pero NO encuentra "vacuum" (correcto), o viceversa.
**Causa sospechosa:** En el último refactor de `Home.jsx`, la IA implementó un "Filtrado temporal en memoria" (fallback) dentro del código JS, ignorando parcialmente la potencia del RPC `search_tools_smart`.
**Acción requerida:** Revisar `useTools.js` y `Home.jsx` para asegurar que el filtrado se delegue 100% al Backend (RPC) y eliminar cualquier lógica de `.filter()` local que esté limitando los resultados.

## 5. Próximos Pasos
1. Debuggear `useTools` para confirmar que los parámetros llegan limpios al RPC.
2. Eliminar filtrado cliente redundante.
3. Verificar que `search_tools_smart` esté devolviendo todos los resultados esperados..
````
