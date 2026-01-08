import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X, AlertTriangle, Clock, User, Bell } from "lucide-react";

const getFechaActual = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
};

function GestionProveedores({ mode, onClose }) {

  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');

  // Estados para los formularios
  const [formAlta, setFormAlta] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    direccionFiscal: "",
    rfc: "",
    cuentaClabe: "",
    banco: "",
    observaciones: "",
    tipoProveedor: "fisica"
  });

  const [formModificacion, setFormModificacion] = useState({
    busqueda: "",
    providerId: null,
    originalProviderData: null,
    nombre: "",
    correo: "",
    telefono: "",
    direccionFiscal: "",
    rfc: "",
    cuentaClabe: "",
    banco: "",
    observaciones: "",
    tipoProveedor: "fisica",
    newPassword: "",
    confirmPassword: "",
    cambiosRealizados: [],
    ultimaModificacion: null
  });

  const [passwordError, setPasswordError] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
  if (formModificacion.newPassword || formModificacion.confirmPassword) {
    if (formModificacion.newPassword.length > 0 && formModificacion.newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
    } else {
      setPasswordError('');
    }

    setPasswordsMatch(
      formModificacion.newPassword === formModificacion.confirmPassword ||
      formModificacion.confirmPassword === ''
    );
  } else {
    setPasswordError('');
    setPasswordsMatch(true);
  }
}, [formModificacion.newPassword, formModificacion.confirmPassword]);


  const [formBaja, setFormBaja] = useState({
    searchTerm: '',
    selectedProvider: null,
    fechaBaja: getFechaActual(),
    motivoBaja: "",
    notas: ""
  });

  // Estado para alertas internas
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ 
    type: '', 
    title: '', 
    message: '', 
    showConfirm: false, 
    onConfirm: null 
  });

  const [proveedorEncontrado, setProveedorEncontrado] = useState(false);

  // Estado para notificaciones (SOLO para solicitudes de alta)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      tipo: "solicitud",
      mensaje: "Nueva solicitud de proveedor",
      datos: {
        rfc: "TASA123456789",
        correo: "contacto@tecnologia-avanzada.com",
        nombre: "Tecnología Avanzada SA",
        tipoProveedor: "moral",
        fecha: "2024-01-19 10:15:30"
      },
      leida: true
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Estados para validación de CLABE
  const [clabeErrorAlta, setClabeErrorAlta] = useState(false);
  const [clabeErrorModificacion, setClabeErrorModificacion] = useState(false);

  // Efecto para establecer la fecha actual por defecto en el formulario de baja
  useEffect(() => {
    if (mode === "baja") {
      setFormBaja(prev => ({
        ...prev,
        fechaBaja: getFechaActual()
      }));
    }
  }, [mode]);

  // Efecto para validar CLABE en modo alta
  useEffect(() => {
    if (formAlta.cuentaClabe && formAlta.cuentaClabe.length > 0) {
      const clabeLimpio = formAlta.cuentaClabe.replace(/\s/g, '');
      setClabeErrorAlta(clabeLimpio.length !== 18);
    } else {
      setClabeErrorAlta(false);
    }
  }, [formAlta.cuentaClabe]);

  // Efecto para validar CLABE en modo modificación
  useEffect(() => {
    if (formModificacion.cuentaClabe && formModificacion.cuentaClabe.length > 0) {
      const clabeLimpio = formModificacion.cuentaClabe.replace(/\s/g, '');
      setClabeErrorModificacion(clabeLimpio.length !== 18);
    } else {
      setClabeErrorModificacion(false);
    }
  }, [formModificacion.cuentaClabe]);

  // Datos de ejemplo para proveedores (simulando base de datos)
  const [proveedores, setProveedores] = useState([
    {
      id: 1,
      nombre: "Tecnología Avanzada SA",
      correo: "contacto@tecnologia-avanzada.com",
      telefono: "+52 55 1234 5678",
      direccionFiscal: "Av. Reforma 123, CDMX",
      rfc: "TASA123456789",
      cuentaClabe: "012180001234567890",
      banco: "Banco Nacional",
      observaciones: "Excelente servicio, entrega puntual",
      tipoProveedor: "moral",
      password: "password123",
      versiones: [
        {
          version: 1,
          fecha: "2024-01-15",
          usuario: "admin",
          cambios: "Registro inicial"
        },
        {
          version: 2,
          fecha: "2024-01-18",
          usuario: "admin",
          cambios: "Teléfono actualizado, Observaciones actualizadas"
        }
      ]
    }
  ]);

  // Función para mostrar alertas
  const showAlert = (type, title, message, showConfirm = false, onConfirm = null) => {
    setAlertConfig({ type, title, message, showConfirm, onConfirm });
    setAlertOpen(true);
    
    if ((type === 'success' || type === 'info') && !showConfirm) {
      setTimeout(() => {
        setAlertOpen(false);
      }, 4000);
    }
  };

  // Función para agregar notificación de solicitud (SOLO para altas)
  const agregarNotificacionSolicitud = (rfc, correo, nombre, tipoProveedor) => {
    const nuevaNotificacion = {
      id: Date.now(),
      tipo: "solicitud",
      mensaje: "Nueva solicitud de proveedor",
      datos: {
        rfc,
        correo,
        nombre,
        tipoProveedor,
        fecha: new Date().toLocaleString()
      },
      leida: false
    };
    
    setNotifications(prev => [nuevaNotificacion, ...prev]);
  };

  // Función para marcar notificación como leída
  const marcarComoLeida = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, leida: true } : notif
      )
    );
  };

  // Componente de Campana de Notificaciones (SOLO para solicitudes - solo visible en modo alta)
  const CampanaNotificaciones = () => {
    const notificacionesNoLeidas = notifications.filter(n => !n.leida).length;

    return (
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`relative p-2 transition-all duration-300 ${
            notificacionesNoLeidas > 0 
              ? 'text-red-500 hover:text-red-600 transform hover:scale-110' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative">
            <Bell className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 ${
              notificacionesNoLeidas > 0 ? 'animate-bounce' : ''
            }`} />
            
            {notificacionesNoLeidas > 0 && (
              <div className="absolute inset-0 bg-red-400 rounded-full opacity-20 animate-ping"></div>
            )}
          </div>
          
          {notificacionesNoLeidas > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
              {notificacionesNoLeidas}
            </span>
          )}
        </button>

        {showNotifications && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowNotifications(false)}
            />
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Solicitudes de Alta</h3>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                  {notificacionesNoLeidas} nuevas
                </span>
              </div>
              
              <div className="max-h-64 sm:max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No hay solicitudes pendientes
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notif.leida ? 'bg-red-50 border-l-4 border-l-red-500' : ''
                      }`}
                      onClick={() => marcarComoLeida(notif.id)}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mt-1.5 flex-shrink-0 ${
                          !notif.leida ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              !notif.leida 
                                ? 'bg-red-100 text-red-800 border border-red-200' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {!notif.leida ? 'Nueva Solicitud' : 'Solicitud'}
                            </span>
                            <span className="text-xs text-gray-500">{notif.datos.fecha}</span>
                          </div>
                          
                          <p className={`font-medium text-xs sm:text-sm mb-2 ${
                            !notif.leida ? 'text-red-700' : 'text-gray-800'
                          }`}>
                            {notif.datos.nombre}
                          </p>
                          
                          <div className="text-xs text-gray-600 space-y-1">
                            <div><strong className="text-gray-700">RFC:</strong> {notif.datos.rfc}</div>
                            <div><strong className="text-gray-700">Correo:</strong> {notif.datos.correo}</div>
                            <div><strong className="text-gray-700">Tipo:</strong> {notif.datos.tipoProveedor === 'fisica' ? 'Persona Física' : 'Persona Moral'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-2 sm:p-3 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, leida: true })))}
                    className="w-full text-center text-xs text-red-600 hover:text-red-800 font-medium py-2 hover:bg-red-50 rounded transition-colors"
                  >
                    Marcar todas como leídas
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // Componente de Alertas Interno
  const Alert = () => {
    if (!alertOpen) return null;

    const alertStyles = {
      success: { 
        bg: 'bg-green-50', 
        border: 'border-green-200', 
        icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />, 
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
        icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />, 
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

    const style = alertStyles[alertConfig.type] || alertStyles.info;

    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity backdrop-blur-sm" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className={`rounded-xl shadow-2xl border-2 ${style.bg} ${style.border} w-full max-w-md transform transition-all duration-300 scale-95 hover:scale-100`}>
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  {style.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`text-base sm:text-lg font-semibold ${style.text} mb-2`}>
                    {alertConfig.title}
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line text-sm sm:text-base">
                    {alertConfig.message}
                  </p>
                  
                  {alertConfig.showConfirm ? (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                      <button
                        onClick={alertConfig.onConfirm}
                        className={`px-4 sm:px-6 py-2 text-white rounded-lg transition ${style.button} font-medium text-sm sm:text-base`}
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setAlertOpen(false)}
                        className="px-4 sm:px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm sm:text-base"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAlertOpen(false)}
                      className={`mt-4 px-4 sm:px-6 py-2 text-white rounded-lg transition ${style.button} font-medium text-sm sm:text-base`}
                    >
                      Aceptar
                    </button>
                  )}
                </div>
                {!alertConfig.showConfirm && (
                  <button
                    onClick={() => setAlertOpen(false)}
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

  // Función para buscar proveedor en modificación
  const buscarProveedor = async () => {
  const rfc = (formModificacion.busqueda || '').trim().toUpperCase();
  if (!RFC_REGEX.test(rfc)) {
    showAlert('error', 'RFC inválido', 'Ingrese un RFC válido (12/13 caracteres)');
    return;
  }
  try {
    const resp = await fetch(`${API_BASE}/api/providers/by-rfc/${encodeURIComponent(rfc)}`, {
      credentials: 'include'
    });
    if (resp.status === 404) {
      setFormModificacion(prev => ({ ...prev, providerId: null, selectedProvider: null }));
      setProveedorEncontrado(false);
      showAlert('info', 'No encontrado', 'No existe un proveedor activo con ese RFC');
      return;
    }
    if (!resp.ok) throw new Error('Error al buscar proveedor');
    const data = await resp.json();
    const p = data.provider;

    // Buscar detalles adicionales (cuenta bancaria)
    const detailResp = await fetch(`${API_BASE}/api/providers/id/${p.id}`, { credentials: 'include' });
    if (!detailResp.ok) throw new Error('Error al obtener detalles');
    const detailData = await detailResp.json();
    const fullProvider = detailData.provider;

    setFormModificacion(prev => ({
      ...prev,
      providerId: p.id,
      originalProviderData: {
        businessName: p.businessName || '',
        emailContacto: p.emailContacto || '',
        telefono: p.telefono || '',
        direccionFiscal: p.direccionFiscal || '',
        observaciones: p.observaciones || '',
        bankName: fullProvider.bankAccounts?.[0]?.bankName || '',
        clabe: fullProvider.bankAccounts?.[0]?.clabe || '',
        rfc: p.rfc || ''
      },
      nombre: p.businessName || '',
      correo: p.emailContacto || '',
      telefono: p.telefono || '',
      direccionFiscal: p.direccionFiscal || '',
      rfc: p.rfc || '',
      cuentaClabe: fullProvider.bankAccounts?.[0]?.clabe || '',
      banco: fullProvider.bankAccounts?.[0]?.bankName || '',
      observaciones: p.observaciones || '',
      ultimaModificacion: {
        version: 1,
        fecha: new Date(p.updatedAt || Date.now()).toLocaleDateString('es-MX'),
        usuario: "Sistema",
        cambios: "Datos actuales"
      }
    }));
    setProveedorEncontrado(true);
    showAlert('success', 'Proveedor Encontrado', p.businessName);
  } catch (err) {
    showAlert('error', 'Error', err.message);
    setProveedorEncontrado(false);
  }
};

  // Handlers para Alta
  const handleAltaChange = (e) => {
    const { name, value } = e.target;
    setFormAlta(prev => ({ ...prev, [name]: value }));
  };

  const handleAltaSubmit = async (e) => {
    e.preventDefault();

    // Validar CLABE si se ingresó
    if (formAlta.cuentaClabe && formAlta.cuentaClabe.length > 0) {
      const clabeLimpio = formAlta.cuentaClabe.replace(/\s/g, '');
      if (clabeLimpio.length !== 18) {
        showAlert('error', 'Error en CLABE', 'La cuenta CLABE debe tener exactamente 18 dígitos');
        return;
      }
    }

    const cleanValue = (val) => {
      if (typeof val === 'string') {
        const trimmed = val.trim();
        return trimmed === '' ? undefined : trimmed;
      }
      return val;
    };

    const payload = {
      businessName: cleanValue(formAlta.nombre),
      rfc: cleanValue(formAlta.rfc)?.toUpperCase(),
      emailContacto: cleanValue(formAlta.correo),
      telefono: cleanValue(formAlta.telefono),
      direccionFiscal: cleanValue(formAlta.direccionFiscal),
      observaciones: cleanValue(formAlta.observaciones),
      bankName: cleanValue(formAlta.banco),
      clabe: cleanValue(formAlta.cuentaClabe),
      // Mapear tipoProveedor a personType para backend
      personType: formAlta.tipoProveedor === 'fisica' ? 'FISICA' : 'MORAL',
      tipoProveedor: formAlta.tipoProveedor // compatibilidad si backend lo usa
    };

    try {
      const resp = await fetch(`${API_BASE}/api/providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const contentType = resp.headers.get('content-type');
      const data = contentType?.includes('application/json') 
        ? await resp.json() 
        : { message: await resp.text() };

      if (!resp.ok) {
        const issuesMsg = Array.isArray(data?.issues) 
          ? data.issues.map(i => i.message).join(', ') 
          : undefined;
        const errorMsg = data?.message || issuesMsg || `Error ${resp.status}`;
        return showAlert('error', 'Error en la Solicitud', errorMsg);
      }

      agregarNotificacionSolicitud(
        formAlta.rfc,
        formAlta.correo,
        formAlta.nombre,
        formAlta.tipoProveedor
      );

      if (data.passwordSent) {
        showAlert('success', 'Proveedor Creado', 'Se envió la contraseña temporal al correo del proveedor.');
      } else {
        showAlert('success', 'Proveedor Creado', 'Proveedor vinculado (usuario ya existía).');
      }

      setFormAlta({
        nombre: '', correo: '', telefono: '', direccionFiscal: '',
        rfc: '', cuentaClabe: '', banco: '', observaciones: '', tipoProveedor: 'fisica'
      });

    } catch (err) {
      console.error('Error al crear proveedor:', err);
      showAlert('error', 'Error de Conexión', err.message || 'No se pudo conectar con el servidor');
    }
  };

  // Handlers para Modificación
  const handleModificacionChange = (e) => {
    const { name, value } = e.target;
    setFormModificacion(prev => ({ ...prev, [name]: value }));
  };

  const handleModificacionSubmit = async (e) => {
  e.preventDefault();

  if (formModificacion.newPassword) {
    if (formModificacion.newPassword.length < 8) {
      showAlert('error', 'Contraseña Inválida', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (formModificacion.newPassword !== formModificacion.confirmPassword) {
      showAlert('error', 'Error', 'Las contraseñas no coinciden');
      return;
    }
  }

  // Validar CLABE
  if (formModificacion.cuentaClabe && formModificacion.cuentaClabe.length > 0) {
    const clabeLimpio = formModificacion.cuentaClabe.replace(/\s/g, '');
    if (clabeLimpio.length !== 18) {
      showAlert('error', 'Error en CLABE', 'La cuenta CLABE debe tener exactamente 18 dígitos');
      return;
    }
  }

  if (!proveedorEncontrado || !formModificacion.providerId) {
    showAlert('error', 'Proveedor No Encontrado', 'Primero debe buscar y cargar un proveedor');
    return;
  }

  const clean = v => {
    if (typeof v !== 'string') return v;
    const t = v.trim();
    return t === '' ? undefined : t;
  };

  const current = {
    businessName: clean(formModificacion.nombre),
    emailContacto: clean(formModificacion.correo),
    telefono: clean(formModificacion.telefono),
    direccionFiscal: clean(formModificacion.direccionFiscal),
    observaciones: clean(formModificacion.observaciones),
    bankName: clean(formModificacion.banco),
    clabe: clean(formModificacion.cuentaClabe),
    rfc: clean(formModificacion.rfc), // ✅ Incluir RFC
    newPassword: clean(formModificacion.newPassword) // ✅ Incluir nueva contraseña
  };

  const original = formModificacion.originalProviderData || {};
  const payload = {};
  Object.entries(current).forEach(([k, v]) => {
    if (k === 'newPassword') {
      // Solo incluir si se proporcionó
      if (v) payload[k] = v;
    } else {
      const ov = original[k] ?? undefined;
      if (v !== undefined && v !== ov) payload[k] = v;
      if (v === undefined && ov !== undefined) payload[k] = undefined;
    }
  });

  if (Object.keys(payload).length === 0) {
    showAlert('info', 'Sin Cambios', 'No hay modificaciones para guardar');
    return;
  }

  try {
    const resp = await fetch(`${API_BASE}/api/providers/${formModificacion.providerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await resp.json();

    if (!resp.ok) {
      const issuesMsg = Array.isArray(data?.issues)
        ? data.issues.map(i => `${i.path}: ${i.message}`).join('\n')
        : '';
      const errorMsg = data?.message || issuesMsg || `Error ${resp.status}`;
      return showAlert('error', 'Error en la Actualización', errorMsg);
    }

    let successMessage = `Los datos de ${data.provider.businessName} fueron actualizados.`;
    if (data.passwordUpdated) {
      successMessage += '\n\n✅ La contraseña ha sido actualizada exitosamente.';
    }

    showAlert('success', 'Proveedor Actualizado', successMessage);

    setFormModificacion({
      busqueda: "",
      providerId: null,
      originalProviderData: null,
      nombre: "",
      correo: "",
      telefono: "",
      direccionFiscal: "",
      rfc: "",
      cuentaClabe: "",
      banco: "",
      observaciones: "",
      tipoProveedor: "fisica",
      newPassword: "",
      confirmPassword: "",
      cambiosRealizados: [],
      ultimaModificacion: null
    });
    setProveedorEncontrado(false);
    onClose && onClose();
  } catch (err) {
    console.error('Error al actualizar proveedor:', err);
    showAlert('error', 'Error de Conexión', err.message || 'No se pudo conectar con el servidor');
  }
};

  // Handlers para Baja
  const handleBajaChange = (e) => {
    const { name, value } = e.target;
    setFormBaja(prev => ({ 
      ...prev, 
      [name]: value,
      ...(name === 'motivoBaja' && value !== 'otros' && { motivoOtros: '' })
    }));
  };

  const RFC_REGEX = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;

  const handleBuscarProveedorBaja = async () => {
  const rfc = (formBaja.searchTerm || '').trim().toUpperCase();
  if (!RFC_REGEX.test(rfc)) {
    showAlert('error', 'RFC inválido', 'Ingrese un RFC válido (12/13 caracteres)');
    return;
  }
  try {
    const resp = await fetch(`${API_BASE}/api/providers/by-rfc/${encodeURIComponent(rfc)}`, {
      credentials: 'include'
    });
    if (resp.status === 404) {
      setFormBaja(prev => ({ ...prev, selectedProvider: null }));
      showAlert('info', 'No encontrado', 'No existe un proveedor activo con ese RFC');
      return;
    }
    if (!resp.ok) throw new Error('Error al buscar proveedor');
    const data = await resp.json();
    setFormBaja(prev => ({ ...prev, selectedProvider: data.provider }));
    showAlert('success', 'Proveedor Encontrado', data.provider.businessName);
  } catch (err) {
    showAlert('error', 'Error', err.message);
  }
};

  const handleBajaSubmit = async (e) => {
    e.preventDefault();
    
    if (!formBaja.selectedProvider) {
      return showAlert('error', 'Error', 'Debe buscar y seleccionar un proveedor');
    }
    
    if (!formBaja.motivoBaja || formBaja.motivoBaja === '') {
      return showAlert('error', 'Error', 'Debe seleccionar un motivo de baja');
    }
    
    const motivoCompleto = formBaja.motivoBaja;
    const notasAdicionales = formBaja.notas?.trim();
    
    showAlert('warning', 
      'Confirmar Baja', 
      `¿Está seguro de dar de baja al proveedor?\n\n` +
      `Proveedor: ${formBaja.selectedProvider.businessName || formBaja.selectedProvider.name}\n` +
      `RFC: ${formBaja.selectedProvider.rfc}\n` +
      `Motivo: ${motivoCompleto}\n` +
      `Fecha: ${formBaja.fechaBaja}\n\n` +
      `Esta acción marcará al proveedor como inactivo.`,
      true,
      async () => {
        try {
          const resp = await fetch(`${API_BASE}/api/providers/${formBaja.selectedProvider.id}/inactivate`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              reason: motivoCompleto,
              notes: notasAdicionales || undefined,
            }),
          });
          
          const data = await resp.json();
          
          if (!resp.ok) {
            const errorMsg = data?.message || `Error ${resp.status}`;
            return showAlert('error', 'Error en la Baja', errorMsg);
          }
          
          showAlert('success', 'Proveedor Dado de Baja', 
            `El proveedor ${data.provider.businessName} ha sido dado de baja exitosamente`);
          
          setFormBaja({
            searchTerm: '',
            selectedProvider: null,
            fechaBaja: getFechaActual(),
            motivoBaja: "",
            notas: ""
          });
          
          if (onClose) onClose();
          
        } catch (err) {
          showAlert('error', 'Error de Conexión', err.message || 'No se pudo conectar con el servidor');
        }
      }
    );
  };

  // Componente para mostrar el historial de versiones
  const HistorialVersiones = ({ ultimaModificacion }) => {
    if (!ultimaModificacion) return null;

    return (
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
          Última Modificación
        </h4>
        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Versión:</span>
            <span className="font-medium">v{ultimaModificacion.version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fecha:</span>
            <span className="font-medium">{ultimaModificacion.fecha}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Usuario:</span>
            <span className="font-medium flex items-center gap-1">
              <User className="w-3 h-3" />
              {ultimaModificacion.usuario}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Cambios:</span>
            <p className="font-medium mt-1 text-blue-600 text-xs sm:text-sm">{ultimaModificacion.cambios}</p>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar el formulario según el modo
  const renderFormulario = () => {
    switch (mode) {
      case "alta":
        return (
          <form onSubmit={handleAltaSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Proveedor
                </label>
                <select
                  name="tipoProveedor"
                  value={formAlta.tipoProveedor}
                  onChange={handleAltaChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                >
                  <option value="fisica">Persona Física</option>
                  <option value="moral">Persona Moral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formAlta.tipoProveedor === 'fisica' ? 'Nombre Completo *' : 'Nombre de la Empresa *'}
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formAlta.nombre}
                  onChange={handleAltaChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder={formAlta.tipoProveedor === 'fisica' ? 'Nombre completo del proveedor' : 'Nombre de la empresa'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formAlta.correo}
                  onChange={handleAltaChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RFC *
                </label>
                <input
                  type="text"
                  name="rfc"
                  value={formAlta.rfc}
                  onChange={handleAltaChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder={formAlta.tipoProveedor === 'fisica' ? 'ABCD123456789' : 'ABCD123456ABC'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formAlta.telefono}
                  onChange={handleAltaChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="+52 123 456 7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección Fiscal
                </label>
                <input
                  type="text"
                  name="direccionFiscal"
                  value={formAlta.direccionFiscal}
                  onChange={handleAltaChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Dirección completa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuenta CLABE
                </label>
                <input
                  type="text"
                  name="cuentaClabe"
                  value={formAlta.cuentaClabe}
                  onChange={handleAltaChange}
                  className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:border-blue-500 text-sm sm:text-base ${
                    clabeErrorAlta 
                      ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="18 dígitos"
                  maxLength={18}
                />
                {clabeErrorAlta && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    La cuenta CLABE debe tener exactamente 18 dígitos
                  </p>
                )}
                {!clabeErrorAlta && formAlta.cuentaClabe && (
                  <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    CLABE válido (18 dígitos)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banco
                </label>
                <input
                  type="text"
                  name="banco"
                  value={formAlta.banco}
                  onChange={handleAltaChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Nombre del banco"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formAlta.observaciones}
                  onChange={handleAltaChange}
                  rows="3"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={clabeErrorAlta}
                className={`px-6 py-2 sm:px-8 sm:py-3 rounded-lg transition duration-200 font-medium text-sm sm:text-base ${
                  clabeErrorAlta
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Enviar Solicitud
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg hover:bg-gray-600 transition duration-200 font-medium text-sm sm:text-base"
              >
                Cancelar
              </button>
            </div>
          </form>
        );

      case "modificacion":
        return (
          <form onSubmit={handleModificacionSubmit} className="space-y-4 sm:space-y-6">
            {/* Búsqueda */}
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Proveedor por RFC *
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="text"
                  name="busqueda"
                  value={formModificacion.busqueda}
                  onChange={(e) => setFormModificacion(prev => ({ ...prev, busqueda: e.target.value.toUpperCase() }))}
                  className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Ingrese RFC del proveedor"
                />
                <button
                  type="button"
                  onClick={buscarProveedor}
                  className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium text-sm sm:text-base"
                >
                  Buscar
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Ingrese el RFC exacto del proveedor (12 o 13 caracteres) y presione "Buscar".
              </p>
            </div>

            {proveedorEncontrado && (
              <>
                <HistorialVersiones ultimaModificacion={formModificacion.ultimaModificacion} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Proveedor *
                    </label>
                    <select
                      name="tipoProveedor"
                      value={formModificacion.tipoProveedor}
                      onChange={handleModificacionChange}
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    >
                      <option value="fisica">Persona Física</option>
                      <option value="moral">Persona Moral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre o Nombre de la Empresa *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formModificacion.nombre}
                      onChange={handleModificacionChange}
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      name="correo"
                      value={formModificacion.correo}
                      onChange={handleModificacionChange}
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formModificacion.telefono}
                      onChange={handleModificacionChange}
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección Fiscal
                    </label>
                    <input
                      type="text"
                      name="direccionFiscal"
                      value={formModificacion.direccionFiscal}
                      onChange={handleModificacionChange}
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RFC *
                    </label>
                    <input
                      type="text"
                      name="rfc"
                      value={formModificacion.rfc}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setFormModificacion(prev => ({ ...prev, rfc: val }));
                      }}
                      required
                      placeholder="RFC del proveedor"
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Puedes modificar el RFC si es necesario.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cuenta CLABE
                    </label>
                    <input
                      type="text"
                      name="cuentaClabe"
                      value={formModificacion.cuentaClabe}
                      onChange={handleModificacionChange}
                      className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:border-blue-500 text-sm sm:text-base ${
                        clabeErrorModificacion 
                          ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      maxLength={18}
                    />
                    {clabeErrorModificacion && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        La cuenta CLABE debe tener exactamente 18 dígitos
                      </p>
                    )}
                    {!clabeErrorModificacion && formModificacion.cuentaClabe && (
                      <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        CLABE válido (18 dígitos)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banco
                    </label>
                    <input
                      type="text"
                      name="banco"
                      value={formModificacion.banco}
                      onChange={handleModificacionChange}
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observaciones
                    </label>
                    <textarea
                      name="observaciones"
                      value={formModificacion.observaciones}
                      onChange={handleModificacionChange}
                      rows="3"
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      placeholder="Observaciones adicionales..."
                    />
                  </div>

                  <div className="md:col-span-2 border-t pt-4">
                    <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
                      Cambiar Contraseña (Opcional)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formModificacion.newPassword}
                          onChange={handleModificacionChange}
                          className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 text-sm sm:text-base ${
                            passwordError 
                              ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                          placeholder="Mínimo 8 caracteres"
                        />
                        {passwordError && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {passwordError}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmar Contraseña
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formModificacion.confirmPassword}
                          onChange={handleModificacionChange}
                          className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 text-sm sm:text-base ${
                            !passwordsMatch 
                              ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                          placeholder="Repite la nueva contraseña"
                        />
                        {!passwordsMatch && formModificacion.confirmPassword && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Las contraseñas no coinciden
                          </p>
                        )}
                        {passwordsMatch && formModificacion.confirmPassword && formModificacion.newPassword && !passwordError && (
                          <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Las contraseñas coinciden
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Deja ambos campos vacíos si no deseas cambiar la contraseña.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={clabeErrorModificacion}
                    className={`px-6 py-2 sm:px-8 sm:py-3 rounded-lg transition duration-200 font-medium text-sm sm:text-base ${
                      clabeErrorModificacion
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-500 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg hover:bg-gray-600 transition duration-200 font-medium text-sm sm:text-base"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </form>
        );

      case "baja":
        return (
          <form onSubmit={handleBajaSubmit} className="space-y-4 sm:space-y-6">
            <div className="bg-red-50 rounded-lg p-3 sm:p-4 border border-red-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Proveedor por RFC *
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="text"
                  value={formBaja.searchTerm}
                  onChange={(e) => setFormBaja(prev => ({ ...prev, searchTerm: e.target.value.toUpperCase() }))}
                  className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                  placeholder="Ingrese RFC del proveedor"
                />
                <button
                  type="button"
                  onClick={handleBuscarProveedorBaja}
                  className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-red-700 transition font-medium text-sm sm:text-base"
                >
                  Buscar
                </button>
              </div>
            
              {formBaja.selectedProvider && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white rounded-lg border border-red-300">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800 text-base sm:text-lg">
                        {formBaja.selectedProvider.businessName || formBaja.selectedProvider.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        RFC: <span className="font-medium">{formBaja.selectedProvider.rfc}</span>
                      </p>
                      {formBaja.selectedProvider.emailContacto && (
                        <p className="text-xs sm:text-sm text-gray-600">
                          Email: {formBaja.selectedProvider.emailContacto}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormBaja(prev => ({ ...prev, selectedProvider: null, searchTerm: '' }))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {formBaja.selectedProvider && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Baja
                    </label>
                    <input
                      type="date"
                      value={formBaja.fechaBaja}
                      onChange={(e) => setFormBaja(prev => ({ ...prev, fechaBaja: e.target.value }))}
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo de Baja *
                    </label>
                    <select
                      value={formBaja.motivoBaja}
                      onChange={(e) => setFormBaja(prev => ({ ...prev, motivoBaja: e.target.value }))}
                      required
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                    >
                      <option value="">Seleccione un motivo</option>
                      <option value="Problemas de calidad en productos o servicios">Problemas de calidad</option>
                      <option value="Incumplimiento de plazos de entrega">Incumplimiento de plazos</option>
                      <option value="Precios no competitivos">Precios no competitivos</option>
                      <option value="Falta de documentación o certificaciones requeridas">Falta de documentación</option>
                      <option value="Problemas financieros o de facturación">Problemas financieros</option>
                      <option value="Cierre o cese de operaciones del proveedor">Cierre de operaciones</option>
                      <option value="Cambio de proveedor por mejores condiciones">Cambio de proveedor</option>
                      <option value="Otro motivo">Otro</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas Adicionales
                    </label>
                    <textarea
                      value={formBaja.notas}
                      onChange={(e) => setFormBaja(prev => ({ ...prev, notas: e.target.value }))}
                      rows="3"
                      maxLength={1000}
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none text-sm sm:text-base"
                      placeholder="Detalles adicionales sobre la baja (opcional)"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formBaja.notas?.length || 0}/1000 caracteres</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white py-2 sm:py-3 rounded-lg hover:bg-red-700 transition font-medium text-sm sm:text-base"
                  >
                    Dar de Baja
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormBaja({
                        searchTerm: '',
                        selectedProvider: null,
                        fechaBaja: getFechaActual(),
                        motivoBaja: "",
                        notas: ""
                      });
                      if (onClose) onClose();
                    }}
                    className="px-6 sm:px-8 bg-gray-500 text-white py-2 sm:py-3 rounded-lg hover:bg-gray-600 transition font-medium text-sm sm:text-base"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </form>
        );

      default:
        return (
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Info className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <p className="text-gray-600 text-base sm:text-lg">
              Modo no especificado
            </p>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "alta": return "Alta de Proveedores";
      case "modificacion": return "Modificación de Proveedores";
      case "baja": return "Baja de Proveedores";
      default: return "Gestión de Proveedores";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "alta": return "Complete el formulario para enviar una solicitud de registro de nuevo proveedor. Los campos marcados con * son obligatorios. La solicitud será revisada por el administrador.";
      case "modificacion": return "Busque un proveedor existente y modifique sus datos. Se registrará un historial de cambios.";
      case "baja": return "Busque un proveedor y complete la información requerida para darle de baja del sistema.";
      default: return "Seleccione una operación para gestionar proveedores.";
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{getTitle()}</h2>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            {getDescription()}
          </p>
        </div>
        
        {mode === "alta" && <CampanaNotificaciones />}
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
        {renderFormulario()}
      </div>

      <Alert />
    </div>
  );
}

export default GestionProveedores;