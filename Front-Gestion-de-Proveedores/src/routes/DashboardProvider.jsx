import React, { useState, useEffect } from "react";
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
  Upload,
  DollarSign,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Menu,
  Bell
} from "lucide-react";

// Importar los componentes reales
import GestionDatosPro from "./GestionDatosPro";
import OrdenCompraPro from "./OrdenCompraPro";
import DocumentosPro from "./DocumentosPro";
import EstatusPago from "./EstatusPago";
import InactivityWarning from '../components/InactivityWarning';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';
import logoImg from '../assets/logo-relleno.png';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function DashboardProvider() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentModal, setCurrentModal] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ type: '', title: '', message: '', showConfirm: false, onConfirm: null });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState({ realEvents: [], projectedEvents: [] });
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [showNotifFeed, setShowNotifFeed] = useState(false);

  const navigate = useNavigate();

  // Hook de inactividad (30 min timeout, 2 min warning)
  const { showWarning, remainingSeconds, extendSession, logout } = useInactivityTimeout(30, 2);

  // Función para cargar notificaciones
  const loadNotifications = () => {
    fetch(`${API_BASE}/api/notifications?unread=1`, { credentials: 'include' })
      .then(r => {
        if (!r.ok) {
          console.warn('No se pudieron cargar notificaciones (requiere sesión activa)');
          return [];
        }
        return r.json();
      })
      .then(data => {
        setNotifs(data);
      })
      .catch(err => {
        console.error('Error cargando notificaciones:', err);
      });
  };

  // Cargar notificaciones al montar y cada 800 segundos
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 800000); // Actualizar cada 800 segundos
    return () => clearInterval(interval);
  }, []);

  // Cargar eventos del calendario
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      setLoadingEvents(true);
      try {
        const year = currentMonth.getFullYear();
        const monthIndex = currentMonth.getMonth();
        const monthParam = `${year}-${String(monthIndex + 1).padStart(2,'0')}`;
        const params = { month: monthParam };

        const response = await axios.get(`${API_BASE}/api/calendar`, { params, withCredentials: true });

        setCalendarEvents({ realEvents: response.data.realEvents || [], projectedEvents: response.data.projectedEvents || [] });
      } catch (error) {
        console.error('Error al cargar eventos del calendario:', error);
        // Si falla, mostrar solo proyecciones
        setCalendarEvents({
          realEvents: [],
          projectedEvents: generateProjectedEvents(currentMonth.getFullYear(), currentMonth.getMonth())
        });
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchCalendarEvents();
  }, [currentMonth]);

  // Verificar proveedor de la sesión en el backend (auto-detecta provider)
  useEffect(() => {
    const verifySessionProvider = async () => {
      try {
        await fetch(`${API_BASE}/api/providers/me`, { credentials: 'include' });
      } catch (err) {
        console.error('Error verificando sesión de proveedor:', err);
      }
    };
    verifySessionProvider();
  }, []);

  // Función auxiliar para generar eventos proyectados en frontend
  const generateProjectedEvents = (year, month) => {
    const events = [];
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    // Cierre de factura - día 15
    let invoiceDay = 15;
    if (invoiceDay <= lastDay) {
      events.push({
        id: 'projected-invoice',
        type: 'invoice',
        date: new Date(year, month, invoiceDay),
        title: 'Fecha límite factura',
        color: 'yellow',
        isReal: false
      });
    }
    
    // Fin de recepción - último lunes del mes
    let lastMonday = new Date(year, month + 1, 0);
    while (lastMonday.getDay() !== 1) {
      lastMonday.setDate(lastMonday.getDate() - 1);
    }
    
    if (lastMonday.getMonth() === month) {
      events.push({
        id: 'projected-reception',
        type: 'purchaseOrder',
        date: lastMonday,
        title: 'Fecha límite recepción',
        color: 'red',
        isReal: false
      });
    }
    
    return events;
  };

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

  // DATOS DEL PROVEEDOR
  const [datosProveedor] = useState({
    nombreEmpresa: "Tecnología S.A. de C.V.",
  });

  // DATOS PARA LAS GRÁFICAS
  const [chartData, setChartData] = useState({
    facturas: { retrasadas: 0, cerradas: 0, "volumen activo": 0 },
    contratos: { nuevos: 0, "en aviso": 0, vencidos: 0 },
    ordenesCompra: { retrasadas: 0, cerradas: 0, "volumen activo": 0 },
  });

  // Cargar estadísticas del proveedor
  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/analytics/provider-dashboard`, {
          withCredentials: true
        });
        setChartData(response.data);
      } catch (error) {
        console.error('Error cargando estadísticas del proveedor:', error);
      }
    };

    cargarEstadisticas();
  }, []);

  // MENÚ PARA PROVEEDOR
  const menuItems = [
    { id: "gestion-datos", title: "Gestión de Datos", icon: <User className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: "ordenes-compra", title: "Órdenes de Compra", icon: <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: "carga-documentos", title: "Carga de Documentos", icon: <Upload className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: "gestion-pagos", title: "Gestión de Estatus de Pago", icon: <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ];

  // --- FUNCIONES DEL CALENDARIO ---
  const obtenerEventosDelMes = (mes, año) => {
    const eventos = {};
    
    // Combinar eventos reales y proyectados
    const allEvents = [...calendarEvents.realEvents, ...calendarEvents.projectedEvents];
    
    allEvents.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate.getMonth() === mes && eventDate.getFullYear() === año) {
        const day = eventDate.getDate();
        
        if (!eventos[day]) {
          eventos[day] = [];
        }
        
        // Mapear colores del backend a nombres
        const colorMap = {
          'blue': 'azul',
          'indigo': 'indigo',
          'yellow': 'amarillo',
          'red': 'rojo',
          'green': 'verde',
          'orange': 'naranja',
          'violet': 'violeta',
          'gray': 'gris'
        };
        
        eventos[day].push({
          tipo: event.isReal ? 'real' : 'proyectado',
          evento: event.title,
          color: colorMap[event.color] || event.color,
          descripcion: event.description,
          eventType: event.type,
          severity: event.severity
        });
      }
    });
    
    return eventos;
  };

  // --- FUNCIONES DE GRÁFICAS ---
  const getChartColors = (chartType, labels) => {
    const colorMap = {
      verde: '#10b981',
      rojo: '#ef4444',
      amarillo: '#f59e0b',
      azul: '#3b82f6', 
    };

    const colorRules = {
      facturas: {
        'retrasadas': colorMap.rojo,
        'cerradas': colorMap.verde,
        'volumen activo': colorMap.amarillo
      },
      contratos: {
        'nuevos': colorMap.verde,
        'en aviso': colorMap.amarillo,
        'vencidos': colorMap.rojo
      },
      ordenesCompra: {
        'retrasadas': colorMap.rojo,
        'cerradas': colorMap.verde,
        'volumen activo': colorMap.amarillo
      }
    };

    return labels.map(label => colorRules[chartType]?.[label] || '#6b7280');
  };

  // --- COMPONENTES DE GRÁFICAS ---
  const PieChart = ({ data, title, chartType }) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    const labels = Object.keys(data);
    const colors = getChartColors(chartType, labels);
    
    // Si no hay datos, mostrar mensaje
    if (total === 0) {
      return (
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl border border-lightBlue shadow-lg">
          <h3 className="text-base sm:text-lg font-semibold text-darkBlue mb-3 sm:mb-4 text-center">{title}</h3>
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            Sin datos disponibles
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl border border-lightBlue shadow-lg">
        <h3 className="text-base sm:text-lg font-semibold text-darkBlue mb-3 sm:mb-4 text-center">{title}</h3>
        <div className="flex flex-col lg:flex-row items-center gap-3 sm:gap-4 md:gap-6">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              {Object.values(data).map((value, index) => {
                const percentage = (value / total) * 100;
                const strokeDasharray = `${percentage} ${100 - percentage}`;
                const previousPercentages = Object.values(data)
                  .slice(0, index)
                  .reduce((sum, val) => sum + (val / total) * 100, 0);
                const strokeDashoffset = 100 - previousPercentages;

                return (
                  <circle
                    key={index}
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="transparent"
                    stroke={colors[index]}
                    strokeWidth="3"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={isNaN(strokeDashoffset) ? 0 : strokeDashoffset}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-darkBlue">{total}</span>
              <span className="text-xs text-midBlue">Total</span>
            </div>
          </div>

          <div className="flex-1 space-y-2 sm:space-y-3 min-w-0 w-full">
            {Object.entries(data).map(([key, value], index) => {
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div 
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: colors[index] }}
                    />
                    <span className="text-xs text-darkBlue capitalize truncate">{key}:</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="text-xs font-semibold text-midBlue block">{value}</span>
                    <span className="text-xs text-midBlue">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // --- COMPONENTE CALENDARIO ---
  const Calendario = () => {
    const navegarMes = (direccion) => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direccion, 1));
    };

    const obtenerDiasDelMes = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const ultimoDia = new Date(year, month + 1, 0);
      const dias = [];
      
      for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const fecha = new Date(year, month, dia);
        const diaSemana = fecha.getDay();
        if (diaSemana >= 1 && diaSemana <= 5) {
          const eventosMes = obtenerEventosDelMes(month, year);
          dias.push({
            fecha: dia,
            diaSemana,
            eventos: eventosMes[dia] || [],
          });
        }
      }
      return dias;
    };

    const obtenerNombreMes = () => 
      currentMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

    const obtenerColorFondoEvento = (color, esReal) => {
      const colores = { 
        verde: esReal ? 'bg-green-500 text-white border-green-600' : 'bg-green-100 text-green-700 border-2 border-dashed border-green-500',
        amarillo: esReal ? 'bg-yellow-500 text-white border-yellow-600' : 'bg-yellow-100 text-yellow-700 border-2 border-dashed border-yellow-500', 
        rojo: esReal ? 'bg-red-500 text-white border-red-600' : 'bg-red-100 text-red-700 border-2 border-dashed border-red-500',
        azul: esReal ? 'bg-blue-500 text-white border-blue-600' : 'bg-blue-100 text-blue-700 border-2 border-dashed border-blue-500',
        indigo: esReal ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-indigo-100 text-indigo-700 border-2 border-dashed border-indigo-500',
        naranja: esReal ? 'bg-orange-500 text-white border-orange-600' : 'bg-orange-100 text-orange-700 border-2 border-dashed border-orange-500',
        violeta: esReal ? 'bg-violet-500 text-white border-violet-600' : 'bg-violet-100 text-violet-700 border-2 border-dashed border-violet-500',
        gris: esReal ? 'bg-gray-500 text-white border-gray-600' : 'bg-gray-100 text-gray-700 border-2 border-dashed border-gray-500'
      };
      return colores[color] || (esReal ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-700 border-2 border-dashed border-gray-500');
    };

    const obtenerTooltipEventos = (eventos) => {
      if (!eventos || eventos.length === 0) return '';
      return eventos.map(e => `${e.evento}${e.descripcion ? ' - ' + e.descripcion : ''}`).join('\n');
    };

    const dias = obtenerDiasDelMes();

    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-midBlue rounded-lg">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-darkBlue">Calendario - {obtenerNombreMes()}</h3>
          </div>
          
          <div className="flex items-center gap-2 self-center">
            <button
              onClick={() => navegarMes(-1)}
              className="p-1 sm:p-2 hover:bg-lightBlue rounded-lg transition"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-darkBlue" />
            </button>
            <button
              onClick={() => navegarMes(1)}
              className="p-1 sm:p-2 hover:bg-lightBlue rounded-lg transition"
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-darkBlue" />
            </button>
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 justify-center bg-gradient-to-r from-lightBlue to-beige rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-xs text-darkBlue font-medium">OC creada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full" />
            <span className="text-xs text-darkBlue font-medium">OC aprobada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-xs text-darkBlue font-medium">Factura</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-xs text-darkBlue font-medium">Recepcion</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-xs text-darkBlue font-medium">Pago</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-xs text-darkBlue font-medium">Deadline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-violet-500 rounded-full" />
            <span className="text-xs text-darkBlue font-medium">Recordatorio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
            <span className="text-xs text-darkBlue font-medium">Proyectado</span>
          </div>
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-1 sm:gap-2">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map((dia) => (
            <div key={dia} className="text-center text-xs sm:text-sm font-semibold text-darkBlue py-1 border-b border-lightBlue">
              {dia}
            </div>
          ))}
          
          {dias.map(({ fecha, diaSemana, eventos }) => {
            const esHoy = fecha === new Date().getDate() && 
                          currentMonth.getMonth() === new Date().getMonth() &&
                          currentMonth.getFullYear() === new Date().getFullYear();
            const tieneEventos = eventos.length > 0;
            const primerEvento = tieneEventos ? eventos[0] : null;
            const esReal = primerEvento?.tipo === 'real';
            const multipleEventos = eventos.length > 1;
            
            return (
              <div
                key={fecha}
                className={`border rounded-lg p-1 sm:p-2 min-h-[50px] xs:min-h-[60px] sm:min-h-[70px] md:min-h-[80px] transition-colors cursor-pointer ${
                  tieneEventos 
                    ? `${obtenerColorFondoEvento(primerEvento.color, esReal)}` 
                    : `border-lightBlue ${esHoy ? 'bg-blue-50 border-blue-300' : 'hover:bg-beige'}`
                }`}
                title={obtenerTooltipEventos(eventos)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-semibold ${
                    esHoy && !tieneEventos 
                      ? 'bg-blue-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[8px] sm:text-[10px]' 
                      : tieneEventos && esReal
                      ? 'text-white'
                      : tieneEventos && !esReal
                      ? ''
                      : 'text-darkBlue'
                  }`}>
                    {fecha}
                  </span>
                  <span className={`text-[8px] sm:text-[10px] ${
                    tieneEventos && esReal ? 'text-white opacity-80' : tieneEventos && !esReal ? 'opacity-70' : 'text-midBlue'
                  }`}>
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][diaSemana]}
                  </span>
                </div>
                {multipleEventos && (
                  <div className={`text-[8px] sm:text-[10px] mt-1 ${
                    esReal ? 'text-white opacity-90' : 'opacity-80'
                  }`}>
                    +{eventos.length - 1} más
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- CONTENIDO PRINCIPAL ---
  const DashboardContent = () => (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header del Dashboard */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-darkBlue mb-2 sm:mb-3">Dashboard de Proveedor</h1>
          <p className="text-midBlue text-sm sm:text-base md:text-lg">Resumen completo de actividades y métricas</p>
        </div>

        {/* Sección de Métricas */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-darkBlue mb-3 sm:mb-4 md:mb-6 text-center">Resumen de Desempeño</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
            <PieChart title="Facturas" data={chartData.facturas} chartType="facturas" />
            <PieChart title="Contratos" data={chartData.contratos} chartType="contratos" />
            <PieChart title="Órdenes de Compra" data={chartData.ordenesCompra} chartType="ordenesCompra" />
          </div>
        </div>

        {/* Sección de Calendario */}
        <div>
          <Calendario />
        </div>
      </div>
    </div>
  );

  // --- SISTEMA DE MODALES ---
  const modalComponents = {
    "gestion-datos": { component: GestionDatosPro, title: "Gestión de Datos" },
    "ordenes-compra": { component: OrdenCompraPro, title: "Órdenes de Compra" },
    "carga-documentos": { component: DocumentosPro, title: "Carga de Documentos" },
    "gestion-pagos": { component: EstatusPago, title: "Gestión de Estatus de Pago" },
  };

  const openModal = (sectionId) => {
    setCurrentModal(sectionId);
    setModalOpen(true);
    setMobileMenuOpen(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentModal("");
  };

  // --- COMPONENTE MODAL ---
  const Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const modalConfig = modalComponents[currentModal];
    
    const renderModalContent = () => {
      if (modalConfig && modalConfig.component) {
        const ModalComponent = modalConfig.component;
        return <ModalComponent />;
      }
      
      return (
        <div className="text-center py-6 sm:py-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-lightBlue rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-midBlue" />
          </div>
          <p className="text-midBlue text-base sm:text-lg">{modalConfig?.title || "Contenido no disponible"}</p>
          <p className="text-darkBlue mt-1 sm:mt-2 text-sm sm:text-base">Esta funcionalidad estará disponible próximamente</p>
        </div>
      );
    };

    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity backdrop-blur-sm" onClick={onClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-full sm:max-w-4xl md:max-w-6xl max-h-[90vh] sm:max-h-[85vh] md:max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-95 hover:scale-100" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-midBlue to-darkBlue px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex justify-between items-center">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white">{modalConfig?.title || currentModal}</h2>
              <button onClick={onClose} className="p-1 sm:p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>
            <div className="p-0 overflow-y-auto max-h-[calc(90vh-60px)] sm:max-h-[calc(85vh-70px)] md:max-h-[80vh]">{renderModalContent()}</div>
          </div>
        </div>
      </>
    );
  };

  // --- RENDER PRINCIPAL ---
  return (
    <div className="min-h-screen flex bg-beige">
      {/* SIDEBAR PARA ESCRITORIO */}
      <aside className={`bg-white border-r border-lightBlue shadow-lg transition-all duration-300 flex-col hidden md:flex ${
        sidebarOpen ? "w-64" : "w-16"
      }`}>
        <div className="flex items-center justify-between px-4 py-4">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="Logo" className="h-8 object-contain" />
              <span className="font-semibold text-darkBlue">Portal Proveedores</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-lightBlue transition">
            {sidebarOpen ? <ChevronLeft className="w-5 h-5 text-darkBlue" /> : <ChevronRight className="w-5 h-5 text-darkBlue" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button onClick={() => openModal(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                currentModal === item.id ? "bg-lightBlue text-darkBlue border border-midBlue" : "text-darkBlue hover:bg-lightBlue"
              }`}>
                <div className={`p-1.5 rounded-lg ${
                  currentModal === item.id ? "bg-midBlue text-white" : "bg-lightBlue text-darkBlue"
                }`}>
                  {item.icon}
                </div>
                {sidebarOpen && <span className="text-sm font-medium">{item.title}</span>}
              </button>
            </div>
          ))}
        </nav>
      </aside>

      {/* SIDEBAR MÓVIL */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-lightBlue shadow-lg z-40 md:hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <img src="/src/assets/logo-relleno.png" alt="Logo" className="h-8 object-contain" />
                <span className="font-semibold text-darkBlue">Portal Proveedores</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-lightBlue transition">
                <X className="w-5 h-5 text-darkBlue" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {menuItems.map((item) => (
                <div key={item.id}>
                  <button onClick={() => openModal(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                    currentModal === item.id ? "bg-lightBlue text-darkBlue border border-midBlue" : "text-darkBlue hover:bg-lightBlue"
                  }`}>
                    <div className={`p-1.5 rounded-lg ${
                      currentModal === item.id ? "bg-midBlue text-white" : "bg-lightBlue text-darkBlue"
                    }`}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium">{item.title}</span>
                  </button>
                </div>
              ))}
            </nav>
          </aside>
        </>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-lightBlue transition"
            >
              <Menu className="w-5 h-5 text-darkBlue" />
            </button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-darkBlue">Bienvenido</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Campana de notificaciones */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifFeed(v => !v);
                  if (!showNotifFeed) loadNotifications(); // Recargar al abrir
                }} 
                className="relative p-2 bg-white rounded-full shadow hover:bg-gray-50 transition"
              >
                <Bell size={20} className="text-darkBlue" />
                {notifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{notifs.length}</span>
                )}
              </button>
              {showNotifFeed && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto bg-white shadow-xl rounded-lg border border-gray-200 z-50">
                  <div className="flex justify-between items-center p-3 border-b">
                    <span className="font-semibold text-darkBlue">Notificaciones</span>
                    <button className="text-blue-600 text-sm hover:underline" onClick={async () => {
                      const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
                        method: 'PATCH',
                        credentials: 'include'
                      });
                      if (!res.ok) {
                        console.error('Error marcar todas como leídas:', res.status);
                        return;
                      }
                      setNotifs([]);
                      setShowNotifFeed(false);
                      loadNotifications(); // Recargar después de marcar como leídas
                    }}>Marcar todas como leídas</button>
                  </div>
                  <div className="p-2 max-h-80 overflow-y-auto">
                    {notifs.length === 0 ? (
                      <div className="text-sm text-gray-500 text-center py-4">Sin nuevas notificaciones</div>
                    ) : (
                      notifs.map(n => {
                        const isDoc = n.entityType === 'DOCUMENT';
                        const badge = isDoc ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800';
                        return (
                          <div key={n.id} className="border rounded-lg p-3 mb-2 hover:bg-gray-50 transition flex items-start gap-3">
                            <div className={`px-2 py-1 text-xs font-medium rounded ${badge}`}>{isDoc ? 'Documento' : 'Orden'}</div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-gray-900">{n.title}</div>
                              <div className="text-sm text-gray-700">{n.message}</div>
                              <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 hover:bg-lightBlue rounded-lg p-1 sm:p-2 transition">
                <div className="text-right hidden xs:block">
                  <span className="text-xs sm:text-sm font-medium text-darkBlue block">Proveedor</span>
                  <span className="text-xs text-midBlue truncate max-w-[100px] sm:max-w-none">{datosProveedor.nombreEmpresa}</span>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-midBlue text-white rounded-full flex items-center justify-center font-semibold shadow-lg text-xs sm:text-sm">PR</div>
              </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-lightBlue py-2 z-50">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 text-sm text-darkBlue hover:bg-lightBlue transition">
                  <LogOut className="w-4 h-4" />
                  <span>Salir</span>
                </button>
              </div>
              )}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto">
          <DashboardContent />
        </section>
      </main>      {/* MODAL */}
      <Modal isOpen={modalOpen} onClose={closeModal} />

      {/* ADVERTENCIA DE INACTIVIDAD */}
      <InactivityWarning
        show={showWarning}
        remainingSeconds={remainingSeconds}
        onExtend={extendSession}
        onLogout={logout}
      />

      {userMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />}
    </div>
  );
}

export default DashboardProvider;