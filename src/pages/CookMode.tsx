import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Timer, Volume2, CheckCircle2 } from 'lucide-react';
import { Recipe, Step } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function CookMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = React.useState<Recipe | null>(null);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

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

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!recipe) return <div>Recipe not found</div>;

  const steps = recipe.analyzedInstructions?.[0]?.steps || [];
  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <div>
            <h1 className="font-bold text-stone-900 line-clamp-1">{recipe.title}</h1>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-stone-100 text-stone-600 rounded-2xl hover:bg-stone-200 transition-colors">
            <Volume2 size={20} />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 bg-stone-100 w-full">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-emerald-500"
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12 text-center"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl font-black text-4xl mb-4">
                {currentStep + 1}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-stone-900 leading-tight">
                {step.step}
              </h2>
            </div>

            {/* Ingredients for this step */}
            {step.ingredients.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3">
                {step.ingredients.map((ing, i) => (
                  <span key={i} className="px-4 py-2 bg-stone-100 text-stone-600 rounded-xl font-bold text-sm">
                    {ing.name}
                  </span>
                ))}
              </div>
            )}

            {/* Timer if available */}
            {step.length && (
              <div className="flex items-center justify-center gap-3 p-6 bg-orange-50 border border-orange-100 rounded-[2rem] text-orange-600 max-w-xs mx-auto">
                <Timer size={32} />
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70">Step Timer</p>
                  <p className="text-2xl font-black">{step.length.number} {step.length.unit}</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Controls */}
      <footer className="p-6 md:p-10 border-t border-stone-100 bg-stone-50/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="flex-1 py-5 bg-white border border-stone-200 text-stone-600 rounded-3xl font-bold hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft size={24} />
            Previous
          </button>
          
          {currentStep === steps.length - 1 ? (
            <button
              onClick={() => navigate('/')}
              className="flex-[2] py-5 bg-emerald-500 text-white rounded-3xl font-bold hover:bg-emerald-400 shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={24} />
              Finish Cooking
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="flex-[2] py-5 bg-stone-900 text-white rounded-3xl font-bold hover:bg-stone-800 shadow-xl shadow-stone-200 transition-all flex items-center justify-center gap-2"
            >
              Next Step
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
