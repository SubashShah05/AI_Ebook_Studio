import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Book, Menu, Edit, Star, Sparkles, LogOut, ChevronDown, Plus } from 'lucide-react';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function ProductPreview() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="product-preview" className="py-24 bg-slate-50 dark:bg-[#0B0F19] overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Mockup */}
          <motion.div 
            variants={shouldReduceMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="w-full lg:w-[60%] relative"
          >
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-violet-600/10 blur-3xl rounded-[2rem] -z-10" />
            
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#0f1523] shadow-2xl overflow-hidden relative h-[450px] flex">
              
              {/* Sidebar */}
              <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F19]/50 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <div className="bg-violet-600 p-1.5 rounded-md text-white">
                    <Book size={16} />
                  </div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Book</span>
                </div>
                
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Chapters</span>
                    <ChevronDown size={14} className="text-slate-500" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="px-3 py-2 bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded text-xs border border-violet-200 dark:border-violet-500/20 flex items-center gap-2">
                      <span className="text-[10px] bg-violet-200 dark:bg-violet-500/30 px-1.5 py-0.5 rounded text-violet-800 dark:text-violet-200">01</span> Introduction
                    </div>
                    {[
                      "The Evolution of AI",
                      "Machine Learning Basics",
                      "Deep Learning",
                      "Natural Language Processing",
                      "Computer Vision",
                      "Robotics and Automation"
                    ].map((title, i) => (
                      <div key={i} className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded text-xs flex items-center gap-2 cursor-pointer transition-colors">
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">0{i+2}</span> {title}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Plus size={14} /> Add Chapter
                  </div>
                </div>
              </div>
              
              {/* Editor Area */}
              <div className="flex-1 flex flex-col bg-white dark:bg-[#0f1523]">
                {/* Header */}
                <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-slate-50/80 dark:bg-[#0B0F19]/80 backdrop-blur-sm">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    The Future of AI / <span className="text-slate-400 dark:text-slate-500">Chapter 1</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-transparent">
                      <Sparkles size={14} className="text-violet-500 dark:text-violet-400" /> AI Assistant
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-md">
                      <LogOut size={14} className="rotate-180" /> Export
                    </button>
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border border-slate-300 dark:border-slate-600">
                      <span className="text-xs text-slate-700 dark:text-slate-300">JS</span>
                    </div>
                  </div>
                </div>
                
                {/* Editor Content */}
                <div className="flex-1 p-8 overflow-hidden relative">
                  <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div className="text-xs font-medium text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400 pb-2">Editor</div>
                    <div className="text-xs font-medium text-slate-500 pb-2 cursor-pointer hover:text-slate-700 dark:hover:text-slate-400">Preview</div>
                  </div>
                  
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6"># Introduction</h1>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    Artificial Intelligence is transforming the world we live in. From simple automation to complex decision-making systems, AI is at the heart of modern innovation.
                  </p>
                  
                  <div className="w-full h-40 rounded-xl bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center border border-slate-200 dark:border-slate-700/50 mb-6 opacity-90 dark:opacity-80 dark:mix-blend-luminosity"></div>
                  
                  {/* Status Bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#0f1523] text-[10px] text-slate-500">
                    <div>Words: 382 | Characters: 2,451</div>
                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Saved</div>
                  </div>
                </div>
              </div>
              
            </div>
          </motion.div>

          {/* Right Text Content */}
          <motion.div 
            className="w-full lg:w-[40%]"
            variants={shouldReduceMotion ? {} : staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={shouldReduceMotion ? {} : fadeUp} className="mb-6">
              <div className="inline-block px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700/50 text-violet-700 dark:text-violet-400 text-[10px] font-bold uppercase tracking-wider">
                Built For Creators
              </div>
            </motion.div>
            
            <motion.h2 
              variants={shouldReduceMotion ? {} : fadeUp}
              className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight transition-colors duration-300"
            >
              A Beautiful, Distraction-Free Writing Experience
            </motion.h2>
            
            <motion.p 
              variants={shouldReduceMotion ? {} : fadeUp}
              className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed transition-colors duration-300"
            >
              Focus on what matters — your ideas. Our clean editor, AI tools, and smart suggestions help you write better, faster, and with more confidence.
            </motion.p>
            
            <motion.div variants={shouldReduceMotion ? {} : staggerContainer} className="space-y-4">
              {[
                "Live Markdown Preview",
                "AI Suggestions & Improvements",
                "Auto-save & Version History",
                "Export to PDF, MD, or Word"
              ].map((feature, i) => (
                <motion.div key={i} variants={shouldReduceMotion ? {} : fadeUp} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center border border-violet-200 dark:border-violet-500/50">
                    <CheckCircle2 size={12} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors duration-300">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
