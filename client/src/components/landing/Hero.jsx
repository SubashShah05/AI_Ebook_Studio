import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, Search, Bell, BookOpen, PenTool, Layout, FileText, CheckCircle2, ChevronDown, User, Star } from 'lucide-react';
import { fadeUp, staggerContainer, fadeIn } from '../../animations/motionVariants';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative pt-28 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-violet-600/10 dark:bg-violet-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-70 -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-50 -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* Left Text Column */}
          <motion.div 
            className="flex-1 w-full max-w-2xl lg:max-w-none z-10"
            variants={shouldReduceMotion ? {} : staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={shouldReduceMotion ? {} : fadeUp} className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-semibold border border-violet-200 dark:border-violet-500/30 uppercase tracking-wider">
                <span className="flex h-2 w-2 rounded-full bg-violet-500"></span>
                AI POWERED EBOOK CREATION
              </div>
            </motion.div>

            <motion.h1 
              variants={shouldReduceMotion ? {} : fadeUp}
              className="text-4xl md:text-6xl lg:text-[4rem] font-bold text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6"
            >
              Create Professional <br />
              Ebooks with <span className="text-violet-600 dark:text-violet-400">AI</span> <br />
              in <span className="text-violet-600 dark:text-violet-400">Minutes</span>, Not Weeks.
            </motion.h1>

            <motion.p 
              variants={shouldReduceMotion ? {} : fadeUp}
              className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-xl leading-relaxed"
            >
              Plan, generate, write, and publish complete books with the power of AI. From idea to finished ebook — faster, smarter, better.
            </motion.p>

            <motion.div 
              variants={shouldReduceMotion ? {} : fadeUp}
              className="flex flex-col sm:flex-row items-center gap-4 mb-12"
            >
              <Link 
                to="/signup"
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-3.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)]"
              >
                Start Creating Free
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <a 
                href="#product-preview"
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-3.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white font-medium border border-slate-200 dark:border-white/10 transition-all shadow-sm dark:shadow-none"
              >
                <PlayCircle size={18} className="text-violet-600 dark:text-violet-400" />
                Watch Demo
              </a>
            </motion.div>

            <motion.div variants={shouldReduceMotion ? {} : fadeUp} className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?img=1" alt="User" className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0B0F19]" />
                <img src="https://i.pravatar.cc/100?img=2" alt="User" className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0B0F19]" />
                <img src="https://i.pravatar.cc/100?img=3" alt="User" className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0B0F19]" />
                <img src="https://i.pravatar.cc/100?img=4" alt="User" className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0B0F19]" />
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Loved by <span className="text-slate-900 dark:text-white">12,000+</span> creators worldwide
              </div>
            </motion.div>
          </motion.div>

          {/* Right Product Mockup */}
          <motion.div 
            variants={shouldReduceMotion ? {} : fadeIn}
            initial="hidden"
            animate="visible"
            className="flex-1 w-full relative"
          >
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-violet-600/10 dark:bg-violet-600/20 blur-3xl rounded-[2rem] -z-10 transform scale-95" />
            
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#0f1523] shadow-2xl overflow-hidden relative">
              {/* Top Bar */}
              <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-slate-50/80 dark:bg-[#0B0F19]/80 backdrop-blur-sm">
                <div className="flex items-center">
                  <img src="/logo.png" alt="AI Ebook Studio" className="h-[32px] w-auto" />
                </div>
                
                <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-[#1a2235] px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 w-64 shadow-sm dark:shadow-none">
                  <Search size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-400">Search books, chapters...</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Bell size={16} className="text-slate-500 dark:text-slate-400" />
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600">
                    <User size={14} className="text-slate-500 dark:text-slate-300" />
                  </div>
                </div>
              </div>
              
              {/* Body */}
              <div className="flex h-[450px] bg-white dark:bg-[#0f1523]">
                {/* Sidebar */}
                <div className="w-48 border-r border-slate-200 dark:border-slate-800 p-4 hidden md:block bg-slate-50 dark:bg-transparent">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Main</div>
                  <div className="space-y-1 mb-6">
                    <div className="h-8 bg-violet-100 dark:bg-violet-600/20 text-violet-700 dark:text-violet-400 rounded-md flex items-center px-3 gap-2 text-xs font-medium border border-violet-200 dark:border-violet-500/20">
                      <Layout size={14} /> Dashboard
                    </div>
                    <div className="h-8 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-md flex items-center px-3 gap-2 text-xs font-medium cursor-pointer">
                      <BookOpen size={14} /> My Books
                    </div>
                    <div className="h-8 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-md flex items-center px-3 gap-2 text-xs font-medium cursor-pointer">
                      <CheckCircle2 size={14} /> Create New Book
                    </div>
                  </div>
                  
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">AI Tools</div>
                  <div className="space-y-1">
                    <div className="h-8 text-slate-600 dark:text-slate-400 rounded-md flex items-center px-3 gap-2 text-xs font-medium">
                      <PenTool size={14} /> AI Writer
                    </div>
                    <div className="h-8 text-slate-600 dark:text-slate-400 rounded-md flex items-center px-3 gap-2 text-xs font-medium">
                      <FileText size={14} /> AI Outline
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-6 overflow-hidden">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Dashboard</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Welcome back, John! 👋</p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-50 dark:bg-[#151c2e] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 mb-2"><BookOpen size={16} /></div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">12</div>
                      <div className="text-[10px] text-slate-500">Total Books</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#151c2e] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 mb-2"><FileText size={16} /></div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">48</div>
                      <div className="text-[10px] text-slate-500">Total Chapters</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#151c2e] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 mb-2"><PenTool size={16} /></div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">120K+</div>
                      <div className="text-[10px] text-slate-500">Words Generated</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#151c2e] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 mb-2"><Star size={16} /></div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">32</div>
                      <div className="text-[10px] text-slate-500">Exports</div>
                    </div>
                  </div>
                  
                  {/* Recent Books List Mock */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Books</h3>
                    <ChevronDown size={14} className="text-slate-500" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#151c2e] rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="flex gap-3 items-center">
                          <div className={`w-10 h-12 rounded bg-gradient-to-br ${i === 1 ? 'from-blue-500 to-violet-600' : i === 2 ? 'from-emerald-400 to-teal-600' : 'from-orange-400 to-rose-500'}`}></div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white mb-0.5">
                              {i === 1 ? 'The Future of AI' : i === 2 ? 'Digital Marketing Secrets' : 'Mindset Mastery'}
                            </div>
                            <div className="text-[10px] text-slate-500">Technology • 12 chapters</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">Updated 2h ago</div>
                          <div className="text-xs font-medium text-violet-600 dark:text-violet-400">{i === 1 ? '80%' : i === 2 ? '64%' : '32%'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
