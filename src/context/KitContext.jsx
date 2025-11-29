import { createContext, useContext, useState } from 'react';

const KitContext = createContext();

export function KitProvider({ children }) {
  const [selectedTools, setSelectedTools] = useState([]);

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