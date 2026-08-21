import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const logos = [
  {
    name: "Google",
    content: (
      <div className="text-xl font-bold font-serif text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-yellow-500"></div> Google
      </div>
    )
  },
  {
    name: "Microsoft",
    content: (
      <div className="text-xl font-bold font-sans tracking-tighter text-slate-800 dark:text-white flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-500 grid grid-cols-2 gap-[1px] p-[1px]"><div className="bg-white"></div><div className="bg-white"></div><div className="bg-white"></div><div className="bg-white"></div></div> Microsoft
      </div>
    )
  },
  {
    name: "airbnb",
    content: (
      <div className="text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
        <div className="text-rose-500 font-serif">a</div> airbnb
      </div>
    )
  },
  {
    name: "HubSpot",
    content: (
      <div className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-1">
        <div className="text-orange-500">H</div>ubSpot
      </div>
    )
  },
  {
    name: "Notion",
    content: (
      <div className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-1">
        <div className="w-5 h-5 border-2 border-slate-800 dark:border-white rounded flex items-center justify-center text-xs">N</div> Notion
      </div>
    )
  }
];

export default function TrustSection() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="py-12 border-b border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#0B0F19] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-8 uppercase tracking-[0.2em]">
          Trusted by creators & companies
        </p>
        <motion.div 
          className={shouldReduceMotion ? "flex flex-wrap justify-center items-center gap-10 md:gap-20" : "logo-orbit-container"}
          variants={shouldReduceMotion ? {} : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {logos.map((logo, index) => (
            <motion.div
              key={index}
              className={shouldReduceMotion ? "" : "logo-orbit-item"}
              style={shouldReduceMotion ? {} : { animationDelay: `-${index * 3}s` }}
              variants={shouldReduceMotion ? {} : itemVariants}
            >
              <div className="opacity-70 dark:opacity-50 hover:opacity-100 dark:hover:opacity-90 hover:scale-[1.03] transition-all duration-[250ms] ease-out cursor-default">
                {logo.content}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
