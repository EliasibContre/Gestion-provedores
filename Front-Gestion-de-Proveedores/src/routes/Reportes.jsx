import React, { useState, useEffect } from 'react';

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
    <div className="min-h-screen bg-beige p-4 md:p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-darkBlue mb-2">
          {tipoReporte === 'ordenes-compra' ? 'Reporte de Órdenes de Compra' : 'Reporte de Facturas'}
        </h1>
        <p className="text-midBlue text-sm md:text-base">
          {tipoReporte === 'ordenes-compra' 
            ? 'Seguimiento de órdenes de compra aprobadas y rechazadas' 
            : 'Seguimiento de facturas aprobadas y rechazadas'
          }
        </p>
      </div>

      {/* Tabla Simplificada */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-darkBlue mb-4">
          {tipoReporte === 'ordenes-compra' ? 'Desempeño por Proveedor - Órdenes de Compra' : 'Desempeño por Proveedor - Facturas'}
        </h2>
        
        {/* Vista de escritorio - Tabla */}
        <div className="hidden md:block overflow-x-auto">
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
                    
                    {/* Porcentaje de Satisfacción */}
                    <td className="p-3 text-center">
                      <span className={`px-3 py-2 rounded-full text-sm font-semibold ${
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

        {/* Vista móvil - Cards */}
        <div className="md:hidden space-y-4">
          {datosReportes.map((proveedor, index) => {
            const porcentaje = calcularPorcentajeSatisfaccion(
              proveedor.aprobadas, 
              proveedor.rechazadas
            );
            
            return (
              <div key={proveedor.proveedor} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {/* Header de la card */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-darkBlue text-sm flex-1 pr-2">
                    {proveedor.proveedor}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    porcentaje >= 80 
                      ? 'bg-green-100 text-green-800'
                      : porcentaje >= 60
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {porcentaje}%
                  </span>
                </div>
                
                {/* Estadísticas */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600 text-xs mb-1">
                      {tipoReporte === 'ordenes-compra' ? 'Aprobadas' : 'Facturas Aprobadas'}
                    </p>
                    <p className="text-green-600 font-semibold text-lg">
                      {proveedor.aprobadas}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 text-xs mb-1">
                      {tipoReporte === 'ordenes-compra' ? 'Rechazadas' : 'Facturas Rechazadas'}
                    </p>
                    <p className="text-red-600 font-semibold text-lg">
                      {proveedor.rechazadas}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen Final - Compacto */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="bg-darkBlue text-white rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-lightBlue mb-1">Total Proveedores</p>
                <p className="text-xl font-bold">{datosReportes.length}</p>
              </div>
              <div>
                <p className="text-xs text-lightBlue mb-1">
                  {tipoReporte === 'ordenes-compra' ? 'Total Aprobadas' : 'Total Facturas Aprobadas'}
                </p>
                <p className="text-xl font-bold text-green-300">
                  {datosReportes.reduce((sum, p) => sum + p.aprobadas, 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-lightBlue mb-1">
                  {tipoReporte === 'ordenes-compra' ? 'Total Rechazadas' : 'Total Facturas Rechazadas'}
                </p>
                <p className="text-xl font-bold text-red-300">
                  {datosReportes.reduce((sum, p) => sum + p.rechazadas, 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-lightBlue mb-1">Satisfacción Promedio</p>
                <p className="text-xl font-bold">
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
      </div>
    </div>
  );
}

export default Reportes;