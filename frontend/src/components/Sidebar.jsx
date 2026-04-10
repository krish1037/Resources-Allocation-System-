import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useAuth from '../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',   icon: 'grid' },
  { to: '/map',        label: 'Needs map',    icon: 'map' },
  { to: '/volunteers', label: 'Volunteers',   icon: 'users' },
  { to: '/ingest',     label: 'Add need',     icon: 'plus-circle' },
  { to: '/analytics',  label: 'Analytics',    icon: 'bar-chart' },
];

// Simple inline SVG icons — one function per icon name
function Icon({ name, className = "w-4 h-4" }) {
  const icons = {
    grid: <path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z"/>,
    map: <><path d="M1 6l7-4 8 4 7-4v16l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    'plus-circle': <><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></>,
    'bar-chart': <><path d="M18 20V10M12 20V4M6 20v-6"/></>,
    'log-out': <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></>,
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {icons[name]}
    </svg>
  );
}

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const needs = useSelector(state => state.needs.items);
  const openCount = Array.isArray(needs) ? needs.filter(n => n.status === 'open').length : 0;

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <aside className="w-56 flex-shrink-0 h-screen flex flex-col bg-white border-r border-slate-200">
      
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <p className="text-sm font-medium text-teal-700">Resource</p>
        <p className="text-lg font-medium text-slate-800 -mt-0.5">Allocator</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-teal-50 text-teal-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            <Icon name={icon} />
            <span className="flex-1">{label}</span>
            {/* Badge: show open need count on Dashboard link */}
            {to === '/dashboard' && openCount > 0 && (
              <span className="text-xs bg-orange-100 text-orange-600 font-medium px-1.5 py-0.5 rounded-full">
                {openCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      {user && (
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-2.5 px-2 mb-2">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center
                              text-teal-700 text-xs font-medium">
                {user.displayName?.[0] ?? 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate">{user.displayName}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs
                       text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <Icon name="log-out" />
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
