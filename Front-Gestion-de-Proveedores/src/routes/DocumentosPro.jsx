import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, X, User, Building, Loader } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const DocumentosPro = () => {
  const [tipoPersona, setTipoPersona] = useState('');
  const [documentTypes, setDocumentTypes] = useState([]);
  const [archivos, setArchivos] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ 
    type: '', 
    title: '', 
    message: ''
  });

  // Cargar documentos existentes al montar
  useEffect(() => {
    loadExistingDocuments();
  }, []);

  // Cargar tipos de documento cuando cambia el tipo de persona
  useEffect(() => {
    if (tipoPersona) {
      loadDocumentTypes();
    } else {
      setDocumentTypes([]);
    }
  }, [tipoPersona]);

  const loadExistingDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/documents/me`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.personType) {
          setTipoPersona(data.personType);
        }
      }
    } catch (error) {
      console.error('Error al cargar documentos:', error);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/api/documents/types?personType=${tipoPersona}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Error al cargar tipos de documento');
      }

      const types = await response.json();
      setDocumentTypes(types);
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error', 'No se pudieron cargar los tipos de documento');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, title, message) => {
    setAlertConfig({ type, title, message });
    setAlertOpen(true);
  };

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
        icon: <X className="w-6 h-6 text-red-600" />, 
        button: 'bg-red-600 hover:bg-red-700',
        text: 'text-red-800'
      },
      warning: { 
        bg: 'bg-yellow-50', 
        border: 'border-yellow-200', 
        icon: <CheckCircle className="w-6 h-6 text-yellow-600" />, 
        button: 'bg-yellow-600 hover:bg-yellow-700',
        text: 'text-yellow-800'
      }
    };

    const style = alertStyles[alertConfig.type] || alertStyles.success;

    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity backdrop-blur-sm" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className={`rounded-xl shadow-2xl border-2 ${style.bg} ${style.border} w-full max-w-sm sm:max-w-md`}>
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">{style.icon}</div>
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
                        setArchivos({});
                        loadExistingDocuments();
                      }
                    }}
                    className={`mt-3 sm:mt-4 px-4 sm:px-6 py-2 text-white rounded-lg transition ${style.button} font-medium text-sm sm:text-base`}
                  >
                    Aceptar
                  </button>
                </div>
                <button
                  onClick={() => setAlertOpen(false)}
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

  const handleTipoPersonaChange = (tipo) => {
    setTipoPersona(tipo);
    setArchivos({});
    setErrors({});
  };

  const handleFileUpload = (event, docCode) => {
    const file = event.target.files[0];
    
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({
          ...prev,
          [docCode]: 'Solo se permiten archivos PDF'
        }));
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [docCode]: 'El archivo no puede ser mayor a 10MB'
        }));
        return;
      }

      setErrors(prev => ({
        ...prev,
        [docCode]: null
      }));

      setArchivos(prev => ({
        ...prev,
        [docCode]: {
          nombre: file.name,
          tamaño: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          fecha: new Date().toLocaleDateString('es-MX'),
          file
        }
      }));
    }
  };

  const handleRemoveFile = (docCode) => {
    setArchivos(prev => {
      const nuevos = { ...prev };
      delete nuevos[docCode];
      return nuevos;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tipoPersona) {
      showAlert('warning', 'Tipo de Persona Requerido', 
        'Por favor selecciona el tipo de persona antes de continuar.');
      return;
    }

    const documentosFaltantes = documentTypes.filter(doc => 
      doc.isRequired && !archivos[doc.code]
    );

    if (documentosFaltantes.length > 0) {
      showAlert('error', 'Documentos Faltantes', 
        `Faltan ${documentosFaltantes.length} documento(s) por subir:\n\n${
          documentosFaltantes.map(doc => `• ${doc.name}`).join('\n')
        }`
      );
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('personType', tipoPersona);

      Object.entries(archivos).forEach(([docCode, data]) => {
        formData.append(docCode, data.file);
      });

      const response = await fetch(`${API_BASE}/api/documents/me`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al subir documentos');
      }

      showAlert('success', 'Documentos Enviados', 
        'Los documentos se han enviado correctamente.\n\nTu información ha sido procesada y estará sujeta a validación.');
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error', error.message || 'No se pudieron subir los documentos');
    } finally {
      setUploading(false);
    }
  };

  const todosDocumentosSubidos = () => {
    if (!tipoPersona) return false;
    return documentTypes
      .filter(doc => doc.isRequired)
      .every(doc => archivos[doc.code]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <Loader className="w-10 h-10 text-midBlue animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-darkBlue">Carga de Documentos</h2>
            <p className="text-midBlue">Sube los documentos requeridos según tu tipo de persona</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg border border-lightBlue p-6">
            {/* Selección de Tipo de Persona */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-darkBlue mb-4">Tipo de Persona *</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleTipoPersonaChange('FISICA')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    tipoPersona === 'FISICA'
                      ? 'border-midBlue bg-lightBlue'
                      : 'border-lightBlue hover:border-midBlue'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className={`w-6 h-6 ${
                      tipoPersona === 'FISICA' ? 'text-midBlue' : 'text-gray-400'
                    }`} />
                    <div>
                      <h4 className="font-semibold text-darkBlue">Persona Física</h4>
                      <p className="text-sm text-midBlue">4 documentos requeridos</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTipoPersonaChange('MORAL')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    tipoPersona === 'MORAL'
                      ? 'border-midBlue bg-lightBlue'
                      : 'border-lightBlue hover:border-midBlue'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building className={`w-6 h-6 ${
                      tipoPersona === 'MORAL' ? 'text-midBlue' : 'text-gray-400'
                    }`} />
                    <div>
                      <h4 className="font-semibold text-darkBlue">Persona Moral</h4>
                      <p className="text-sm text-midBlue">2 documentos requeridos</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Documentos Requeridos */}
            {tipoPersona && documentTypes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-darkBlue mb-4">
                  Documentos para {tipoPersona === 'FISICA' ? 'Persona Física' : 'Persona Moral'}
                </h3>
                <div className="space-y-4">
                  {documentTypes.map((documento) => (
                    <div key={documento.code} className="border border-lightBlue rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-midBlue" />
                            <div>
                              <span className="font-medium text-darkBlue">{documento.name}</span>
                              {documento.isRequired && (
                                <span className="ml-2 text-xs text-red-500">*Requerido</span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-midBlue mb-3">{documento.description}</p>
                          
                          {archivos[documento.code] ? (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <div>
                                  <span className="font-medium text-darkBlue">{archivos[documento.code].nombre}</span>
                                  <div className="text-xs text-midBlue">
                                    {archivos[documento.code].tamaño} • {archivos[documento.code].fecha}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(documento.code)}
                                  className="text-red-500 hover:text-red-700 transition text-sm flex items-center gap-1"
                                >
                                  <X className="w-4 h-4" />
                                  Remover
                                </button>
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    className="hidden"
                                    id={`update-${documento.code}`}
                                    accept=".pdf"
                                    onChange={(e) => handleFileUpload(e, documento.code)}
                                  />
                                  <div className="flex items-center space-x-1 px-3 py-1 bg-midBlue text-white rounded-lg hover:bg-darkBlue transition text-sm">
                                    <Upload className="w-4 h-4" />
                                    <span>Actualizar</span>
                                  </div>
                                </label>
                              </div>
                            </div>
                          ) : (
                            <div className={`border-2 border-dashed rounded-lg p-4 text-center transition ${
                              errors[documento.code] 
                                ? 'border-red-500 bg-red-50' 
                                : 'border-lightBlue hover:border-midBlue'
                            }`}>
                              <Upload className="w-6 h-6 text-midBlue mx-auto mb-2" />
                              <p className="text-sm text-darkBlue mb-2">
                                Haz clic para subir el documento en PDF
                              </p>
                              <p className="text-xs text-midBlue mb-2">
                                Máximo 10MB - Solo archivos PDF
                              </p>
                              <input
                                type="file"
                                className="hidden"
                                id={`upload-${documento.code}`}
                                accept=".pdf"
                                onChange={(e) => handleFileUpload(e, documento.code)}
                              />
                              <label
                                htmlFor={`upload-${documento.code}`}
                                className="inline-block px-4 py-2 bg-midBlue text-white rounded-lg hover:bg-darkBlue transition cursor-pointer text-sm"
                              >
                                Seleccionar Archivo
                              </label>
                              {errors[documento.code] && (
                                <p className="text-red-500 text-xs mt-2">{errors[documento.code]}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumen */}
            {tipoPersona && Object.keys(archivos).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-darkBlue mb-4">Resumen de Documentos</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-darkBlue">
                    <strong>{Object.keys(archivos).length}</strong> de{' '}
                    <strong>{documentTypes.filter(doc => doc.isRequired).length}</strong>{' '}
                    documentos requeridos subidos
                  </p>
                  {todosDocumentosSubidos() && (
                    <p className="text-green-600 text-sm font-medium mt-1">
                      ✓ Todos los documentos requeridos han sido subidos
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Botón de envío */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-lightBlue">
              <button 
                type="submit"
                disabled={!tipoPersona || !todosDocumentosSubidos() || uploading}
                className={`px-6 py-2 rounded-lg transition flex items-center gap-2 ${
                  tipoPersona && todosDocumentosSubidos() && !uploading
                    ? 'bg-midBlue text-white hover:bg-darkBlue'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {uploading && <Loader className="w-4 h-4 animate-spin" />}
                {uploading ? 'Enviando...' : 'Enviar Documentos'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <Alert />
    </div>
  );
};

export default DocumentosPro;