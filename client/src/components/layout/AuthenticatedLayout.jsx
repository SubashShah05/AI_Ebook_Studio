import React, { useState, useContext, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import { AuthContext } from '../../context/AuthContext';

export default function AuthenticatedLayout() {
  const { user } = useContext(AuthContext);
  
  // Collapse sidebar on smaller desktop screens automatically
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
  const [isMobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && !isCollapsed) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1024 && isCollapsed) {
        setIsCollapsed(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1523] text-slate-900 dark:text-slate-100 flex transition-colors duration-200 overflow-hidden">
      
      <Sidebar 
        isCollapsed={isCollapsed} 
        isMobileOpen={isMobileOpen} 
        setMobileOpen={setMobileOpen} 
        user={user} 
      />

      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: window.innerWidth >= 768 ? (isCollapsed ? '80px' : '260px') : '0' }}
      >
        <TopNavigation 
          setMobileOpen={setMobileOpen} 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
}
