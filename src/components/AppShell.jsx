import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Mic, BookOpen, User, LogOut, Menu, FileText } from 'lucide-react';
import { useAppAuth } from '@/lib/appAuth';

const NAV_ITEMS = [
  { path: '/', label: 'ダッシュボード', sub: 'Dashboard', icon: LayoutDashboard },
  { path: '/interview', label: 'AI面接官', sub: 'AI Interview (Voice & Video)', icon: Mic },
  { path: '/resume', label: '履歴書作成', sub: 'Resume Builder', icon: FileText },
  { path: '/etiquette', label: 'マナーガイド', sub: 'Manner & Etiquette', icon: BookOpen },
  { path: '/profile', label: 'プロフィール', sub: 'Profile & Settings', icon: User },
];

const LEVEL_COLORS = {
  N1: 'bg-emerald-100 text-emerald-700',
  N2: 'bg-blue-100 text-blue-700',
  N3: 'bg-amber-100 text-amber-700',
};

export default function AppShell() {
  const { user, logout } = useAppAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeItem = NAV_ITEMS.find((i) => i.path === location.pathname) || NAV_ITEMS[0];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center">
          <Mic className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-navy leading-tight">面接マスター</p>
          <p className="text-[11px] text-slate-400">Interview Master</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition group ${
                active
                  ? 'bg-navy text-white shadow-md shadow-navy/20'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-navy'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${active ? 'text-white' : 'text-slate-400 group-hover:text-navy'}`} />
              <div className="text-left">
                <p className="font-medium leading-tight">{item.label}</p>
                <p className={`text-[10px] ${active ? 'text-white/60' : 'text-slate-400'}`}>{item.sub}</p>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-navy-light text-white flex items-center justify-center text-xs font-semibold">
            {user?.avatar || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy truncate">{user?.nameJp || user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.name}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-crimson hover:bg-crimson/5 transition"
        >
          <LogOut className="w-3.5 h-3.5" /> ログアウト
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-100 flex-col fixed h-screen print:hidden">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-navy/40 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden fixed top-0 left-0 w-64 bg-white z-50 h-screen"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-100 sticky top-0 z-30 print:hidden">
          <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base font-bold text-navy leading-tight">{activeItem.label}</h1>
                <p className="text-[11px] text-slate-400">{activeItem.sub}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${LEVEL_COLORS[user?.level] || 'bg-slate-100 text-slate-600'}`}>
                JLPT {user?.level}
              </span>
              <div className="w-9 h-9 rounded-full bg-navy-light text-white flex items-center justify-center text-xs font-semibold">
                {user?.avatar || 'U'}
              </div>
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-crimson hover:bg-crimson/5 transition"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 max-w-6xl w-full mx-auto print:p-0 print:max-w-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}