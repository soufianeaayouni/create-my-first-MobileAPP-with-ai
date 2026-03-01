import React from 'react';
import { Search as SearchIcon, Package, ExternalLink } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';

export default function Products() {
  const [search, setSearch] = React.useState('');
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!search.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/spoon/products/search?query=${encodeURIComponent(search)}&number=12`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Unexpected API response:', data);
        setProducts([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Search Products</h1>
          <p className="text-stone-500 font-medium">Find information about packaged food products.</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative flex-1 max-w-xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for products (e.g. Greek yogurt, organic pasta)..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-100"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-stone-100 rounded-3xl aspect-square" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all group p-4 flex flex-col"
            >
              <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-stone-50">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="font-bold text-stone-800 line-clamp-2 mb-4 flex-1">
                {product.title}
              </h3>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">ID: {product.id}</span>
                <button className="p-2 bg-stone-50 text-stone-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-500 transition-all">
                  <ExternalLink size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : search ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-stone-200 border-dashed">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400">
            <SearchIcon size={40} />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">No products found</h3>
          <p className="text-stone-500 max-w-xs mx-auto">
            Try searching for something else.
          </p>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-stone-200 border-dashed">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
            <Package size={40} />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Find packaged products</h3>
          <p className="text-stone-500 max-w-xs mx-auto">
            Search for your favorite packaged food products to see details.
          </p>
        </div>
      )}
    </div>
  );
}
