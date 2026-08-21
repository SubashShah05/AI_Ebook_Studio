import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Lightbulb, FileText, PenTool, Edit3, Upload } from 'lucide-react';

const steps = [
  { icon: <Lightbulb size={24} className="text-violet-400" />, title: "1. Describe Your Idea", desc: "Share your topic, audience, and goals for your book." },
  { icon: <FileText size={24} className="text-violet-400" />, title: "2. Generate Outline", desc: "AI creates a detailed outline with chapters and synopsis." },
  { icon: <PenTool size={24} className="text-violet-400" />, title: "3. Generate Content", desc: "AI writes engaging content for each chapter." },
  { icon: <Edit3 size={24} className="text-violet-400" />, title: "4. Edit & Refine", desc: "Edit, polish, and enhance with AI suggestions." },
  { icon: <Upload size={24} className="text-violet-400" />, title: "5. Export & Publish", desc: "Export and share your ebook with the world." }
];

export default function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="how-it-works" className="py-24 bg-white dark:bg-[#0B0F19] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 flex flex-col items-center">
          <motion.div 
            variants={shouldReduceMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="inline-block px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700/50 text-violet-700 dark:text-violet-400 text-xs font-bold uppercase tracking-wider mb-6"
          >
            How It Works
          </motion.div>
          <motion.h2 
            variants={shouldReduceMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300"
          >
            Create Your Ebook in <span className="text-violet-600 dark:text-violet-400">5</span> Simple Steps
          </motion.h2>
        </div>

        <motion.div 
          className="flex flex-col lg:flex-row justify-between items-center relative gap-8 lg:gap-2"
          variants={shouldReduceMotion ? {} : staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <motion.div 
                variants={shouldReduceMotion ? {} : fadeUp}
                className="flex flex-col items-center text-center w-full lg:w-48 group"
              >
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-[#0f1523] border border-violet-200 dark:border-violet-500/30 flex items-center justify-center mb-6 shadow-sm dark:shadow-[0_0_15px_rgba(124,58,237,0.15)] group-hover:border-violet-400 group-hover:shadow-md dark:group-hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all duration-300">
                  {step.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-300">
                  {step.desc}
                </p>
              </motion.div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block w-8 h-px bg-slate-200 dark:bg-slate-700 relative shrink-0 transition-colors duration-300">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 border-t border-r border-slate-300 dark:border-slate-500 rotate-45 transition-colors duration-300"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
