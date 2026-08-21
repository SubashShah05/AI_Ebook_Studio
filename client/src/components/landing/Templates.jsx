import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, Code, GraduationCap, Briefcase, Heart, Megaphone } from 'lucide-react';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const templates = [
  { name: "Technical", icon: <Code size={20} />, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { name: "Educational", icon: <GraduationCap size={20} />, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { name: "Business", icon: <Briefcase size={20} />, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
  { name: "Self Improvement", icon: <Heart size={20} />, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20" },
  { name: "Fiction", icon: <Book size={20} />, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
  { name: "Marketing", icon: <Megaphone size={20} />, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20" }
];

export default function Templates() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="templates" className="py-24 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Start with the Perfect Structure
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Don't stare at a blank page. Choose a template tailored for your specific genre.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
          variants={shouldReduceMotion ? {} : staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {templates.map((template, index) => (
            <motion.div 
              key={index}
              variants={shouldReduceMotion ? {} : fadeUp}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-shadow cursor-pointer group`}
            >
              <div className={`w-12 h-12 rounded-full ${template.bg} ${template.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {template.icon}
              </div>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 text-center">
                {template.name}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center">
          <Link 
            to="/signup"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            Explore Templates
          </Link>
        </div>
      </div>
    </section>
  );
}
