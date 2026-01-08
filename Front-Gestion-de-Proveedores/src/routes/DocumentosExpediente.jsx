import React, { useState, useEffect } from "react";
import { Search, Clock, Download, FileText, Loader, User } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function DocumentosExpediente({ showAlert }) {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState("");

  useEffect(() => {
    cargarDocumentos();
  }, [filtroEstatus]);

  const cargarDocumentos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroEstatus) params.append('status', filtroEstatus);

      const response = await fetch(`${API_BASE}/api/document-reviews?${params}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Error al cargar documentos');

      const data = await response.json();
      setDocumentos(data);
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error', 'No se pudieron cargar los documentos');
    } finally {
      setLoading(false);
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
      
      showAlert('success', 'Descarga Iniciada', 'El documento se está descargando');
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error', 'No se pudo descargar el documento');
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "APPROVED": return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED": return "bg-red-100 text-red-800 border-red-200";
      case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-midBlue animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg border border-lightBlue p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 justify-between items-start lg:items-center">
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-midBlue w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por proveedor o tipo de documento..."
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
              <option value="">Todos los estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="APPROVED">Aprobado</option>
              <option value="REJECTED">Rechazado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-lightBlue overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-lightBlue border-b border-midBlue">
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">ID</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">Proveedor</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">Tipo de Documento</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">Estado</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">Fecha Subida</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">Documento</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">Comentario</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">Revisado Por</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">Fecha Revisión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lightBlue">
              {documentosFiltrados.map((documento) => (
                <tr key={documento.id} className="hover:bg-beige transition-colors">
                  <td className="px-4 sm:px-6 py-3"><div className="text-sm font-medium text-darkBlue">#{documento.id}</div></td>
                  <td className="px-4 sm:px-6 py-3">
                    <div className="text-sm font-medium text-darkBlue">{documento.provider.businessName}</div>
                    <div className="text-xs text-midBlue">{documento.provider.rfc}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm text-midBlue">{documento.documentType.name}</td>
                  <td className="px-4 sm:px-6 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(documento.status)}`}>
                      <Clock className="w-3 h-3" />
                      <span className="hidden sm:inline">{getEstadoTexto(documento.status)}</span>
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
                    {documento.reviewedBy ? (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-midBlue" />
                        <div>
                          <div className="text-sm font-medium text-darkBlue">{documento.reviewedBy.fullName}</div>
                          <div className="text-xs text-midBlue">{documento.reviewedBy.email}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm text-midBlue">
                    {documento.status !== 'PENDING' && documento.updatedAt
                      ? new Date(documento.updatedAt).toLocaleDateString('es-MX')
                      : <span className="text-gray-400 italic text-xs">N/A</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {documentosFiltrados.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-midBlue mb-2" />
            <p className="text-darkBlue text-base sm:text-lg">No se encontraron documentos</p>
            <p className="text-midBlue text-sm">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentosExpediente;