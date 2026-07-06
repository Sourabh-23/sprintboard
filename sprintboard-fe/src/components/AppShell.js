import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Boxes, ChevronDown, ClipboardList, FolderKanban, Gauge, LogOut, Menu, Settings2, Users, X, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar, Toast } from './UI';

const nav = [
  { to: '/overview', label: 'Overview', icon: Gauge },
  { to: '/projects', label: 'Projects', icon: Boxes },
  { to: '/backlog', label: 'Backlog', icon: ClipboardList },
  { to: '/board', label: 'Board', icon: FolderKanban },
  { to: '/sprints', label: 'Sprints', icon: Zap },
  { to: '/team', label: 'Team', icon: Users },
];

export default function AppShell() {
  const { user, projects, selectedProjectId, selectProject, signOut } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const active = nav.find((item) => location.pathname.startsWith(item.to));

  const logout = () => { signOut(); navigate('/login'); };
  const sidebar = (
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><FolderKanban size={20} /></span><strong>SprintBoard</strong><button className="sidebar-close" onClick={() => setMobileOpen(false)}><X size={19} /></button></div>
      <div className="project-switcher-wrap">
        <label>Current project</label>
        <div className="select-wrap"><select value={selectedProjectId} onChange={(e) => selectProject(e.target.value)} disabled={!projects.length}>
          {!projects.length && <option value="">No projects yet</option>}
          {projects.map((project) => <option key={project.id} value={project.id}>{project.key} · {project.name}</option>)}
        </select><ChevronDown size={15} /></div>
      </div>
      <nav className="side-nav">{nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-footer"><div className="profile-mini"><Avatar name={user?.name} /><div><strong>{user?.name}</strong><span>{user?.role}</span></div></div><button className="icon-button icon-button-dark" onClick={logout} title="Log out"><LogOut size={17} /></button></div>
    </aside>
  );

  return <div className="app-layout">
    {sidebar}{mobileOpen && <button className="mobile-overlay" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
    <main className="main-area">
      <header className="topbar"><button className="menu-button" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><div><span className="topbar-label">Workspace</span><strong>{active?.label || 'SprintBoard'}</strong></div><div className="topbar-actions"><span className="status-dot" />API connected<Settings2 size={17} /></div></header>
      <div className="page-container"><Outlet /></div>
    </main><Toast />
  </div>;
}
