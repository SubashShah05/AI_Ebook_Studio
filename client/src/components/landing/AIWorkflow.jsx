import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function AIWorkflow() {
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    { text: "User Idea", highlight: false },
    { text: "AI Outline", highlight: true },
    { text: "Chapter Generation", highlight: true },
    { text: "AI Refinement", highlight: true },
    { text: "Finished Ebook", highlight: false },
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={shouldReduceMotion ? {} : fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-6">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12">
            The Magic of AI Workflow
          </h2>
        </motion.div>

        <motion.div 
          className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2 max-w-4xl mx-auto"
          variants={shouldReduceMotion ? {} : staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <motion.div 
                variants={shouldReduceMotion ? {} : fadeUp}
                className={`px-6 py-4 rounded-xl border font-medium whitespace-nowrap transition-colors ${
                  step.highlight 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {step.text}
              </motion.div>
              {index < steps.length - 1 && (
                <motion.div variants={shouldReduceMotion ? {} : fadeUp} className="text-slate-300 dark:text-slate-600 rotate-90 md:rotate-0">
                  <ArrowRight size={24} />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
