import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCog,
  ClipboardList,
  FileCheck,
  FileMinus,
  FileEdit,
  FileSearch,
  LogOut,
  User,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  DollarSign
} from "lucide-react";

// Importar componentes
import ExpendientesDigitales from './ExpendientesDigitales';
import GestionProveedores from './GestionProveedores';
import Usuarios from './Usuarios';
import VerificacionR from './VerificacionR';
import Graficas from './Graficas';
import GestionPagos from './GestionPagos';
import InactivityWarning from '../components/InactivityWarning';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';

function DashboardAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();
  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');
  const [currentModal, setCurrentModal] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ type: '', title: '', message: '', showConfirm: false, onConfirm: null });

  // Hook de inactividad (30 min timeout, 2 min warning)
  const { showWarning, remainingSeconds, extendSession, logout } = useInactivityTimeout(30, 2);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/api/auth/logout`, null, { withCredentials: true });
    } catch (e) {
      console.error("Error during logout:", e);
    } finally {
      setUserMenuOpen(false);
      navigate("/login");
    }
  };

  const menuItems = [
    {
      id: "gestion-proveedores",
      title: "Gestión de Proveedores",
      icon: <Users className="w-5 h-5" />,
      submenu: [
        { id: "altas", title: "Altas", icon: <FileCheck className="w-4 h-4" /> },
        { id: "bajas", title: "Bajas", icon: <FileMinus className="w-4 h-4" /> },
        { id: "modificaciones", title: "Modificaciones", icon: <FileEdit className="w-4 h-4" /> },
      ],
    },
    {
      id: "gestion-pagos",
      title: "Gestión de Pagos",
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      id: "expedientes-digitales",
      title: "Expedientes Digitales",
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      id: "usuarios",
      title: "Usuarios",
      icon: <UserCog className="w-5 h-5" />,
      submenu: [{ id: "administracion", title: "Administración", icon: <Settings className="w-4 h-4" /> }],
    },
    {
      id: "verificacion-rapida",
      title: "Verificación Rápida",
      icon: <FileSearch className="w-5 h-5" />,
    },
  ];

  // Función para mostrar alertas centradas
  const showAlert = (type, title, message, showConfirm = false, onConfirm = null) => {
    setAlertConfig({ type, title, message, showConfirm, onConfirm });
    setAlertOpen(true);
    
    if ((type === 'success' || type === 'info') && !showConfirm) {
      setTimeout(() => {
        setAlertOpen(false);
      }, 4000);
    }
  };

  // Mapeo de modales a componentes
  const modalComponents = {
    "altas": { component: GestionProveedores, title: "Altas de Proveedores", props: { mode: 'alta' } },
    "bajas": { component: GestionProveedores, title: "Bajas de Proveedores", props: { mode: 'baja' } },
    "modificaciones": { component: GestionProveedores, title: "Modificación de Proveedores", props: { mode: 'modificacion' } },
    "gestion-pagos": { component: GestionPagos, title: "Gestión de Pagos", props: { showAlert } },
    "expedientes-digitales": { component: ExpendientesDigitales, title: "Expedientes Digitales", props: {} },
    "administracion": { component: Usuarios, title: "Administración de Usuarios", props: {} },
    "verificacion-rapida": { component: VerificacionR, title: "Verificación Rápida", props: {} }
  };

  // Función para abrir modal
  const openModal = (sectionId) => {
    setCurrentModal(sectionId);
    setModalOpen(true);
  };

  // Función para cerrar modal
  const closeModal = () => {
    setModalOpen(false);
    setCurrentModal("");
  };

  // Componente de Alertas Centradas
  const Alert = ({ isOpen, onClose, type, title, message, showConfirm = false, onConfirm }) => {
    if (!isOpen) return null;

    const alertStyles = {
      success: { 
        bg: 'bg-green-50', 
        border: 'border-green-200', 
        icon: <CheckCircle2 className="w-6 h-6 text-green-600" />, 
        button: 'bg-green-600 hover:bg-green-700',
        text: 'text-green-800'
      },
      error: { 
        bg: 'bg-red-50', 
        border: 'border-red-200', 
        icon: <AlertCircle className="w-6 h-6 text-red-600" />, 
        button: 'bg-red-600 hover:bg-red-700',
        text: 'text-red-800'
      },
      warning: { 
        bg: 'bg-yellow-50', 
        border: 'border-yellow-200', 
        icon: <AlertCircle className="w-6 h-6 text-yellow-600" />, 
        button: 'bg-yellow-600 hover:bg-yellow-700',
        text: 'text-yellow-800'
      },
      info: { 
        bg: 'bg-blue-50', 
        border: 'border-blue-200', 
        icon: <Info className="w-6 h-6 text-blue-600" />, 
        button: 'bg-blue-600 hover:bg-blue-700',
        text: 'text-blue-800'
      }
    };

    const style = alertStyles[type] || alertStyles.info;

    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity backdrop-blur-sm" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className={`rounded-xl shadow-2xl border-2 ${style.bg} ${style.border} w-full max-w-md transform transition-all duration-300 scale-95 hover:scale-100`}>
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  {style.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${style.text} mb-2`}>{title}</h3>
                  <p className="text-gray-700 whitespace-pre-line text-sm sm:text-base">{message}</p>
                  
                  {showConfirm ? (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                      <button
                        onClick={onConfirm}
                        className={`px-4 sm:px-6 py-2 text-white rounded-lg transition ${style.button} font-medium text-sm sm:text-base`}
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={onClose}
                        className="px-4 sm:px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm sm:text-base"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={onClose}
                      className={`mt-4 px-4 sm:px-6 py-2 text-white rounded-lg transition ${style.button} font-medium text-sm sm:text-base`}
                    >
                      Aceptar
                    </button>
                  )}
                </div>
                {!showConfirm && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Componente del Modal
  const Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const modalConfig = modalComponents[currentModal];
    
    const renderModalContent = () => {
      if (modalConfig) {
        const ModalComponent = modalConfig.component;
        return <ModalComponent {...modalConfig.props} onClose={onClose} showAlert={showAlert} />;
      }
      
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-lightBlue rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-midBlue" />
          </div>
          <p className="text-midBlue text-lg">
            Contenido de {currentModal}
          </p>
        </div>
      );
    };

    return (
      <>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />
        
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-95 hover:scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-midBlue to-darkBlue px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {modalConfig?.title || currentModal}
              </h2>
              <button
                onClick={onClose}
                className="p-1 sm:p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>

            <div className="p-2 sm:p-4 lg:p-6 overflow-y-auto max-h-[80vh]">
              {renderModalContent()}
            </div>
          </div>
        </div>
      </>
    );
  };

  // CONTENIDO PRINCIPAL - Muestra las gráficas directamente
  const renderContent = () => {
    return <Graficas showAlert={showAlert} />;
  };

  return (
    <div className="min-h-screen flex bg-beige">
      {/* SIDEBAR */}
      <aside
        className={`bg-white border-r border-lightBlue shadow-lg transition-all duration-300 flex flex-col ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <img
                src="/src/assets/logo-relleno.png"
                alt="Logo"
                className="h-8 object-contain"
              />
              <span className="font-semibold text-darkBlue text-sm sm:text-base">Gestión de Proveedores</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-lightBlue transition"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-darkBlue" />
            ) : (
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-darkBlue" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.submenu) {
                    openModal(item.submenu[0].id);
                  } else {
                    openModal(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 sm:py-3 rounded-xl transition-all text-sm sm:text-base ${
                  currentModal === item.id ||
                  item.submenu?.some((s) => s.id === currentModal)
                    ? "bg-lightBlue text-darkBlue border border-midBlue"
                    : "text-darkBlue hover:bg-lightBlue"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${
                  currentModal === item.id ||
                  item.submenu?.some((s) => s.id === currentModal)
                    ? "bg-midBlue text-white"
                    : "bg-lightBlue text-darkBlue"
                }`}>
                  {item.icon}
                </div>
                {sidebarOpen && <span className="font-medium truncate">{item.title}</span>}
              </button>

              {sidebarOpen && item.submenu && (
                <div className="ml-4 mt-2 space-y-1 border-l border-lightBlue pl-3 sm:pl-4">
                  {item.submenu.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => openModal(sub.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                        currentModal === sub.id
                          ? "text-midBlue font-medium"
                          : "text-darkBlue hover:text-midBlue"
                      }`}
                    >
                      {sub.icon}
                      <span className="truncate">{sub.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white shadow-sm px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-darkBlue">
              Panel de Administración
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 hover:bg-lightBlue rounded-lg p-1 sm:p-2 transition"
              >
                <div className="text-right hidden sm:block">
                  <span className="text-sm font-medium text-darkBlue block">Administrador</span>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-midBlue text-white rounded-full flex items-center justify-center font-semibold shadow-lg text-sm sm:text-base">
                  A
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-lightBlue py-2 z-50">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-darkBlue hover:bg-lightBlue transition">
                    <LogOut className="w-4 h-4" />
                    <span>Salir</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto w-full">
            {renderContent()}
          </div>
        </section>
      </main>

      {/* MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
      />

      {/* ALERTAS CENTRADAS */}
      <Alert
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        showConfirm={alertConfig.showConfirm}
        onConfirm={alertConfig.onConfirm}
      />

      {/* ADVERTENCIA DE INACTIVIDAD */}
      <InactivityWarning
        show={showWarning}
        remainingSeconds={remainingSeconds}
        onExtend={extendSession}
        onLogout={logout}
      />

      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default DashboardAdmin;