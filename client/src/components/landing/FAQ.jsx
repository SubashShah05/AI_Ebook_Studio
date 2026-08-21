import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const faqs = [
  {
    question: "What is AI Ebook Studio?",
    answer: "AI Ebook Studio is a complete creative workspace designed to help you plan, write, and export professional ebooks using the power of Artificial Intelligence."
  },
  {
    question: "Do I retain copyright to the books generated?",
    answer: "Yes, absolutely. You retain 100% copyright and ownership of any content you generate and edit using AI Ebook Studio. We do not claim any rights to your work."
  },
  {
    question: "What languages are supported?",
    answer: "Currently, our AI generation works best in English, but we also support generating content in Spanish, French, German, Italian, and Portuguese with high quality."
  },
  {
    question: "Can I export my book to Kindle format?",
    answer: "Yes! You can export your book as a standard Markdown file or PDF, which can be easily converted to EPUB or MOBI formats for Kindle publishing."
  },
  {
    question: "Is the content plagiarism-free?",
    answer: "Yes, the AI generates unique content from scratch based on your prompts. However, as with any tool, we recommend reviewing the content and using a plagiarism checker if you plan to publish commercially."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const faqStagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const getSlideVariant = (index) => {
    // Even index (0, 2, 4) from left, Odd (1, 3) from right
    const isLeft = index % 2 === 0;
    return {
      hidden: { opacity: 0, x: isLeft ? -45 : 45, y: 10 },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1]
        }
      }
    };
  };

  return (
    <section className="py-24 bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            variants={shouldReduceMotion ? {} : fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-3xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300"
          >
            Frequently Asked Questions
          </motion.h2>
        </div>

        <motion.div 
          className="space-y-4"
          variants={shouldReduceMotion ? {} : faqStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              variants={shouldReduceMotion ? {} : getSlideVariant(index)}
              className={`border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0f1523] overflow-hidden transition-all duration-300 shadow-sm dark:shadow-none hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700/50 ${openIndex !== index ? 'hover:scale-[1.01]' : ''}`}
            >
              <button
                className="w-full px-6 py-4 flex items-center justify-between focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
                <span className="font-semibold text-slate-900 dark:text-white text-left text-sm transition-colors duration-300">{faq.question}</span>
                <ChevronDown 
                  className={`text-violet-600 dark:text-violet-400 transition-transform duration-200 shrink-0 ${openIndex === index ? 'rotate-180' : ''}`} 
                  size={20} 
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-4 text-slate-600 dark:text-slate-400 text-sm transition-colors duration-300">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
