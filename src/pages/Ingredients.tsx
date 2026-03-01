import React from 'react';
import { Search as SearchIcon, SlidersHorizontal, X, ShoppingBasket, Plus, Trash2 } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import { Recipe } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const cuisines = ['Italian', 'Mexican', 'Asian', 'American', 'French', 'Indian', 'Mediterranean'];
const diets = ['Vegetarian', 'Vegan', 'Gluten Free', 'Ketogenic', 'Paleo'];

export default function Ingredients() {
  const [ingredientInput, setIngredientInput] = React.useState('');
  const [ingredients, setIngredients] = React.useState<string[]>([]);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedCuisine, setSelectedCuisine] = React.useState<string | null>(null);
  const [selectedDiet, setSelectedDiet] = React.useState<string | null>(null);

  const addIngredient = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!ingredientInput.trim()) return;
    if (!ingredients.includes(ingredientInput.trim().toLowerCase())) {
      setIngredients([...ingredients, ingredientInput.trim().toLowerCase()]);
    }
    setIngredientInput('');
  };

  const removeIngredient = (ing: string) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const handleSearch = async () => {
    if (ingredients.length === 0) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        includeIngredients: ingredients.join(','),
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

  React.useEffect(() => {
    if (ingredients.length > 0) {
      handleSearch();
    }
  }, [ingredients, selectedCuisine, selectedDiet]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Search by Ingredients</h1>
          <p className="text-stone-500 font-medium">Add what you have in your fridge to find the perfect recipe.</p>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-[2.5rem] p-6 md:p-8 shadow-sm space-y-6">
        <form onSubmit={addIngredient} className="flex gap-3">
          <div className="relative flex-1">
            <ShoppingBasket className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input
              type="text"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              placeholder="Add an ingredient (e.g. chicken, tomato, garlic)..."
              className="w-full pl-12 pr-4 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
            />
          </div>
          <button 
            type="submit"
            className="px-6 py-4 bg-emerald-500 text-white rounded-2xl font-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add</span>
          </button>
          <button 
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-4 rounded-2xl border transition-all flex items-center justify-center",
              showFilters ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-emerald-500"
            )}
          >
            <SlidersHorizontal size={24} />
          </button>
        </form>

        <div className="flex flex-wrap gap-2 min-h-[40px]">
          <AnimatePresence>
            {ingredients.map((ing) => (
              <motion.span
                key={ing}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100"
              >
                {ing}
                <button onClick={() => removeIngredient(ing)} className="hover:text-emerald-900">
                  <X size={14} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
          {ingredients.length > 0 && (
            <button 
              onClick={() => setIngredients([])}
              className="text-xs font-bold text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1 px-2"
            >
              <Trash2 size={12} />
              Clear all
            </button>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pt-4 border-t border-stone-100"
            >
              <div className="space-y-6">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-stone-100 rounded-3xl aspect-[4/5]" />
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
              <RecipeCard recipe={recipe} />
            </motion.div>
          ))}
        </div>
      ) : ingredients.length > 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-stone-200 border-dashed">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400">
            <SearchIcon size={40} />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">No recipes found</h3>
          <p className="text-stone-500 max-w-xs mx-auto">
            Try adding different ingredients or adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-stone-200 border-dashed">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
            <ShoppingBasket size={40} />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">What's in your fridge?</h3>
          <p className="text-stone-500 max-w-xs mx-auto">
            Add ingredients above to find recipes you can cook right now.
          </p>
        </div>
      )}
    </div>
  );
}
