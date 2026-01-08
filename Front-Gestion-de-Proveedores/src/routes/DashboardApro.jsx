import React, { useState, useEffect } from "react";
import { apiGet, apiPatch } from '../api';
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  BarChart,
  LogOut,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  FileCheck,
  FileX,
  Save,
  Edit,
  Eye,
  EyeOff
} from "lucide-react";

// Importar componentes
import Aprobacion from './Aprobacion';
import Graficas from './Graficas';
import Reportes from "./Reportes";
import SolicitudesAcceso from './SolicitudesAcceso';
import InactivityWarning from '../components/InactivityWarning';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const DEPT_OPTIONS = [
  { label: 'Sin asignar', value: 'SIN_ASIGNAR' },
  { label: 'RH', value: 'RH' },
  { label: 'Finanzas', value: 'FINANZAS' },
  { label: 'Compras', value: 'COMPRAS' },
  { label: 'TI', value: 'TI' },
  { label: 'Ventas', value: 'VENTAS' },
  { label: 'Marketing', value: 'MARKETING' },
  { label: 'Operaciones', value: 'OPERACIONES' },
  { label: 'Logística', value: 'LOGISTICA' },
  { label: 'Calidad', value: 'CALIDAD' },
  { label: 'Dirección General', value: 'DIRECCION_GENERAL' }
];

// Modal estable (fuera del componente principal)
function ModalShell({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-midBlue to-darkBlue px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 sm:p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
          <div className="p-0 overflow-y-auto max-h-[80vh]">{children}</div>
        </div>
      </div>
    </>
  );
}

