/**
 * UI Labels and Text Constants
 * Centralized location for all user-facing text in the application.
 * This makes it easier to update copy and potentially support i18n in the future.
 */

export const UI_LABELS = {
  // Home Page - Header
  HOME_TITLE: "Inventario Global",
  HOME_SEARCH_PLACEHOLDER: "Buscar herramienta, P/N, o descripción...",
  
  // Home Page - Categories
  CATEGORY_ALL: "Todas",
  CATEGORY_LOADING: "Cargando filtros...",
  
  // Home Page - Results
  RESULTS_COUNTING: "Contando...",
  RESULTS_EXPLORING: "Explorando",
  RESULTS_TOOLS: "herramientas",
  RESULTS_FOUND_SINGULAR: "resultado encontrado",
  RESULTS_FOUND_PLURAL: "resultados encontrados",
  RESULTS_TOOL_SINGULAR: "herramienta encontrada",
  RESULTS_TOOL_PLURAL: "herramientas encontradas",
  RESULTS_CLEAR_FILTERS: "Limpiar filtros",
  RESULTS_NO_TOOLS: "No encontramos herramientas con ese criterio.",
  
  // Home Page - Actions
  ACTION_MANAGE_CATEGORIES: "Gestionar Categorías",
  ACTION_NEW_TOOL: "Nueva Herramienta",
  ACTION_LOAD_MORE: "Cargar más herramientas...",
  ACTION_LOADING: "Cargando...",
  
  // Home Page - View Modes
  VIEW_GRID_TITLE: "Vista de Grilla",
  VIEW_LIST_TITLE: "Vista de Lista",
  
  // Kit Creation
  KIT_EMPTY_TITLE: "Tu lista está vacía",
  KIT_EMPTY_MESSAGE: "Selecciona herramientas del buscador antes de crear un kit.",
  KIT_EMPTY_BACK: "Volver al Buscador",
  KIT_CREATE_TITLE: "Publicar Nueva Lista",
  KIT_CREATE_SUBTITLE: "Comparte tu conocimiento con el equipo. Esta lista será visible para todos.",
  KIT_FORM_NAME_LABEL: "Nombre de la Lista",
  KIT_FORM_NAME_PLACEHOLDER: "Ej: Cambio de Ruedas b787 med",
  KIT_FORM_AUTHOR_LABEL: "Creado por",
  KIT_FORM_AUTHOR_PLACEHOLDER: "Tu nombre (ej: eduin)",
  KIT_FORM_DESCRIPTION_LABEL: "Notas / Descripción (opcional)",
  KIT_FORM_DESCRIPTION_PLACEHOLDER: "Ej: Para mantenimiento preventivo mensual...",
  KIT_FORM_SUBMIT: "Publicar Lista",
  KIT_FORM_SUBMITTING: "Guardando...",
  KIT_TOOLS_COUNT: "Herramientas",
  KIT_TOOLS_SELECTED: "Herramientas seleccionadas",
  KIT_TOOLS_READY: "Listas para compartir",
  KIT_CREATE_ACTION: "Crear Lista",
  
  // Kits Page
  KITS_TITLE: "Biblioteca de Kits",
  KITS_SUBTITLE: "Configuraciones estandarizadas para tareas operativas.",
  KITS_BADGE: "Listas Destacadas",
  KITS_EMPTY_TITLE: "Aún no hay listas",
  KITS_EMPTY_MESSAGE: "¡Sé el primero en crear una!",
  
  // Kit Modal
  MODAL_BY_AUTHOR: "Por",
  MODAL_BY_ANON: "Anónimo",
  MODAL_TOOLS_INCLUDED: "Herramientas incluidas",
  MODAL_PART_NUMBER: "Part Number",
  MODAL_CATEGORY: "Categoría",
  MODAL_EMPTY: "Este kit no tiene herramientas",
  MODAL_ACTION_COPY: "Copiar",
  MODAL_ACTION_WHATSAPP: "WhatsApp",
  MODAL_ACTION_CLOSE: "Cerrar",
  
  // Tool Card
  TOOL_PART_NUMBER_LABEL: "P/N:",
  TOOL_ACTION_COPY: "Copiar",
  TOOL_ACTION_COPIED: "¡Copiado!",
  TOOL_ACTION_ADD: "Agregar a lista",
  TOOL_ACTION_REMOVE: "Quitar de la lista",
  TOOL_ACTION_DELETE_TITLE: "Editar herramienta",
  TOOL_ACTION_EDIT_TITLE: "Eliminar herramienta",
  
  // Toasts/Notifications
  TOAST_KIT_CREATED: "✅ Lista creada con éxito",
  TOAST_KIT_DELETED: "✅ Lista eliminada correctamente",
  TOAST_KIT_COPIED: "✅ Lista copiada al portapapeles",
  TOAST_TOOL_CREATED: "✅ Herramienta creada con éxito",
  TOAST_TOOL_UPDATED: "✅ Herramienta actualizada",
  TOAST_TOOL_DELETED: "✅ Herramienta eliminada",
  TOAST_ERROR_SAVE: "⚠️ Error al guardar:",
  TOAST_ERROR_DELETE: "⚠️ Error al borrar:",
  TOAST_ERROR_LOAD: "Error al cargar herramientas",
  TOAST_ERROR_UNEXPECTED: "Ocurrió un error inesperado",
  TOAST_FORM_INCOMPLETE: "⚠️ Por favor completa todos los campos",
  TOAST_DUPLICATE_PN: "⚠️ Ya existe una herramienta con ese Part Number",
  
  // Dialogs
  DIALOG_DELETE_KIT_TITLE: "¿Seguro que quieres eliminar esta lista permanentemente?",
  DIALOG_DELETE_TOOL_TITLE: "¿Eliminar herramienta?",
  DIALOG_DELETE_TOOL_MESSAGE: "Esta acción es permanente y no se puede deshacer. La herramienta será eliminada del catálogo.",
};

export default UI_LABELS;
