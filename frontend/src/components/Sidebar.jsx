import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  LogOut,
  ChevronLeft,
  Menu,
  Zap,
  X,
  ShieldCheck,
  User
} from 'lucide-react';
import { useState } from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/projects', icon: FolderKanban, label: 'Projects' },
  ];

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const avatarColors = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #3b82f6, #06b6d4)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #ef4444, #f87171)',
  ];

  const getAvatarColor = (name) => {
    if (!name) return avatarColors[0];
    const idx = name.charCodeAt(0) % avatarColors.length;
    return avatarColors[idx];
  };

  return (
    <>
      {/* Mobile toggle */}
      <button className="sidebar-mobile-toggle" onClick={() => setMobileOpen(true)}>
        <Menu size={22} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Zap size={20} />
          </div>
          {!collapsed && <span className="sidebar-logo-text">TaskFlow</span>}
          <button
            className="sidebar-collapse-btn desktop-only"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
          </button>
          <button
            className="sidebar-collapse-btn mobile-only"
            onClick={() => setMobileOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={20} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div
              className="avatar avatar-md"
              style={{ background: getAvatarColor(user?.name) }}
            >
              {getInitials(user?.name)}
            </div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.name}</span>
                <span className={`sidebar-role-badge ${user?.role === 'ADMIN' ? 'role-admin' : 'role-member'}`}>
                  {user?.role === 'ADMIN'
                    ? <><ShieldCheck size={11} /> Admin</>
                    : <><User size={11} /> Member</>}
                </span>
              </div>
            )}
          </div>
          <button className="sidebar-nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
