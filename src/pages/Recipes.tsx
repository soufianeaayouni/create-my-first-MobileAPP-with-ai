import React from 'react';
import { Search as SearchIcon, Filter, SlidersHorizontal, ChevronRight, X } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import { Recipe, MealPlan } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import AddToPlannerModal from '../components/AddToPlannerModal';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

const cuisines = ['Italian', 'Mexican', 'Asian', 'American', 'French', 'Indian', 'Mediterranean'];
const diets = ['Vegetarian', 'Vegan', 'Gluten Free', 'Ketogenic', 'Paleo'];

export default function Recipes() {
  const [search, setSearch] = React.useState('');
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedCuisine, setSelectedCuisine] = React.useState<string | null>(null);
  const [selectedDiet, setSelectedDiet] = React.useState<string | null>(null);
  const [selectedRecipeForPlanner, setSelectedRecipeForPlanner] = React.useState<Recipe | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: search,
        cuisine: selectedCuisine || '',
        diet: selectedDiet || '',
        number: '12'
      });
      
      const res = await fetch(`/api/spoon/search?${params.toString()}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setRecipes(data);
      } else {
        console.error('Unexpected API response:', data);
        setRecipes([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlanner = (date: Date, meal: 'breakfast' | 'lunch' | 'dinner') => {
    if (!selectedRecipeForPlanner) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const saved = localStorage.getItem('meal-planner');
    const planner: MealPlan = saved ? JSON.parse(saved) : {};
    
    if (!planner[dateStr]) {
      planner[dateStr] = {};
    }
    
    planner[dateStr][meal] = selectedRecipeForPlanner;
    localStorage.setItem('meal-planner', JSON.stringify(planner));
    
    setSelectedRecipeForPlanner(null);
    alert(`Recipe added to ${meal} on ${format(date, 'MMM do')}!`);
  };

  React.useEffect(() => {
    // Initial load - check for query param
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query) {
      setSearch(query);
      // We need to call handleSearch with the query, but handleSearch uses the 'search' state
      // which might not be updated yet. So we'll pass the query directly.
      const fetchWithQuery = async (q: string) => {
        setLoading(true);
        try {
          const searchParams = new URLSearchParams({
            query: q,
            cuisine: selectedCuisine || '',
            diet: selectedDiet || '',
            number: '12'
          });
          const res = await fetch(`/api/spoon/search?${searchParams.toString()}`);
          const data = await res.json();
          if (Array.isArray(data)) setRecipes(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchWithQuery(query);
    } else {
      // Fetch 4 random recipes for initial load
      const fetchInitial = async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/spoon/search?number=4');
          const data = await res.json();
          if (Array.isArray(data)) setRecipes(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchInitial();
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Discover Recipes</h1>
          <p className="text-stone-500 font-medium">Find the perfect meal for any occasion.</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative flex-1 max-w-xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ingredients or keywords..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
          <button 
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-stone-100 rounded-xl text-stone-600 transition-colors"
          >
            <SlidersHorizontal size={20} />
          </button>
        </form>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-4">Cuisine</h3>
                <div className="flex flex-wrap gap-2">
                  {cuisines.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedCuisine(selectedCuisine === c ? null : c)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                        selectedCuisine === c 
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200" 
                          : "bg-stone-50 text-stone-600 border-stone-200 hover:border-emerald-500"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-4">Dietary Preference</h3>
                <div className="flex flex-wrap gap-2">
                  {diets.map(d => (
                    <button
                      key={d}
                      onClick={() => setSelectedDiet(selectedDiet === d ? null : d)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                        selectedDiet === d 
                          ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200" 
                          : "bg-stone-50 text-stone-600 border-stone-200 hover:border-orange-500"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-stone-100">
                <button 
                  onClick={() => {
                    setShowFilters(false);
                    handleSearch();
                  }}
                  className="px-8 py-3 bg-stone-900 text-white rounded-xl font-black hover:bg-stone-800 transition-all shadow-lg shadow-stone-200"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-stone-100 rounded-2xl aspect-[4/5]" />
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {recipes.map((recipe, idx) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
            >
              <RecipeCard 
                recipe={recipe} 
                onAddToPlanner={(r) => setSelectedRecipeForPlanner(r)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 border-dashed">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400">
            <SearchIcon size={40} />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">No recipes found</h3>
          <p className="text-stone-500 max-w-xs mx-auto">
            Try searching for something else or adjust your filters.
          </p>
        </div>
      )}

      {selectedRecipeForPlanner && (
        <AddToPlannerModal
          recipe={selectedRecipeForPlanner}
          isOpen={!!selectedRecipeForPlanner}
          onClose={() => setSelectedRecipeForPlanner(null)}
          onAdd={handleAddToPlanner}
        />
      )}
    </div>
  );
}

