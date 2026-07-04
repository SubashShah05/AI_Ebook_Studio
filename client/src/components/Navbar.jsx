
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // Import theme
import { BookOpen, LogOut, User, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext); // Use theme
  const navigate = useNavigate();

  return (
    <nav className="bg-indigo-600 dark:bg-indigo-900 text-white shadow-md px-6 py-4 flex justify-between items-center transition-colors duration-200">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
        <BookOpen className="w-6 h-6" />
        <span>AI eBook Studio</span>
      </Link>
      
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle Button */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 transition"
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
            <Link to="/login" className="hover:underline text-sm font-medium">Login</Link>
            <Link to="/register" className="bg-white text-indigo-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-indigo-50 transition">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}