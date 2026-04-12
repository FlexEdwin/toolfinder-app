import { createContext, useContext, useState, useEffect } from 'react';

const KitContext = createContext();

const STORAGE_KEY = 'toolfinder_cart';
const STORAGE_KEY_EDITING = 'toolfinder_editing_kit';

export function KitProvider({ children }) {
  // Inicializar desde localStorage
  const [selectedTools, setSelectedTools] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  const [editingKit, setEditingKit] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EDITING);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading editing kit from localStorage:', error);
      return null;
    }
  });

  // Persistir en localStorage cada vez que cambie selectedTools o editingKit
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTools));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [selectedTools]);

  useEffect(() => {
    try {
      if (editingKit) {
        localStorage.setItem(STORAGE_KEY_EDITING, JSON.stringify(editingKit));
      } else {
        localStorage.removeItem(STORAGE_KEY_EDITING);
      }
    } catch (error) {
      console.error('Error saving editing kit to localStorage:', error);
    }
  }, [editingKit]);

  // Agregar herramienta al "carrito"
  const toggleTool = (tool) => {
    setSelectedTools(prev => {
      const exists = prev.find(t => t.id === tool.id);
      if (exists) {
        // Si ya está, la quitamos (deseleccionar)
        return prev.filter(t => t.id !== tool.id);
      } else {
        // Si no está, la agregamos
        return [...prev, tool];
      }
    });
  };

  const clearKit = () => {
    setSelectedTools([]);
    setEditingKit(null);
  };

  // Cargar un kit para editarlo
  const setKitForEditing = (kit) => {
    setEditingKit({
      id: kit.id,
      name: kit.name,
      author_name: kit.author_name,
      description: kit.description || ''
    });
    
    // Extraer herramientas del formato del backend (kit.kit_items[].tools)
    const toolsForCart = (kit.kit_items || []).map(item => ({
      id: item.tool_id || item.tools?.id, 
      name: item.tools?.name,
      part_number: item.tools?.part_number,
      category: item.tools?.category
    })).filter(t => t.id); // Asegurar que tengan ID válido
    
    setSelectedTools(toolsForCart);
  };

  const value = {
    selectedTools,
    toggleTool,
    clearKit,
    setKitForEditing,
    editingKit,
    count: selectedTools.length
  };

  return (
    <KitContext.Provider value={value}>
      {children}
    </KitContext.Provider>
  );
}

export const useKit = () => useContext(KitContext);