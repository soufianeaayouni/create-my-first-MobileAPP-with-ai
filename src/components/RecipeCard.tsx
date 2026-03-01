import { Link } from 'react-router-dom';
import { Clock, Flame, ChefHat, Plus, Heart } from 'lucide-react';
import { Recipe } from '../types';
import { motion } from 'motion/react';
import React from 'react';

interface RecipeCardProps {
  recipe: Recipe;
  onAddToPlanner?: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, onAddToPlanner }: RecipeCardProps) {
  const [isLiked, setIsLiked] = React.useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all group"
    >
      <Link to={`/recipe/${recipe.id}`} className="block relative aspect-[4/3] overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <button 
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-sm ${isLiked ? 'bg-red-500 text-white' : 'bg-white/80 text-stone-400 hover:text-red-500'}`}
          >
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          </button>
          {recipe.readyInMinutes && (
            <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold text-stone-700 shadow-sm">
              <Clock size={12} className="text-emerald-500" />
              {recipe.readyInMinutes}m
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/recipe/${recipe.id}`}>
          <h3 className="font-bold text-stone-800 line-clamp-2 mb-3 group-hover:text-emerald-600 transition-colors h-12">
            {recipe.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-4 text-stone-500">
            <div className="flex items-center gap-1">
              <Flame size={14} className="text-orange-500" />
              <span className="text-xs font-medium">{recipe.calories || 350} kcal</span>
            </div>
            <div className="flex items-center gap-1">
              <ChefHat size={14} className="text-emerald-500" />
              <span className="text-xs font-medium">{recipe.difficulty || 'Medium'}</span>
            </div>
          </div>
          
          {onAddToPlanner && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToPlanner(recipe);
              }}
              className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
            >
              <Plus size={18} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
