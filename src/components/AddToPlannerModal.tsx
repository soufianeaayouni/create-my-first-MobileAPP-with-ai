import React from 'react';
import { X, Calendar, Clock, Check } from 'lucide-react';
import { Recipe, MealPlan } from '../types';
import { format, addDays, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface AddToPlannerModalProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (date: Date, meal: 'breakfast' | 'lunch' | 'dinner') => void;
}

const MEALS = [
  { id: 'breakfast', label: 'Breakfast', icon: '🍳', color: 'bg-emerald-50 text-emerald-600' },
  { id: 'lunch', label: 'Lunch', icon: '🍱', color: 'bg-orange-50 text-orange-600' },
  { id: 'dinner', label: 'Dinner', icon: '🍽️', color: 'bg-blue-50 text-blue-600' }
] as const;

export default function AddToPlannerModal({ recipe, isOpen, onClose, onAdd }: AddToPlannerModalProps) {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [selectedMeal, setSelectedMeal] = React.useState<'breakfast' | 'lunch' | 'dinner'>('lunch');

  // Generate next 7 days
  const days = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-stone-900">Add to Planner</h2>
              <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8 p-4 bg-stone-50 rounded-2xl border border-stone-100">
              <img src={recipe.image} alt={recipe.title} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-stone-900 truncate">{recipe.title}</h3>
                <p className="text-xs text-stone-500 font-medium">{recipe.readyInMinutes} mins • {recipe.calories} kcal</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-400 mb-4 block">Select Date</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {days.map((day) => {
                    const isSelected = isSameDay(day, selectedDate);
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all border",
                          isSelected 
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200" 
                            : "bg-white border-stone-200 text-stone-600 hover:border-emerald-500"
                        )}
                      >
                        <span className="text-[10px] font-black uppercase mb-1">{format(day, 'EEE')}</span>
                        <span className="text-lg font-black">{format(day, 'd')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-400 mb-4 block">Select Meal</label>
                <div className="grid grid-cols-3 gap-3">
                  {MEALS.map((meal) => {
                    const isSelected = selectedMeal === meal.id;
                    return (
                      <button
                        key={meal.id}
                        onClick={() => setSelectedMeal(meal.id)}
                        className={cn(
                          "p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border",
                          isSelected 
                            ? "bg-stone-900 border-stone-900 text-white shadow-xl" 
                            : "bg-stone-50 border-stone-100 text-stone-600 hover:border-stone-300"
                        )}
                      >
                        <span className="text-2xl">{meal.icon}</span>
                        <span className="text-xs font-bold">{meal.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => onAdd(selectedDate, selectedMeal)}
              className="w-full mt-10 py-4 bg-emerald-500 text-white rounded-2xl font-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Confirm Selection
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
