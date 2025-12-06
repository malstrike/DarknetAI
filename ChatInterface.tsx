import React, { useState, useEffect, useRef } from 'react';
import { generateAIResponse, generateImageResponse } from '../services/geminiService';
import { spendCoins } from '../services/authService';
import { ChatMessage, User, AiMode } from '../types';
import { Send, Bot, User as UserIcon, Loader2, RefreshCw, Zap, Shield, Sparkles, Skull, AlertTriangle, Image as ImageIcon, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInterfaceProps {
  user: User;
  onBalanceUpdate: (newBalance: number) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onBalanceUpdate }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `SYSTEM INITIALIZED. WELCOME, ${user.username.toUpperCase()}.
Current Protocol: STANDARD
Coin Balance: ${user.coins}
Select a mode below to begin.`,
      timestamp: Date.now()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [mode, setMode] = useState<AiMode>(AiMode.STANDARD);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Cost per message
  const getCost = (m: AiMode) => (m === AiMode.VISION ? 20 : 5);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const cost = getCost(mode);

    // Check Balance
    if (user.coins < cost) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'ERROR: INSUFFICIENT CRYPTOCOINS. PLEASE RECHARGE TO CONTINUE GENERATION.',
        timestamp: Date.now()
      }]);
      return;
    }

    // Deduct coins
    try {
      const updatedUser = spendCoins(user.id, cost);
      onBalanceUpdate(updatedUser.coins);
    } catch (err) {
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
      mode: mode
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      if (mode === AiMode.VISION) {
        // Image Generation
        const result = await generateImageResponse(userMsg.text);
        
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: result.text || "IMAGE GENERATED SUCCESSFULLY.",
          imageUrl: result.imageUrl,
          timestamp: Date.now(),
          mode: mode
        };
        setMessages(prev => [...prev, botMsg]);

      } else {
        // Text Generation
        // Format history
        const history = messages
          .filter(m => !m.text.includes('ERROR') && !m.imageUrl) // Exclude images from text history to prevent errors
          .map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          }));

        const aiText = await generateAIResponse(userMsg.text, history, mode);

        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: aiText,
          timestamp: Date.now(),
          mode: mode
        };

        setMessages(prev => [...prev, botMsg]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "SYSTEM ERROR: EXECUTION FAILED.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getModeIcon = (m: AiMode) => {
    switch (m) {
      case AiMode.CREATIVE: return <Sparkles size={14} />;
      case AiMode.UNRESTRICTED: return <Skull size={14} />;
      case AiMode.VISION: return <ImageIcon size={14} />;
      default: return <Shield size={14} />;
    }
  };

  const getModeColor = (m: AiMode) => {
    switch (m) {
      case AiMode.CREATIVE: return 'text-purple-400 border-purple-400 bg-purple-500/10 shadow-[0_0_15px_rgba(192,132,252,0.3)]';
      case AiMode.UNRESTRICTED: return 'text-red-500 border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
      case AiMode.VISION: return 'text-pink-400 border-pink-400 bg-pink-500/10 shadow-[0_0_15px_rgba(244,114,182,0.3)]';
      default: return 'text-primary border-primary bg-primary/10 shadow-[0_0_15px_var(--color-primary)]';
    }
  };

  const getModeLabel = (m: AiMode) => {
     switch (m) {
        case AiMode.CREATIVE: return "CREATIVE";
        case AiMode.UNRESTRICTED: return "UNRESTRICTED";
        case AiMode.VISION: return "IMAGE GEN";
        default: return "STANDARD";
     }
  }

  return (
    <div className="flex flex-col h-full relative font-sans overflow-hidden">
      
      {/* Mode Selector Header */}
      <div className="h-16 border-b border-primary/20 bg-surface/30 backdrop-blur-md flex items-center justify-between px-6 z-30 shrink-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {Object.values(AiMode).map((m) => (
            <motion.button
              key={m}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(m)}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-mono transition-all border whitespace-nowrap ${
                mode === m 
                  ? getModeColor(m) 
                  : 'border-slate-700 text-slate-500 hover:text-white hover:border-slate-500 bg-bg/50'
              }`}
            >
              {getModeIcon(m)}
              {getModeLabel(m)}
            </motion.button>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2 font-mono text-yellow-400 text-sm bg-yellow-400/10 px-3 py-1 rounded border border-yellow-400/30 shadow-[0_0_10px_rgba(250,204,21,0.2)]">
          <Zap size={14} className="fill-yellow-400" />
          <span>{user.coins.toLocaleString()} CC</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 z-10 scroll-smooth custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] md:max-w-[75%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 mt-1 rounded-sm flex items-center justify-center shrink-0 border shadow-lg ${
                  msg.role === 'user' 
                    ? 'bg-surface border-slate-600 text-slate-300' 
                    : getModeColor(msg.mode as AiMode || AiMode.STANDARD).replace(/shadow-\[.*?\]/g, '') // simplified border
                }`}>
                  {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                </div>

                {/* Bubble */}
                <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-sm border backdrop-blur-md relative group overflow-hidden shadow-xl ${
                    msg.role === 'user'
                      ? 'bg-surface/80 border-slate-600/50 text-white rounded-tr-none'
                      : 'bg-surface/60 border-primary/20 text-text rounded-tl-none'
                  }`}>
                    
                    {/* Corner Accent */}
                    <div className={`absolute top-0 w-3 h-3 border-t border-opacity-50 ${
                        msg.role === 'user' ? 'right-0 border-r border-white' : 'left-0 border-l border-primary'
                    }`} />

                    {/* Image Content */}
                    {msg.imageUrl && (
                        <div className="mb-3 rounded overflow-hidden border border-white/10 relative group-image">
                            <img src={msg.imageUrl} alt="Generated" className="max-w-full h-auto max-h-[400px] object-contain bg-black/50" />
                            <a 
                                href={msg.imageUrl} 
                                download={`screenhost_gen_${msg.id}.png`}
                                className="absolute top-2 right-2 p-2 bg-black/70 text-white rounded hover:bg-primary hover:text-black transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Download size={16} />
                            </a>
                        </div>
                    )}

                    {/* Text Content */}
                    {msg.text && (
                        <div className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'model' ? 'font-mono' : 'font-sans'}`}>
                        {msg.text}
                        </div>
                    )}
                    
                    {/* Metadata */}
                    <div className="flex justify-between items-center mt-2 opacity-40 text-[10px] font-mono select-none">
                      <span className="uppercase">{msg.mode}</span>
                      <span className="ml-4">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isThinking && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-3 text-primary p-4 border border-primary/20 bg-surface/30 rounded-sm backdrop-blur-sm">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-xs font-mono tracking-widest animate-pulse">
                {mode === AiMode.VISION ? 'SYNTHESIZING PIXELS...' : 'PROCESSING NEURAL REQUEST...'}
              </span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-primary/20 bg-bg/80 backdrop-blur-xl z-20 shrink-0 relative">
         {/* Decorative top line */}
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

        <div className="relative max-w-5xl mx-auto flex gap-4">
          <div className="flex-1 relative group">
            <div className={`absolute -inset-0.5 opacity-20 blur group-hover:opacity-40 transition duration-500 rounded-sm ${
                mode === AiMode.UNRESTRICTED ? 'bg-red-500' : mode === AiMode.VISION ? 'bg-pink-500' : 'bg-primary'
            }`}></div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                  mode === AiMode.UNRESTRICTED ? "ENTER ROOT COMMAND..." : 
                  mode === AiMode.VISION ? "DESCRIBE VISUAL OUTPUT..." :
                  mode === AiMode.CREATIVE ? "ENTER NARRATIVE PROMPT..." :
                  "Enter transmission..."
              }
              className={`relative w-full bg-bg/90 text-text p-4 pr-12 rounded-sm border focus:outline-none resize-none h-14 overflow-hidden font-mono text-sm shadow-inner transition-colors ${
                  mode === AiMode.UNRESTRICTED 
                  ? 'border-red-900 focus:border-red-500 placeholder-red-900/50' 
                  : mode === AiMode.VISION
                  ? 'border-pink-900 focus:border-pink-500 placeholder-pink-900/50'
                  : 'border-primary/30 focus:border-primary placeholder-slate-600'
              }`}
              disabled={isThinking}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className={`w-14 h-14 rounded-sm flex items-center justify-center transition-all shadow-lg ${
                mode === AiMode.UNRESTRICTED 
                ? 'bg-red-500 text-black hover:bg-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                : mode === AiMode.VISION
                ? 'bg-pink-500 text-black hover:bg-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.4)]'
                : 'bg-primary text-bg hover:bg-white hover:text-black shadow-[0_0_20px_var(--color-primary)]'
            }`}
          >
            {isThinking ? <Loader2 className="animate-spin" /> : <Send />}
          </motion.button>
        </div>
        <div className="flex justify-center gap-6 mt-3">
           <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 bg-surface/50 px-2 py-0.5 rounded border border-slate-800">
             <Zap size={10} className="text-yellow-500" /> COST: {getCost(mode)} CC
           </span>
           {mode === AiMode.UNRESTRICTED && (
               <span className="text-[10px] text-red-500 font-mono flex items-center gap-1 animate-pulse bg-red-900/10 px-2 py-0.5 rounded border border-red-900/30">
                 <AlertTriangle size={10} /> SAFETY PROTOCOLS: BYPASSED (SIM)
               </span>
           )}
        </div>
      </div>
    </div>
  );
};