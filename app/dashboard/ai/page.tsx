'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui';
import { LoadingDots } from '@/src/components/animations/loading-states';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  'How do I transfer money?',
  'What are the current exchange rates?',
  'How can I increase my daily limit?',
  'What does KYC verification involve?',
  'How do I set up 2FA?',
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m Cherokee Bank\'s AI Assistant. I can help you with account management, transactions, crypto exchange, and more. What can I assist you with today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'m processing your request. In a production environment, this would connect to our AI backend. ' + text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <motion.div
      className="space-y-6 flex flex-col h-[calc(100vh-200px)]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white">AI Assistant</h1>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-accent/20 text-brand-accent">GPT-4</span>
        </div>
        <p className="text-white/60">Your intelligent banking companion, available 24/7</p>
      </motion.div>

      {/* Chat Container */}
      <motion.div variants={itemVariants} className="flex-1 flex flex-col gap-4">
        {messages.length === 1 ? (
          // Suggested questions
          <div className="flex-1 flex items-center justify-center">
            <div className="space-y-4 max-w-xl w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-brand-accent/20 flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-3xl text-brand-accent">smart_toy</span>
                </div>
                <p className="text-white/60">Try asking me anything about your account</p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {suggestedQuestions.map((question, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSendMessage(question)}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left flex items-center justify-between group"
                  >
                    <span className="text-white text-sm">{question}</span>
                    <span className="material-icons text-white/40 group-hover:text-white/60 transition-colors">arrow_forward</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Chat messages
          <Card className="cherokee-card border-white/5 flex-1 flex flex-col p-6">
            <div className="flex-1 overflow-y-auto space-y-4 pr-4 mb-4">
              {messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="material-icons text-brand-accent text-sm">smart_toy</span>
                    </div>
                  )}
                  <div
                    className={`max-w-xs px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-brand-accent/30 text-white'
                        : 'bg-white/5 text-white/90 border border-white/10'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-60">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="material-icons text-brand-accent text-sm">smart_toy</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                    <LoadingDots />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </Card>
        )}
      </motion.div>

      {/* Input Area */}
      <motion.div variants={itemVariants} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask me anything..."
          className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent/50 transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || isLoading}
          className="px-6 py-3 rounded-lg bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
        >
          <span className="material-icons">send</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
