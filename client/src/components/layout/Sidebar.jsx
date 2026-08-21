import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Plus, LayoutDashboard, Library, FileText, 
  Sparkles, Wand2, Bot, FolderKanban, BarChart3, 
  Download, User, Settings, CreditCard, HelpCircle, X, Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // assuming useAuth exists, wait, it's AuthContext. Let's import it directly.

export default function Sidebar({ isCollapsed, isMobileOpen, setMobileOpen, user }) {
  const location = useLocation();

  const navigation = [
    {
      group: 'MAIN',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'My Books', icon: Library, path: '/books' }, // Might not exist yet, we'll route it
        { name: 'Create New Book', icon: Plus, path: '/create' },
        { name: 'Templates', icon: FileText, path: '/templates' },
      ]
    },
    {
      group: 'AI STUDIO',
      items: [
        { name: 'AI Writer', icon: Sparkles, path: '/ai-writer' },
        { name: 'AI Outline', icon: Wand2, path: '/ai-outline' },
        { name: 'AI Assistant', icon: Bot, path: '/ai-assistant' },
      ]
    },
    {
      group: 'MANAGEMENT',
      items: [
        { name: 'Projects', icon: FolderKanban, path: '/projects' },
        { name: 'Analytics', icon: BarChart3, path: '/analytics' },
        { name: 'Team', icon: Users, path: '/team' },
        { name: 'Exports', icon: Download, path: '/exports' },
      ]
    },
    {
      group: 'ACCOUNT',
      items: [
        { name: 'Profile', icon: User, path: '/profile' },
        { name: 'Settings', icon: Settings, path: '/settings' },
        { name: 'Billing', icon: CreditCard, path: '/billing' },
        { name: 'Help & Support', icon: HelpCircle, path: '/help' },
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-white dark:bg-[#0B1020] border-r border-slate-200 dark:border-[#252B45] text-slate-600 dark:text-slate-300">
      
      {/* Logo Area */}
      <div className="p-4 flex items-center justify-between min-h-[72px]">
        <div className="flex items-center gap-3 px-2">
          <Link to="/" className="flex shrink-0 items-center">
            <img src="/logo.png" alt="AI Ebook Studio Logo" className="h-8 w-auto" />
          </Link>
          {(!isCollapsed || isMobileOpen) && (
            <Link to="/">
              <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight whitespace-nowrap">AI Ebook Studio</span>
            </Link>
          )}
        </div>
        {isMobileOpen && (
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white p-1">
            <X size={20} />
          </button>
        )}
      </div>

      {/* CTA Button */}
      <div className="px-4 py-2 mb-2">
        <NavLink to="/create" className="flex items-center justify-center gap-2 w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium p-2.5 rounded-lg transition shadow-[0_0_10px_rgba(139,92,246,0.2)]">
          <Plus size={20} className="flex-shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span className="whitespace-nowrap">Create New Book</span>}
        </NavLink>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 space-y-6 pb-6">
        {navigation.map((group, i) => (
          <div key={i}>
            {(!isCollapsed || isMobileOpen) && (
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#CBD5E1]/60 mb-2 whitespace-nowrap">
                {group.group}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${
                      isActive 
                        ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] font-medium' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#252B45]/50'
                    }`}
                    title={isCollapsed && !isMobileOpen ? item.name : ''}
                  >
                    <item.icon size={18} className={`flex-shrink-0 ${isActive ? 'text-[#8B5CF6]' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white'}`} />
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="whitespace-nowrap">{item.name}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Card */}
      <div className="p-4 mt-auto border-t border-slate-200 dark:border-[#252B45]">
        <div className={`flex items-center gap-3 ${isCollapsed && !isMobileOpen ? 'justify-center' : 'px-2'}`}>
          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-[#252B45] flex items-center justify-center text-sm font-bold text-indigo-700 dark:text-white flex-shrink-0 border border-[#8B5CF6]/30">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-[#8B5CF6] truncate">Pro Plan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className="hidden md:block h-screen fixed left-0 top-0 z-40"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isMobileOpen ? 0 : '-100%' }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className="md:hidden fixed left-0 top-0 h-screen w-[260px] z-50 shadow-2xl"
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
