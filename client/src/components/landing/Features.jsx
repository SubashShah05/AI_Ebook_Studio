import React from 'react';
import { motion } from 'framer-motion';
import { Bot, FileText, PenTool, Layout, ArrowRightLeft, Download, LayoutTemplate, History } from 'lucide-react';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const features = [
  {
    icon: <Bot className="text-violet-400" size={20} />,
    title: "AI Book Generator",
    description: "Instantly generate complete drafts from a simple prompt or topic."
  },
  {
    icon: <FileText className="text-violet-400" size={20} />,
    title: "Smart Outline Builder",
    description: "Let AI structure your book logically before you start writing."
  },
  {
    icon: <PenTool className="text-violet-400" size={20} />,
    title: "AI Writing Assistant",
    description: "Expand, rewrite, or summarize existing text directly in the editor."
  },
  {
    icon: <Layout className="text-violet-400" size={20} />,
    title: "Rich Markdown Editor",
    description: "Live preview, real-time editing, and beautiful formatting."
  },
  {
    icon: <ArrowRightLeft className="text-violet-400" size={20} />,
    title: "Export Options",
    description: "Export your books as PDF, Markdown, or Word files."
  },
  {
    icon: <LayoutTemplate className="text-violet-400" size={20} />,
    title: "Templates Library",
    description: "Professionally designed templates for any book type."
  },
  {
    icon: <History className="text-violet-400" size={20} />,
    title: "Analytics Dashboard",
    description: "Track your progress, words, and engagement insights."
  },
  {
    icon: <History className="text-violet-400" size={20} />,
    title: "Secure & Private",
    description: "Your data is encrypted and 100% private. Always."
  }
];

export default function Features() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="features" className="py-24 bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
          <motion.div 
            variants={shouldReduceMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="inline-block px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700/50 text-violet-700 dark:text-violet-400 text-xs font-bold uppercase tracking-wider mb-6"
          >
            Powerful Features
          </motion.div>
          <motion.h2 
            variants={shouldReduceMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight transition-colors duration-300"
          >
            Everything You Need to Create <br/> Exceptional Ebooks
          </motion.h2>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={shouldReduceMotion ? {} : staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={shouldReduceMotion ? {} : fadeUp}
              className="bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 hover:border-violet-500/50 dark:hover:border-violet-500/50 transition-colors duration-300 group flex items-start gap-4 shadow-sm dark:shadow-none"
            >
              <div className="w-10 h-10 bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 rounded-lg flex items-center justify-center shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            Explore All Features
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
