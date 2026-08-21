
import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // Import theme
import { BookOpen, LogOut, User, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext); // Use theme
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/signup';
  const navBackground = isAuthPage ? 'bg-[#0B1020] border-b border-[#252B45]' : 'bg-indigo-600 dark:bg-indigo-900 shadow-md';

  return (
    <nav className={`${navBackground} text-white px-6 py-4 flex justify-between items-center transition-colors duration-200`}>
      <Link to="/" className="flex items-center">
        <img src="/logo.png" alt="AI Ebook Studio" className="h-[40px] w-auto" />
      </Link>
      
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle Button */}
        <button 
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg transition ${isAuthPage ? 'text-[#CBD5E1] hover:text-[#FFFFFF] hover:bg-[#252B45]' : 'hover:bg-indigo-700 dark:hover:bg-indigo-800'}`}
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {user ? (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-sm font-medium bg-indigo-700 dark:bg-indigo-800 px-3 py-1.5 rounded-full">
              <User className="w-4 h-4" />
              <span>{user.name}</span>
            </div>
            <button 
              onClick={() => { logout(); navigate('/login'); }} 
              className="flex items-center gap-1 text-sm bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            <Link to="/login" className={`text-sm font-medium transition ${isAuthPage ? 'text-[#CBD5E1] hover:text-[#FFFFFF] hover:underline' : 'hover:underline'}`}>Login</Link>
            <Link to="/register" className={`px-3 py-1.5 rounded text-sm font-medium transition ${isAuthPage ? 'bg-[#8B5CF6] text-[#FFFFFF] hover:bg-[#7C3AED]' : 'bg-white text-indigo-600 hover:bg-slate-100'}`}>Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}