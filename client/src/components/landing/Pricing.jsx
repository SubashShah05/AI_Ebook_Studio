import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const plans = [
  {
    name: "Hobby",
    price: "Free",
    description: "Perfect for getting started with AI ebook creation.",
    features: [
      "1 Book Project",
      "Up to 10,000 words generated",
      "Basic AI Templates",
      "Standard Markdown Export",
      "Community Support"
    ],
    buttonText: "Start Free",
    popular: false
  },
  {
    name: "Creator",
    price: "$10",
    period: "/month",
    description: "Everything you need for serious content creation.",
    features: [
      "Unlimited Book Projects",
      "100,000 words generated/mo",
      "Premium AI Templates",
      "Advanced Markdown & PDF Export",
      "Priority Email Support",
      "Version History"
    ],
    buttonText: "Upgrade to Creator",
    popular: true
  },
  {
    name: "Pro",
    price: "$30",
    period: "/month",
    description: "For professionals and agencies building businesses.",
    features: [
      "Everything in Creator",
      "Unlimited AI Generation",
      "Custom Brand Assets",
      "API Access",
      "White-label Exports",
      "24/7 Dedicated Support"
    ],
    buttonText: "Get Pro",
    popular: false
  }
];

export default function Pricing() {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(1);

  return (
    <section id="pricing" className="py-24 bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
          <motion.div 
            variants={shouldReduceMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="inline-block px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700/50 text-violet-700 dark:text-violet-400 text-xs font-bold uppercase tracking-wider mb-6"
          >
            Simple Pricing
          </motion.div>
          <motion.h2 
            variants={shouldReduceMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300"
          >
            Pricing that scales with you
          </motion.h2>
          <motion.p 
            variants={shouldReduceMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-slate-600 dark:text-slate-400 text-sm transition-colors duration-300"
          >
            Start for free, upgrade when you need more power.
          </motion.p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          variants={shouldReduceMotion ? {} : staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {plans.map((plan, index) => {
            const isActive = activeIndex === index;
            
            return (
              <motion.div 
                key={index}
                variants={shouldReduceMotion ? {} : fadeUp}
                onClick={() => setActiveIndex(index)}
                className={`group bg-white dark:bg-[#0f1523] border rounded-2xl p-8 flex flex-col relative cursor-pointer transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive 
                    ? 'border-violet-500 shadow-[0_20px_40px_-15px_rgba(124,58,237,0.2)] dark:shadow-[0_20px_40px_-15px_rgba(124,58,237,0.3)] md:scale-[1.02] md:-translate-y-2 opacity-100 z-10' 
                    : 'border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none scale-100 translate-y-0 opacity-100 md:opacity-60 md:hover:opacity-100 hover:border-violet-300 dark:hover:border-violet-700 md:hover:scale-[1.02] md:hover:-translate-y-2 md:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(124,58,237,0.15)] z-0'
                }`}
              >
                {/* Subtle highlight overlay */}
                <div className={`absolute inset-0 bg-gradient-to-b from-violet-500/10 dark:from-violet-500/5 to-transparent rounded-2xl transition-opacity duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none ${isActive ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}`} />

                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-violet-600 text-white text-xs font-bold rounded-full uppercase tracking-wider z-10 shadow-sm">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-300 relative z-10">{plan.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 min-h-[40px] transition-colors duration-300 relative z-10">{plan.description}</p>
                
                <div className="mb-6 relative z-10">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white transition-colors duration-300">{plan.price}</span>
                  {plan.period && <span className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">{plan.period}</span>}
                </div>
                
                <button className={`w-full py-3 rounded-lg font-medium text-sm mb-8 transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] relative z-10 ${
                  isActive 
                    ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md' 
                    : 'bg-slate-100 dark:bg-slate-800 md:group-hover:bg-violet-600 md:group-hover:text-white text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}>
                  {plan.buttonText}
                </button>
                
                <div className="space-y-4 flex-1 relative z-10">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-[400ms] ${isActive ? 'bg-violet-100 dark:bg-violet-500/20' : 'bg-slate-100 dark:bg-slate-800 md:group-hover:bg-violet-100 md:group-hover:dark:bg-violet-500/20'}`}>
                        <Check size={12} className={`transition-colors duration-[400ms] ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500 md:group-hover:text-violet-600 md:group-hover:dark:text-violet-400'}`} />
                      </div>
                      <span className={`text-sm transition-colors duration-[400ms] ${isActive ? 'text-slate-900 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400 md:group-hover:text-slate-900 md:group-hover:dark:text-slate-200'}`}>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
