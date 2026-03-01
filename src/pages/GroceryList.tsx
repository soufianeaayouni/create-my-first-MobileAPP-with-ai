import React from 'react';
import { ShoppingCart, Trash2, Plus, CheckCircle2, Circle, Share2, Printer, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GroceryItem {
  id: number;
  name: string;
  checked: boolean;
  category: string;
}

export default function GroceryList() {
  const [items, setItems] = React.useState<GroceryItem[]>(() => {
    try {
      const saved = localStorage.getItem('grocery-list');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse grocery-list from localStorage', e);
      return [];
    }
  });
  const [newItem, setNewItem] = React.useState('');

  React.useEffect(() => {
    localStorage.setItem('grocery-list', JSON.stringify(items));
  }, [items]);

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const item: GroceryItem = {
      id: Math.random(),
      name: newItem,
      checked: false,
      category: 'Other'
    };
    setItems([item, ...items]);
    setNewItem('');
  };

  const toggleItem = (id: number) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    setItems(items.filter(item => !item.checked));
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear your entire grocery list?')) {
      setItems([]);
      localStorage.removeItem('grocery-list');
    }
  };

  const categories = Array.from(new Set(items.map(item => item.category)));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Grocery List</h1>
          <p className="text-stone-500">Everything you need for your next meal.</p>
        </div>
        <div className="flex gap-2">
          <button className="p-3 bg-white border border-stone-200 text-stone-600 rounded-2xl hover:bg-stone-50 transition-all shadow-sm">
            <Share2 size={20} />
          </button>
          <button className="p-3 bg-white border border-stone-200 text-stone-600 rounded-2xl hover:bg-stone-50 transition-all shadow-sm">
            <Printer size={20} />
          </button>
        </div>
      </div>

      <form onSubmit={addItem} className="relative">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add something to your list..."
          className="w-full pl-6 pr-16 py-5 bg-white border border-stone-200 rounded-3xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-lg"
        />
        <button 
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-200"
        >
          <Plus size={24} />
        </button>
      </form>

      <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <ShoppingCart className="text-emerald-500" size={24} />
            <span className="font-bold text-stone-800">{items.length} Items</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={clearCompleted}
              className="text-sm font-bold text-stone-400 hover:text-emerald-600 transition-colors"
            >
              Clear Completed
            </button>
            <button 
              onClick={clearAll}
              className="text-sm font-bold text-stone-400 hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-10">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-200">
                <ShoppingCart size={40} />
              </div>
              <p className="text-stone-400 font-medium">Your list is empty.</p>
            </div>
          ) : (
            categories.map(cat => (
              <div key={cat} className="space-y-4">
                <h3 className="text-xs font-black text-stone-300 uppercase tracking-[0.2em] px-2">{cat}</h3>
                <div className="space-y-2">
                  <AnimatePresence>
                    {items.filter(i => i.category === cat).map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl transition-all group",
                          item.checked ? "bg-stone-50 opacity-60" : "bg-white hover:bg-emerald-50/50"
                        )}
                      >
                        <button 
                          onClick={() => toggleItem(item.id)}
                          className="flex items-center gap-4 flex-1 text-left"
                        >
                          {item.checked ? (
                            <CheckCircle2 className="text-emerald-500" size={24} />
                          ) : (
                            <Circle className="text-stone-200 group-hover:text-emerald-300" size={24} />
                          )}
                          <span className={cn(
                            "text-lg font-medium transition-all",
                            item.checked ? "text-stone-400 line-through" : "text-stone-700"
                          )}>
                            {item.name}
                          </span>
                        </button>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-stone-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={20} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
