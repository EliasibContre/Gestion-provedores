import { Routes, Route, Navigate} from "react-router-dom";
import Login from "./routes/Login.jsx";
import Autentificacion from "./routes/Autentificacion.jsx";
import CambioPass from "./routes/CambioPass.jsx";
import DashboardAdmin from "./routes/DashboardAdmin.jsx";
import DashboardApro from "./routes/DashboardApro.jsx";
import DashboardProvider from "./routes/DashboardProvider.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/autentificacion" element={<Autentificacion />} />
      
      {/* Ruta de cambio de contraseña (requiere autenticación pero sin rol específico) */}
      <Route 
        path="/cambio-pass" 
        element={
          <ProtectedRoute>
            <CambioPass />
          </ProtectedRoute>
        } 
      />
      
      {/* Rutas protegidas por rol */}
      <Route 
        path="/dashboarda" 
        element={
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <DashboardAdmin />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboardapro" 
        element={
          <ProtectedRoute requiredRoles={['APPROVER', 'ADMIN']}>
            <DashboardApro />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboardprovider" 
        element={
          <ProtectedRoute requiredRoles={['PROVIDER']}>
            <DashboardProvider />
          </ProtectedRoute>
        } 
      />
      
      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
