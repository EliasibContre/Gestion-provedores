import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { apiGet, apiPatch } from '../api';


const GestionDatosPro = ({ onClose }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    rfc: '',
    fiscalAddress: '',
    fullName: '',
    contactPosition: '',
    email: '',
    phone: '',
    deliveryAddress: '',
    clabe: '',
    bankName: '',
    bankAccountId: null
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [alertOpen, setAlertOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ 
    type: '', 
    title: '', 
    message: '', 
    showConfirm: false, 
    onConfirm: null 
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await apiGet('/api/providers/me');
      setFormData({
        businessName: data.businessName || '',
        rfc: data.rfc || '',
        fiscalAddress: data.fiscalAddress || '',
        fullName: data.fullName || '',
        contactPosition: data.contactPosition || '',
        email: data.email || '',
        phone: data.phone || '',
        deliveryAddress: data.deliveryAddress || data.fiscalAddress || '',
        clabe: data.clabe || '',
        bankName: data.bankName || '',
        bankAccountId: data.bankAccountId || null
      });
    } catch {
      showAlert('error', 'Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  }

  // Validaciones
  const validations = {
    businessName: (value) => {
      if (!value) return 'La razón social es obligatoria';
      if (value.length < 3) return 'La razón social debe tener al menos 3 caracteres';
      return null;
    },
    
    rfc: (value) => {
      if (!value) return 'El RFC es obligatorio';
      const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
      if (!rfcRegex.test(value)) return 'Formato de RFC inválido';
      return null;
    },
    
    fiscalAddress: (value) => {
      if (!value) return 'El domicilio fiscal es obligatorio';
      if (value.length < 10) return 'El domicilio fiscal debe ser más específico';
      return null;
    },
    
    fullName: (value) => {
      if (!value) return 'El nombre de contacto es obligatorio';
      if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres';
      return null;
    },
    
    contactPosition: (value) => {
      if (!value) return 'El cargo es obligatorio';
      return null;
    },
    
    email: (value) => {
      if (!value) return 'El correo electrónico es obligatorio';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Formato de correo inválido';
      return null;
    },
    
    phone: (value) => {
      if (!value) return 'El teléfono es obligatorio';
      const phoneRegex = /^[\d\s\+\-\(\)]{10,15}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Formato de teléfono inválido';
      return null;
    },
    
    deliveryAddress: (value) => {
      if (!value) return 'La dirección de entrega es obligatoria';
      if (value.length < 10) return 'La dirección de entrega debe ser más específica';
      return null;
    },
    
    clabe: (value) => {
      if (!value) return 'La CLABE es obligatoria';
      const clabeRegex = /^\d{18}$/;
      if (!clabeRegex.test(value.replace(/\s/g, ''))) return 'La CLABE debe tener 18 dígitos';
      return null;
    },
    
    bankName: (value) => {
      if (!value) return 'El banco es obligatorio';
      if (value.length < 3) return 'El nombre del banco debe tener al menos 3 caracteres';
      return null;
    }
  };

  // Función para mostrar alertas
  const showAlert = (type, title, message, showConfirm = false, onConfirm = null) => {
    setAlertConfig({ type, title, message, showConfirm, onConfirm });
    setAlertOpen(true);
  };

  // Componente de Alertas
  const Alert = () => {
    if (!alertOpen) return null;

    const alertStyles = {
      success: { 
        bg: 'bg-green-50', 
        border: 'border-green-200', 
        icon: <CheckCircle className="w-6 h-6 text-green-600" />, 
        button: 'bg-green-600 hover:bg-green-700',
        text: 'text-green-800'
      },
      error: { 
        bg: 'bg-red-50', 
        border: 'border-red-200', 
        icon: <XCircle className="w-6 h-6 text-red-600" />, 
        button: 'bg-red-600 hover:bg-red-700',
        text: 'text-red-800'
      }
    };

    const style = alertStyles[alertConfig.type] || alertStyles.success;

    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity backdrop-blur-sm" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className={`rounded-xl shadow-2xl border-2 ${style.bg} ${style.border} w-full max-w-sm sm:max-w-md transform transition-all duration-300 scale-95 hover:scale-100`}>
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base sm:text-lg font-semibold ${style.text} mb-2`}>
                    {alertConfig.title}
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line text-sm sm:text-base">
                    {alertConfig.message}
                  </p>
                  <button
                    onClick={() => {
                      setAlertOpen(false);
                      if (alertConfig.type === 'success' && onClose) {
                        onClose();
                      }
                    }}
                    className={`mt-3 sm:mt-4 px-4 sm:px-6 py-2 text-white rounded-lg transition ${style.button} font-medium text-sm sm:text-base`}
                  >
                    Aceptar
                  </button>
                </div>
                <button
                  onClick={() => {
                    setAlertOpen(false);
                    if (alertConfig.type === 'success' && onClose) {
                      onClose();
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 transition flex-shrink-0 mt-1"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  function handleChange(field, value) {
    setFormData(p => ({ ...p, [field]: value }));
    if (touched[field] && validations[field]) {
      setErrors(e => ({ ...e, [field]: validations[field](value) }));
    }
  }

  function handleBlur(field) {
    setTouched(t => ({ ...t, [field]: true }));
    if (validations[field]) {
      setErrors(e => ({ ...e, [field]: validations[field](formData[field]) }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newTouched = {};
    Object.keys(validations).forEach(k => newTouched[k] = true);
    setTouched(newTouched);

    const newErrors = {};
    Object.keys(validations).forEach(k => {
      const err = validations[k](formData[k]);
      if (err) newErrors[k] = err;
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length) {
      showAlert('error', 'Errores', 'Revisa los campos marcados');
      return;
    }

    try {
      setSaving(true);
      await apiPatch('/api/providers/me', {
        businessName: formData.businessName,
        fiscalAddress: formData.fiscalAddress,
        fullName: formData.fullName,
        contactPosition: formData.contactPosition,
        phone: formData.phone,
        clabe: formData.clabe,
        bankName: formData.bankName,
        bankAccountId: formData.bankAccountId
        // rfc no se envía si es inmutable
      });
      showAlert('success', 'Guardado', 'Datos actualizados correctamente');
      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Error al guardar';
      showAlert('error', 'Error', msg);
    } finally {
      setSaving(false);
    }
  }

  const getFieldStatus = (field) => {
    if (!touched[field]) return 'untouched';
    if (errors[field]) return 'error';
    return 'valid';
  };

  const renderFieldIcon = (field) => {
    const status = getFieldStatus(field);
    
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-darkBlue">Gestión de Datos del Proveedor</h2>
              <p className="text-midBlue">Administra la información de tu empresa</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg border border-lightBlue p-6 space-y-8">
            {/* Sección 1: Datos Fiscales */}
            <div>
              <h3 className="text-lg font-semibold text-darkBlue mb-4 border-b border-lightBlue pb-2">
                Datos Fiscales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-darkBlue mb-1">
                    Nombre o Razón Social *
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.businessName}
                      onChange={(e) => handleChange('businessName', e.target.value)}
                      onBlur={() => handleBlur('businessName')}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                        getFieldStatus('businessName') === 'error' 
                          ? 'border-red-500 focus:ring-red-500' 
                          : getFieldStatus('businessName') === 'valid'
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-lightBlue focus:ring-midBlue'
                      }`}
                      placeholder="Ingresa la razón social de la empresa"
                    />
                    <div className="absolute right-3 top-2">
                      {renderFieldIcon('businessName')}
                    </div>
                  </div>
                  {errors.businessName && (
                    <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkBlue mb-1">
                    RFC *
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.rfc}
                      onChange={(e) => handleChange('rfc', e.target.value.toUpperCase())}
                      onBlur={() => handleBlur('rfc')}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                        getFieldStatus('rfc') === 'error' 
                          ? 'border-red-500 focus:ring-red-500' 
                          : getFieldStatus('rfc') === 'valid'
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-lightBlue focus:ring-midBlue'
                      }`}
                      placeholder="Ej: ABC123456789"
                      maxLength={13}
                    />
                    <div className="absolute right-3 top-2">
                      {renderFieldIcon('rfc')}
                    </div>
                  </div>
                  {errors.rfc && (
                    <p className="text-red-500 text-xs mt-1">{errors.rfc}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-darkBlue mb-1">
                    Domicilio Fiscal *
                  </label>
                  <div className="relative">
                    <textarea 
                      value={formData.fiscalAddress}
                      onChange={(e) => handleChange('fiscalAddress', e.target.value)}
                      onBlur={() => handleBlur('fiscalAddress')}
                      rows="3"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                        getFieldStatus('fiscalAddress') === 'error' 
                          ? 'border-red-500 focus:ring-red-500' 
                          : getFieldStatus('fiscalAddress') === 'valid'
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-lightBlue focus:ring-midBlue'
                      }`}
                      placeholder="Calle, número, colonia, ciudad, estado, código postal"
                    />
                    <div className="absolute right-3 top-2">
                      {renderFieldIcon('fiscalAddress')}
                    </div>
                  </div>
                  {errors.fiscalAddress && (
                    <p className="text-red-500 text-xs mt-1">{errors.fiscalAddress}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 2: Datos de Contacto */}
            <div>
              <h3 className="text-lg font-semibold text-darkBlue mb-4 border-b border-lightBlue pb-2">
                Datos de Contacto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-darkBlue mb-1">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      onBlur={() => handleBlur('fullName')}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                        getFieldStatus('fullName') === 'error' 
                          ? 'border-red-500 focus:ring-red-500' 
                          : getFieldStatus('fullName') === 'valid'
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-lightBlue focus:ring-midBlue'
                      }`}
                      placeholder="Nombre del contacto principal"
                    />
                    <div className="absolute right-3 top-2">
                      {renderFieldIcon('fullName')}
                    </div>
                  </div>
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkBlue mb-1">
                    Cargo *
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.contactPosition}
                      onChange={(e) => handleChange('contactPosition', e.target.value)}
                      onBlur={() => handleBlur('contactPosition')}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                        getFieldStatus('contactPosition') === 'error' 
                          ? 'border-red-500 focus:ring-red-500' 
                          : getFieldStatus('contactPosition') === 'valid'
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-lightBlue focus:ring-midBlue'
                      }`}
                      placeholder="Ej: Gerente de Ventas"
                    />
                    <div className="absolute right-3 top-2">
                      {renderFieldIcon('contactPosition')}
                    </div>
                  </div>
                  {errors.contactPosition && (
                    <p className="text-red-500 text-xs mt-1">{errors.contactPosition}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkBlue mb-1">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={formData.email}
                      readOnly
                      onBlur={() => handleBlur('email')}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                        getFieldStatus('email') === 'error' 
                          ? 'border-red-500 focus:ring-red-500' 
                          : getFieldStatus('email') === 'valid'
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-lightBlue focus:ring-midBlue'
                      }`}
                      placeholder="correo@empresa.com"
                    />
                    <div className="absolute right-3 top-2">
                      {renderFieldIcon('email')}
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkBlue mb-1">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                        getFieldStatus('phone') === 'error' 
                          ? 'border-red-500 focus:ring-red-500' 
                          : getFieldStatus('phone') === 'valid'
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-lightBlue focus:ring-midBlue'
                      }`}
                      placeholder="+52 55 1234 5678"
                    />
                    <div className="absolute right-3 top-2">
                      {renderFieldIcon('phone')}
                    </div>
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-darkBlue mb-1">
                    Dirección de Entrega *
                  </label>
                  <div className="relative">
                    <textarea 
                      value={formData.deliveryAddress}
                      onChange={(e) => handleChange('deliveryAddress', e.target.value)}
                      onBlur={() => handleBlur('deliveryAddress')}
                      rows="3"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                        getFieldStatus('deliveryAddress') === 'error' 
                          ? 'border-red-500 focus:ring-red-500' 
                          : getFieldStatus('deliveryAddress') === 'valid'
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-lightBlue focus:ring-midBlue'
                      }`}
                      placeholder="Dirección completa para recibir mercancía"
                    />
                    <div className="absolute right-3 top-2">
                      {renderFieldIcon('deliveryAddress')}
                    </div>
                  </div>
                  {errors.deliveryAddress && (
                    <p className="text-red-500 text-xs mt-1">{errors.deliveryAddress}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 3: Datos Bancarios */}
            <div>
              <h3 className="text-lg font-semibold text-darkBlue mb-4 border-b border-lightBlue pb-2">
                Datos Bancarios
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-darkBlue mb-1">
                    Cuenta CLABE *
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.clabe}
                      onChange={(e) => handleChange('clabe', e.target.value.replace(/\D/g, ''))}
                      onBlur={() => handleBlur('clabe')}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                        getFieldStatus('clabe') === 'error' 
                          ? 'border-red-500 focus:ring-red-500' 
                          : getFieldStatus('clabe') === 'valid'
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-lightBlue focus:ring-midBlue'
                      }`}
                      placeholder="18 dígitos"
                      maxLength={18}
                    />
                    <div className="absolute right-3 top-2">
                      {renderFieldIcon('clabe')}
                    </div>
                  </div>
                  {errors.clabe && (
                    <p className="text-red-500 text-xs mt-1">{errors.clabe}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkBlue mb-1">
                    Banco *
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.bankName}
                      onChange={(e) => handleChange('bankName', e.target.value)}
                      onBlur={() => handleBlur('bankName')}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                        getFieldStatus('bankName') === 'error' 
                          ? 'border-red-500 focus:ring-red-500' 
                          : getFieldStatus('bankName') === 'valid'
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-lightBlue focus:ring-midBlue'
                      }`}
                      placeholder="Ej: BBVA Bancomer, Santander, etc."
                    />
                    <div className="absolute right-3 top-2">
                      {renderFieldIcon('bankName')}
                    </div>
                  </div>
                  {errors.bankName && (
                    <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Botones de acción - SOLO GUARDAR CAMBIOS */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-lightBlue">
              <button 
                type="submit"
                className="px-6 py-2 bg-midBlue text-white rounded-lg hover:bg-darkBlue transition"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Alertas */}
      <Alert />
    </div>
  );
};

export default GestionDatosPro;