import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_BASE } from '../api';

/**
 * Componente para proteger rutas que requieren autenticación
 * Verifica que el usuario tenga sesión válida antes de permitir acceso
 */
export default function ProtectedRoute({ children, requiredRoles = [] }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      // Verificar sesión con el backend
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        
        // Extraer roles del usuario
        const rolesData = data.user?.roles || [];
        const roles = rolesData.map(r => {
          if (typeof r === 'string') {
            return r.toUpperCase();
          } else if (r && r.name) {
            return r.name.toUpperCase();
          }
          return null;
        }).filter(Boolean);
        
        setUserRoles(roles);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  // Mostrar loading mientras verifica
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Verificando sesión, espere un momento...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se requieren roles específicos, verificar
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => 
      userRoles.includes(role.toUpperCase())
    );

    if (!hasRequiredRole) {
      // Si no tiene el rol requerido, redirigir según su rol
      if (userRoles.includes('ADMIN')) {
        return <Navigate to="/dashboarda" replace />;
      } else if (userRoles.includes('APPROVER')) {
        return <Navigate to="/dashboardapro" replace />;
      } else if (userRoles.includes('PROVIDER')) {
        return <Navigate to="/dashboardprovider" replace />;
      } else {
        return <Navigate to="/login" replace />;
      }
    }
  }

  // Si está autenticado y tiene el rol correcto, mostrar el componente
  return children;
}
