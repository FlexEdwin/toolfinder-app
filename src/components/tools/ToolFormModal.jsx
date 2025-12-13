import { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, ExternalLink, Image, ChevronDown, Plus, Check } from 'lucide-react';

export default function ToolFormModal({ isOpen, onClose, tool, onSave, existingCategories = [] }) {
  const [formData, setFormData] = useState({
    part_number: '',
    name: '',
    category: '',
    specs: '',
    keywords: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState(false);
  
  // Category dropdown state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const dropdownRef = useRef(null);

  // Pre-fill form when editing
  useEffect(() => {
    if (tool) {
      setFormData({
        part_number: tool.part_number || '',
        name: tool.name || '',
        category: tool.category || '',
        specs: tool.specs || '',
        keywords: tool.keywords || '',
        image_url: tool.image_url || ''
      });
      setCategoryFilter(tool.category || '');
    } else {
      // Reset form for create mode
      setFormData({
        part_number: '',
        name: '',
        category: '',
        specs: '',
        keywords: '',
        image_url: ''
      });
      setCategoryFilter('');
    }
    setErrors({});
    setImageError(false);
  }, [tool, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter categories based on input
  const filteredCategories = existingCategories.filter(cat =>
    cat.toLowerCase().includes(categoryFilter.toLowerCase())
  );

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
      await onSave( formData);
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
    // Reset image error when URL changes
    if (field === 'image_url') {
      setImageError(false);
    }
  };

  const handleCategoryInputChange = (value) => {
    setCategoryFilter(value);
    handleChange('category', value);
    setShowCategoryDropdown(true);
  };

  const handleCategorySelect = (category) => {
    handleChange('category', category);
    setCategoryFilter(category);
    setShowCategoryDropdown(false);
  };

  const handleCreateNewCategory = () => {
    handleChange('category', categoryFilter);
    setShowCategoryDropdown(false);
  };

  /**
   * Open Google Images search for the part number
   */
  const handleGoogleSearch = () => {
    if (formData.part_number) {
      window.open(
        `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(formData.part_number)}`,
        '_blank'
      );
    }
  };

  if (!isOpen) return null;

  const showCreateOption = categoryFilter.trim() && filteredCategories.length === 0;
  const exactMatch = existingCategories.some(cat => cat.toLowerCase() === categoryFilter.toLowerCase());

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

          {/* Category - Custom Dropdown with Autocomplete */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Categoría
            </label>
            <div className="relative">
              <input
                type="text"
                value={categoryFilter}
                onChange={(e) => handleCategoryInputChange(e.target.value)}
                onFocus={() => setShowCategoryDropdown(true)}
                className="w-full p-3 pr-10 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Buscar o seleccionar categoría..."
                disabled={loading}
              />
              <ChevronDown 
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-transform ${
                  showCategoryDropdown ? 'rotate-180' : ''
                }`}
                size={20}
              />
            </div>

            {/* Dropdown List */}
            {showCategoryDropdown && (
              <div className="absolute w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                {filteredCategories.length > 0 ? (
                  <div className="py-1">
                    {filteredCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategorySelect(category)}
                        className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors flex items-center justify-between group"
                      >
                        <span className="text-slate-700">{category}</span>
                        {formData.category === category && (
                          <Check size={16} className="text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : showCreateOption ? (
                  <button
                    type="button"
                    onClick={handleCreateNewCategory}
                    className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center gap-2 text-green-700 font-medium border-t-2 border-dashed border-green-200"
                  >
                    <Plus size={18} className="flex-shrink-0" />
                    <div>
                      <div>Crear nueva categoría:</div>
                      <div className="text-sm font-bold">&quot;{categoryFilter}&quot;</div>
                    </div>
                  </button>
                ) : (
                  <div className="px-4 py-3 text-slate-500 text-sm text-center">
                    Escribe para buscar o crear una categoría
                  </div>
                )}
              </div>
            )}

            {/* Helper text */}
            {!exactMatch && categoryFilter.trim() && !showCategoryDropdown && (
              <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                <Plus size={12} />
                Se creará como nueva categoría
              </p>
            )}
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

          {/* Image URL - ADMIN ONLY */}
          <div className="border-t border-slate-200 pt-4">
            <label className="block text-sm font-bold text-slate-700 mb-1">
              URL de Imagen (Opcional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                className="flex-1 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://ejemplo.com/imagen.jpg"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleGoogleSearch}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 text-slate-700 font-medium"
                disabled={!formData.part_number || loading}
                title="Buscar en Google Images"
              >
                <ExternalLink size={18} />
                Buscar en Google
              </button>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Copia la URL de la imagen desde Google Images o cualquier fuente externa.
            </p>

            {/* Image Preview */}
            {formData.image_url && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-bold text-slate-600 uppercase mb-2">Vista Previa:</p>
                {!imageError ? (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-32 h-32 object-contain bg-white border border-slate-200 rounded-lg"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-32 h-32 bg-slate-200 border border-slate-300 rounded-lg flex flex-col items-center justify-center">
                    <Image size={32} className="text-slate-400 mb-2" />
                    <p className="text-xs text-slate-500 text-center px-2">Error al cargar imagen</p>
                  </div>
                )}
              </div>
            )}
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
