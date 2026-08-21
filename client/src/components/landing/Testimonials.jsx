import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const testimonials = [
  {
    quote: "AI Ebook Studio helped me write my first book in just 2 weeks. The AI assistant is incredible!",
    author: "Sarah Johnson",
    role: "Author & Blogger",
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    quote: "The best AI writing platform I've used. The outlines are spot-on and save me so much time.",
    author: "Michael Chen",
    role: "Entrepreneur",
    avatar: "https://i.pravatar.cc/150?img=11"
  },
  {
    quote: "I love the clean interface and how easy it is to export my books. Highly recommended!",
    author: "Emily Rodriguez",
    role: "Content Creator",
    avatar: "https://i.pravatar.cc/150?img=5"
  }
];

export default function Testimonials() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-24 bg-white dark:bg-[#0B0F19] relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div 
            variants={shouldReduceMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="inline-block px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700/50 text-violet-700 dark:text-violet-400 text-xs font-bold uppercase tracking-wider mb-6"
          >
            Loved By Creators
          </motion.div>
          <motion.h2 
            variants={shouldReduceMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white transition-colors duration-300"
          >
            What Our Users Say
          </motion.h2>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={shouldReduceMotion ? {} : staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              variants={shouldReduceMotion ? {} : fadeUp}
              className="bg-slate-50 dark:bg-[#0f1523] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col relative transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-[0_10px_30px_rgba(124,58,237,0.1)] hover:border-violet-300 dark:hover:border-violet-700/50 cursor-pointer"
            >

              <p className="text-slate-700 dark:text-slate-300 relative z-10 flex-1 mb-8 text-sm leading-relaxed transition-colors duration-300">
                {testimonial.quote}
              </p>
              
              <div className="flex items-center gap-4 mt-auto relative z-10">
                <img 
                  src={testimonial.avatar}
                  alt={testimonial.author} 
                  className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 transition-colors duration-300"
                />
                <div>
                  <h4 className="text-slate-900 dark:text-white font-semibold text-sm transition-colors duration-300">{testimonial.author}</h4>
                  <p className="text-slate-500 text-xs">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
