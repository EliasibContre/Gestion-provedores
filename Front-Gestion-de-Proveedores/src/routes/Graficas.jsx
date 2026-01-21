import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FileText, Download, Eye, Trash2, Plus, Edit, 
  AlertCircle, CheckCircle2, Info, X, FileSpreadsheet, Loader2 
} from "lucide-react";

// Configuración base de la API (ajusta si usas variables de entorno)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function Graficas({ showAlert }) {
  const [loading, setLoading] = useState(true);
  
  // Estado para los datos de la tabla (Proveedores)
  const [tableData, setTableData] = useState([]);
  
  // Estado para las gráficas (Valores iniciales en 0 para evitar errores visuales)
  const [chartData, setChartData] = useState({
    proveedores: { aprobado: 0, rechazado: 0 },
    facturas: { aprobadas: 0, rechazadas: 0, "pendientes por pagar": 0, pagadas: 0 },
    contratos: { nuevos: 0, "en aviso": 0, vencidos: 0 },
    ordenesCompra: { retrasadas: 0, aprobadas: 0, rechazadas: 0 },
  });

  const [editingComment, setEditingComment] = useState(null);
  const [commentText, setCommentText] = useState("");

  // --- EFECTO: CARGAR DATOS REALES DEL BACKEND ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Obtener estadísticas para las gráficas
        // NOTA: Asegúrate de que tu backend tenga habilitada la ruta /api/analytics/dashboard
        const statsRes = await axios.get(`${API_BASE_URL}/api/analytics/dashboard`, { withCredentials: true });
        
        if (statsRes.data) {
          setChartData(statsRes.data);
        }

        // 2. Obtener lista de proveedores para la tabla
        const providersRes = await axios.get(`${API_BASE_URL}/api/providers`, { withCredentials: true });
        
        if (providersRes.data && providersRes.data.results) {
          // Transformamos los datos del backend al formato que necesita la tabla visual
          const mappedProviders = providersRes.data.results.map(p => ({
            id: p.id,
            proveedor: p.businessName || "Sin Nombre",
            // Como el backend actual no envía documentos anidados en la búsqueda, iniciamos vacíos
            facturas: [], 
            ordenesCompra: [], 
            documentosRespaldo: [], 
            estatus: p.isActive ? "Activo" : "Inactivo",
            categoria: p.personType === "MORAL" ? "Empresa" : "Persona Física",
            comentarios: p.observaciones ? [p.observaciones] : [] // Convertimos string de observaciones a array
          }));
          setTableData(mappedProviders);
        }

      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
        showAlert('error', 'Error de Conexión', 'No se pudieron cargar los datos del servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Se ejecuta solo al montar el componente

  // --- FUNCIONES CRUD (Adaptadas para conectar a API en el futuro) ---
  const handleDelete = async (id) => {
    const proveedor = tableData.find(p => p.id === id);
    showAlert('warning', 
      'Confirmar Eliminación', 
      `¿Estás seguro de que quieres eliminar a "${proveedor?.proveedor}"? Esta acción no se puede deshacer.`,
      true,
      async () => {
        try {
          // Llamada real al backend para eliminar (inactivar)
          await axios.delete(`${API_BASE_URL}/api/providers/${id}`, { withCredentials: true });
          
          // Actualizar estado local
          setTableData(tableData.filter(item => item.id !== id));
          showAlert('success', 'Eliminado', 'El proveedor ha sido dado de baja correctamente');
        } catch (error) {
          console.error("Error eliminando proveedor:", error);
          showAlert('error', 'Error', 'No se pudo eliminar el proveedor');
        }
      }
    );
  };

  const handleView = (id) => {
    const proveedor = tableData.find(p => p.id === id);
    // Aquí podrías navegar a una ruta de detalle si la tienes: navigate(`/proveedores/${id}`)
    showAlert('info', 'Detalles del Proveedor', 
      `Nombre: ${proveedor.proveedor}\nCategoría: ${proveedor.categoria}\nEstatus: ${proveedor.estatus}\nID Sistema: ${proveedor.id}`);
  };

  // --- FUNCIONES DE EXPORTACIÓN (PDF/EXCEL) ---
  // (Se mantienen igual que en tu Repo 2, son puramente frontend)

  const generarExcelConFormato = (datos, cabeceras, titulo, nombreArchivo) => {
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
            .titulo { background-color: #2F4156; color: white; font-size: 18px; font-weight: bold; padding: 15px; text-align: center; border: 1px solid #2F4156; }
            .cabecera { background-color: #567C8D; color: white; font-weight: bold; padding: 10px; border: 1px solid #567C8D; text-align: center; }
            .fila-datos { background-color: #FFFFFF; }
            .fila-datos:nth-child(even) { background-color: #C8D9E6; }
            .celda { padding: 8px; border: 1px solid #567C8D; text-align: left; }
            .celda-numero { text-align: right; padding: 8px; border: 1px solid #567C8D; }
            .celda-centro { text-align: center; padding: 8px; border: 1px solid #567C8D; }
          </style>
        </head>
        <body>
          <table>
            <tr><td colspan="${cabeceras.length}" class="titulo">${titulo}</td></tr>
            <tr>${cabeceras.map(cabecera => `<td class="cabecera">${cabecera}</td>`).join('')}</tr>
            ${datos.map(fila => `
              <tr class="fila-datos">
                ${fila.map((celda, i) => {
                  const esNumero = !isNaN(parseFloat(celda)) && isFinite(celda);
                  const esCentro = cabeceras[i] === 'ESTATUS' || cabeceras[i] === 'Fecha';
                  const clase = esNumero ? 'celda-numero' : (esCentro ? 'celda-centro' : 'celda');
                  return `<td class="${clase}">${celda}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${nombreArchivo}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generarPDF = (documento, tipo, proveedor) => {
    const contenido = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${documento.nombre}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { border-bottom: 3px solid #2F4156; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
          .info { margin: 20px 0; }
          .label { font-weight: bold; color: #2F4156; width: 150px; display: inline-block; }
          .section { margin: 25px 0; padding: 15px; border-left: 4px solid #567C8D; background-color: #f8f9fa; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #567C8D; color: white; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DOCUMENTO - ${tipo.toUpperCase()}</h1>
          <p>Sistema de Gestión de Proveedores</p>
        </div>
        <div class="info">
          <h2>Información del Documento</h2>
          <p><span class="label">Documento:</span> ${documento.nombre}</p>
          <p><span class="label">Tipo:</span> ${tipo}</p>
          <p><span class="label">Tamaño:</span> ${documento.tamaño}</p>
          <p><span class="label">Fecha:</span> ${new Date().toLocaleDateString('es-MX')}</p>
        </div>
        <div class="section">
          <h2>Información del Proveedor</h2>
          <p><span class="label">Proveedor:</span> ${proveedor.proveedor}</p>
          <p><span class="label">Categoría:</span> ${proveedor.categoria}</p>
          <p><span class="label">Estatus:</span> ${proveedor.estatus}</p>
        </div>
        <div class="footer">
          <p>Documento generado automáticamente - Sistema de Gestión de Proveedores</p>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([contenido], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documento.nombre.replace('.pdf', '')}_${tipo}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const descargarExcel = (documento, tipo, proveedor) => {
    // Implementación simplificada para mantener compatibilidad
    try {
      const datos = [{
        Proveedor: proveedor.proveedor,
        Documento: documento.nombre,
        Tipo: tipo,
        Tamaño: documento.tamaño,
        Fecha: new Date().toLocaleDateString('es-MX')
      }];
      const cabeceras = ["Proveedor", "Documento", "Tipo", "Tamaño", "Fecha"];
      generarExcelConFormato(datos.map(d => Object.values(d)), cabeceras, `REPORTE ${tipo.toUpperCase()}`, `doc_${documento.id}`);
      showAlert('success', 'Descarga Completada', 'Archivo Excel generado');
    } catch (e) {
      console.error(e);
      showAlert('error', 'Error', 'No se pudo generar el Excel');
    }
  };

  const descargarPDF = (documento, tipo, proveedor) => {
    try {
      generarPDF(documento, tipo, proveedor);
      showAlert('success', 'Descarga Completada', 'Vista previa PDF generada');
    } catch (e) {
      console.error(e);
      showAlert('error', 'Error', 'No se pudo generar el PDF');
    }
  };

  // --- FUNCIONES VISUALES (GRÁFICAS) ---
  const getChartColors = (chartType, labels) => {
    const colorMap = { verde: '#10b981', rojo: '#ef4444', amarillo: '#f59e0b', azul: '#3b82f6', verdeo: '#045338ff' };
    const colorRules = {
      proveedores: { 'aprobado': colorMap.verde, 'rechazado': colorMap.rojo },
      facturas: { 'aprobadas': colorMap.verde, 'rechazadas': colorMap.rojo, 'pendientes por pagar': colorMap.amarillo, 'pagadas': colorMap.verdeo },
      contratos: { 'nuevos': colorMap.azul, 'en aviso': colorMap.amarillo, 'vencidos': colorMap.rojo },
      ordenesCompra: { 'retrasadas': colorMap.amarillo, 'aprobadas': colorMap.verde, 'rechazadas': colorMap.rojo }
    };
    return labels.map(label => colorRules[chartType]?.[label] || '#6b7280');
  };

  const PieChart = ({ data, title, chartType }) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    const labels = Object.keys(data);
    const colors = getChartColors(chartType, labels);
    
    // Si no hay datos, mostrar placeholder
    if (total === 0) {
      return (
        <div className="bg-white p-6 rounded-xl border border-lightBlue shadow-lg flex flex-col items-center justify-center h-64">
          <h3 className="text-lg font-semibold text-darkBlue mb-2">{title}</h3>
          <p className="text-gray-400 text-sm">Sin datos disponibles</p>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-xl border border-lightBlue shadow-lg">
        <h3 className="text-lg font-semibold text-darkBlue mb-4 text-center">{title}</h3>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="relative w-40 h-40 mx-auto">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              {Object.values(data).map((value, index) => {
                const percentage = (value / total) * 100;
                const strokeDasharray = `${percentage} ${100 - percentage}`;
                const previousPercentages = Object.values(data).slice(0, index).reduce((sum, val) => sum + (val / total) * 100, 0);
                const strokeDashoffset = 100 - previousPercentages;
                return (
                  <circle key={index} cx="18" cy="18" r="15.9155" fill="transparent" stroke={colors[index]} strokeWidth="3"
                    strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-bold text-darkBlue">{total}</span>
              <span className="text-sm text-midBlue">Total</span>
            </div>
          </div>
          <div className="flex-1 space-y-3 min-w-0">
            {Object.entries(data).map(([key, value], index) => {
              const percentage = ((value / total) * 100).toFixed(1);
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors[index] }}></div>
                    <span className="text-xs text-darkBlue capitalize">{key}:</span>
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

  // --- COMPONENTES AUXILIARES ---
  const DocumentList = ({ documentos, tipo, proveedor }) => (
    <div className="space-y-2">
      {documentos && documentos.length > 0 ? (
        documentos.map((doc, idx) => (
          <div key={doc.id || idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="w-4 h-4 text-midBlue flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-darkBlue truncate">{doc.nombre}</p>
                <p className="text-xs text-gray-500">{doc.tamaño || 'N/A'}</p>
              </div>
            </div>
            <div className="flex gap-1 ml-2 flex-shrink-0">
              <button onClick={() => descargarExcel(doc, tipo, proveedor)} className="p-2 text-green-600 hover:bg-green-50 rounded"><FileSpreadsheet className="w-4 h-4" /></button>
              <button onClick={() => descargarPDF(doc, tipo, proveedor)} className="p-2 text-red-600 hover:bg-red-50 rounded"><FileText className="w-4 h-4" /></button>
            </div>
          </div>
        ))
      ) : (
        <span className="text-xs text-gray-400 italic">No hay documentos</span>
      )}
    </div>
  );

  const CommentsSection = ({ proveedor }) => {
    // (Simplificado: Solo visualización por ahora ya que el backend maneja observaciones como string único)
    return (
      <div className="space-y-2">
        {proveedor.comentarios && proveedor.comentarios.length > 0 ? (
          proveedor.comentarios.map((comentario, index) => (
            <div key={index} className="flex items-start justify-between">
              <p className="text-xs text-darkBlue bg-lightBlue p-2 rounded w-full">{comentario}</p>
            </div>
          ))
        ) : (
           <span className="text-xs text-gray-400 italic">Sin comentarios</span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-12 h-12 text-midBlue animate-spin mb-4" />
        <p className="text-darkBlue font-medium">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-darkBlue mb-3">Resumen General del Sistema</h2>
        <p className="text-midBlue text-lg">Estadísticas y métricas clave en tiempo real</p>
      </div>

      {/* GRÁFICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        <PieChart title="Proveedores" data={chartData.proveedores} chartType="proveedores" />
        <PieChart title="Facturas" data={chartData.facturas} chartType="facturas" />
        <PieChart title="Contratos" data={chartData.contratos} chartType="contratos" />
        <PieChart title="Órdenes de Compra" data={chartData.ordenesCompra} chartType="ordenesCompra" />
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl border border-lightBlue shadow-lg overflow-hidden">
        <div className="p-6 border-b border-lightBlue">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-darkBlue">Gestión de Proveedores</h3>
              <p className="text-sm text-midBlue mt-1">Lista completa de proveedores registrados</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-lightBlue">
                <th className="px-6 py-4 text-left text-xs font-semibold text-darkBlue uppercase">Proveedor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-darkBlue uppercase">Facturas</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-darkBlue uppercase">Órdenes de Compra</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-darkBlue uppercase">Documentos</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-darkBlue uppercase">Acciones</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-darkBlue uppercase">Comentarios</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lightBlue">
              {tableData.length > 0 ? (
                tableData.map((row) => (
                  <tr key={row.id} className="hover:bg-lightBlue hover:bg-opacity-30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-darkBlue">{row.proveedor}</div>
                        <div className="text-xs text-midBlue">{row.categoria}</div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                          row.estatus === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {row.estatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><DocumentList documentos={row.facturas} tipo="facturas" proveedor={row} /></td>
                    <td className="px-6 py-4"><DocumentList documentos={row.ordenesCompra} tipo="ordenes-compra" proveedor={row} /></td>
                    <td className="px-6 py-4"><DocumentList documentos={row.documentosRespaldo} tipo="documentos-respaldo" proveedor={row} /></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleView(row.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Ver Detalle"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(row.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                    <td className="px-6 py-4"><CommentsSection proveedor={row} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colspan="6" className="px-6 py-8 text-center text-gray-500">
                    No hay proveedores registrados o no se encontraron datos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Graficas;