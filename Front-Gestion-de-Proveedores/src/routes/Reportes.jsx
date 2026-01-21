import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; // Importar la librería para Excel
import { Download } from 'lucide-react'; // Icono para el botón

function Reportes({ tipoReporte }) {
  const [datosReportes, setDatosReportes] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Datos de ejemplo para Facturas
  const datosFacturas = [
    { 
      proveedor: 'Tecnología S.A.', 
      aprobadas: 8, 
      rechazadas: 2,
      montoAprobado: 125000,
      montoRechazado: 35000
    },
    { 
      proveedor: 'Suministros Industriales', 
      aprobadas: 12, 
      rechazadas: 1,
      montoAprobado: 89000,
      montoRechazado: 8500
    },
    { 
      proveedor: 'Servicios Corporativos', 
      aprobadas: 5, 
      rechazadas: 3,
      montoAprobado: 45000,
      montoRechazado: 28000
    },
    { 
      proveedor: 'Logística Express', 
      aprobadas: 15, 
      rechazadas: 0,
      montoAprobado: 210000,
      montoRechazado: 0
    },
    { 
      proveedor: 'Consultoría Profesional', 
      aprobadas: 3, 
      rechazadas: 4,
      montoAprobado: 60000,
      montoRechazado: 75000
    }
  ];

  // Datos de ejemplo para Órdenes de Compra
  const datosOrdenesCompra = [
    { 
      proveedor: 'Materiales de Construcción', 
      aprobadas: 6, 
      rechazadas: 1,
      montoAprobado: 180000,
      montoRechazado: 25000
    },
    { 
      proveedor: 'Equipos Tecnológicos', 
      aprobadas: 4, 
      rechazadas: 2,
      montoAprobado: 320000,
      montoRechazado: 150000
    },
    { 
      proveedor: 'Insumos de Oficina', 
      aprobadas: 10, 
      rechazadas: 0,
      montoAprobado: 45000,
      montoRechazado: 0
    },
    { 
      proveedor: 'Mobiliario Corporativo', 
      aprobadas: 2, 
      rechazadas: 3,
      montoAprobado: 120000,
      montoRechazado: 180000
    },
    { 
      proveedor: 'Servicios de Limpieza', 
      aprobadas: 8, 
      rechazadas: 1,
      montoAprobado: 75000,
      montoRechazado: 12000
    },
    { 
      proveedor: 'Seguridad Industrial', 
      aprobadas: 7, 
      rechazadas: 0,
      montoAprobado: 95000,
      montoRechazado: 0
    }
  ];

  useEffect(() => {
    const cargarDatos = () => {
      setTimeout(() => {
        // Seleccionar datos según el tipo de reporte
        const datos = tipoReporte === 'ordenes-compra' ? datosOrdenesCompra : datosFacturas;
        setDatosReportes(datos);
        setCargando(false);
      }, 500);
    };
    
    cargarDatos();
  }, [tipoReporte]);

  // Calcular porcentaje de satisfacción
  const calcularPorcentajeSatisfaccion = (aprobadas, rechazadas) => {
    const total = aprobadas + rechazadas;
    if (total === 0) return 100;
    return ((aprobadas / total) * 100).toFixed(1);
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  };

  // Función para exportar a Excel
  const exportarAExcel = () => {
    // Crear datos formateados para Excel
    const datosExcel = datosReportes.map(proveedor => {
      const porcentaje = calcularPorcentajeSatisfaccion(
        proveedor.aprobadas, 
        proveedor.rechazadas
      );
      
      return {
        'Proveedor': proveedor.proveedor,
        'Aprobadas': proveedor.aprobadas,
        'Rechazadas': proveedor.rechazadas,
        'Monto Aprobado': formatearMoneda(proveedor.montoAprobado),
        'Monto Rechazado': formatearMoneda(proveedor.montoRechazado),
        'Porcentaje de Satisfacción': `${porcentaje}%`
      };
    });

    // Agregar fila de resumen
    const totalAprobadas = datosReportes.reduce((sum, p) => sum + p.aprobadas, 0);
    const totalRechazadas = datosReportes.reduce((sum, p) => sum + p.rechazadas, 0);
    const totalMontoAprobado = datosReportes.reduce((sum, p) => sum + p.montoAprobado, 0);
    const totalMontoRechazado = datosReportes.reduce((sum, p) => sum + p.montoRechazado, 0);
    const promedioPorcentaje = (
      datosReportes.reduce((sum, p) => 
        sum + parseFloat(calcularPorcentajeSatisfaccion(p.aprobadas, p.rechazadas)), 0
      ) / datosReportes.length
    ).toFixed(1);

    datosExcel.push({}); // Fila vacía para separación
    datosExcel.push({
      'Proveedor': 'TOTALES',
      'Aprobadas': totalAprobadas,
      'Rechazadas': totalRechazadas,
      'Monto Aprobado': formatearMoneda(totalMontoAprobado),
      'Monto Rechazado': formatearMoneda(totalMontoRechazado),
      'Porcentaje de Satisfacción': `${promedioPorcentaje}%`
    });

    // Crear hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(datosExcel, { skipHeader: false });
    
    // Ajustar anchos de columnas
    const wscols = [
      { wch: 30 }, // Proveedor
      { wch: 15 }, // Aprobadas
      { wch: 15 }, // Rechazadas
      { wch: 20 }, // Monto Aprobado
      { wch: 20 }, // Monto Rechazado
      { wch: 25 }  // Porcentaje de Satisfacción
    ];
    ws['!cols'] = wscols;

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

    // Generar nombre del archivo
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `${tipoReporte === 'ordenes-compra' ? 'Reporte_Ordenes_Compra' : 'Reporte_Facturas'}_${fecha}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(wb, nombreArchivo);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-darkBlue mx-auto"></div>
          <p className="text-darkBlue mt-4 text-lg">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-darkBlue mb-2">
          {tipoReporte === 'ordenes-compra' ? 'Reporte de Órdenes de Compra' : 'Reporte de Facturas'}
        </h1>
        <p className="text-midBlue">
          {tipoReporte === 'ordenes-compra' 
            ? 'Seguimiento de órdenes de compra aprobadas y rechazadas' 
            : 'Seguimiento de facturas aprobadas y rechazadas'
          }
        </p>
      </div>

      {/* Botón de descarga Excel */}
      <div className="flex justify-end mb-4">
        <button
          onClick={exportarAExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Descargar Excel
        </button>
      </div>

      {/* Tabla Simplificada */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h2 className="text-xl font-semibold text-darkBlue mb-4">
          {tipoReporte === 'ordenes-compra' ? 'Desempeño por Proveedor - Órdenes de Compra' : 'Desempeño por Proveedor - Facturas'}
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-lightBlue text-darkBlue">
                <th className="p-3 font-semibold text-sm">Proveedor</th>
                <th className="p-3 font-semibold text-sm text-center">
                  {tipoReporte === 'ordenes-compra' ? 'Órdenes Aprobadas' : 'Facturas Aprobadas'}
                </th>
                <th className="p-3 font-semibold text-sm text-center">
                  {tipoReporte === 'ordenes-compra' ? 'Órdenes Rechazadas' : 'Facturas Rechazadas'}
                </th>
                <th className="p-3 font-semibold text-sm text-center">Monto Aprobado</th>
                <th className="p-3 font-semibold text-sm text-center">Monto Rechazado</th>
                <th className="p-3 font-semibold text-sm text-center">Porcentaje de Satisfacción</th>
              </tr>
            </thead>
            <tbody>
              {datosReportes.map((proveedor, index) => {
                const porcentaje = calcularPorcentajeSatisfaccion(
                  proveedor.aprobadas, 
                  proveedor.rechazadas
                );
                
                return (
                  <tr key={proveedor.proveedor} className="border-t hover:bg-blue-50 transition duration-150">
                    {/* Nombre del Proveedor */}
                    <td className="p-3 font-medium text-darkBlue text-sm">
                      {proveedor.proveedor}
                    </td>
                    
                    {/* Aprobadas */}
                    <td className="p-3 text-center">
                      <span className="text-green-600 font-semibold">
                        {proveedor.aprobadas}
                    </span>
                    </td>
                    
                    {/* Rechazadas */}
                    <td className="p-3 text-center">
                      <span className="text-red-600 font-semibold">
                        {proveedor.rechazadas}
                      </span>
                    </td>
                    
                    {/* Monto Aprobado */}
                    <td className="p-3 text-center">
                      <span className="text-green-600 font-semibold">
                        {formatearMoneda(proveedor.montoAprobado)}
                      </span>
                    </td>
                    
                    {/* Monto Rechazado */}
                    <td className="p-3 text-center">
                      <span className="text-red-600 font-semibold">
                        {formatearMoneda(proveedor.montoRechazado)}
                      </span>
                    </td>
                    
                    {/* Porcentaje de Satisfacción */}
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        porcentaje >= 80 
                          ? 'bg-green-100 text-green-800'
                          : porcentaje >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {porcentaje}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Resumen Final - Compacto */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="bg-darkBlue text-white rounded-lg p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-xs text-lightBlue">Proveedores</p>
                <p className="text-lg font-bold">{datosReportes.length}</p>
              </div>
              <div>
                <p className="text-xs text-lightBlue">
                  {tipoReporte === 'ordenes-compra' ? 'Órdenes Aprobadas' : 'Facturas Aprobadas'}
                </p>
                <p className="text-lg font-bold">
                  {datosReportes.reduce((sum, p) => sum + p.aprobadas, 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-lightBlue">
                  {tipoReporte === 'ordenes-compra' ? 'Órdenes Rechazadas' : 'Facturas Rechazadas'}
                </p>
                <p className="text-lg font-bold">
                  {datosReportes.reduce((sum, p) => sum + p.rechazadas, 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-lightBlue">Porcentaje</p>
                <p className="text-lg font-bold">
                  {(
                    datosReportes.reduce((sum, p) => 
                      sum + parseFloat(calcularPorcentajeSatisfaccion(p.aprobadas, p.rechazadas)), 0
                    ) / datosReportes.length
                  ).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-4 text-center text-midBlue text-sm">
        <p>
          {tipoReporte === 'ordenes-compra' 
            ? `Total de órdenes procesadas: ${datosReportes.reduce((sum, p) => sum + p.aprobadas + p.rechazadas, 0)}`
            : `Total de facturas procesadas: ${datosReportes.reduce((sum, p) => sum + p.aprobadas + p.rechazadas, 0)}`
          }
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Puedes descargar este reporte en formato Excel haciendo clic en el botón "Descargar Excel"
        </p>
      </div>
    </div>
  );
}

export default Reportes;