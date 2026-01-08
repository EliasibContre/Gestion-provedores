import React, { useState, useEffect } from "react";
import { Search, Eye, User, Building, Download, FileText, Receipt, X, AlertCircle, Info, AlertTriangle, CheckCircle, Loader, FolderArchive, Calendar, DollarSign, FileCode } from "lucide-react";
import DocumentosExpediente from './DocumentosExpediente';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function ExpedientesDigitales() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [vistaActual, setVistaActual] = useState("proveedores");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ type: '', title: '', message: '', showConfirm: false, onConfirm: null });

  // Nuevos estados para modales de órdenes y facturas
  const [modalOrdenesAbierto, setModalOrdenesAbierto] = useState(false);
  const [modalFacturasAbierto, setModalFacturasAbierto] = useState(false);
  const [ordenesCompra, setOrdenesCompra] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [loadingFacturas, setLoadingFacturas] = useState(false);

  useEffect(() => {
    if (vistaActual === 'proveedores') {
      cargarProveedores();
    }
  }, [vistaActual, filtroEstatus, filtroTipo]);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroEstatus) params.append('status', filtroEstatus);
      if (filtroTipo) params.append('personType', filtroTipo);

      const response = await fetch(`${API_BASE}/api/digital-files/providers?${params}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Error al cargar proveedores');

      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error', 'No se pudieron cargar los proveedores');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, title, message, showConfirm = false, onConfirm = null) => {
    setAlertConfig({ type, title, message, showConfirm, onConfirm });
    setAlertOpen(true);
    if ((type === 'success' || type === 'info') && !showConfirm) {
      setTimeout(() => setAlertOpen(false), 4000);
    }
  };

  const Alert = () => {
    if (!alertOpen) return null;
    const alertStyles = {
      success: { bg: 'bg-green-50', border: 'border-green-200', icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />, button: 'bg-green-600 hover:bg-green-700', text: 'text-green-800' },
      error: { bg: 'bg-red-50', border: 'border-red-200', icon: <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />, button: 'bg-red-600 hover:bg-red-700', text: 'text-red-800' },
      warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />, button: 'bg-yellow-600 hover:bg-yellow-700', text: 'text-yellow-800' },
      info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />, button: 'bg-blue-600 hover:bg-blue-700', text: 'text-blue-800' }
    };
    const style = alertStyles[alertConfig.type] || alertStyles.info;

    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity backdrop-blur-sm" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className={`rounded-xl shadow-2xl border-2 ${style.bg} ${style.border} w-full max-w-md transform transition-all duration-300 scale-95 hover:scale-100`}>
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">{style.icon}</div>
                <div className="flex-1">
                  <h3 className={`text-base sm:text-lg font-semibold ${style.text} mb-2`}>{alertConfig.title}</h3>
                  <p className="text-gray-700 whitespace-pre-line text-sm sm:text-base">{alertConfig.message}</p>
                  {alertConfig.showConfirm ? (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                      <button onClick={alertConfig.onConfirm} className={`px-4 sm:px-6 py-2 text-white rounded-lg transition ${style.button} font-medium text-sm sm:text-base`}>Confirmar</button>
                      <button onClick={() => setAlertOpen(false)} className="px-4 sm:px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm sm:text-base">Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => setAlertOpen(false)} className={`mt-4 px-4 sm:px-6 py-2 text-white rounded-lg transition ${style.button} font-medium text-sm sm:text-base`}>Aceptar</button>
                  )}
                </div>
                {!alertConfig.showConfirm && (
                  <button onClick={() => setAlertOpen(false)} className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const abrirModalOrdenes = async (proveedor) => {
    try {
      setLoadingOrdenes(true);
      setProveedorSeleccionado(proveedor);
      setModalOrdenesAbierto(true);

      const response = await fetch(`${API_BASE}/api/digital-files/providers/${proveedor.id}/purchase-orders`, { credentials: 'include' });
      if (!response.ok) throw new Error('Error al obtener órdenes');

      const data = await response.json();
      setOrdenesCompra(data);
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error', 'No se pudieron cargar las órdenes de compra');
      setModalOrdenesAbierto(false);
    } finally {
      setLoadingOrdenes(false);
    }
  };

  const abrirModalFacturas = async (proveedor) => {
    try {
      setLoadingFacturas(true);
      setProveedorSeleccionado(proveedor);
      setModalFacturasAbierto(true);

      const response = await fetch(`${API_BASE}/api/digital-files/providers/${proveedor.id}/purchase-orders`, { credentials: 'include' });
      if (!response.ok) throw new Error('Error al obtener facturas');

      const data = await response.json();
      const facturadas = data.filter(o => o.invoiceStorageKey);
      setFacturas(facturadas);
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error', 'No se pudieron cargar las facturas');
      setModalFacturasAbierto(false);
    } finally {
      setLoadingFacturas(false);
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

  const descargarOrdenPDF = async (orden) => {
    try {
      if (orden.pdfUrl) {
        // Si tiene URL directa de Supabase, abrirla directamente
        window.open(resolveUrl(orden.pdfUrl), '_blank');
      } else {
        // Fallback al endpoint del backend
        window.open(`${API_BASE}/api/digital-files/purchase-orders/${orden.id}/download`, '_blank');
      }
      showAlert('success', 'Descarga Iniciada', `Orden ${orden.number} se está descargando`);
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error', 'No se pudo descargar la orden');
    }
  };

  const descargarFacturaPDF = async (orden) => {
    try {
      if (orden.invoicePdfUrl) {
        // Si tiene URL directa de Supabase, abrirla directamente
        window.open(resolveUrl(orden.invoicePdfUrl), '_blank');
      } else {
        // Fallback al endpoint del backend
        window.open(`${API_BASE}/api/digital-files/purchase-orders/${orden.id}/invoice/download`, '_blank');
      }
      showAlert('success', 'Descarga Iniciada', `Factura ${orden.number} se está descargando`);
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error', 'No se pudo descargar la factura');
    }
  };

  // Descargar factura XML
  const descargarFacturaXML = async (orden) => {
    try {
      if (orden.invoiceXmlUrl) {
        // Si tiene URL directa de Supabase, abrirla directamente
        window.open(resolveUrl(orden.invoiceXmlUrl), '_blank');
      } else {
        // Fallback al endpoint del backend
        window.open(`${API_BASE}/api/digital-files/purchase-orders/${orden.id}/invoice/xml`, '_blank');
      }
      showAlert('success', 'Descarga Iniciada', `XML de factura ${orden.number} se está descargando`);
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error', 'No se pudo descargar el XML');
    }
  };

  const descargarTodasOrdenesExcel = () => {
    if (ordenesCompra.length === 0) return;

    const cabeceras = ["Número", "Estado", "Total", "Fecha Emisión", "Creado Por", "Aprobado Por"];
    const filas = ordenesCompra.map(o => [
      o.number,
      o.status,
      `$${parseFloat(o.total || 0).toFixed(2)}`,
      o.issuedAt ? new Date(o.issuedAt).toLocaleDateString('es-MX') : 'N/A',
      o.createdBy?.fullName || 'N/A',
      o.approvedBy?.fullName || 'Pendiente'
    ]);

    generarExcelConFormato(filas, cabeceras, `Órdenes de Compra - ${proveedorSeleccionado.businessName}`, `OC_${proveedorSeleccionado.businessName.replace(/\s+/g,'_')}`);
    showAlert('success', 'Descarga Exitosa', 'Reporte Excel generado');
  };

  const descargarTodasFacturasExcel = () => {
    if (facturas.length === 0) return;

    const cabeceras = ["Número OC", "Total", "Fecha Emisión", "Archivo PDF", "Archivo XML"];
    const filas = facturas.map(o => [
      o.number,
      `$${parseFloat(o.total || 0).toFixed(2)}`,
      o.issuedAt ? new Date(o.issuedAt).toLocaleDateString('es-MX') : 'N/A',
      o.invoiceStorageKey || 'N/A',
      o.invoiceXmlStorageKey || 'N/A'
    ]);

    generarExcelConFormato(filas, cabeceras, `Facturas - ${proveedorSeleccionado.businessName}`, `FAC_${proveedorSeleccionado.businessName.replace(/\s+/g,'_')}`);
    showAlert('success', 'Descarga Exitosa', 'Reporte Excel generado');
  };

  const generarExcelConFormato = (datos, cabeceras, titulo, nombreArchivo) => {
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="UTF-8"><style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
          .titulo { background-color: #2F4156; color: white; font-size: 18px; font-weight: bold; padding: 15px; text-align: center; border: 1px solid #2F4156; }
          .cabecera { background-color: #567C8D; color: white; font-weight: bold; padding: 10px; border: 1px solid #567C8D; text-align: center; }
          .fila-datos { background-color: #FFFFFF; }
          .fila-datos:nth-child(even) { background-color: #C8D9E6; }
          .celda { padding: 8px; border: 1px solid #567C8D; text-align: left; }
        </style></head>
        <body>
          <table>
            <tr><td colspan="${cabeceras.length}" class="titulo">${titulo}</td></tr>
            <tr>${cabeceras.map(c => `<td class="cabecera">${c}</td>`).join('')}</tr>
            ${datos.map(fila => `<tr class="fila-datos">${fila.map(c => `<td class="celda">${c}</td>`).join('')}</tr>`).join('')}
          </table>
        </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${nombreArchivo}.xls`;
    link.click();
  };

  const proveedoresFiltrados = proveedores.filter(p => {
    const coincide = p.businessName.toLowerCase().includes(busqueda.toLowerCase()) ||
                     (p.emailContacto || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                     p.rfc.toLowerCase().includes(busqueda.toLowerCase());
    return coincide;
  });

  const verDetallesProveedor = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setModalAbierto(true);
  };

  const getEstatusColor = (isActive) => isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-800";
      case "DRAFT": return "bg-yellow-100 text-yellow-800";
      case "PENDING": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  const getTipoColor = (tipo) => {
    if (tipo === 'FISICA') return { bg: "bg-blue-100 text-blue-800", icon: <User className="w-3 h-3" />, text: "Persona Física" };
    if (tipo === 'MORAL') return { bg: "bg-purple-100 text-purple-800", icon: <Building className="w-3 h-3" />, text: "Persona Moral" };
    return { bg: "bg-gray-100 text-gray-800", icon: <User className="w-3 h-3" />, text: "No especificado" };
  };

  if (loading && vistaActual === 'proveedores') {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-midBlue animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-beige min-h-screen">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-darkBlue mb-2">Expedientes Digitales</h1>
        <p className="text-midBlue text-sm sm:text-base">Gestión de proveedores y consulta de información</p>
      </div>

      <div className="bg-white rounded-lg border border-lightBlue p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button onClick={() => setVistaActual("proveedores")} className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition duration-200 text-sm sm:text-base ${vistaActual === "proveedores" ? "bg-midBlue text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Proveedores</button>
          <button onClick={() => setVistaActual("documentos")} className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition duration-200 text-sm sm:text-base ${vistaActual === "documentos" ? "bg-midBlue text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Documentos</button>
        </div>
      </div>

      {vistaActual === "proveedores" && (
        <>
          <div className="bg-white rounded-lg border border-lightBlue p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 justify-between items-start lg:items-center">
              <div className="flex-1 w-full lg:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-midBlue w-4 h-4" />
                  <input type="text" placeholder="Buscar por nombre, email o RFC..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-lightBlue rounded-lg focus:ring-2 focus:ring-midBlue focus:border-midBlue text-darkBlue text-sm sm:text-base" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="flex-1 sm:flex-none px-3 py-2 border border-lightBlue rounded-lg focus:ring-2 focus:ring-midBlue focus:border-midBlue text-darkBlue text-sm sm:text-base min-w-[140px]">
                  <option value="">Todos los tipos</option>
                  <option value="FISICA">Persona Física</option>
                  <option value="MORAL">Persona Moral</option>
                </select>
                <select value={filtroEstatus} onChange={(e) => setFiltroEstatus(e.target.value)} className="flex-1 sm:flex-none px-3 py-2 border border-lightBlue rounded-lg focus:ring-2 focus:ring-midBlue focus:border-midBlue text-darkBlue text-sm sm:text-base min-w-[140px]">
                  <option value="">Todos los estatus</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-lightBlue overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-lightBlue border-b border-midBlue">
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">Nombre</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">Correo</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">Tipo</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">Estatus</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">Órdenes de Compra</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">Facturas</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lightBlue">
                  {proveedoresFiltrados.map((proveedor) => {
                    const tipoInfo = getTipoColor(proveedor.personType);
                    return (
                      <tr key={proveedor.id} className="hover:bg-beige transition-colors">
                        <td className="px-4 sm:px-6 py-3"><div className="text-sm font-medium text-darkBlue">{proveedor.businessName}</div></td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-midBlue">{proveedor.emailContacto || 'N/A'}</td>
                        <td className="px-4 sm:px-6 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoInfo.bg}`}>
                            {tipoInfo.icon}
                            <span className="hidden sm:inline">{tipoInfo.text}</span>
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstatusColor(proveedor.isActive)}`}>{proveedor.isActive ? 'Activo' : 'Inactivo'}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <button onClick={() => abrirModalOrdenes(proveedor)} className="text-green-600 hover:text-green-800 transition p-1 flex items-center gap-1 text-xs" title="Ver Órdenes de Compra">
                            <FileText className="w-4 h-4" />
                            <Eye className="w-3 h-3" />
                          </button>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <button onClick={() => abrirModalFacturas(proveedor)} className="text-blue-600 hover:text-blue-800 transition p-1 flex items-center gap-1 text-xs" title="Ver Facturas">
                            <Receipt className="w-4 h-4" />
                            <Eye className="w-3 h-3" />
                          </button>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <button onClick={() => verDetallesProveedor(proveedor)} className="text-midBlue hover:text-darkBlue transition p-1" title="Ver detalles del proveedor"><Eye className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {proveedoresFiltrados.length === 0 && (
              <div className="text-center py-8">
                <Search className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-midBlue mb-2" />
                <p className="text-darkBlue text-base sm:text-lg">No se encontraron proveedores</p>
                <p className="text-midBlue text-sm">Intenta ajustar los filtros de búsqueda</p>
              </div>
            )}
          </div>
        </>
      )}

      {vistaActual === "documentos" && <DocumentosExpediente showAlert={showAlert} />}

      {/* Modal Detalles Proveedor */}
      {modalAbierto && proveedorSeleccionado && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity backdrop-blur-sm" onClick={() => setModalAbierto(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl border-2 border-midBlue w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 hover:scale-100" onClick={(e) => e.stopPropagation()}>
              <div className="bg-midBlue text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl flex justify-between items-center sticky top-0">
                <h3 className="text-base sm:text-lg font-semibold">Detalles del Proveedor</h3>
                <button onClick={() => setModalAbierto(false)} className="text-white hover:text-lightBlue transition"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div><label className="block text-sm font-medium text-darkBlue mb-2">Información General</label>
                      <div className="space-y-2 sm:space-y-3">
                        <div><span className="text-xs text-midBlue font-medium">Nombre:</span><div className="p-2 sm:p-3 border border-lightBlue rounded-lg bg-beige text-darkBlue mt-1 text-sm sm:text-base">{proveedorSeleccionado.businessName}</div></div>
                        <div><span className="text-xs text-midBlue font-medium">Email:</span><div className="p-2 sm:p-3 border border-lightBlue rounded-lg bg-beige text-darkBlue mt-1 text-sm sm:text-base">{proveedorSeleccionado.emailContacto || 'N/A'}</div></div>
                        <div><span className="text-xs text-midBlue font-medium">RFC:</span><div className="p-2 sm:p-3 border border-lightBlue rounded-lg bg-beige text-darkBlue mt-1 text-sm sm:text-base">{proveedorSeleccionado.rfc}</div></div>
                        <div><span className="text-xs text-midBlue font-medium">Tipo:</span><div className="p-2 sm:p-3 border border-lightBlue rounded-lg bg-beige mt-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(proveedorSeleccionado.personType).bg}`}>
                            {getTipoColor(proveedorSeleccionado.personType).icon}{getTipoColor(proveedorSeleccionado.personType).text}
                          </span>
                        </div></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div><label className="block text-sm font-medium text-darkBlue mb-2">Estado y Documentos</label>
                      <div className="space-y-2 sm:space-y-3">
                        <div><span className="text-xs text-midBlue font-medium">Estatus:</span><div className="p-2 sm:p-3 border border-lightBlue rounded-lg bg-beige mt-1">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstatusColor(proveedorSeleccionado.isActive)}`}>{proveedorSeleccionado.isActive ? 'Activo' : 'Inactivo'}</span>
                        </div></div>
                        <div><span className="text-xs text-midBlue font-medium">Documentos Aprobados:</span><div className="p-2 sm:p-3 border border-lightBlue rounded-lg bg-beige text-darkBlue mt-1 text-sm sm:text-base">{proveedorSeleccionado.documents?.filter(d => d.status === 'APPROVED').length || 0}</div></div>
                        <div><span className="text-xs text-midBlue font-medium">Órdenes de Compra:</span><div className="p-2 sm:p-3 border border-lightBlue rounded-lg bg-beige text-darkBlue mt-1 text-sm sm:text-base">{proveedorSeleccionado.purchaseOrders?.length || 0}</div></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-lightBlue">
                  <button onClick={() => setModalAbierto(false)} className="bg-midBlue text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-darkBlue transition duration-200 font-medium flex-1 text-sm sm:text-base">Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Órdenes de Compra */}
      {modalOrdenesAbierto && proveedorSeleccionado && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity backdrop-blur-sm" onClick={() => setModalOrdenesAbierto(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl border-2 border-green-600 w-full max-w-6xl max-h-[90vh] overflow-y-auto transform transition-all duration-300" onClick={(e) => e.stopPropagation()}>
              <div className="bg-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl flex justify-between items-center sticky top-0">
                <h3 className="text-base sm:text-lg font-semibold">Órdenes de Compra - {proveedorSeleccionado.businessName}</h3>
                <button onClick={() => setModalOrdenesAbierto(false)} className="text-white hover:text-green-200 transition"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
              </div>
              <div className="p-4 sm:p-6">
                {loadingOrdenes ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 text-green-600 animate-spin" />
                  </div>
                ) : ordenesCompra.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-green-600 mb-2" />
                    <p className="text-darkBlue text-lg">No hay órdenes de compra registradas</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex gap-2">
                      <button onClick={descargarTodasOrdenesExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4" />
                        Descargar Excel
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed">
                        <colgroup>
                          <col className="w-44"/><col className="w-28"/><col className="w-32"/><col className="w-36"/><col className="w-44"/><col className="w-24"/>
                        </colgroup>
                        <thead>
                          <tr className="bg-green-100 border-b border-green-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-darkBlue uppercase">Número</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-darkBlue uppercase">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-darkBlue uppercase">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-darkBlue uppercase">Fecha</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-darkBlue uppercase">Creado Por</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-darkBlue uppercase">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-green-100">
                          {ordenesCompra.map(o=>(
                            <tr key={o.id} className="hover:bg-green-50 transition-colors">
                              <td className="px-4 py-3 text-sm font-medium text-darkBlue truncate">{o.number}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(o.status)} whitespace-nowrap`}>{o.status}</span>
                              </td>
                              <td className="px-4 py-3 text-sm text-darkBlue">
                                <div className="flex items-center gap-1 whitespace-nowrap">
                                  <DollarSign className="w-3 h-3 text-green-600"/>{parseFloat(o.total||0).toFixed(2)}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-midBlue">
                                <div className="flex items-center gap-1 whitespace-nowrap">
                                  <Calendar className="w-3 h-3"/>{o.issuedAt?new Date(o.issuedAt).toLocaleDateString('es-MX'):'N/A'}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-midBlue truncate">{o.createdBy?.fullName||'N/A'}</td>
                              <td className="px-4 py-3 text-center">
                                <button onClick={()=>descargarOrdenPDF(o)} className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 text-xs" title="Descargar PDF">
                                  <FileText className="w-4 h-4"/><Download className="w-3 h-3"/>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Facturas */}
      {modalFacturasAbierto && proveedorSeleccionado && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity backdrop-blur-sm" onClick={() => setModalFacturasAbierto(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-600 w-full max-w-6xl max-h-[90vh] overflow-y-auto transform transition-all duration-300" onClick={(e) => e.stopPropagation()}>
              <div className="bg-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl flex justify-between items-center sticky top-0">
                <h3 className="text-base sm:text-lg font-semibold">Facturas - {proveedorSeleccionado.businessName}</h3>
                <button onClick={() => setModalFacturasAbierto(false)} className="text-white hover:text-blue-200 transition"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
              </div>
              <div className="p-4 sm:p-6">
                {loadingFacturas ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : facturas.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="w-12 h-12 mx-auto text-blue-600 mb-2" />
                    <p className="text-darkBlue text-lg">No hay facturas registradas</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex gap-2">
                      <button onClick={descargarTodasFacturasExcel} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm">
                        <Receipt className="w-4 h-4" />
                        Descargar Excel
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed">
                        <colgroup>
                          <col className="w-44"/><col className="w-32"/><col className="w-36"/><col className="w-48"/><col className="w-24"/>
                        </colgroup>
                        <thead>
                          <tr className="bg-blue-100 border-b border-blue-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-darkBlue uppercase">Número OC</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-darkBlue uppercase">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-darkBlue uppercase">Fecha</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-darkBlue uppercase">Archivo PDF</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-darkBlue uppercase">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-100">
                          {facturas.map(f=>(
                            <tr key={f.id} className="hover:bg-blue-50 transition-colors">
                              <td className="px-4 py-3 text-sm font-medium text-darkBlue truncate">{f.number}</td>
                              <td className="px-4 py-3 text-sm text-darkBlue">
                                <div className="flex items-center gap-1 whitespace-nowrap">
                                  <DollarSign className="w-3 h-3 text-blue-600"/>{parseFloat(f.total||0).toFixed(2)}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-midBlue">
                                <div className="flex items-center gap-1 whitespace-nowrap">
                                  <Calendar className="w-3 h-3"/>{f.issuedAt?new Date(f.issuedAt).toLocaleDateString('es-MX'):'N/A'}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-xs text-midBlue truncate">{f.invoiceStorageKey}</td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={()=>descargarFacturaPDF(f)} className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 text-xs" title="Descargar PDF">
                                    <Receipt className="w-4 h-4"/><Download className="w-3 h-3"/>
                                  </button>
                                  {f.invoiceXmlStorageKey && (
                                    <button onClick={()=>descargarFacturaXML(f)} className="text-purple-600 hover:text-purple-800 inline-flex items-center gap-1 text-xs" title="Descargar XML">
                                      <FileCode className="w-4 h-4"/><Download className="w-3 h-3"/>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <Alert />
    </div>
  );
}

export default ExpedientesDigitales;