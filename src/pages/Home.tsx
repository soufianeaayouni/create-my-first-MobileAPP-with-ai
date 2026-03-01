import React from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Sparkles, Utensils, Calendar, ShoppingBag, Carrot, Package, LayoutGrid } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import { Recipe } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Home() {
  const [trending, setTrending] = React.useState<Recipe[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/spoon/random');
        const data = await res.json();
        if (Array.isArray(data)) {
          setTrending(data);
        } else {
          console.error('Unexpected API response:', data);
          setTrending([]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="space-y-12 bg-white min-h-screen">
      {/* Quick Shortcuts / Action Buttons */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Utensils, label: 'Recipes', path: '/recipes', color: 'bg-stone-50 text-stone-900 border-stone-100' },
          { icon: Carrot, label: 'Ingredients', path: '/ingredients', color: 'bg-stone-50 text-stone-900 border-stone-100' },
          { icon: Package, label: 'Products', path: '/recipes', color: 'bg-stone-50 text-stone-900 border-stone-100' },
          { icon: LayoutGrid, label: 'Meal Planning', path: '/planner', color: 'bg-stone-50 text-stone-900 border-stone-100' },
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
          >
            <Link 
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center p-8 rounded-[2rem] border transition-all hover:bg-stone-100 hover:shadow-sm",
                item.color
              )}
            >
              <item.icon size={32} className="mb-4 text-emerald-500" />
              <span className="font-bold tracking-tight text-sm">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Recent Recipes */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black tracking-tight text-stone-900">Recent recipes</h2>
          <Link to="/recipes" className="text-sm font-bold text-emerald-600 hover:underline">See all</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-stone-100 rounded-3xl aspect-[4/5]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trending.map((recipe, idx) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * idx }}
              >
                <RecipeCard recipe={recipe} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Banner */}
      <section className="relative rounded-[2.5rem] overflow-hidden bg-stone-50 p-8 md:p-12 border border-stone-100">
        <div className="relative z-10 max-w-md">
          <h3 className="text-3xl font-black text-stone-900 mb-4 leading-tight">
            Discover new <br />
            seasonal flavors.
          </h3>
          <p className="text-stone-500 mb-8 font-medium">
            Explore our curated collection of spring recipes.
          </p>
          <Link to="/recipes" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-200">
            Explore Now
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
          <img 
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000" 
            alt="Healthy food" 
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>
    </div>
  );
}
