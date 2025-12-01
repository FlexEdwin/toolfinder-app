PROJECT CONTEXT: ToolFinder App

1. Resumen del Proyecto
   Aplicación web para la gestión y búsqueda inteligente de herramientas en almacenes técnicos.
   Objetivo: Permitir a operarios encontrar herramientas por nombre, descripción, P/N o sinónimos (en inglés/español) rápidamente, incluso con mala conexión, y agruparlas en "Kits".
2. Stack Tecnológico
   Frontend: React 19 + Vite (SPA).
   Estilos: TailwindCSS + Lucide Icons + Sonner (Toasts).
   Backend/DB: Supabase (PostgreSQL + Auth + Storage).
   State Management: [En transición a TanStack Query] (Actualmente useState/Context).
   Deploy: Cloudflare Pages / GitHub Actions.
3. Base de Datos (Schema Actual)
   Tabla: tools
   id (uuid, PK)
   name (text): Nombre común (ej: "Taladro Percutor").
   part_number (text): Código único (ej: "DWD520").
   description (text): Detalles técnicos.
   category (text): Agrupación (ej: "Power Tools").
   keywords (text): Palabras clave para búsqueda (ej: "drill, agujerear").
   image (text): URL de la imagen (opcional).
   Pendiente: Implementación de índices FTS y Trigramas.
   Tabla: kits
   id (uuid, PK)
   name (text): Nombre del kit (ej: "Kit Cambio de Rueda").
   author_name (text): Creador.
   created_at (timestamp).
   Tabla: kit_items
   kit_id (FK -> kits.id)
   tool_id (FK -> tools.id)
4. Reglas de Negocio Clave
   Read-Only para Operarios: Cualquiera puede buscar y ver herramientas.
   Admin Only: Solo el administrador puede crear/editar/borrar herramientas (Tabla tools).
   Kits Públicos: Los usuarios pueden crear Kits para agrupar herramientas y compartirlos.
   Búsqueda Robusta: Debe tolerar errores ortográficos ("vaccum" vs "vacuum") y buscar en múltiples campos a la vez.
5. Estado Actual del Código (Snapshot)
   Fetching: Actualmente se hace en Home.jsx mediante un useEffect que llama a un RPC search_tools_partial o filtra un array en memoria.
   Problema actual: Se carga gran parte de la DB al inicio. Estamos migrando a búsqueda 100% server-side.
