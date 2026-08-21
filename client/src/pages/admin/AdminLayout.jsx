import React, { useState, useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, CreditCard, BookOpen, FileText, Sparkles, Activity,
  ShieldAlert, Settings, LogOut, ChevronLeft, ChevronRight, Menu, X,
  Bot, ClipboardList, HeartPulse, Crown
} from 'lucide-react';

const NAV = [
  { group: 'OVERVIEW', items: [{ label: 'Dashboard', icon: LayoutDashboard, to: '/admin' }] },
  {
    group: 'USERS',
    items: [
      { label: 'Users', icon: Users, to: '/admin/users' },
      { label: 'Subscriptions', icon: CreditCard, to: '/admin/subscriptions' },
    ]
  },
  {
    group: 'CONTENT',
    items: [
      { label: 'Books', icon: BookOpen, to: '/admin/books' },
      { label: 'Templates', icon: FileText, to: '/admin/templates' },
    ]
  },
  {
    group: 'AI',
    items: [
      { label: 'AI Usage', icon: Sparkles, to: '/admin/ai-usage' },
    ]
  },
  {
    group: 'OPERATIONS',
    items: [
      { label: 'Activity', icon: Activity, to: '/admin/activity' },
      { label: 'System Health', icon: HeartPulse, to: '/admin/system-health' },
    ]
  },
  {
    group: 'SECURITY',
    items: [
      { label: 'Security Events', icon: ShieldAlert, to: '/admin/security' },
      { label: 'Audit Log', icon: ClipboardList, to: '/admin/audit' },
    ]
  },
];

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#060B18] border-r border-[#1E2535] text-slate-300">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 min-h-[64px] border-b border-[#1E2535]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shrink-0">
            <Crown size={16} className="text-white" />
          </div>
          {(!collapsed || mobileOpen) && (
            <div>
              <p className="text-white font-bold text-sm leading-tight">Admin Panel</p>
              <p className="text-[10px] text-slate-500">AI Ebook Studio</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-slate-400 hover:text-white p-1"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
        {NAV.map((group, gi) => (
          <div key={gi}>
            {(!collapsed || mobileOpen) && (
              <p className="px-3 text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">
                {group.group}
              </p>
            )}
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition mb-0.5 ${
                    isActive
                      ? 'bg-rose-500/10 text-rose-400 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-[#1E2535]'
                  }`
                }
                title={collapsed && !mobileOpen ? item.label : ''}
              >
                <item.icon size={16} className="shrink-0" />
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-[#1E2535]">
        {(!collapsed || mobileOpen) && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-rose-400">Admin</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition ${collapsed && !mobileOpen ? 'justify-center' : ''}`}
        >
          <LogOut size={15} className="shrink-0" />
          {(!collapsed || mobileOpen) && 'Logout'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#080D1A] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col transition-all duration-300 shrink-0 ${collapsed ? 'w-[64px]' : 'w-[220px]'}`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-[220px] h-full shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-[#060B18] border-b border-[#1E2535] shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              <Menu size={20} />
            </button>
            {/* Desktop collapse */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 text-slate-500 hover:text-white hover:bg-[#1E2535] rounded-lg transition"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded font-bold uppercase tracking-wide">
                Admin
              </span>
              <span className="text-sm text-slate-500 hidden sm:block">
                AI Ebook Studio Control Panel
              </span>
            </div>
          </div>
          <NavLink
            to="/dashboard"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 border border-[#1E2535] rounded-lg transition hover:border-slate-500"
          >
            <BookOpen size={13} />
            Back to App
          </NavLink>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
