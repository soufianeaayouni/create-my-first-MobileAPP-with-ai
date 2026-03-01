import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Clock, Flame, ChefHat, Users, ArrowLeft, 
  Heart, Share2, Plus, Play, Info, CheckCircle2 
} from 'lucide-react';
import { Recipe, MealPlan } from '../types';
import { motion } from 'motion/react';
import AddToPlannerModal from '../components/AddToPlannerModal';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = React.useState<Recipe | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSaved, setIsSaved] = React.useState(false);
  const [showPlannerModal, setShowPlannerModal] = React.useState(false);

  React.useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`/api/spoon/recipe/${id}`);
        const data = await res.json();
        setRecipe(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const addToGroceryList = (ingredient: any) => {
    const list = JSON.parse(localStorage.getItem('grocery-list') || '[]');
    const newItem = { id: Math.random(), name: ingredient.original, checked: false, category: ingredient.aisle || 'Other' };
    localStorage.setItem('grocery-list', JSON.stringify([...list, newItem]));
    // Show toast or feedback
    alert('Added to grocery list!');
  };

  const handleAddToPlanner = (date: Date, meal: 'breakfast' | 'lunch' | 'dinner') => {
    if (!recipe) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const saved = localStorage.getItem('meal-planner');
    const planner: MealPlan = saved ? JSON.parse(saved) : {};
    
    if (!planner[dateStr]) {
      planner[dateStr] = {};
    }
    
    planner[dateStr][meal] = recipe;
    localStorage.setItem('meal-planner', JSON.stringify(planner));
    
    setShowPlannerModal(false);
    alert(`Recipe added to ${meal} on ${format(date, 'MMM do')}!`);
    navigate('/planner');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-10 w-32 bg-stone-200 rounded-xl" />
        <div className="aspect-video bg-stone-200 rounded-3xl" />
        <div className="h-12 w-3/4 bg-stone-200 rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-stone-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!recipe) return <div>Recipe not found</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-stone-500 hover:text-emerald-600 font-bold mb-6 transition-colors group"
      >
        <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
        Back to Recipes
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image & Basic Info */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl shadow-stone-200 group">
            <img 
              src={recipe.image} 
              alt={recipe.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-6 right-6 flex gap-3">
              <button 
                onClick={() => setIsSaved(!isSaved)}
                className={cn(
                  "w-12 h-12 rounded-2xl backdrop-blur-md flex items-center justify-center transition-all shadow-lg",
                  isSaved ? "bg-red-500 text-white" : "bg-white/80 text-stone-800 hover:bg-white"
                )}
              >
                <Heart size={24} fill={isSaved ? "currentColor" : "none"} />
              </button>
              <button className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-stone-800 hover:bg-white transition-all shadow-lg">
                <Share2 size={24} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-stone-900 leading-tight">
              {recipe.title}
            </h1>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Clock, label: `${recipe.readyInMinutes} min`, color: 'bg-emerald-50 text-emerald-600' },
                { icon: Flame, label: `${Math.round(recipe.nutrition?.nutrients[0]?.amount || 350)} kcal`, color: 'bg-orange-50 text-orange-600' },
                { icon: Users, label: `${recipe.servings} servings`, color: 'bg-blue-50 text-blue-600' },
                { icon: ChefHat, label: recipe.difficulty || 'Medium', color: 'bg-purple-50 text-purple-600' },
              ].map((stat, i) => (
                <div key={i} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm", stat.color)}>
                  <stat.icon size={18} />
                  {stat.label}
                </div>
              ))}
            </div>
          </div>

          <div className="prose prose-stone max-w-none">
            <div 
              className="text-lg text-stone-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: recipe.summary || '' }} 
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Instructions</h2>
              <Link 
                to={`/cook/${recipe.id}`}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-200"
              >
                <Play size={20} fill="currentColor" />
                Start Cooking
              </Link>
            </div>
            
            <div className="space-y-8">
              {recipe.analyzedInstructions?.[0]?.steps.map((step, idx) => (
                <div key={idx} className="flex gap-6 group">
                  <div className="flex-shrink-0 w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 font-black text-lg group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                    {step.number}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-stone-700 text-lg leading-relaxed">{step.step}</p>
                    {step.equipment.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {step.equipment.map((eq, i) => (
                          <span key={i} className="text-xs font-bold text-stone-400 uppercase tracking-widest bg-stone-50 px-2 py-1 rounded-md">
                            {eq.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Ingredients & Nutrition */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white rounded-[2rem] border border-stone-200 p-8 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Ingredients</h2>
              <button 
                onClick={() => {
                  recipe.extendedIngredients?.forEach(addToGroceryList);
                }}
                className="text-emerald-600 font-bold text-sm hover:underline flex items-center gap-1"
              >
                <Plus size={16} />
                Add all to list
              </button>
            </div>

            <div className="space-y-4">
              {recipe.extendedIngredients?.map((ing, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-stone-700 font-medium">{ing.original}</span>
                  </div>
                  <button 
                    onClick={() => addToGroceryList(ing)}
                    className="p-1.5 text-stone-300 hover:text-emerald-500 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-stone-100">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Info size={20} className="text-stone-400" />
                Nutrition Info
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {recipe.nutrition?.nutrients.slice(0, 4).map((n, i) => (
                  <div key={i} className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{n.name}</p>
                    <p className="text-lg font-black text-stone-800">{Math.round(n.amount)}{n.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <button 
                onClick={() => setShowPlannerModal(true)}
                className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add to Planner
              </button>
            </div>
          </div>
        </div>
      </div>

      {recipe && (
        <AddToPlannerModal
          recipe={recipe}
          isOpen={showPlannerModal}
          onClose={() => setShowPlannerModal(false)}
          onAdd={handleAddToPlanner}
        />
      )}
    </div>
  );
}

