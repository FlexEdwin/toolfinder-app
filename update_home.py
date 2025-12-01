import re

# Read the original file
with open('src/pages/Home.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add categories state after totalResults
content = content.replace(
    '  const [totalResults, setTotalResults] = useState(0);\n  const debounceTimer = useRef(null);',
    '  const [totalResults, setTotalResults] = useState(0);\n  const [categories, setCategories] = useState(["Todas"]);\n  const [selectedCategory, setSelectedCategory] = useState("Todas");\n  const debounceTimer = useRef(null);'
)

# 2. Add fetchCategories function before fetchTools
fetch_categories = '''  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('category')
        .not('category', 'is', null);
      
      if (error) throw error;
      
      const uniqueCategories = [...new Set(data.map(t => t.category))];
      setCategories(["Todas", ...uniqueCategories.sort()]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

'''

content = content.replace(
    '  // Fetch tools - either default or search',
    fetch_categories + '  // Fetch tools - either default or search'
)

# 3. Update fetchTools signature to include category parameter
content = content.replace(
    '  const fetchTools = async (page = 1, search = "") => {',
    '  const fetchTools = async (page = 1, search = "", category = "Todas") => {'
)

# 4. Add category filtering in search branch
old_search_block = '''        setTools(data || []);
        setTotalResults(data?.length || 0);
      } else {'''

new_search_block = '''        // Filter by category if not "Todas"
        let filteredData = data || [];
        if (category !== "Todas") {
          filteredData = filteredData.filter(t => t.category === category);
        }
        
        setTools(filteredData);
        setTotalResults(filteredData.length);
      } else {'''

content = content.replace(old_search_block, new_search_block)

# 5. Add category filtering in default branch
old_default_block = '''        const startRange = (page - 1) * ITEMS_PER_PAGE;
        const endRange = startRange + ITEMS_PER_PAGE - 1;
        
        const { data, error, count } = await supabase
          .from('tools')
          .select('*', { count: 'exact' })
          .order('name', { ascending: true })
          .range(startRange, endRange);'''

new_default_block = '''        const startRange = (page - 1) * ITEMS_PER_PAGE;
        const endRange = startRange + ITEMS_PER_PAGE - 1;
        
        let query = supabase
          .from('tools')
          .select('*', { count: 'exact' })
          .order('name', { ascending: true });
        
        // Apply category filter if not "Todas"
        if (category !== "Todas") {
          query = query.eq('category', category);
        }
        
        const { data, error, count } = await query.range(startRange, endRange);'''

content = content.replace(old_default_block, new_default_block)

# 6. Update initial useEffect
content = content.replace(
    '  useEffect(() => {\n    fetchTools(1, "");\n  }, []);',
    '  useEffect(() => {\n    fetchCategories();\n    fetchTools(1, "", "Todas");\n  }, []);'
)

# 7. Update debounced search
content = content.replace(
    '      fetchTools(1, searchTerm);',
    '      fetchTools(1, searchTerm, selectedCategory);'
)

# 8. Update handlePageChange
content = content.replace(
    '    fetchTools(newPage, searchTerm);',
    '    fetchTools(newPage, searchTerm, selectedCategory);'
)

# 9. Add handleCategoryChange function
handle_category = '''
  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchTools(1, searchTerm, category);
  };
'''

content = content.replace(
    '  // Calculate total pages',
    handle_category + '\n  // Calculate total pages'
)

# 10. Update CRUD operations to refresh categories
content = content.replace(
    '        toast.success("✅ Herramienta actualizada");\n        // Refresh current page\n        fetchTools(currentPage, searchTerm);',
    '        toast.success("✅ Herramienta actualizada");\n        // Refresh current page\n        fetchCategories();\n        fetchTools(currentPage, searchTerm, selectedCategory);'
)

content = content.replace(
    '        toast.success("✅ Herramienta creada con éxito");\n        // Refresh current page\n        fetchTools(currentPage, searchTerm);',
    '        toast.success("✅ Herramienta creada con éxito");\n        // Refresh current page\n        fetchCategories();\n        fetchTools(currentPage, searchTerm, selectedCategory);'
)

content = content.replace(
    '      toast.success("✅ Herramienta eliminada");\n      setShowDeleteConfirm(false);\n      // Refresh current page\n      fetchTools(currentPage, searchTerm);',
    '      toast.success("✅ Herramienta eliminada");\n      setShowDeleteConfirm(false);\n      // Refresh current page\n      fetchCategories();\n      fetchTools(currentPage, searchTerm, selectedCategory);'
)

# 11. Add category pills before closing </div></div>
category_pills = '''
          {/* Filtros de Categoría (Pill Shapes) */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>'''

# Find the position after the search input div closes
search_div_end = content.find('            </div>\n          </div>\n        </div>\n      </div>\n\n      {/* --- RESULTADOS (GRILLA) --- */')
if search_div_end > 0:
    insert_pos = content.find('          </div>\n        </div>\n      </div>\n\n      {/* --- RESULTADOS (GRILLA) --- */')
    content = content[:insert_pos] + '          </div>\n' + category_pills + '\n        </div>\n      </div>\n\n      {/* --- RESULTADOS (GRILLA) --- */' + content[insert_pos + len('          </div>\n        </div>\n      </div>\n\n      {/* --- RESULTADOS (GRILLA) --- */'):]

# 12. Fix pagination contrast - change text-slate-700 to text-slate-900
content = content.replace(
    '                  <span className="text-slate-700 font-medium px-3">',
    '                  <span className="text-slate-900 font-bold px-3">'
)

content = content.replace(
    '                <span className="text-slate-700 font-medium px-4">',
    '                <span className="text-slate-900 font-bold px-4">'
)

# 13. Update modal props
content = content.replace(
    '        existingCategories={[]}',
    '        existingCategories={categories.filter(c => c !== "Todas")}'
)

content = content.replace(
    '        categories={[]}\n        onRefresh={() => fetchTools(currentPage, searchTerm)}',
    '        categories={categories}\n        onRefresh={() => {\n          fetchCategories();\n          fetchTools(currentPage, searchTerm, selectedCategory);\n        }}'
)

# Write the updated content
with open('src/pages/Home.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("File updated successfully!")
