import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { getErrorMessage } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(() => localStorage.getItem('selectedProjectId') || '');
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const loadProjects = useCallback(async () => {
    if (!localStorage.getItem('accessToken')) return;
    setProjectsLoading(true);
    try {
      const { data } = await api.get('/projects');
      setProjects(data.projects);
      setSelectedProjectId((current) => {
        const valid = data.projects.some((project) => String(project.id) === String(current));
        const next = valid ? String(current) : data.projects[0] ? String(data.projects[0].id) : '';
        if (next) localStorage.setItem('selectedProjectId', next);
        else localStorage.removeItem('selectedProjectId');
        return next;
      });
    } catch (error) {
      notify(getErrorMessage(error), 'error');
    } finally {
      setProjectsLoading(false);
    }
  }, [notify]);

  useEffect(() => { if (user) loadProjects(); }, [user, loadProjects]);

  const selectProject = (id) => {
    const value = String(id);
    setSelectedProjectId(value);
    localStorage.setItem('selectedProjectId', value);
  };

  const signIn = (data) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const signOut = () => {
    ['accessToken', 'refreshToken', 'user', 'selectedProjectId'].forEach((key) => localStorage.removeItem(key));
    setUser(null);
    setProjects([]);
  };

  const value = useMemo(() => ({
    user, projects, selectedProjectId, selectedProject: projects.find((p) => String(p.id) === String(selectedProjectId)),
    projectsLoading, toast, setToast, notify, loadProjects, selectProject, signIn, signOut,
    canManage: ['owner', 'admin'].includes(user?.role),
  }), [user, projects, selectedProjectId, projectsLoading, toast, notify, loadProjects]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
