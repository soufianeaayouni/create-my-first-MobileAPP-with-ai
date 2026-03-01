import React from 'react';
import { Send, Bot, User, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function AIChat() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is not configured.');
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: "You are a helpful cooking assistant. Help the user with recipes, cooking tips, and meal planning." }] },
          ...messages,
          userMessage
        ],
      });
      
      const aiMessage: Message = { role: 'model', parts: [{ text: response.text || 'Sorry, I couldn\'t generate a response.' }] };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = { role: 'model', parts: [{ text: 'Sorry, I encountered an error. Please try again.' }] };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Chef Assistant</h1>
            <p className="text-sm text-stone-500">Ask me anything about cooking!</p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([])}
          className="p-3 text-stone-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-y-auto p-6 md:p-8 space-y-6 mb-6"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center text-stone-200">
              <Bot size={48} />
            </div>
            <div className="max-w-xs space-y-2">
              <h3 className="text-xl font-bold text-stone-800">How can I help you today?</h3>
              <p className="text-stone-500">Try asking for a recipe, a substitute for an ingredient, or cooking tips.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
              {[
                "What can I cook with chicken and spinach?",
                "Substitute for heavy cream?",
                "How to cook the perfect steak?",
                "Give me a 5-minute breakfast idea"
              ].map(q => (
                <button 
                  key={q}
                  onClick={() => setInput(q)}
                  className="p-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-medium text-stone-600 hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-600 transition-all text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                msg.role === 'user' ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"
              )}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={cn(
                "max-w-[80%] p-5 rounded-3xl text-lg leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-emerald-50 text-emerald-900 rounded-tr-none" 
                  : "bg-stone-50 text-stone-800 rounded-tl-none border border-stone-100"
              )}>
                {msg.parts[0].text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Bot size={20} />
            </div>
            <div className="bg-stone-50 p-5 rounded-3xl rounded-tl-none border border-stone-100 flex items-center gap-2">
              <Loader2 size={20} className="animate-spin text-orange-500" />
              <span className="text-stone-400 font-medium">Chef is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="w-full pl-6 pr-16 py-5 bg-white border border-stone-200 rounded-3xl shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-lg"
        />
        <button 
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
