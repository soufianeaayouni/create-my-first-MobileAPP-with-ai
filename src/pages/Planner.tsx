import React from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, ChevronLeft, ChevronRight, ShoppingBag, Clock, Users, Utensils, Sparkles } from 'lucide-react';
import { Recipe, MealPlan } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths,
  addDays,
  startOfWeek,
  endOfWeek,
  isToday
} from 'date-fns';
import { cn } from '../lib/utils';

const MEALS = ['breakfast', 'lunch', 'dinner'] as const;

export default function Planner() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [planner, setPlanner] = React.useState<MealPlan>(() => {
    try {
      const saved = localStorage.getItem('meal-planner');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Failed to parse meal-planner from localStorage', e);
      return {};
    }
  });

  React.useEffect(() => {
    localStorage.setItem('meal-planner', JSON.stringify(planner));
  }, [planner]);

  const removeRecipe = (dateStr: string, meal: typeof MEALS[number]) => {
    const newPlanner = { ...planner };
    if (newPlanner[dateStr]) {
      delete newPlanner[dateStr][meal];
      if (Object.keys(newPlanner[dateStr]).length === 0) {
        delete newPlanner[dateStr];
      }
    }
    setPlanner(newPlanner);
  };

  const generateGroceryList = () => {
    const ingredients: any[] = [];
    Object.values(planner).forEach(day => {
      Object.values(day).forEach(recipe => {
        if (recipe && recipe.extendedIngredients) {
          recipe.extendedIngredients.forEach(ing => {
            ingredients.push({
              id: Math.random(),
              name: ing.original,
              checked: false,
              category: ing.aisle || 'Other'
            });
          });
        }
      });
    });
    
    if (ingredients.length === 0) {
      alert('Please add some recipes to your planner first!');
      return;
    }

    const existing = JSON.parse(localStorage.getItem('grocery-list') || '[]');
    localStorage.setItem('grocery-list', JSON.stringify([...existing, ...ingredients]));
    
    if (confirm('Grocery list generated! Would you like to view it now?')) {
      navigate('/groceries');
    }
  };

  const clearPlanner = () => {
    if (confirm('Are you sure you want to clear your entire meal plan?')) {
      setPlanner({});
      localStorage.removeItem('meal-planner');
    }
  };

  const generateSamplePlan = async () => {
    try {
      const res = await fetch('/api/spoon/random');
      const recipes: Recipe[] = await res.json();
      
      if (recipes.length > 0) {
        const newPlanner: MealPlan = {};
        const today = new Date();
        
        // Seed today and tomorrow
        [0, 1].forEach(offset => {
          const date = addDays(today, offset);
          const dateStr = format(date, 'yyyy-MM-dd');
          newPlanner[dateStr] = {
            breakfast: recipes[0],
            lunch: recipes[1],
            dinner: recipes[2]
          };
        });
        
        setPlanner(newPlanner);
        localStorage.setItem('meal-planner', JSON.stringify(newPlanner));
        alert('Sample plan generated for today and tomorrow!');
      }
    } catch (err) {
      console.error('Failed to generate sample plan:', err);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayMeals = planner[selectedDateStr] || {};

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Meal Planner</h1>
          <p className="text-stone-500 font-medium">Plan your week, eat better, live healthier.</p>
        </div>
        <div className="flex gap-2">
          {Object.keys(planner).length === 0 && (
            <button 
              onClick={generateSamplePlan}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl font-bold hover:bg-emerald-100 transition-all shadow-sm"
            >
              <Sparkles size={20} />
              Sample Plan
            </button>
          )}
          <button 
            onClick={clearPlanner}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 text-stone-600 rounded-2xl font-bold hover:bg-stone-50 transition-all shadow-sm"
          >
            <Trash2 size={20} />
            Clear
          </button>
          <button 
            onClick={generateGroceryList}
            className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-black hover:bg-stone-800 transition-all shadow-lg shadow-stone-200"
          >
            <ShoppingBag size={20} />
            Generate Grocery List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-xl font-black text-stone-900">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 hover:bg-stone-100 rounded-xl text-stone-600 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 hover:bg-stone-100 rounded-xl text-stone-600 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-black text-stone-400 uppercase tracking-widest py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const hasMeals = planner[dateStr];
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = format(day, 'M') === format(currentMonth, 'M');

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all",
                      !isCurrentMonth ? "opacity-20" : "opacity-100",
                      isSelected 
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-105 z-10" 
                        : "hover:bg-stone-50 text-stone-700",
                      isToday(day) && !isSelected && "border-2 border-emerald-500/20"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-bold",
                      isSelected ? "text-white" : "text-stone-900"
                    )}>
                      {format(day, 'd')}
                    </span>
                    
                    {/* Meal Dots */}
                    {hasMeals && (
                      <div className="flex gap-0.5 mt-1">
                        {hasMeals.breakfast && <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-emerald-400")} />}
                        {hasMeals.lunch && <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-orange-400")} />}
                        {hasMeals.dinner && <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-blue-400")} />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
              <Utensils size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-emerald-900 uppercase tracking-widest">Pro Tip</p>
              <p className="text-emerald-700 text-sm font-medium">
                Planning your meals ahead reduces food waste and saves you money!
              </p>
            </div>
          </div>
        </div>

        {/* Daily Schedule Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-stone-900">
              {format(selectedDate, 'EEEE, MMM do')}
            </h2>
          </div>

          <div className="space-y-4">
            {MEALS.map((meal) => {
              const recipe = selectedDayMeals[meal];
              const colors = {
                breakfast: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                lunch: 'bg-orange-50 text-orange-600 border-orange-100',
                dinner: 'bg-blue-50 text-blue-600 border-blue-100'
              };

              return (
                <motion.div
                  key={meal}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-[2rem] border border-stone-200 p-5 shadow-sm relative group overflow-hidden"
                >
                  <div className="flex gap-5">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0">
                      {recipe ? (
                        <img 
                          src={recipe.image} 
                          alt={recipe.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <Plus size={32} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                          colors[meal]
                        )}>
                          {meal}
                        </span>
                      </div>

                      {recipe ? (
                        <>
                          <Link to={`/recipe/${recipe.id}`} className="block group-hover:text-emerald-600 transition-colors">
                            <h3 className="font-black text-stone-900 truncate mb-2">{recipe.title}</h3>
                          </Link>
                          <div className="flex items-center gap-4 text-stone-400">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span className="text-xs font-bold">
                                {recipe.readyInMinutes ? `${recipe.readyInMinutes}m` : '30m'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users size={14} />
                              <span className="text-xs font-bold">
                                {recipe.servings ? `${recipe.servings} servings` : '4 servings'}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div>
                          <h3 className="font-black text-stone-300 mb-2">No meal planned</h3>
                          <Link 
                            to="/recipes" 
                            className="text-xs font-black text-emerald-500 hover:text-emerald-600 uppercase tracking-widest"
                          >
                            + Add Recipe
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {recipe && (
                    <button 
                      onClick={() => removeRecipe(selectedDateStr, meal)}
                      className="absolute top-4 right-4 p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
