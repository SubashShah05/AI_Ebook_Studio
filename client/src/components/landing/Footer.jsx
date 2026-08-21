import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Twitter, Github, Linkedin, Facebook, Instagram } from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Templates', href: '#' },
    { name: 'Changelog', href: '#' }
  ],
  resources: [
    { name: 'Documentation', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Community', href: '#' },
    { name: 'Help Center', href: '#' }
  ],
  company: [
    { name: 'About', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Contact', href: '#' },
    { name: 'Partners', href: '#' }
  ],
  legal: [
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '#' },
    { name: 'Security', href: '#' }
  ]
};

export default function Footer() {
  const location = useLocation();

  const isActiveLink = (href) => {
    if (!href || href === '#') return false;
    const currentPath = location.pathname + location.hash;
    return currentPath === href || location.pathname === href || location.hash === href;
  };

  return (
    <footer className="bg-slate-50 dark:bg-[#0f1523] border-t border-slate-200 dark:border-slate-800 py-12 md:py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center mb-6">
              <img src="/logo.png" alt="AI Ebook Studio" className="h-[48px] md:h-[56px] w-auto hover:scale-105 transition-transform origin-left" />
            </Link>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-xs transition-colors duration-300">
              The complete creative workspace for modern authors, creators, and businesses.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/subash.shah.7549" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/subashs621?igsh=bGhwOW4wZnVxNnVx" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.linkedin.com/in/subash-shah-dev/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="https://github.com/SubashShah05" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 transition-colors duration-300">Product</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className={`text-slate-600 dark:text-slate-400 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-red-600 hover:to-yellow-500 hover:underline hover:decoration-red-500 hover:decoration-2 hover:underline-offset-4 active:text-transparent active:bg-clip-text active:bg-gradient-to-r active:from-red-600 active:to-yellow-500 transition-all duration-300 ${isActiveLink(link.href) ? 'underline decoration-2 underline-offset-4 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500 decoration-red-500' : ''}`}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 transition-colors duration-300">Resources</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className={`text-slate-600 dark:text-slate-400 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-red-600 hover:to-yellow-500 hover:underline hover:decoration-red-500 hover:decoration-2 hover:underline-offset-4 active:text-transparent active:bg-clip-text active:bg-gradient-to-r active:from-red-600 active:to-yellow-500 transition-all duration-300 ${isActiveLink(link.href) ? 'underline decoration-2 underline-offset-4 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500 decoration-red-500' : ''}`}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 transition-colors duration-300">Company</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className={`text-slate-600 dark:text-slate-400 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-red-600 hover:to-yellow-500 hover:underline hover:decoration-red-500 hover:decoration-2 hover:underline-offset-4 active:text-transparent active:bg-clip-text active:bg-gradient-to-r active:from-red-600 active:to-yellow-500 transition-all duration-300 ${isActiveLink(link.href) ? 'underline decoration-2 underline-offset-4 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500 decoration-red-500' : ''}`}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 transition-colors duration-300">Legal</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className={`text-slate-600 dark:text-slate-400 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-red-600 hover:to-yellow-500 hover:underline hover:decoration-red-500 hover:decoration-2 hover:underline-offset-4 active:text-transparent active:bg-clip-text active:bg-gradient-to-r active:from-red-600 active:to-yellow-500 transition-all duration-300 ${isActiveLink(link.href) ? 'underline decoration-2 underline-offset-4 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500 decoration-red-500' : ''}`}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-300">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} AI Ebook Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
