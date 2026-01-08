import React, { useState, useEffect } from "react";
import axios from 'axios';
import { FileText, Eye, FileSpreadsheet, X, Loader } from "lucide-react";

// Componente de gráficas y tabla para usar directamente en el dashboard
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Graficas({ showAlert }) {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalFacturas, setModalFacturas] = useState({ open: false, proveedor: null, facturas: [] });
  const [modalOrdenes, setModalOrdenes] = useState({ open: false, proveedor: null, ordenes: [] });
  const [modalDocumentos, setModalDocumentos] = useState({ open: false, proveedor: null, documentos: [] });
  const [loadingModal, setLoadingModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [chartData, setChartData] = useState({
    proveedores: { aprobado: 0, rechazado: 0 },
    facturas: { aprobadas: 0, rechazadas: 0, "pendientes por pagar": 0, pagadas: 0 },
    contratos: { nuevos: 0, "en aviso": 0, vencidos: 0 },
    ordenesCompra: { retrasadas: 0, aprobadas: 0, rechazadas: 0 }
  });
  
  // Cargar proveedores activos desde el backend
  useEffect(() => {
    cargarProveedores();
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/analytics/dashboard`, {
        withCredentials: true
      });
      setChartData(response.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      // Mantener datos de ejemplo si falla
    }
  };

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/providers/search`, { 
        params: { q: '' },
        withCredentials: true 
      });
      const proveedores = (response.data.results || []).filter(p => p.isActive && !p.isBlacklisted);
      setTableData(proveedores);
      setCurrentPage(1); // Reset a la primera página
    } catch (error) {
      console.error('Error cargando proveedores:', error);
      showAlert('error', 'Error', 'No se pudieron cargar los proveedores');
    } finally {
      setLoading(false);
    }
  };

  // Calcular proveedores para la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const abrirModalFacturas = async (proveedor) => {
    try {
      setLoadingModal(true);
      setModalFacturas({ open: true, proveedor, facturas: [] });
      const response = await axios.get(`${API_BASE}/api/purchase-orders`, {
        params: { providerId: proveedor.id },
        withCredentials: true
      });
      const ordenes = response.data.purchaseOrders || [];
      const facturasConPdf = ordenes.filter(o => o.invoicePdfUrl);
      setModalFacturas({ open: true, proveedor, facturas: facturasConPdf });
    } catch (error) {
      console.error('Error cargando facturas:', error);
      showAlert('error', 'Error', 'No se pudieron cargar las facturas');
    } finally {
      setLoadingModal(false);
    }
  };

  const resolveUrl = (url) => {
    if (!url) return null;
    try {
      return String(url).startsWith('http') ? url : `${API_BASE}${url}`;
    } catch (e) {
      return `${API_BASE}${url}`;
    }
  };

  const abrirModalOrdenes = async (proveedor) => {
    try {
      setLoadingModal(true);
      setModalOrdenes({ open: true, proveedor, ordenes: [] });
      const response = await axios.get(`${API_BASE}/api/purchase-orders`, {
        params: { providerId: proveedor.id },
        withCredentials: true
      });
      setModalOrdenes({ open: true, proveedor, ordenes: response.data.purchaseOrders || [] });
    } catch (error) {
      console.error('Error cargando órdenes:', error);
      showAlert('error', 'Error', 'No se pudieron cargar las órdenes de compra');
    } finally {
      setLoadingModal(false);
    }
  };

  const abrirModalDocumentos = async (proveedor) => {
    try {
      setLoadingModal(true);
      setModalDocumentos({ open: true, proveedor, documentos: [] });
      const response = await axios.get(`${API_BASE}/api/digital-files/providers/${proveedor.id}/documents`, {
        withCredentials: true
      });
      setModalDocumentos({ open: true, proveedor, documentos: response.data || [] });
    } catch (error) {
      console.error('Error cargando documentos:', error);
      showAlert('error', 'Error', 'No se pudieron cargar los documentos de respaldo');
    } finally {
      setLoadingModal(false);
    }
  };

  const cerrarModales = () => {
    setModalFacturas({ open: false, proveedor: null, facturas: [] });
    setModalOrdenes({ open: false, proveedor: null, ordenes: [] });
    setModalDocumentos({ open: false, proveedor: null, documentos: [] });
  };

  // FUNCIONES CRUD
  const handleView = (id) => {
    const proveedor = tableData.find(p => p.id === id);
    const info = `Nombre: ${proveedor?.businessName}\nRFC: ${proveedor?.rfc}\nEmail: ${proveedor?.emailContacto}\nTeléfono: ${proveedor?.telefono || 'N/A'}\nDirección: ${proveedor?.direccionFiscal || 'N/A'}\nTipo: ${proveedor?.personType || 'N/A'}`;
    showAlert('info', 'Detalles del Proveedor', info);
  };

  // Función para generar archivo Excel con formato profesional
  const generarExcelConFormato = (datos, cabeceras, titulo, nombreArchivo) => {
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8">
          <style>
            table {
              border-collapse: collapse;
              width: 100%;
              font-family: Arial, sans-serif;
            }
            .titulo {
              background-color: #2F4156;
              color: white;
              font-size: 18px;
              font-weight: bold;
              padding: 15px;
              text-align: center;
              border: 1px solid #2F4156;
            }
            .cabecera {
              background-color: #567C8D;
              color: white;
              font-weight: bold;
              padding: 10px;
              border: 1px solid #567C8D;
              text-align: center;
            }
            .fila-datos {
              background-color: #FFFFFF;
            }
            .fila-datos:nth-child(even) {
              background-color: #C8D9E6;
            }
            .celda {
              padding: 8px;
              border: 1px solid #567C8D;
              text-align: left;
            }
            .celda-numero {
              text-align: right;
              padding: 8px;
              border: 1px solid #567C8D;
            }
            .celda-centro {
              text-align: center;
              padding: 8px;
              border: 1px solid #567C8D;
            }
          </style>
        </head>
        <body>
          <table>
            <tr>
              <td colspan="${cabeceras.length}" class="titulo">${titulo}</td>
            </tr>
            <tr>
              ${cabeceras.map(cabecera => `<td class="cabecera">${cabecera}</td>`).join('')}
            </tr>
            ${datos.map((fila, index) => `
              <tr class="fila-datos">
                ${fila.map((celda, celdaIndex) => {
                  const esNumero = !isNaN(parseFloat(celda)) && isFinite(celda);
                  const esCentro = cabeceras[celdaIndex] === 'ESTATUS' || cabeceras[celdaIndex] === 'Fecha';
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

  // Función para generar PDF
  const generarPDF = (documento, tipo, proveedor) => {
    const contenido = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${documento.nombre}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            color: #333;
          }
          .header { 
            border-bottom: 3px solid #2F4156; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
            text-align: center;
          }
          .info { 
            margin: 20px 0; 
          }
          .label { 
            font-weight: bold; 
            color: #2F4156; 
            width: 150px;
            display: inline-block;
          }
          .section {
            margin: 25px 0;
            padding: 15px;
            border-left: 4px solid #567C8D;
            background-color: #f8f9fa;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          th {
            background-color: #567C8D;
            color: white;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
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
          <p><span class="label">Fecha de generación:</span> ${new Date().toLocaleDateString('es-MX')}</p>
        </div>

        <div class="section">
          <h2>Información del Proveedor</h2>
          <p><span class="label">Proveedor:</span> ${proveedor.proveedor}</p>
          <p><span class="label">Categoría:</span> ${proveedor.categoria}</p>
          <p><span class="label">Estatus:</span> ${proveedor.estatus}</p>
        </div>

        <div class="section">
          <h2>Detalles del Documento</h2>
          <table>
            <tr>
              <th>Campo</th>
              <th>Valor</th>
            </tr>
            <tr>
              <td>ID del Documento</td>
              <td>${documento.id}</td>
            </tr>
            <tr>
              <td>Fecha de Emisión</td>
              <td>${new Date().toLocaleDateString('es-MX')}</td>
            </tr>
            <tr>
              <td>UUID</td>
              <td>uuid-${documento.id}-${Date.now()}</td>
            </tr>
            ${tipo === 'facturas' ? `
            <tr>
              <td>SUBTOTAL</td>
              <td>$10,000.00</td>
            </tr>
            <tr>
              <td>IVA</td>
              <td>$1,600.00</td>
            </tr>
            <tr>
              <td>TOTAL</td>
              <td>$11,600.00</td>
            </tr>
            ` : ''}
            ${tipo === 'ordenes-compra' ? `
            <tr>
              <td>Orden de Compra</td>
              <td>OC-2024-${documento.id.toString().padStart(3, '0')}</td>
            </tr>
            <tr>
              <td>PROYECTO</td>
              <td>Proyecto Principal</td>
            </tr>
            ` : ''}
            ${tipo === 'documentos-respaldo' ? `
            <tr>
              <td>Válido Hasta</td>
              <td>31/12/2024</td>
            </tr>
            <tr>
              <td>Emitido Por</td>
              <td>Departamento Legal</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div class="footer">
          <p>Documento generado automáticamente - Sistema de Gestión de Proveedores</p>
          <p>MBQ - ${new Date().getFullYear()}</p>
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

  // Función para descargar Excel
  const descargarExcel = (documento, tipo, proveedor) => {
    try {
      let datos = [];
      let cabeceras = [];
      let titulo = '';
      let nombreArchivo = '';

      // Configurar según el tipo de documento
      switch(tipo) {
        case "facturas":
          datos = [
            {
              Proveedor: proveedor.proveedor,
              Documento: documento.nombre,
              Tipo: "Factura",
              Tamaño: documento.tamaño,
              Categoría: proveedor.categoria,
              Estatus: proveedor.estatus,
              Fecha: new Date().toLocaleDateString('es-MX'),
              UUID: `uuid-${documento.id}-${Date.now()}`,
              SUBTOTAL: "$10,000.00",
              IVA: "$1,600.00",
              TOTAL: "$11,600.00"
            }
          ];
          cabeceras = ["Proveedor", "Documento", "Tipo", "Tamaño", "Categoría", "Estatus", "Fecha", "UUID", "SUBTOTAL", "IVA", "TOTAL"];
          titulo = `MBQ FACTURA - ${proveedor.proveedor.toUpperCase()}`;
          nombreArchivo = `factura_${proveedor.proveedor.replace(/\s+/g, '_')}_${documento.id}`;
          break;

        case "ordenes-compra":
          datos = [
            {
              Proveedor: proveedor.proveedor,
              Documento: documento.nombre,
              Tipo: "Orden de Compra",
              Tamaño: documento.tamaño,
              Categoría: proveedor.categoria,
              Estatus: proveedor.estatus,
              Fecha: new Date().toLocaleDateString('es-MX'),
              Orden: `OC-2024-${documento.id.toString().padStart(3, '0')}`,
              PROYECTO: "Proyecto Principal",
              SUBTOTAL: "$8,500.00",
              IVA: "$1,360.00",
              TOTAL: "$9,860.00"
            }
          ];
          cabeceras = ["Proveedor", "Documento", "Tipo", "Tamaño", "Categoría", "Estatus", "Fecha", "Orden", "PROYECTO", "SUBTOTAL", "IVA", "TOTAL"];
          titulo = `MBQ ORDEN DE COMPRA - ${proveedor.proveedor.toUpperCase()}`;
          nombreArchivo = `orden_compra_${proveedor.proveedor.replace(/\s+/g, '_')}_${documento.id}`;
          break;

        case "documentos-respaldo":
          datos = [
            {
              Proveedor: proveedor.proveedor,
              Documento: documento.nombre,
              Tipo: "Documento de Respaldo",
              Tamaño: documento.tamaño,
              Categoría: proveedor.categoria,
              Estatus: proveedor.estatus,
              Fecha: new Date().toLocaleDateString('es-MX'),
              Descripción: "Documento de respaldo oficial",
              Válido_Hasta: "31/12/2024",
              Emitido_Por: "Departamento Legal"
            }
          ];
          cabeceras = ["Proveedor", "Documento", "Tipo", "Tamaño", "Categoría", "Estatus", "Fecha", "Descripción", "Válido_Hasta", "Emitido_Por"];
          titulo = `MBQ DOCUMENTO RESPALDO - ${proveedor.proveedor.toUpperCase()}`;
          nombreArchivo = `respaldo_${proveedor.proveedor.replace(/\s+/g, '_')}_${documento.id}`;
          break;

        default:
          datos = [
            {
              Proveedor: proveedor.proveedor,
              Documento: documento.nombre,
              Tipo: tipo,
              Tamaño: documento.tamaño,
              Categoría: proveedor.categoria,
              Estatus: proveedor.estatus,
              Fecha: new Date().toLocaleDateString('es-MX')
            }
          ];
          cabeceras = ["Proveedor", "Documento", "Tipo", "Tamaño", "Categoría", "Estatus", "Fecha"];
          titulo = `MBQ DOCUMENTO - ${proveedor.proveedor.toUpperCase()}`;
          nombreArchivo = `documento_${proveedor.proveedor.replace(/\s+/g, '_')}_${documento.id}`;
      }

      // Convertir datos a filas
      const filas = datos.map(doc => 
        Object.values(doc).map(valor => 
          typeof valor === 'string' && valor.startsWith('$') ? valor : valor.toString()
        )
      );

      generarExcelConFormato(filas, cabeceras, titulo, nombreArchivo);
      showAlert('success', 'Descarga Completada', `${documento.nombre} se ha descargado correctamente en formato Excel`);
      
    } catch (error) {
      console.error('Error al descargar:', error);
      showAlert('error', 'Error en Descarga', 'Hubo un problema al descargar el documento');
    }
  };

  // Función para descargar PDF
  const descargarPDF = (documento, tipo, proveedor) => {
    try {
      generarPDF(documento, tipo, proveedor);
      showAlert('success', 'Descarga Completada', `${documento.nombre} se ha descargado correctamente en formato PDF`);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      showAlert('error', 'Error en Descarga', 'Hubo un problema al descargar el documento PDF');
    }
  };

  // Función para obtener colores según la categoría y estado
  const getChartColors = (chartType, labels) => {
    const colorMap = {
      verde: '#10b981',
      rojo: '#ef4444',
      amarillo: '#f59e0b',
      azul: '#3b82f6', 
      verdeo: '#045338ff'
    };

    const colorRules = {
      proveedores: {
        'aprobado': colorMap.verde,
        'rechazado': colorMap.rojo
      },
      facturas: {
        'aprobadas': colorMap.verde,
        'rechazadas': colorMap.rojo,
        'pendientes por pagar': colorMap.amarillo,
        'pagadas': colorMap.verdeo
      },
      contratos: {
        'nuevos': colorMap.azul,
        'en aviso': colorMap.amarillo,
        'vencidos': colorMap.rojo
      },
      ordenesCompra: {
        'retrasadas': colorMap.amarillo,
        'aprobadas': colorMap.verde,
        'rechazadas': colorMap.rojo
      }
    };

    return labels.map(label => colorRules[chartType]?.[label] || '#6b7280');
  };

  // Componente de gráfica de pastel - MEJORADO PARA SER RESPONSIVO
  const PieChart = ({ data, title, chartType }) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    const labels = Object.keys(data);
    const colors = getChartColors(chartType, labels);
    
    // Si no hay datos, mostrar mensaje
    if (total === 0) {
      return (
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-lightBlue shadow-lg h-full flex flex-col">
          <h3 className="text-lg font-semibold text-darkBlue mb-4 text-center">{title}</h3>
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
            Sin datos disponibles
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-lightBlue shadow-lg h-full flex flex-col">
        <h3 className="text-lg font-semibold text-darkBlue mb-4 text-center">{title}</h3>
        <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6 flex-1">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 flex-shrink-0">
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
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-darkBlue">
                {total}
              </span>
              <span className="text-xs sm:text-sm text-midBlue">Total</span>
            </div>
          </div>

          <div className="flex-1 space-y-2 sm:space-y-3 min-w-0 w-full">
            {Object.entries(data).map(([key, value], index) => {
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: colors[index] }}
                    ></div>
                    <span className="text-xs sm:text-sm text-darkBlue capitalize truncate">
                      {key}:
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="text-xs sm:text-sm font-semibold text-midBlue block">
                      {value}
                    </span>
                    <span className="text-xs text-midBlue">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Componente para mostrar documentos descargables
  const DocumentList = ({ documentos, tipo, proveedor }) => (
    <div className="space-y-2">
      {documentos.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between group">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="w-4 h-4 text-midBlue flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-darkBlue truncate">{doc.nombre}</p>
              <p className="text-xs text-gray-500">{doc.tamaño}</p>
            </div>
          </div>
          <div className="flex gap-1 ml-2 flex-shrink-0">
            <button
              onClick={() => descargarExcel(doc, tipo, proveedor)}
              className="p-1 sm:p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition"
              title="Descargar Excel"
            >
              <FileSpreadsheet className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => descargarPDF(doc, tipo, proveedor)}
              className="p-1 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
              title="Descargar PDF"
            >
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      ))}
      {documentos.length === 0 && (
        <span className="text-xs text-gray-400 italic">No hay documentos</span>
      )}
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-darkBlue mb-3">
          Resumen General del Sistema
        </h2>
        <p className="text-midBlue text-base sm:text-lg">
          Estadísticas y métricas clave en tiempo real
        </p>
      </div>

      {/* GRÁFICAS - MEJORADO EL GRID PARA SER MÁS RESPONSIVO */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 auto-rows-fr">
        <PieChart
          title="Proveedores"
          data={chartData.proveedores}
          chartType="proveedores"
        />
        <PieChart
          title="Facturas"
          data={chartData.facturas}
          chartType="facturas"
        />
        <PieChart
          title="Contratos"
          data={chartData.contratos}
          chartType="contratos"
        />
        <PieChart
          title="Órdenes de Compra"
          data={chartData.ordenesCompra}
          chartType="ordenesCompra"
        />
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl border border-lightBlue shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-lightBlue">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-darkBlue">
                Gestión de Proveedores
              </h3>
              <p className="text-xs sm:text-sm text-midBlue mt-1">
                Lista completa de proveedores registrados ({tableData.length} total)
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-lightBlue">
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">
                  Facturas
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">
                  Órdenes de Compra
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-darkBlue uppercase tracking-wider">
                  Documentos Respaldo
                </th>
                <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-darkBlue uppercase tracking-wider">
                  Ver Detalles
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lightBlue">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-midBlue">Cargando proveedores...</td></tr>
              ) : tableData.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-midBlue">No hay proveedores activos</td></tr>
              ) : currentItems.map((row) => (
                <tr key={row.id} className="hover:bg-lightBlue hover:bg-opacity-30 transition-colors">
                  <td className="px-4 sm:px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-darkBlue">
                        {row.businessName}
                      </div>
                      <div className="text-xs text-midBlue">
                        RFC: {row.rfc}
                      </div>
                      <div className="text-xs text-midBlue">
                        {row.emailContacto}
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 bg-green-100 text-green-800">
                        Activo
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-4 sm:px-6 py-4">
                    <button
                      onClick={() => abrirModalFacturas(row)}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded transition"
                    >
                      <FileText className="w-4 h-4" />
                      Ver Facturas
                    </button>
                  </td>
                  
                  <td className="px-4 sm:px-6 py-4">
                    <button
                      onClick={() => abrirModalOrdenes(row)}
                      className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-3 py-2 rounded transition"
                    >
                      <FileText className="w-4 h-4" />
                      Ver Órdenes
                    </button>
                  </td>
                  
                  <td className="px-4 sm:px-6 py-4">
                    <button
                      onClick={() => abrirModalDocumentos(row)}
                      className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-2 rounded transition"
                    >
                      <FileText className="w-4 h-4" />
                      Ver Documentos
                    </button>
                  </td>
                  
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleView(row.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                        title="Ver Detalles"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Ver</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!loading && tableData.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-lightBlue bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-midBlue">
                Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, tableData.length)} de {tableData.length} proveedores
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-midBlue text-white hover:bg-darkBlue transition'
                  }`}
                >
                  Anterior
                </button>
                
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Mostrar solo algunas páginas para evitar muchos botones
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => goToPage(pageNumber)}
                          className={`px-3 py-1 rounded ${
                            currentPage === pageNumber
                              ? 'bg-darkBlue text-white'
                              : 'bg-white text-midBlue border border-lightBlue hover:bg-lightBlue transition'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="px-2 text-midBlue">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-midBlue text-white hover:bg-darkBlue transition'
                  }`}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Facturas */}
      {modalFacturas.open && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={cerrarModales} style={{ margin: 0, padding: 0 }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden mx-4 my-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-midBlue to-darkBlue text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Facturas - {modalFacturas.proveedor?.businessName}</h3>
              <button onClick={cerrarModales} className="hover:bg-white hover:bg-opacity-20 p-2 rounded transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {loadingModal ? (
                <div className="text-center py-8"><Loader className="w-8 h-8 text-midBlue animate-spin mx-auto" /></div>
              ) : modalFacturas.facturas.length === 0 ? (
                <p className="text-center text-midBlue py-8">No hay facturas disponibles</p>
              ) : (
                <div className="space-y-4">
                  {modalFacturas.facturas.map((factura) => (
                    <div key={factura.id} className="border border-lightBlue rounded-lg p-4 hover:bg-beige transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-darkBlue">OC: {factura.number}</p>
                          <p className="text-sm text-midBlue">Total: ${factura.total || '0'}</p>
                          <p className="text-sm text-midBlue">Estatus: {factura.status}</p>
                        </div>
                        <div className="flex gap-2">
                          {factura.invoicePdfUrl && (
                            <a
                              href={resolveUrl(factura.invoicePdfUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                              title="Ver PDF"
                            >
                              <FileText className="w-5 h-5" />
                            </a>
                          )}
                          {factura.invoiceXmlUrl && (
                            <a
                              href={resolveUrl(factura.invoiceXmlUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Ver XML"
                            >
                              <FileSpreadsheet className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Órdenes de Compra */}
      {modalOrdenes.open && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={cerrarModales} style={{ margin: 0, padding: 0 }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden mx-4 my-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Órdenes de Compra - {modalOrdenes.proveedor?.businessName}</h3>
              <button onClick={cerrarModales} className="hover:bg-white hover:bg-opacity-20 p-2 rounded transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {loadingModal ? (
                <div className="text-center py-8"><Loader className="w-8 h-8 text-purple-600 animate-spin mx-auto" /></div>
              ) : modalOrdenes.ordenes.length === 0 ? (
                <p className="text-center text-midBlue py-8">No hay órdenes de compra</p>
              ) : (
                <div className="space-y-4">
                  {modalOrdenes.ordenes.map((orden) => (
                    <div key={orden.id} className="border border-lightBlue rounded-lg p-4 hover:bg-beige transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-darkBlue">OC-{orden.number}</p>
                          <p className="text-sm text-midBlue">Total: ${orden.total || '0'}</p>
                          <p className="text-sm text-midBlue">Estatus: {orden.status}</p>
                          {orden.issuedAt && <p className="text-xs text-gray-500">Fecha: {new Date(orden.issuedAt).toLocaleDateString('es-MX')}</p>}
                        </div>
                        {orden.pdfUrl && (
                          <a
                            href={resolveUrl(orden.pdfUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                            title="Ver PDF"
                          >
                            <FileText className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Documentos Respaldo */}
      {modalDocumentos.open && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={cerrarModales} style={{ margin: 0, padding: 0 }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden mx-4 my-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-green-600 to-green-800 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Documentos de Respaldo - {modalDocumentos.proveedor?.businessName}</h3>
              <button onClick={cerrarModales} className="hover:bg-white hover:bg-opacity-20 p-2 rounded transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {loadingModal ? (
                <div className="text-center py-8"><Loader className="w-8 h-8 text-green-600 animate-spin mx-auto" /></div>
              ) : modalDocumentos.documentos.length === 0 ? (
                <p className="text-center text-midBlue py-8">No hay documentos de respaldo</p>
              ) : (
                <div className="space-y-4">
                  {modalDocumentos.documentos.map((doc) => (
                    <div key={doc.id} className="border border-lightBlue rounded-lg p-4 hover:bg-beige transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-darkBlue">{doc.documentType?.name || 'Documento'}</p>
                          <p className="text-sm text-midBlue">Estado: {doc.status}</p>
                          {doc.notes && <p className="text-xs text-gray-500">{doc.notes}</p>}
                          <p className="text-xs text-gray-400">Subido: {new Date(doc.createdAt).toLocaleDateString('es-MX')}</p>
                        </div>
                        {doc.fileUrl && (
                          <a
                            href={resolveUrl(doc.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Ver documento"
                          >
                            <FileText className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Graficas;