function DashboardApro() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentModal, setCurrentModal] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ type: '', title: '', message: '', showConfirm: false, onConfirm: null });
  const [mostrarContraseña, setMostrarContraseña] = useState(false);

  const navigate = useNavigate();

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

  // DATOS DE PRUEBA PARA APROBACIONES
  const [aprobaciones, setAprobaciones] = useState([
    {
      id: 1,
      proveedorNombre: "Proveedor ABC",
      solicitud: "Alta de proveedor",
      estado: "Pendiente",
      fecha: "2024-01-15",
      comentario: ""
    },
    {
      id: 2,
      proveedorNombre: "Empresa XYZ",
      solicitud: "Modificación de datos",
      estado: "Pendiente",
      fecha: "2024-01-16",
      comentario: ""
    },
    {
      id: 3,
      proveedorNombre: "Comercial S.A.",
      solicitud: "Renovación de contrato",
      estado: "Aprobado",
      fecha: "2024-01-10",
      comentario: ""
    },
    {
      id: 4,
      proveedorNombre: "Servicios Técnicos",
      solicitud: "Alta de proveedor",
      estado: "Rechazado",
      fecha: "2024-01-12",
      comentario: "Documentación incompleta"
    }
  ]);

  const handleAprobacionChange = (nuevasAprobaciones) => {
    setAprobaciones(nuevasAprobaciones);
  };

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nombreCompleto: '',
    area: '',
    correoCorporativo: '',
    telefono: ''
  });

  const [originalForm, setOriginalForm] = useState(form);
  const [cargando, setCargando] = useState(true);

  // Función para mostrar alertas (DEBE ESTAR ANTES DEL useEffect)
  const showAlert = (type, title, message, showConfirm = false, onConfirm = null) => {
    setAlertConfig({ type, title, message, showConfirm, onConfirm });
    setAlertOpen(true);

    if ((type === 'success' || type === 'info') && !showConfirm) {
      setTimeout(() => {
        setAlertOpen(false);
      }, 4000);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await apiGet('/api/users/me');
        if (!mounted) return;
        const datos = {
          nombreCompleto: me.fullName || '',
          area: me.department || '',
          correoCorporativo: me.email || '',
          telefono: me.phone || ''
        };
        setForm(datos);
        setOriginalForm(datos);
      } catch {
        if (!mounted) return;
        showAlert('error', 'Error', 'No se pudieron cargar tus datos');
      } finally {
        if (mounted) setCargando(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onCancelar = () => {
    setForm(originalForm);
    setEditando(false);
  };

  const onGuardar = async () => {
    try {
      const updated = await apiPatch('/api/users/me', {
        fullName: form.nombreCompleto,
        department: form.area,
        phone: form.telefono
      });
      const datos = {
        nombreCompleto: updated.fullName || '',
        area: updated.department || '',
        correoCorporativo: updated.email || '',
        telefono: updated.phone || ''
      };
      setForm(datos);
      setOriginalForm(datos);
      setEditando(false);
      showAlert('success', 'Éxito', 'Datos actualizados correctamente');
    } catch {
      showAlert('error', 'Error', 'No se pudo guardar. Intenta de nuevo.');
    }
  };

  // MENÚ PARA APROBADOR
  const menuItems = [
    {
      id: "datos-aprobador",
      title: "Datos del Aprobador",
      icon: <User className="w-5 h-5" />,
    },
    {
      id: "revision-documentos",
      title: "Revisión de Documentos",
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      id: "solicitudes-acceso",
      title: "Solicitudes de Acceso",
      icon: <User className="w-5 h-5" />,
    },
    {
      id: "reportes",
      title: "Reportes",
      icon: <BarChart className="w-5 h-5" />,
      submenu: [
        { id: "facturas", title: "Facturas", icon: <FileCheck className="w-4 h-4" /> },
        { id: "ordenes-compra", title: "Órdenes de Compra", icon: <FileX className="w-4 h-4" /> },
      ],
    },
  ];

  // SISTEMA DE MAPEO DE COMPONENTES
  const modalComponents = {
    "revision-documentos": {
      component: Aprobacion,
      title: "Revisión de Documentos",
      props: {
        aprobaciones: aprobaciones,
        onAprobacionChange: handleAprobacionChange
      }
    },
    "solicitudes-acceso": {
      component: SolicitudesAcceso,
      title: "Solicitudes de Acceso",
      props: { showAlert }
    },
    "facturas": {
      component: Reportes,
      title: "Reporte de Facturas",
      props: { tipoReporte: "facturas" }
    },
    "ordenes-compra": {
      component: Reportes,
      title: "Reporte de Órdenes de Compra",
      props: { tipoReporte: "ordenes-compra" }
    },
    "datos-aprobador": {
      component: null,
      title: "Datos del Aprobador",
      props: {},
      renderDirect: true
    },
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

  // Renderizar contenido del modal
  const renderModalContent = () => {
    const modalConfig = modalComponents[currentModal];

    // CASO ESPECIAL: Datos del Aprobador
    if (currentModal === "datos-aprobador") {
      if (cargando) {
        return (
          <div className="p-4 sm:p-6 flex justify-center items-center">
            <div className="text-midBlue">Cargando datos...</div>
          </div>
        );
      }

      return (
        <div className="p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-darkBlue">Mis Datos</h2>
                <p className="text-midBlue text-sm sm:text-base">Actualiza tu información personal</p>
              </div>
              {!editando ? (
                <button
                  onClick={() => setEditando(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-midBlue text-white rounded-lg hover:bg-darkBlue transition text-sm sm:text-base w-full sm:w-auto"
                >
                  <Edit className="w-4 h-4" />
                  Editar Datos
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={onGuardar}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm sm:text-base flex-1 sm:flex-none"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                  <button
                    onClick={onCancelar}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm sm:text-base flex-1 sm:flex-none"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border border-lightBlue p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-darkBlue mb-2">
                      Nombre Completo *
                    </label>
                    {editando ? (
                      <input
                        type="text"
                        name="nombreCompleto"
                        value={form.nombreCompleto}
                        onChange={onChange}
                        className="w-full px-3 py-2 border border-lightBlue rounded-lg focus:ring-2 focus:ring-midBlue focus:border-midBlue text-darkBlue text-sm sm:text-base"
                        placeholder="Ingresa tu nombre completo"
                      />
                    ) : (
                      <div className="p-2 sm:p-3 bg-beige rounded-lg text-darkBlue text-sm sm:text-base">
                        {form.nombreCompleto || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-darkBlue mb-2">
                      Correo Corporativo
                    </label>
                    <input
                      type="email"
                      value={form.correoCorporativo}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-lg text-gray-600 cursor-not-allowed text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-darkBlue mb-2">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarContraseña ? "text" : "password"}
                        value="********"
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-lg text-gray-600 cursor-not-allowed pr-10 text-sm sm:text-base"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarContraseña(!mostrarContraseña)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {mostrarContraseña ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-darkBlue mb-2">
                      Área/Departamento *
                    </label>
                    {editando ? (
                      <select
                        name="area"
                        value={form.area}
                        onChange={onChange}
                        className="w-full px-3 py-2 border border-lightBlue rounded-lg focus:ring-2 focus:ring-midBlue focus:border-midBlue text-darkBlue text-sm sm:text-base"
                      >
                        <option value="">Selecciona tu área</option>
                        {DEPT_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-2 sm:p-3 bg-beige rounded-lg text-darkBlue text-sm sm:text-base">
                        {DEPT_OPTIONS.find(o => o.value === form.area)?.label || form.area || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-darkBlue mb-2">
                      Teléfono *
                    </label>
                    {editando ? (
                      <input
                        type="tel"
                        name="telefono"
                        value={form.telefono}
                        onChange={onChange}
                        className="w-full px-3 py-2 border border-lightBlue rounded-lg focus:ring-2 focus:ring-midBlue focus:border-midBlue text-darkBlue text-sm sm:text-base"
                        placeholder="+52 55 1234 5678"
                      />
                    ) : (
                      <div className="p-2 sm:p-3 bg-beige rounded-lg text-darkBlue text-sm sm:text-base">
                        {form.telefono || 'No especificado'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // OTROS COMPONENTES
    if (modalConfig && modalConfig.component) {
      const ModalComponent = modalConfig.component;
      return (
        <ModalComponent
          {...modalConfig.props}
          onClose={closeModal}
          showAlert={showAlert}
        />
      );
    }

    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-lightBlue rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-midBlue" />
        </div>
        <p className="text-midBlue text-base sm:text-lg">Contenido no disponible</p>
      </div>
    );
  };

  // Componente de Alertas Centradas
  const Alert = ({ isOpen, onClose, type, title, message, showConfirm = false, onConfirm }) => {
    if (!isOpen) return null;

    const alertStyles = {
      success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />,
        button: 'bg-green-600 hover:bg-green-700',
        text: 'text-green-800'
      },
      error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />,
        button: 'bg-red-600 hover:bg-red-700',
        text: 'text-red-800'
      },
      warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />,
        button: 'bg-yellow-600 hover:bg-yellow-700',
        text: 'text-yellow-800'
      },
      info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />,
        button: 'bg-blue-600 hover:bg-blue-700',
        text: 'text-blue-800'
      }
    };

    const style = alertStyles[type] || alertStyles.info;

    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity backdrop-blur-sm" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className={`rounded-xl shadow-2xl border-2 ${style.bg} ${style.border} w-full max-w-md`}>
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  {style.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`text-base sm:text-lg font-semibold ${style.text} mb-2`}>{title}</h3>
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
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // CONTENIDO PRINCIPAL
  const renderContent = () => {
    return <Graficas showAlert={showAlert} />;
  };

  return (
    <div className="min-h-screen flex bg-beige">
      {/* SIDEBAR */}
      <aside
        className={`bg-white border-r border-lightBlue shadow-lg transition-all duration-300 flex flex-col ${sidebarOpen ? "w-64" : "w-20"
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
              <span className="font-semibold text-darkBlue text-sm sm:text-base">Sistema de Aprobaciones</span>
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
                className={`w-full flex items-center gap-3 px-3 py-2 sm:py-3 rounded-xl transition-all text-sm sm:text-base ${currentModal === item.id ||
                    item.submenu?.some((s) => s.id === currentModal)
                    ? "bg-lightBlue text-darkBlue border border-midBlue"
                    : "text-darkBlue hover:bg-lightBlue"
                  }`}
              >
                <div className={`p-1.5 rounded-lg ${currentModal === item.id ||
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
                      className={`w-full flex items-center gap-2 px-2 py-1 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${currentModal === sub.id
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
              Dashboard de Aprobaciones
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 hover:bg-lightBlue rounded-lg p-1 sm:p-2 transition"
              >
                <div className="text-right hidden sm:block">
                  <span className="text-sm font-medium text-darkBlue block">Aprobador</span>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-midBlue text-white rounded-full flex items-center justify-center font-semibold shadow-lg text-sm sm:text-base">
                  AP
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
      <ModalShell
        isOpen={modalOpen}
        onClose={closeModal}
        title={(modalComponents[currentModal]?.title) || currentModal}
      >
        {renderModalContent()}
      </ModalShell>

      {/* ALERTAS */}
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

export default DashboardApro;