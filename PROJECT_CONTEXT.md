# PROJECT CONTEXT: ToolFinder App

## 1. Estado del Proyecto

**Fase Actual:** FASE 3 COMPLETADA (UX y Kits optimizados). Listo para Fase 4.
**Progreso:**

- Fase 1: Core Tecnológico (Server-Side Search, React Query).
- Fase 2: Data Cleaning & Visualización (List View, Sticky Headers).
- Fase 3: Gestión de Kits (Smart Form, Smart Selection, WhatsApp Share).

## 2. Base de Datos (Supabase)

**Estado:** SANITIZADA Y CATEGORIZADA.

- **Limpieza:** Eliminados sufijos `-AV`, duplicados y espacios. Trigger activo.
- **Categorías:** 10 Super-Categorías (Medición, GSE, etc.).
- **Búsqueda:** `search_tools_smart` (Sensibilidad 0.3).
- **Conteo:** `count_tools_smart` para totales reales.
- **Kits:** Tabla actualizada con columna `description`.

## 3. Frontend (React + Vite)

- **UX Móvil:**
  - Botones de selección táctiles (`+` azul / `✓` verde) con vibración.
  - Teclado se oculta al hacer scroll.
  - Vista de Lista responsiva (P/N debajo del nombre en móvil).
- **Kits:**
  - Creación inteligente (recuerda autor).
  - Modal de detalles con acciones: Copiar al portapapeles y Enviar a WhatsApp.
  - Formato de texto limpio para compartir.

## 4. Próximos Pasos (Opciones Fase 4)

- **Opción A:** Escáner de Código de Barras + PWA (Offline Mode).
- **Opción B:** Sistema de Imágenes + Panel Admin UI.

## 5. Reglas de Negocio Vigentes

- El **Part Number** es el dato rey.
- La app debe ser rápida y manejable con una sola mano (Mobile First).
- La confidencialidad de proveedores locales está protegida (Part Numbers limpios).
