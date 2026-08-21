import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp } from '../../animations/motionVariants';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function FinalCTA() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-24 bg-slate-50 dark:bg-[#0B0F19] relative overflow-hidden transition-colors duration-300">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-violet-600/10 dark:bg-violet-600/20 rounded-full blur-[100px] -z-10 transition-colors duration-300" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div 
          variants={shouldReduceMotion ? {} : fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight transition-colors duration-300">
            Ready to Write Your <br />
            Next Bestseller?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto transition-colors duration-300">
            Join thousands of creators using AI Ebook Studio to plan, write, and publish faster than ever before.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/signup"
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-3.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] dark:shadow-[0_0_20px_rgba(124,58,237,0.4)]"
            >
              Start Creating Free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
