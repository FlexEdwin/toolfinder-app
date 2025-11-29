import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

export default function ToolFormModal({ isOpen, onClose, tool, onSave, existingCategories = [] }) {
  const [formData, setFormData] = useState({
    part_number: '',
    name: '',
    category: '',
    specs: '',
    keywords: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Pre-fill form when editing
  useEffect(() => {
    if (tool) {
      setFormData({
        part_number: tool.part_number || '',
        name: tool.name || '',
        category: tool.category || '',
        specs: tool.specs || '',
        keywords: tool.keywords || ''
      });
    } else {
      // Reset form for create mode
      setFormData({
        part_number: '',
        name: '',
        category: '',
        specs: '',
        keywords: ''
      });
    }
    setErrors({});
  }, [tool, isOpen]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.part_number.trim()) {
      newErrors.part_number = 'Part Number es obligatorio';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nombre es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      // Error handling is done in parent component
      console.error('Error saving tool:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">
            {tool ? 'Editar Herramienta' : 'Nueva Herramienta'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Part Number */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Part Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.part_number}
              onChange={(e) => handleChange('part_number', e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                errors.part_number ? 'border-red-500' : 'border-slate-300'
              } focus:ring-2 focus:ring-blue-500 outline-none`}
              placeholder="Ej: H-20-MED"
              disabled={loading || !!tool} // Disable editing part_number for existing tools
            />
            {errors.part_number && (
              <p className="text-red-500 text-sm mt-1">{errors.part_number}</p>
            )}
            {tool && (
              <p className="text-slate-500 text-xs mt-1">El Part Number no se puede modificar</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Nombre/Descripción <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                errors.name ? 'border-red-500' : 'border-slate-300'
              } focus:ring-2 focus:ring-blue-500 outline-none`}
              placeholder="Ej: Martillo de goma"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Categoría
            </label>
            <input
              type="text"
              list="categories"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: Herramientas Manuales"
              disabled={loading}
            />
            <datalist id="categories">
              {existingCategories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          {/* Specs */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Especificaciones Técnicas
            </label>
            <textarea
              value={formData.specs}
              onChange={(e) => handleChange('specs', e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Detalles técnicos, dimensiones, etc."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Palabras Clave (Keywords)
            </label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => handleChange('keywords', e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: hammer, tool, manual"
              disabled={loading}
            />
            <p className="text-slate-500 text-xs mt-1">
              Ayuda a mejorar la búsqueda. Separa con comas o espacios.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar Herramienta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
