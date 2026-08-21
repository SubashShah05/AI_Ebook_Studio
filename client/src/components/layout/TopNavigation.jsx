import React, { useContext } from 'react';
import { Menu, Search, Bell, Moon, Sun, ChevronDown, LogOut, User, Settings, CreditCard, HelpCircle } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopNavigation({ setMobileOpen, isCollapsed, setIsCollapsed }) {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-[72px] bg-white dark:bg-[#0B1020] border-b border-slate-200 dark:border-[#252B45] flex items-center justify-between px-4 sticky top-0 z-30 transition-colors duration-200">
      
      {/* Left section */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#252B45]/50 transition"
        >
          <Menu size={20} />
        </button>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:block p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#252B45]/50 transition"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="hidden sm:flex items-center max-w-md w-full relative">
          <Search size={18} className="absolute left-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search books, projects, chapters..." 
            className="w-full bg-slate-100 dark:bg-[#0f1523] border border-transparent dark:border-[#252B45] text-slate-700 dark:text-white text-sm rounded-lg pl-10 pr-12 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 transition"
          />
          <div className="absolute right-3 hidden lg:flex items-center gap-1 text-[10px] text-slate-400 font-medium">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#252B45] border border-slate-300 dark:border-slate-600">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#252B45] border border-slate-300 dark:border-slate-600">K</kbd>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#252B45]/50 transition"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#252B45]/50 transition relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#0B1020]"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252B45]/50 transition border border-transparent dark:border-transparent dark:hover:border-[#252B45]"
          >
            <div className="w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <ChevronDown size={16} className="text-slate-500 dark:text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0B1020] rounded-xl shadow-xl border border-slate-200 dark:border-[#252B45] py-1 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-[#252B45]">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400">
                    Pro Plan
                  </div>
                </div>
                
                <div className="py-1">
                  <button onClick={() => {navigate('/profile'); setProfileOpen(false)}} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252B45]/50 flex items-center gap-2 transition">
                    <User size={16} /> Profile
                  </button>
                  <button onClick={() => {navigate('/settings'); setProfileOpen(false)}} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252B45]/50 flex items-center gap-2 transition">
                    <Settings size={16} /> Settings
                  </button>
                  <button onClick={() => {navigate('/billing'); setProfileOpen(false)}} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252B45]/50 flex items-center gap-2 transition">
                    <CreditCard size={16} /> Billing
                  </button>
                  <button onClick={() => {navigate('/help'); setProfileOpen(false)}} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252B45]/50 flex items-center gap-2 transition">
                    <HelpCircle size={16} /> Help & Support
                  </button>
                </div>
                <div className="border-t border-slate-100 dark:border-[#252B45] py-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 transition"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
