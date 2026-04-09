import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; 
import { Activity, Search, Moon, Sun, Globe, Bell } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useTranslation } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';

export default function TopNavigation() {
  const { t, lang, setLang } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const needs = useSelector(state => state.needs.items ?? []);
  const openCount = needs.filter(n => n.status === 'open').length;

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard') },
    { to: '/map', label: t('nav.map') },
    { to: '/volunteers', label: t('nav.volunteers') },
    { to: '/ingest', label: t('nav.ingest') },
    { to: '/analytics', label: t('nav.analytics') },
  ];

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        {/* Left: Logo + Nav */}
        <div className="flex items-center space-x-8">
          <NavLink to="/dashboard" className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-zinc-900 dark:bg-white rounded-sm flex items-center justify-center">
              <Activity className="w-4 h-4 text-white dark:text-zinc-900" />
            </div>
            <span className="font-semibold text-zinc-900 dark:text-white text-sm tracking-tight hidden sm:block">
              Allocator
            </span>
          </NavLink>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-sm font-medium rounded-md transition-colors relative ${
                    isActive
                      ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800/50'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                  }`
                }
              >
                {item.label}
                {item.to === '/dashboard' && openCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {openCount > 9 ? '9+' : openCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3">

          <div className="hidden sm:flex items-center px-2 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
            <Search className="w-3.5 h-3.5 text-zinc-400 mr-2" />
            <span className="text-xs text-zinc-500 mr-4">Search...</span>
            <kbd className="text-[10px] text-zinc-400 font-mono">⌘K</kbd>
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block mx-1" />

          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <div className="relative flex items-center mx-1">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="pl-2 pr-6 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-transparent appearance-none cursor-pointer focus:outline-none transition-colors"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
              </select>
              <Globe className="w-3.5 h-3.5 text-zinc-400 absolute right-1 pointer-events-none" />
            </div>

            <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors relative">
              <Bell className="w-4 h-4" />
              {openCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Avatar / Sign out */}
          {user ? (
            <button
              onClick={handleSignOut}
              className="ml-2 w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              title={`Sign out (${user.displayName || user.email})`}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-[10px] font-bold">
                  {user.displayName?.[0] || user.email?.[0] || 'U'}
                </span>
              )}
            </button>
          ) : (
            <NavLink
              to="/login"
              className="ml-2 w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center"
            >
              <span className="text-zinc-500 text-[10px] font-bold">?</span>
            </NavLink>
          )}
        </div>

      </div>

      {/* Mobile nav */}
      <nav className="md:hidden flex items-center space-x-1 px-4 pb-2 overflow-x-auto scrollbar-hide">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                isActive
                  ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800/50'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
