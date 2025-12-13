import { createContext, useContext, useState, useEffect } from 'react';

const KitContext = createContext();

const STORAGE_KEY = 'toolfinder_cart';

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

  // Persistir en localStorage cada vez que cambie selectedTools
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTools));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [selectedTools]);

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

  const clearKit = () => setSelectedTools([]);

  const value = {
    selectedTools,
    toggleTool,
    clearKit,
    count: selectedTools.length
  };

  return (
    <KitContext.Provider value={value}>
      {children}
    </KitContext.Provider>
  );
}

export const useKit = () => useContext(KitContext);