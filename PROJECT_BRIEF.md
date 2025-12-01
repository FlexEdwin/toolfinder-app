# ToolFinder App – Brief de Proyecto & Estado

## 1. Resumen del problema

En trabajos técnicos, los operarios necesitan herramientas usando tickets con **Part Number (P/N)**. Los códigos son difíciles de recordar. Esto causa demoras y errores.

## 2. Objetivo

App web inteligente para buscar herramientas por nombre, descripción, P/N o sinónimos (incluso con errores ortográficos), permitiendo crear kits para agilizar solicitudes al almacén.

## 3. Estado Actual (Fase 1 - Core Tecnológico)

- **Motor de Búsqueda:** Migrado a **Server-Side Full Text Search** (PostgreSQL). Soporta errores ortográficos ("vaccum" -> "vacuum") y búsqueda difusa.
- **Rendimiento:** Implementado **React Query** para caché y velocidad instantánea.
- **Frontend:** Refactorizado para usar Hooks (`useTools`, `useCategories`) y eliminar carga masiva de datos.

## 4. Stack Tecnológico

- **Frontend:** React 19 + Vite + TailwindCSS.
- **State/Cache:** TanStack Query (React Query).
- **Backend:** Supabase (Postgres + Auth + RPCs personalizadas).
- **Infraestructura:** Cloudflare Pages + GitHub Actions.

## 5. Reglas de Negocio

- **Admin:** CRUD total.
- **Usuario:** Solo lectura de herramientas, pero puede crear/editar Kits públicos.
- **Búsqueda:** Debe tolerar typos y buscar en inglés/español simultáneamente.

## 6. Hoja de Ruta Inmediata

- [x] Optimizar base de datos (Índices y FTS).
- [x] Implementar React Query.
- [ ] Forzar uso de RPC en Frontend (Solucionar fallback local).
- [ ] UI/UX: Mejorar visualización de resultados (Virtual Scroller).
