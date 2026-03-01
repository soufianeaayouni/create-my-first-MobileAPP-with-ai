import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Calendar, ShoppingCart, MessageSquare, Menu, X, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Recipes', path: '/recipes' },
  { icon: Calendar, label: 'Planner', path: '/planner' },
  { icon: ShoppingCart, label: 'Groceries', path: '/grocery' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-stone-200 sticky top-0 h-screen p-6">
        <div className="flex items-center gap-2 mb-10">
          <span className="text-2xl font-black tracking-tighter lowercase">allrecipy</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                location.pathname === item.path 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" 
                  : "hover:bg-emerald-50 text-stone-600 hover:text-emerald-600"
              )}
            >
              <item.icon size={20} className={cn(
                "transition-transform duration-200 group-hover:scale-110",
                location.pathname === item.path ? "text-white" : "text-stone-400 group-hover:text-emerald-500"
              )} />
              <span className="font-bold">{item.label}</span>
            </Link>
          ))}
          <Link
            to="/chat"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              location.pathname === '/chat' 
                ? "bg-orange-500 text-white shadow-lg shadow-orange-200" 
                : "hover:bg-orange-50 text-stone-600 hover:text-orange-600"
            )}
          >
            <MessageSquare size={20} />
            <span className="font-bold">AI Chef</span>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-stone-100">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
            <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-1">Pro Tip</p>
            <p className="text-sm text-stone-600 leading-relaxed font-medium">
              Try "Cook Mode" for a distraction-free experience!
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between relative">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg z-10"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-black text-xl tracking-tighter lowercase">allrecipy</span>
          </div>

          {/* Spacer to keep title centered */}
          <div className="w-10" />
        </div>

        <div className="px-4 pb-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Quick find: tags, recipes & more"
              className="w-full pl-10 pr-4 py-2.5 bg-stone-100 border-none rounded-xl text-sm placeholder:text-stone-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = (e.target as HTMLInputElement).value;
                  window.location.href = `/recipes?q=${encodeURIComponent(query)}`;
                }
              }}
            />
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 md:hidden p-6 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-10">
                <span className="text-2xl font-black tracking-tighter lowercase">allrecipy</span>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-4 rounded-xl transition-all",
                      location.pathname === item.path 
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" 
                        : "text-stone-600 font-bold"
                    )}
                  >
                    <item.icon size={20} />
                    <span className="text-lg">{item.label}</span>
                  </Link>
                ))}
                <Link
                  to="/chat"
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-4 rounded-xl transition-all",
                    location.pathname === '/chat' 
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-200" 
                      : "text-stone-600 font-bold"
                  )}
                >
                  <MessageSquare size={20} />
                  <span className="text-lg">AI Chef</span>
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-stone-100 px-6 py-4 flex justify-between items-center z-40">
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            location.pathname === '/' ? "text-emerald-500" : "text-stone-300"
          )}
        >
          <Home size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
        </Link>
        <Link
          to="/recipes"
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            location.pathname === '/recipes' ? "text-emerald-500" : "text-stone-300"
          )}
        >
          <Search size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Recipes</span>
        </Link>
        
        <Link
          to="/chat"
          className="w-14 h-14 bg-stone-900 text-white rounded-full flex items-center justify-center shadow-xl shadow-stone-200 transition-all -mt-12 border-4 border-white"
        >
          <Plus size={28} />
        </Link>

        <Link
          to="/planner"
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            location.pathname === '/planner' ? "text-emerald-500" : "text-stone-300"
          )}
        >
          <Calendar size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Planner</span>
        </Link>
        <Link
          to="/grocery"
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            location.pathname === '/grocery' ? "text-emerald-500" : "text-stone-300"
          )}
        >
          <ShoppingCart size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Groceries</span>
        </Link>
      </nav>
    </div>
  );
}
