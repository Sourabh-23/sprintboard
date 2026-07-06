import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute() {
  const { user } = useApp();
  return user && localStorage.getItem('accessToken') ? <Outlet /> : <Navigate to="/login" replace />;
}
