import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Command, Sparkles, MessageSquare, Zap, Terminal } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

const JerryIcon = () => (
    <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-tr from-green-core to-emerald-400 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-green-core to-green-deep border-4 border-white/10 flex items-center justify-center shadow-glow overflow-hidden transform group-hover:scale-110 transition-transform">
            <Bot size={22} className="text-black-spore" fill="currentColor" strokeWidth={1.5} />
            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full border-2 border-green-core animate-ping shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        </div>
    </div>
);

const UserIcon = () => (
    <div className="w-10 h-10 rounded-full bg-black-spore border-2 border-green-core/30 flex items-center justify-center shadow-card overflow-hidden">
        <User size={20} className="text-green-core" />
    </div>
);

const MessageBubble = ({ message, isLast }) => {
    const isJerry = message.role !== 'user';
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`flex w-full mb-8 group ${isJerry ? 'justify-start' : 'justify-end'}`}
        >
            <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${isJerry ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="flex-shrink-0 mt-1">
                    {isJerry ? <JerryIcon /> : <UserIcon />}
                </div>
                
                <div className={`flex flex-col ${isJerry ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                        <span className={`text-[11px] font-black uppercase tracking-[0.1em] ${isJerry ? 'text-green-core' : 'text-text-muted'}`}>
                            {isJerry ? 'Jerry (AI Core)' : 'You'}
                        </span>
                        {isJerry && <Sparkles size={10} className="text-green-core animate-pulse" />}
                    </div>
                    
                    <div className={`relative px-5 py-4 rounded-[22px] shadow-card transition-all duration-300 border backdrop-blur-md
                        ${isJerry 
                            ? 'bg-bg-glass border-green-core/20 rounded-tl-none text-text-primary group-hover:border-green-core/40' 
                            : 'bg-green-core/15 border-green-core/30 rounded-tr-none text-text-primary group-hover:bg-green-core/20'
                        }`}
                    >
                        <div className="markdown-content text-[15px] leading-relaxed font-body">
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                                    code: ({node, inline, ...props}) => (
                                        inline 
                                            ? <code className="bg-black-spore/5 px-1.5 py-0.5 rounded text-green-deep font-bold" {...props} />
                                            : <div className="my-4 overflow-x-auto rounded-xl border border-green-core/10"><code className="block bg-black-ink p-4 text-emerald-100 font-mono text-sm leading-6" {...props} /></div>
                                    ),
                                    strong: ({node, ...props}) => <strong className="font-black text-green-deep" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-4 space-y-1.5" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-4 space-y-1.5" {...props} />,
                                    li: ({node, ...props}) => <li className="text-text-secondary" {...props} />,
                                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-green-core/30 pl-4 py-1 italic text-text-muted my-4" {...props} />
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                        
                        {!isJerry && (
                            <div className="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-1.5 h-1.5 bg-green-core rounded-full shadow-glow" />
                            </div>
                        )}
                    </div>
                    
                    <span className="text-[10px] text-text-muted mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default function ChatScreen() {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    
    const { messages, isTyping, sendChatMessage, loadChatHistory } = useAppStore();

    useEffect(() => {
        loadChatHistory();
        inputRef.current?.focus();
    }, [loadChatHistory]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;
        sendChatMessage(input);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full bg-bg-primary relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-green-core/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] animate-blob" />
            </div>



            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-2 scroll-smooth">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20 px-10">
                        <Terminal size={48} className="text-green-core mb-6 animate-bounce" />
                        <h3 className="text-xl font-display font-black text-text-primary mb-2">Initialize Core-1 Chat</h3>
                        <p className="text-sm max-w-xs text-text-secondary leading-relaxed">
                            Start a logic thread with Jerry. He's ready to optimize your productivity.
                        </p>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto py-6">
                        <AnimatePresence mode="popLayout">
                            {messages.map((msg, index) => (
                                <MessageBubble key={msg.id || index} message={msg} isLast={index === messages.length - 1} />
                            ))}
                        </AnimatePresence>
                        
                        {isTyping && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex gap-4 items-center mb-8"
                            >
                                <JerryIcon />
                                <div className="px-5 py-6 bg-bg-glass backdrop-blur-md rounded-2xl border border-green-core/20 shadow-card flex gap-1.5 items-center">
                                    <span className="w-1.5 h-1.5 bg-green-core rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-green-core rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-green-core rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-bg-primary/80 backdrop-blur-2xl border-t border-green-core/10 shrink-0 relative">
                <div className="absolute -top-1 px-4 left-1/2 -translate-x-1/2">
                    <div className="bg-bg-primary border border-green-core/10 text-[9px] font-black uppercase text-text-muted px-3 py-1 rounded-full whitespace-nowrap tracking-widest shadow-sm">
                        Securing Neural Connection
                    </div>
                </div>
                
                <form 
                    onSubmit={handleSend} 
                    className="max-w-4xl mx-auto relative group"
                >
                    <div className="absolute inset-0 bg-green-core/5 rounded-[22px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative flex items-center bg-bg-glass backdrop-blur-md rounded-[22px] border border-green-core/20 shadow-card focus-within:border-green-core/50 transition-all duration-300">
                        <div className="pl-5 pr-2 py-4">
                            <Command className="text-green-core/40 group-focus-within:text-green-core transition-colors" size={20} />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isTyping ? "Jerry is thinking..." : "Sync your thoughts with Jerry..."}
                            disabled={isTyping}
                            className="flex-1 bg-transparent py-5 px-3 outline-none text-text-primary placeholder:text-text-muted font-medium text-base disabled:opacity-50"
                        />
                        <div className="px-3">
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="p-3 bg-gradient-to-tr from-green-core to-emerald-400 text-black-spore font-black rounded-xl shadow-glow hover:translate-y-[-2px] hover:shadow-[0_8px_20px_rgba(76,221,30,0.4)] active:scale-95 transition-all duration-200 disabled:opacity-20 disabled:translate-y-0 disabled:shadow-none flex items-center gap-2 group/btn"
                            >
                                <Send size={20} className="group-hover:rotate-12 transition-transform" />
                            </button>
                        </div>
                    </div>
                    <div className="m-3 flex justify-center gap-6">
                        <p className="text-[10px] text-text-muted font-bold tracking-tighter uppercase flex items-center gap-1.5 group-hover:text-green-core/60 transition-colors">
                            <span className="w-1 h-1 rounded-full bg-green-core" />
                            LLM Model: Jerry-Neural-1
                        </p>
                        <p className="text-[10px] text-text-muted font-bold tracking-tighter uppercase flex items-center gap-1.5 group-hover:text-green-core/60 transition-colors">
                            <span className="w-1 h-1 rounded-full bg-green-core animate-pulse" />
                            Context Window: 4096
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

