import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const OrdenCompraPro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    monto: '',
    fecha: '',
    numeroOrden: '',
    rfc: '',
    observaciones: '',
    archivoOrden: null,
    archivoFacturaPdf: null,
    archivoFacturaXml: null
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ 
    type: '', 
    title: '', 
    message: '', 
    showConfirm: false, 
    onConfirm: null 
  });

  // Validaciones
  const validations = {
    monto: (value) => {
      if (!value) return 'El monto es obligatorio';
      const montoRegex = /^\d+(\.\d{1,2})?$/;
      if (!montoRegex.test(value)) return 'Formato de monto inválido (ej: 1500.00)';
      if (parseFloat(value) <= 0) return 'El monto debe ser mayor a 0';
      return null;
    },
    
    fecha: (value) => {
      if (!value) return 'La fecha es obligatoria';
      // Eliminada la validación de fecha futura
      return null;
    },
    
    numeroOrden: (value) => {
      if (!value) return 'El número de orden es obligatorio';
      if (value.length < 3) return 'El número de orden debe tener al menos 3 caracteres';
      return null;
    },
    
    rfc: (value) => {
      if (!value) return 'El RFC es obligatorio';
      const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
      if (!rfcRegex.test(value)) return 'Formato de RFC inválido';
      return null;
    },
    
    observaciones: (value) => {
      if (value && value.length > 500) return 'Las observaciones no pueden exceder 500 caracteres';
      return null;
    },
    
    archivoOrden: (value) => {
      if (!value) return 'La orden de compra en PDF es obligatoria';
      return null;
    },

    archivoFacturaPdf: (value) => {
      if (!value) return 'La factura en PDF es obligatoria';
      return null;
    },

    archivoFacturaXml: (value) => {
      if (!value) return 'La factura en XML es obligatoria';
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
                      if (alertConfig.type === 'success') {
                        // Limpiar formulario después de éxito
                        setFormData({
                          monto: '',
                          fecha: '',
                          numeroOrden: '',
                          rfc: '',
                          observaciones: '',
                          archivoOrden: null,
                          archivoFacturaPdf: null,
                          archivoFacturaXml: null
                        });
                        setTouched({});
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
                    if (alertConfig.type === 'success') {
                      // Limpiar formulario después de éxito
                      setFormData({
                        monto: '',
                        fecha: '',
                        numeroOrden: '',
                        rfc: '',
                        observaciones: '',
                        archivoOrden: null,
                        archivoFacturaPdf: null,
                        archivoFacturaXml: null
                      });
                      setTouched({});
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

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validar en tiempo real si el campo ya fue tocado
    if (touched[field]) {
      const error = validations[field](value);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    const error = validations[field](formData[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleFileUploadGeneric = (event, campo) => {
  const file = event.target.files[0];
  if (file) {
    const acceptedTypes = {
      archivoOrden: ['application/pdf'],
      archivoFacturaPdf: ['application/pdf'],
      archivoFacturaXml: ['application/xml', 'text/xml']
    };

    const allowed = acceptedTypes[campo] || [];
    if (!allowed.includes(file.type)) {
      setErrors(prev => ({ 
        ...prev, 
        [campo]: campo.includes('Xml') ? 'Solo se permiten archivos XML' : 'Solo se permiten archivos PDF'
      }));
      setFormData(prev => ({ ...prev, [campo]: null }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [campo]: 'El archivo no puede ser mayor a 10MB' }));
      setFormData(prev => ({ ...prev, [campo]: null }));
      return;
    }
    setErrors(prev => ({ ...prev, [campo]: null }));
    setFormData(prev => ({ ...prev, [campo]: file }));
    setTouched(prev => ({ ...prev, [campo]: true }));
  }
};

  const handleRemoveFile = (campo) => {
  setFormData(prev => ({ ...prev, [campo]: null }));
  setErrors(prev => ({
    ...prev,
    [campo]: validations[campo](null)
  }));
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Marcar todos los campos como tocados
  const allTouched = {};
  Object.keys(formData).forEach(key => {
    allTouched[key] = true;
  });
  setTouched(allTouched);

  // Validar todos los campos
  const newErrors = {};
  Object.keys(formData).forEach(key => {
    const error = validations[key](formData[key]);
    if (error) newErrors[key] = error;
  });

  setErrors(newErrors);

  // Si no hay errores, proceder con el envío
  if (Object.keys(newErrors).length === 0) {
    try {
      // Crear FormData para enviar archivo
      const formDataToSend = new FormData();
      formDataToSend.append('monto', formData.monto);
      formDataToSend.append('fecha', formData.fecha);
      formDataToSend.append('numeroOrden', formData.numeroOrden);
      formDataToSend.append('rfc', formData.rfc);
      if (formData.observaciones) {
        formDataToSend.append('observaciones', formData.observaciones);
      }
      if (formData.archivoOrden) {
        formDataToSend.append('archivoOrden', formData.archivoOrden);
      }
      if (formData.archivoFacturaPdf) {
        formDataToSend.append('archivoFacturaPdf', formData.archivoFacturaPdf);
      }
      if (formData.archivoFacturaXml) {
        formDataToSend.append('archivoFacturaXml', formData.archivoFacturaXml);
      }

      // Enviar a backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/purchase-orders/me`,
        {
          method: 'POST',
          credentials: 'include',
          body: formDataToSend
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al registrar la orden');
      }

      const data = await response.json();

      showAlert(
        'success', 
        'Orden Registrada', 
        'La orden de compra se ha registrado correctamente.'
      );
    } catch (error) {
      console.error('Error:', error);
      showAlert(
        'error',
        'Error',
        error.message || 'No se pudo registrar la orden de compra'
      );
    }
  } else {
    // Mostrar alerta de error si hay campos inválidos
    const camposConError = Object.keys(newErrors).length;
    showAlert(
      'error', 
      'Error en el Formulario', 
      `Hay ${camposConError} campo(s) que requieren atención. Por favor, revisa la información ingresada.`
    );
  }
};

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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-darkBlue">Registro de Órdenes de Compra</h2>
              <p className="text-midBlue">Registra tus órdenes de compra</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg border border-lightBlue p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-6">
                {/* Monto */}
                <div>
                  <label className="block text-sm font-medium text-darkBlue mb-1">
                    Monto en $ *
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.monto}
                      onChange={(e) => handleChange('monto', e.target.value)}
                      onBlur={() => handleBlur('monto')}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                        getFieldStatus('monto') === 'error' 
                          ? 'border-red-500 focus:ring-red-500' 
                          : getFieldStatus('monto') === 'valid'
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-lightBlue focus:ring-midBlue'
                      }`}
                      placeholder="Ej: 1500.00"
                    />
                    <div className="absolute right-3 top-2">
                      {renderFieldIcon('monto')}
                    </div>
                  </div>
                  {errors.monto && (
                    <p className="text-red-500 text-xs mt-1">{errors.monto}</p>
                  )}
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-darkBlue mb-1">
                    Fecha *
                  </label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={formData.fecha}
                      onChange={(e) => handleChange('fecha', e.target.value)}
                      onBlur={() => handleBlur('fecha')}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                        getFieldStatus('fecha') === 'error' 
                          ? 'border-red-500 focus:ring-red-500' 
                          : getFieldStatus('fecha') === 'valid'
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-lightBlue focus:ring-midBlue'
                      }`}
                    />
                    <div className="absolute right-3 top-2">
                      {renderFieldIcon('fecha')}
                    </div>
                  </div>
                  {errors.fecha && (
                    <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>
                  )}
                </div>

                {/* Número de Orden */}
                <div>
                  <label className="block text-sm font-medium text-darkBlue mb-1">
                    Número de Orden *
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.numeroOrden}
                      onChange={(e) => handleChange('numeroOrden', e.target.value)}
                      onBlur={() => handleBlur('numeroOrden')}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                        getFieldStatus('numeroOrden') === 'error' 
                          ? 'border-red-500 focus:ring-red-500' 
                          : getFieldStatus('numeroOrden') === 'valid'
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-lightBlue focus:ring-midBlue'
                      }`}
                      placeholder="Ej: OC-2024-001"
                    />
                    <div className="absolute right-3 top-2">
                      {renderFieldIcon('numeroOrden')}
                    </div>
                  </div>
                  {errors.numeroOrden && (
                    <p className="text-red-500 text-xs mt-1">{errors.numeroOrden}</p>
                  )}
                </div>

                {/* RFC */}
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
              </div>

              {/* Columna derecha */}
              <div className="space-y-6">
                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-medium text-darkBlue mb-1">
                    Observaciones
                  </label>
                  <div className="relative">
                    <textarea 
                      value={formData.observaciones}
                      onChange={(e) => handleChange('observaciones', e.target.value)}
                      onBlur={() => handleBlur('observaciones')}
                      rows="4"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                        getFieldStatus('observaciones') === 'error' 
                          ? 'border-red-500 focus:ring-red-500' 
                          : getFieldStatus('observaciones') === 'valid'
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-lightBlue focus:ring-midBlue'
                      }`}
                      placeholder="Observaciones adicionales (opcional)"
                    />
                    <div className="absolute right-3 top-2">
                      {renderFieldIcon('observaciones')}
                    </div>
                  </div>
                  {errors.observaciones && (
                    <p className="text-red-500 text-xs mt-1">{errors.observaciones}</p>
                  )}
                  <div className="text-right text-xs text-midBlue mt-1">
                    {formData.observaciones.length}/500 caracteres
                  </div>
                </div>

                {/* Subir Orden de Compra PDF */}
                <div>
                  <label className="block text-sm font-medium text-darkBlue mb-1">
                    Orden de Compra en PDF *
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center transition ${
                    errors.archivoOrden 
                      ? 'border-red-500 bg-red-50' 
                      : formData.archivoOrden
                      ? 'border-green-500 bg-green-50'
                      : 'border-lightBlue hover:border-midBlue'
                  }`}>
                    {!formData.archivoOrden ? (
                      <div>
                        <Upload className="w-8 h-8 text-midBlue mx-auto mb-2" />
                        <p className="text-sm text-darkBlue mb-2">
                          Haz clic para subir la orden de compra en PDF
                        </p>
                        <p className="text-xs text-midBlue">
                          Máximo 10MB - Solo archivos PDF
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          id="orden-pdf"
                          accept=".pdf"
                          onChange={(e) => handleFileUploadGeneric(e, 'archivoOrden')}
                        />
                        <label
                          htmlFor="orden-pdf"
                          className="inline-block mt-2 px-4 py-2 bg-midBlue text-white rounded-lg hover:bg-darkBlue transition cursor-pointer text-sm"
                        >
                          Seleccionar Archivo
                        </label>
                      </div>
                    ) : (
                      <div className="text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-darkBlue">{formData.archivoOrden.name}</p>
                        <p className="text-xs text-midBlue">{formData.archivoOrden.size}</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('archivoOrden')}
                          className="mt-2 px-3 py-1 text-red-500 hover:text-red-700 transition text-sm flex items-center gap-1 mx-auto"
                        >
                          <X className="w-4 h-4" />
                          Remover archivo
                        </button>
                      </div>
                    )}
                  </div>
                  {errors.archivoOrden && (
                    <p className="text-red-500 text-xs mt-1">{errors.archivoOrden}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkBlue mb-1">
                    Factura en PDF *
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center transition ${
                    errors.archivoFacturaPdf 
                      ? 'border-red-500 bg-red-50' 
                      : formData.archivoFacturaPdf
                      ? 'border-green-500 bg-green-50'
                      : 'border-lightBlue hover:border-midBlue'
                  }`}>
                    {!formData.archivoFacturaPdf ? (
                      <div>
                        <Upload className="w-8 h-8 text-midBlue mx-auto mb-2" />
                        <p className="text-sm text-darkBlue mb-2">
                          Haz clic para subir la factura en PDF
                        </p>
                        <p className="text-xs text-midBlue">
                          Máximo 10MB - Solo archivos PDF
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          id="factura-pdf"
                          accept=".pdf"
                          onChange={(e) => handleFileUploadGeneric(e, 'archivoFacturaPdf')}
                        />
                        <label
                          htmlFor="factura-pdf"
                          className="inline-block mt-2 px-4 py-2 bg-midBlue text-white rounded-lg hover:bg-darkBlue transition cursor-pointer text-sm"
                        >
                          Seleccionar Archivo
                        </label>
                      </div>
                    ) : (
                      <div className="text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-darkBlue">{formData.archivoFacturaPdf.name}</p>
                        <p className="text-xs text-midBlue">
                          {(formData.archivoFacturaPdf.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('archivoFacturaPdf')}
                          className="mt-2 px-3 py-1 text-red-500 hover:text-red-700 transition text-sm flex items-center gap-1 mx-auto"
                        >
                          <X className="w-4 h-4" />
                          Remover archivo
                        </button>
                      </div>
                    )}
                  </div>
                  {errors.archivoFacturaPdf && (
                    <p className="text-red-500 text-xs mt-1">{errors.archivoFacturaPdf}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkBlue mb-1">
                    Factura en XML *
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center transition ${
                    errors.archivoFacturaXml 
                      ? 'border-red-500 bg-red-50' 
                      : formData.archivoFacturaXml
                      ? 'border-green-500 bg-green-50'
                      : 'border-lightBlue hover:border-midBlue'
                  }`}>
                    {!formData.archivoFacturaXml ? (
                      <div>
                        <Upload className="w-8 h-8 text-midBlue mx-auto mb-2" />
                        <p className="text-sm text-darkBlue mb-2">
                          Haz clic para subir la factura en XML
                        </p>
                        <p className="text-xs text-midBlue">
                          Máximo 10MB - Solo archivos XML
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          id="factura-xml"
                          accept=".xml"
                          onChange={(e) => handleFileUploadGeneric(e, 'archivoFacturaXml')}
                        />
                        <label
                          htmlFor="factura-xml"
                          className="inline-block mt-2 px-4 py-2 bg-midBlue text-white rounded-lg hover:bg-darkBlue transition cursor-pointer text-sm"
                        >
                          Seleccionar Archivo
                        </label>
                      </div>
                    ) : (
                      <div className="text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-darkBlue">{formData.archivoFacturaXml.name}</p>
                        <p className="text-xs text-midBlue">
                          {(formData.archivoFacturaXml.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('archivoFacturaXml')}
                          className="mt-2 px-3 py-1 text-red-500 hover:text-red-700 transition text-sm flex items-center gap-1 mx-auto"
                        >
                          <X className="w-4 h-4" />
                          Remover archivo
                        </button>
                      </div>
                    )}
                  </div>
                  {errors.archivoFacturaXml && (
                    <p className="text-red-500 text-xs mt-1">{errors.archivoFacturaXml}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Botones de acción - SOLO REGISTRAR ORDEN DE COMPRA */}
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-lightBlue">
              <button 
                type="submit"
                className="px-6 py-2 bg-midBlue text-white rounded-lg hover:bg-darkBlue transition"
              >
                Registrar Orden de Compra
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

export default OrdenCompraPro;