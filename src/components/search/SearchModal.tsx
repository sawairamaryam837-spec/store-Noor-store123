import React, { useState } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
  onSearchSubmit: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onSearchSubmit,
}) => {
  const { products } = useStore();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const matches = query.trim()
    ? products
        .filter((p) => {
          const q = query.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.fabric.toLowerCase().includes(q)
          );
        })
        .slice(0, 5)
    : [];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearchSubmit(query.trim());
      onClose();
    }
  };

  const trendingTags = ['Chiffon', 'Lawn 3-Piece', 'Velvet Shawl', 'Peshwas', 'Chikankari', 'Black Kurti'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#EADBCE] relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleFormSubmit} className="relative mt-2">
          <Search className="w-5 h-5 text-[#B88E3E] absolute left-4 top-3.5" />
          <input
            type="text"
            autoFocus
            placeholder="Search by fabric, style, or collection (e.g. Velvet, Organza)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 rounded-xl border border-[#D9CCC2] text-sm focus:outline-none focus:border-[#B88E3E] shadow-inner"
          />
        </form>

        {/* Quick Trending Tags */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#8C827A] flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#E89A97]" />
            Trending:
          </span>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setQuery(tag);
                onSearchSubmit(tag);
                onClose();
              }}
              className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EADBCE] text-[11px] text-[#4A423D] hover:border-[#B88E3E] hover:text-[#B88E3E] transition"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Live Search Results */}
        {matches.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[#EADBCE] space-y-3">
            <span className="text-xs uppercase font-bold text-[#8C827A] tracking-wider block">
              Matching Ensembles ({matches.length})
            </span>
            <div className="space-y-2">
              {matches.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    onSelectProduct(prod);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl border border-[#EADBCE] hover:border-[#B88E3E] bg-[#FAF8F5] flex items-center gap-3 cursor-pointer transition"
                >
                  <img
                    src={prod.colors[0]?.images[0] || '/assets/aistudio/weddingseason__3__6ca9845d.jpeg'}
                    alt={prod.name}
                    className="w-12 h-14 object-cover object-top rounded-lg border border-[#EADBCE]"
                  />
                  <div className="flex-1">
                    <p className="font-serif font-bold text-xs text-[#1F1C1A]">{prod.name}</p>
                    <p className="text-[11px] text-[#7A7169]">{prod.category} • {prod.fabric}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#B88E3E]">
                      Rs. {(prod.salePrice || prod.regularPrice).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
