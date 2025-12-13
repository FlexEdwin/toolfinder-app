# 🛠️ ToolFinder

**Gestión Inteligente de Inventario Aeronáutico**

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2.86-3ECF8E?logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)
![Status](https://img.shields.io/badge/Status-Production-success)

---

## 📖 Descripción Ejecutiva

**ToolFinder** es una Progressive Web App empresarial diseñada para la gestión centralizada de inventarios técnicos en entornos aeronáuticos. Implementa búsqueda semántica de alto rendimiento, gestión colaborativa de kits de herramientas, y capacidades offline-first para maximizar la productividad operativa.

### Características Destacadas

- **🔍 Búsqueda Inteligente Fuzzy**: Motor de búsqueda con tolerancia a errores tipográficos y similitud semántica basado en PostgreSQL Trigram Search
- **📦 Smart Kits**: Sistema de agrupación de herramientas con persistencia y compartición vía WhatsApp
- **📱 PWA Offline**: Service Worker configurado con caché estratégico para funcionamiento sin conexión
- **🖼️ Gestión de Imágenes**: Integración con CDN externo (Supabase Storage) para visualización de equipamiento
- **⚡ Performance Optimizado**: React Query con caché inteligente, paginación infinita y renderizado virtual
- **📊 Contador de Progreso Real**: Visualización de items cargados vs total disponible
- **🎨 Mobile-First UX**: Diseño ultra-compacto optimizado para uso con una sola mano

---

## 🏗️ Arquitectura Técnica

### Frontend Stack

| Tecnología         | Versión | Propósito                                  |
| ------------------ | ------- | ------------------------------------------ |
| **React**          | 19.2    | Framework UI con Concurrent Features       |
| **Vite**           | 7.2     | Build tool y dev server con HMR            |
| **TanStack Query** | 5.x     | State management, caching y sincronización |
| **React Router**   | 7.9     | Routing declarativo con lazy loading       |
| **Tailwind CSS**   | 3.4     | Utility-first styling con JIT compiler     |
| **Lucide React**   | 0.555   | Iconografía SVG optimizada                 |
| **Sonner**         | 2.0     | Toast notifications con stack management   |
| **Vite PWA**       | 1.2     | Service Worker y manifest generator        |

### Backend Infrastructure

| Componente    | Tecnología               | Función                            |
| ------------- | ------------------------ | ---------------------------------- |
| **Database**  | Supabase (PostgreSQL 15) | Almacenamiento relacional          |
| **Auth**      | Supabase Auth            | Autenticación JWT con RLS          |
| **Storage**   | Supabase Storage         | CDN para imágenes de herramientas  |
| **Functions** | PostgreSQL RPCs          | Lógica de negocio server-side      |
| **Search**    | pg_trgm + unaccent       | Full-text search con normalización |

### Custom Supabase RPCs

```sql
-- Búsqueda inteligente con paginación
search_tools_smart(search_term, category_filter, page, limit)

-- Conteo real de resultados
count_tools_smart(search_term, category_filter)

-- Listado de categorías únicas
get_distinct_categories()
```

### Database Triggers

- **`clean_part_number_trigger`**: Sanitiza automáticamente Part Numbers (elimina sufijos `-AV`, normaliza espacios)

---

## 📂 Estructura del Proyecto

```
toolfinder/
├── src/
│   ├── components/
│   │   ├── tools/
│   │   │   ├── ToolCard.jsx           # Tarjeta de herramienta (Grid/List)
│   │   │   ├── ToolListRow.jsx        # Vista de lista compacta
│   │   │   ├── ToolFormModal.jsx      # CRUD modal (Admin)
│   │   │   └── CategoryManagerModal.jsx
│   │   ├── ConfirmDialog.jsx
│   │   └── SystemAnnouncement.jsx      # Banner informativo
│   ├── hooks/
│   │   ├── useTools.js                 # Infinite query + search
│   │   ├── useToolCount.js             # Total count query
│   │   └── useCategories.js            # Category filter hook
│   ├── context/
│   │   ├── AuthContext.jsx             # User session management
│   │   └── KitContext.jsx              # Selection state (smart kits)
│   ├── pages/
│   │   ├── Home.jsx                    # Catálogo principal
│   │   ├── CreateKit.jsx               # Formulario de kit
│   │   ├── Kits.jsx                    # Listado de kits
│   │   └── Login.jsx                   # Auth page
│   ├── constants/
│   │   └── uiLabels.js                 # i18n strings centralizados
│   ├── utils/
│   │   └── notifications.js            # Sonner wrappers
│   └── lib/
│       └── supabaseClient.js           # Supabase singleton
├── public/
│   ├── manifest.json                   # PWA manifest
│   └── icons/                          # App icons (varios tamaños)
└── vite.config.js                      # PWA + React config
```

---

## ⚡ Instalación y Configuración

### Prerrequisitos

- Node.js 18+ y npm 9+
- Cuenta de Supabase con proyecto creado
- Variables de entorno configuradas

### 1. Clonar Repositorio

```bash
git clone https://github.com/tu-usuario/toolfinder.git
cd toolfinder
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 4. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 5. Build de Producción

```bash
npm run build
npm run preview  # Preview local del build
```

---

## 🚀 Características Implementadas (v1.0)

### ✅ Core Features

- [x] Búsqueda fuzzy con tolerancia a typos (pg_trgm, similitud 0.3)
- [x] Filtrado por categorías dinámicas (10 super-categorías aeronáuticas)
- [x] Paginación infinita manual con "Cargar más"
- [x] Vista Grid / List toggle con persistencia (localStorage)
- [x] Contador de progreso real (Mostrando X de Y herramientas)
- [x] Sticky header con búsqueda siempre visible

### ✅ Smart Kits

- [x] Selección multi-herramienta con feedback visual (+/✓)
- [x] Creación de kits con autor y descripción
- [x] Persistencia de formulario (localStorage)
- [x] Modal de detalles con texto formateado
- [x] Compartir vía WhatsApp (URL encoding)
- [x] Copiar al portapapeles (Clipboard API)

### ✅ UI/UX Móvil

- [x] Diseño ultra-compacto (3+ filas visibles en móvil)
- [x] Auto-dismiss del teclado al hacer scroll
- [x] Haptic feedback en selecc

iones (Vibration API)

- [x] Botones de altura fija (h-8) y tipografía reducida (text-[10px])
- [x] Badge de categoría en flujo normal (no obstruye imágenes)

### ✅ PWA & Offline

- [x] Manifest.json con branding e iconos
- [x] Service Worker con estrategia Cache-First
- [x] Instalable en iOS/Android
- [x] Meta tags optimizados (viewport, theme-color)

### ✅ Admin Features

- [x] CRUD completo de herramientas (solo usuarios autenticados)
- [x] Gestión de categorías (crear/renombrar)
- [x] Confirmación de eliminación (modal defensivo)
- [x] Validación de Part Number único (constraint DB)

---

## 🎯 Reglas de Negocio

1. **Part Number es dato maestro**: Todas las búsquedas priorizan P/N sobre nombre
2. **Mobile-First**: Diseño optimizado para uso con una mano
3. **Offline-Capable**: Caché de herramientas frecuentes vía Service Worker
4. **Zero-Trust Search**: Toda lógica de filtrado en PostgreSQL (cero filtrado cliente)
5. **Confidencialidad**: Part Numbers sanitizados (sin sufijos de proveedores)

---

## 👨‍💻 Desarrollo

### Scripts Disponibles

```bash
npm run dev      # Dev server con HMR
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # ESLint check
```

### Hooks Personalizados

#### `useTools()`

```javascript
const { data, isLoading, fetchNextPage, hasNextPage } = useTools({
  search: "multimeter",
  category: "Medición y Pruebas",
});
```

#### `useToolCount()`

```javascript
const { data: totalCount } = useToolCount({
  search: searchTerm,
  category: selectedCategory,
});
```

---

## Licencia

**Propietario**: Proyecto privado. Todos los derechos reservados.

---

## 🙏 Créditos

**Engineered by**: Flex - Lead Developer  
**Stack**: React 19 + Supabase + Vite  
**Versión**: 1.0.0 (Production Release)
