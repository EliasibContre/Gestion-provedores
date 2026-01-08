import React, { useState, useEffect } from "react";
import { Search, Check, X, Clock, Download, FileText, Loader, ShoppingCart, Receipt, Package } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Aprobacion({ showAlert }) {
  const [vistaActual, setVistaActual] = useState("documentos"); // "documentos" o "ordenes"
  const [documentos, setDocumentos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState("");
  const [modalRechazo, setModalRechazo] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (vistaActual === "documentos") {
      cargarDocumentos();
    } else {
      cargarOrdenes();
    }
  }, [filtroEstatus, vistaActual]);

  const cargarDocumentos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroEstatus) params.append('status', filtroEstatus);

      const response = await fetch(
        `${API_BASE}/api/document-reviews?${params}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Error al cargar documentos');
      }

        let data;
        try {
          data = await response.json();
        } catch (err) {
          const text = await response.text();
          console.error('Expected JSON but received:', text);
          throw new Error('Respuesta inesperada del servidor');
        }
        // API may return either an array or an object { data, hasMore }
        setDocumentos(Array.isArray(data) ? data : (data?.data || []));
    } finally {
      setLoading(false);
    }
  };

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroEstatus) params.append('status', filtroEstatus);

      const response = await fetch(
        `${API_BASE}/api/purchase-orders/pending-approval?${params}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Error al cargar órdenes');
      }

        let data;
        try {
          data = await response.json();
        } catch (err) {
          const text = await response.text();
          console.error('Expected JSON but received:', text);
          throw new Error('Respuesta inesperada del servidor');
        }
        // API may return { data, hasMore, nextCursor } or an array directly
        setOrdenes(Array.isArray(data) ? data : (data?.data || []));
    } finally {
      setLoading(false);
    }
  };

  const aprobarDocumento = async (documentId) => {
    try {
      setProcesando(true);
      const response = await fetch(
        `${API_BASE}/api/document-reviews/${documentId}/approve`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al aprobar documento');
      }

      showAlert('success', 'Documento Aprobado', 'El documento ha sido aprobado exitosamente');
      cargarDocumentos();
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error', error.message);
    } finally {
      setProcesando(false);
    }
  };

  const aprobarOrden = async (ordenId) => {
    try {
      setProcesando(true);
      const response = await fetch(
        `${API_BASE}/api/purchase-orders/${ordenId}/approve`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comments: 'Aprobada' })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al aprobar orden');
      }

      showAlert('success', 'Orden Aprobada', 'La orden de compra ha sido aprobada y enviada');
      cargarOrdenes();
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error', error.message);
    } finally {
      setProcesando(false);
    }
  };

  const descargarOrden = (orden) => {
    if (!orden?.pdfUrl) return;
    const url = orden.pdfUrl.startsWith('http') ? orden.pdfUrl : `${API_BASE}${orden.pdfUrl}`;
    window.open(url, '_blank');
  };

  const marcarComoRecibida = async (ordenId) => {
    try {
      setProcesando(true);
      const response = await fetch(
        `${API_BASE}/api/purchase-orders/${ordenId}/mark-received`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al marcar como recibida');
      }

      showAlert('success', 'Orden Recibida', 'La orden ha sido marcada como recibida');
      cargarOrdenes();
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error', error.message);
    } finally {
      setProcesando(false);
    }
  };

  const abrirModalRechazo = (item, tipo = "documento") => {
    // Si el segundo argumento es un objeto (orden), ajustar automáticamente
    if (tipo && typeof tipo === 'object' && !Array.isArray(tipo)) {
      item = tipo;
      tipo = 'orden';
    }
    if (tipo === 'orden') {
      setOrdenSeleccionada(item);
      setDocumentoSeleccionado(null);
    } else {
      setDocumentoSeleccionado(item);
      setOrdenSeleccionada(null);
    }
    setMotivoRechazo("");
    setModalRechazo(true);
  };

  const confirmarRechazo = async () => {
    if (!motivoRechazo.trim() || motivoRechazo.trim().length < 3) {
      showAlert('error', 'Motivo Requerido', 'Por favor ingrese un motivo válido (mínimo 3 caracteres)');
      return;
    }

    try {
      setProcesando(true);
      
      let url, body;
      if (documentoSeleccionado) {
        url = `${API_BASE}/api/document-reviews/${documentoSeleccionado.id}/reject`;
        body = { reason: motivoRechazo.trim() };
      } else if (ordenSeleccionada) {
        url = `${API_BASE}/api/purchase-orders/${ordenSeleccionada.id}/reject`;
        body = { reason: motivoRechazo.trim() };
      } else {
        throw new Error('No hay elemento seleccionado');
      }

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al rechazar');
      }

      showAlert('success', 'Rechazado', documentoSeleccionado ? 'El documento ha sido rechazado' : 'La orden ha sido rechazada');
      setModalRechazo(false);
      setDocumentoSeleccionado(null);
      setOrdenSeleccionada(null);
      
      if (documentoSeleccionado) {
        cargarDocumentos();
      } else {
        cargarOrdenes();
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error', error.message);
    } finally {
      setProcesando(false);
    }
  };

  // Función para resolver URLs (igual que en Graficas.jsx)
  const resolveUrl = (url) => {
    if (!url) return null;
    try {
      return String(url).startsWith('http') ? url : `${API_BASE}${url}`;
    } catch (e) {
      return `${API_BASE}${url}`;
    }
  };

  const descargarDocumento = async (documento) => {
    try {
      if (documento.fileUrl) {
        // Si tiene URL directa de Supabase, abrirla directamente
        window.open(resolveUrl(documento.fileUrl), '_blank');
      } else {
        // Fallback al endpoint del backend
        window.open(`${API_BASE}/api/document-reviews/${documento.id}/download`, '_blank');
      }
      
      showAlert('success', 'Descarga Exitosa', 'El documento se ha descargado correctamente');
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error', 'No se pudo descargar el documento');
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEstadoIcono = (estado) => {
    switch (estado) {
      case "APPROVED":
        return <Check className="w-3 h-3" />;
      case "REJECTED":
        return <X className="w-3 h-3" />;
      case "PENDING":
        return <Clock className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case "APPROVED": return "Aprobado";
      case "REJECTED": return "Rechazado";
      case "PENDING": return "Pendiente";
      default: return estado;
    }
  };

  const documentosFiltrados = documentos.filter(doc => {
    const coincideBusqueda = 
      doc.provider.businessName.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.documentType.name.toLowerCase().includes(busqueda.toLowerCase());
    return coincideBusqueda;
  });

  const ordenesFiltradas = ordenes.filter(orden => {
    const coincideBusqueda = 
      orden.number.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.provider?.businessName.toLowerCase().includes(busqueda.toLowerCase());
    return coincideBusqueda;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-midBlue animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Pestañas de navegación */}
      <div className="bg-white rounded-lg border border-lightBlue p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => setVistaActual("documentos")}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition duration-200 text-sm sm:text-base flex items-center justify-center gap-2 ${
              vistaActual === "documentos"
                ? "bg-midBlue text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            Documentos
          </button>
          <button
            onClick={() => setVistaActual("ordenes")}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition duration-200 text-sm sm:text-base flex items-center justify-center gap-2 ${
              vistaActual === "ordenes"
                ? "bg-midBlue text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Órdenes de Compra
          </button>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="bg-white rounded-lg border border-lightBlue p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 justify-between items-start lg:items-center">
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-midBlue w-4 h-4" />
              <input
                type="text"
                placeholder={vistaActual === "documentos" ? "Buscar por proveedor o solicitud..." : "Buscar por número de orden o proveedor..."}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-lightBlue rounded-lg focus:ring-2 focus:ring-midBlue focus:border-midBlue text-darkBlue text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <select
              value={filtroEstatus}
              onChange={(e) => setFiltroEstatus(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 border border-lightBlue rounded-lg focus:ring-2 focus:ring-midBlue focus:border-midBlue text-darkBlue text-sm sm:text-base min-w-[140px]"
            >
              {vistaActual === "documentos" ? (
                <>
                  <option value="">Todos los estados</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="APPROVED">Aprobado</option>
                  <option value="REJECTED">Rechazado</option>
                </>
              ) : (
                <>
                  <option value="">Todos los estados</option>
                  <option value="DRAFT">Borrador</option>
                  <option value="SENT">Enviada</option>
                  <option value="RECEIVED">Recibida</option>
                  <option value="CANCELLED">Cancelada</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Vista condicional: Documentos o Órdenes */}
      <div className={vistaActual === "documentos" ? 'block' : 'hidden'}>
        {/* Tabla de Documentos */}
        <div className="bg-white rounded-lg border border-lightBlue overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-lightBlue border-b border-midBlue">
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">
                  Tipo de Documento
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">
                  Comentario
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lightBlue">
              {documentosFiltrados.map((documento) => (
                <tr key={documento.id} className="hover:bg-beige transition-colors">
                  <td className="px-4 sm:px-6 py-3">
                    <div className="text-sm font-medium text-darkBlue">
                      #{documento.id}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <div className="text-sm font-medium text-darkBlue">
                      {documento.provider.businessName}
                    </div>
                    <div className="text-xs text-midBlue">
                      {documento.provider.rfc}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm text-midBlue">
                    {documento.documentType.name}
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(documento.status)}`}>
                      {getEstadoIcono(documento.status)}
                      <span className="hidden sm:inline">{getEstadoTexto(documento.status)}</span>
                      <span className="sm:hidden">
                        {documento.status === 'PENDING' ? 'Pend.' : 
                         documento.status === 'APPROVED' ? 'Aprob.' : 'Rech.'}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm text-midBlue">
                    {new Date(documento.createdAt).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <button
                      onClick={() => descargarDocumento(documento)}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-xs font-medium"
                      title="Descargar PDF"
                    >
                      <FileText className="w-3 h-3" />
                      <Download className="w-3 h-3" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm text-midBlue max-w-xs">
                    {documento.notes ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
                        <p className="text-red-700 text-xs line-clamp-2">{documento.notes}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Sin comentarios</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <div className="flex gap-1 sm:gap-2">
                      {documento.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => aprobarDocumento(documento.id)}
                            disabled={procesando}
                            className="text-green-600 hover:text-green-800 transition p-1 disabled:opacity-50"
                            title="Aprobar documento"
                          >
                            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={() => abrirModalRechazo(documento)}
                            disabled={procesando}
                            className="text-red-600 hover:text-red-800 transition p-1 disabled:opacity-50"
                            title="Rechazar documento"
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </>
                      )}
                      {(documento.status === "APPROVED" || documento.status === "REJECTED") && (
                        <span className="text-xs text-gray-500 italic">
                          Resuelto
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {documentosFiltrados.length === 0 && (
          <div className="text-center py-8">
            <div className="text-midBlue mb-2">
              <Search className="w-8 h-8 sm:w-12 sm:h-12 mx-auto" />
            </div>
            <p className="text-darkBlue text-base sm:text-lg">No se encontraron documentos</p>
            <p className="text-midBlue text-sm">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
        </div>
      </div>

      {/* Vista de Órdenes de Compra */}
      <div className={vistaActual === 'ordenes' ? 'block' : 'hidden'}>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-darkBlue to-lightBlue text-white">
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">N° Orden</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Proveedor</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold hidden sm:table-cell">Total</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold hidden md:table-cell">Fecha</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold hidden lg:table-cell">Orden PDF</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Estado</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold hidden lg:table-cell">Factura</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center">
                      <Loader className="w-8 h-8 animate-spin mx-auto text-lightBlue" />
                      <p className="text-gray-500 mt-2 text-sm">Cargando órdenes de compra...</p>
                    </td>
                  </tr>
                ) : ordenes.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center">
                      <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">No hay órdenes de compra pendientes de aprobación</p>
                    </td>
                  </tr>
                ) : (
                  ordenes.map((orden) => (
                    <tr 
                      key={orden.id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <p className="text-xs sm:text-sm font-medium text-darkBlue">
                          {orden.number}
                        </p>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {orden.provider?.businessName || 'N/A'}
                        </p>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                        <p className="text-xs sm:text-sm text-gray-900 font-medium">
                          ${parseFloat(orden.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">
                        <p className="text-xs sm:text-sm text-gray-600">
                          {new Date(orden.issuedAt).toLocaleDateString('es-MX')}
                        </p>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
                        {orden.pdfUrl ? (
                          <button
                            onClick={() => descargarOrden(orden)}
                            className="flex items-center gap-1 px-2 py-1 bg-darkBlue hover:bg-midBlue text-white rounded-lg transition text-xs"
                            title="Descargar Orden"
                          >
                            <FileText className="w-3 h-3" />
                            <span>PDF</span>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Sin PDF</span>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          orden.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : (orden.status === 'SENT' || orden.status === 'APPROVED')
                            ? 'bg-blue-100 text-blue-800'
                            : orden.status === 'RECEIVED'
                            ? 'bg-green-100 text-green-800'
                            : orden.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {orden.status === 'DRAFT' ? 'Pendiente' :
                           (orden.status === 'SENT' || orden.status === 'APPROVED') ? 'Aprobada' :
                           orden.status === 'RECEIVED' ? 'Recibida' :
                           orden.status === 'CANCELLED' ? 'Rechazada' :
                           orden.status === 'CLOSED' ? 'Cerrada' : orden.status}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
                        {orden.invoicePdfUrl || orden.invoiceXmlUrl ? (
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                            <Receipt className="w-4 h-4" />
                            <span>Subida</span>
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm text-gray-400">Sin factura</span>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center items-center">
                          {orden.status === 'DRAFT' && (
                            <>
                              <button
                                onClick={() => aprobarOrden(orden.id)}
                                disabled={procesando}
                                className="bg-green-600 text-white p-1.5 sm:p-2 rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 flex items-center gap-1 text-xs sm:text-sm w-full sm:w-auto justify-center"
                              >
                                <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="sm:inline">Aprobar</span>
                              </button>
                              <button
                                onClick={() => abrirModalRechazo(orden, 'orden')}
                                disabled={procesando}
                                className="bg-red-600 text-white p-1.5 sm:p-2 rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 flex items-center gap-1 text-xs sm:text-sm w-full sm:w-auto justify-center"
                              >
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="sm:inline">Rechazar</span>
                              </button>
                            </>
                          )}
                          {(orden.status === 'SENT' || orden.status === 'APPROVED') && (
                            <button
                              onClick={() => marcarComoRecibida(orden.id)}
                              disabled={procesando}
                              className="bg-blue-600 text-white p-1.5 sm:p-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 flex items-center gap-1 text-xs sm:text-sm w-full sm:w-auto justify-center"
                            >
                              <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="sm:inline">Marcar Recibida</span>
                            </button>
                          )}
                          {orden.status === 'RECEIVED' && (
                            <span className="text-xs sm:text-sm text-gray-500 italic">Orden recibida</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de rechazo */}
      {modalRechazo && (documentoSeleccionado || ordenSeleccionada) && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity backdrop-blur-sm"
            onClick={() => !procesando && setModalRechazo(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl border-2 border-red-300 w-full max-w-md">
              <div className="bg-red-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-semibold">Motivo del Rechazo</h3>
                <button
                  onClick={() => !procesando && setModalRechazo(false)}
                  className="text-white hover:text-red-200 transition"
                  disabled={procesando}
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div>
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    Especifique el motivo del rechazo:
                  </p>
                  <p className="font-medium text-darkBlue mb-2 text-sm sm:text-base">
                    {documentoSeleccionado 
                      ? `${documentoSeleccionado.provider.businessName} - ${documentoSeleccionado.documentType.name}`
                      : `${ordenSeleccionada?.provider?.businessName || 'N/A'} - Orden ${ordenSeleccionada?.number}`
                    }
                  </p>
                  
                  <label className="block text-sm font-medium text-darkBlue mb-2">
                    Motivo *
                  </label>
                  <textarea
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    className="w-full p-2 sm:p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-darkBlue text-sm sm:text-base"
                    rows="3"
                    placeholder="Describa el motivo del rechazo (mínimo 3 caracteres)..."
                    required
                    disabled={procesando}
                  />
                  <p className="text-red-500 text-xs mt-1">
                    Este comentario será visible para el proveedor.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    onClick={confirmarRechazo}
                    className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-red-700 transition duration-200 font-medium flex-1 text-sm sm:text-base disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={!motivoRechazo.trim() || procesando}
                  >
                    {procesando && <Loader className="w-4 h-4 animate-spin" />}
                    {procesando ? 'Procesando...' : 'Confirmar Rechazo'}
                  </button>
                  <button
                    onClick={() => setModalRechazo(false)}
                    className="bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-600 transition duration-200 font-medium flex-1 text-sm sm:text-base disabled:opacity-50"
                    disabled={procesando}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Aprobacion;