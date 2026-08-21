import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { BookOpen, Menu, X, Sun, Moon } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Optional: automatically update active link based on scroll position could go here
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
  ];

  const handleNavClick = (e, href) => {
    if (location.pathname !== '/') return;
    
    e.preventDefault();
    setActiveLink(href);
    const element = document.querySelector(href);
    if (element) {
      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: 'smooth'
      });
      setIsMobileMenuOpen(false);
    }
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 origin-left z-[60] shadow-[0_0_10px_rgba(239,68,68,0.5)]"
        style={{ scaleX }}
      />
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0B1020]/95 backdrop-blur-md border-b border-[#252B45] shadow-lg' 
          : 'bg-transparent'
      }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <img src="/logo.png" alt="AI Ebook Studio" className="h-[48px] md:h-[56px] w-auto group-hover:scale-105 transition-transform origin-left" />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = activeLink === link.href;
                return (
                  <a 
                    key={link.name} 
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`relative text-sm font-medium transition-colors group ${
                      isActive 
                        ? 'text-[#8B5CF6]' 
                        : isScrolled 
                          ? 'text-[#CBD5E1] hover:text-[#FFFFFF]'
                          : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#FFFFFF]'
                    }`}
                  >
                    {link.name}
                    <span className={`absolute -bottom-1.5 left-0 w-full h-[2px] bg-[#8B5CF6] origin-left transition-all duration-300 ease-out ${
                      isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                    }`} />
                  </a>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 transition-colors rounded-full ${
                  isScrolled 
                    ? 'text-[#CBD5E1] hover:text-[#FFFFFF] hover:bg-[#252B45]' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-[#CBD5E1] dark:hover:text-[#FFFFFF] hover:bg-slate-100 dark:hover:bg-[#252B45]'
                }`}
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link 
                to="/login"
                className={`text-sm font-medium transition-colors ${
                  isScrolled 
                    ? 'text-[#CBD5E1] hover:text-[#FFFFFF]' 
                    : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#FFFFFF]'
                }`}
              >
                Login
              </Link>
              <Link 
                to="/signup"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-[#FFFFFF] bg-[#8B5CF6] rounded-lg hover:bg-[#7C3AED] transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button & Theme Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 transition-colors rounded-full ${
                  isScrolled ? 'text-[#CBD5E1] hover:text-[#FFFFFF]' : 'text-slate-500 hover:text-slate-900 dark:text-[#CBD5E1] dark:hover:text-[#FFFFFF]'
                }`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 ${
                  isScrolled ? 'text-[#CBD5E1] hover:text-[#FFFFFF]' : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#FFFFFF]'
                }`}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0B1020] border-b border-slate-200 dark:border-[#252B45] absolute top-20 left-0 w-full shadow-2xl">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block px-3 py-4 text-base font-medium text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#FFFFFF] hover:bg-slate-50 dark:hover:bg-[#252B45] rounded-md transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              <Link 
                to="/login"
                className="block w-full text-center px-4 py-3 text-base font-medium text-slate-700 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#252B45] rounded-lg hover:bg-slate-50 dark:hover:bg-[#252B45] transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup"
                className="block w-full text-center px-4 py-3 text-base font-medium text-[#FFFFFF] bg-[#8B5CF6] rounded-lg hover:bg-[#7C3AED] transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
    </>
  );
}
