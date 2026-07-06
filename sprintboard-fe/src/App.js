import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import AuthPage from './pages/AuthPage';
import Overview from './pages/Overview';
import Projects from './pages/Projects';
import Backlog from './pages/Backlog';
import Board from './pages/Board';
import Sprints from './pages/Sprints';
import Team from './pages/Team';
import './App.css';

export default function App() {
  return <BrowserRouter><AppProvider><Routes>
    <Route path="/login" element={<AuthPage />} />
    <Route element={<ProtectedRoute />}><Route element={<AppShell />}>
      <Route path="/overview" element={<Overview />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/backlog" element={<Backlog />} />
      <Route path="/board" element={<Board />} />
      <Route path="/sprints" element={<Sprints />} />
      <Route path="/team" element={<Team />} />
    </Route></Route>
    <Route path="*" element={<Navigate to={localStorage.getItem('accessToken') ? '/overview' : '/login'} replace />} />
  </Routes></AppProvider></BrowserRouter>;
}
