import React, { useState } from "react";
import { DollarSign, Search, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";

function HistorialPagos({ showAlert }) {
  const [pagos, setPagos] = useState([
    {
      id: 1,
      proveedor: "Construcciones Modernas S.A.",
      fechaPago: "2024-01-15",
      monto: "$45,800.00",
      pagos: "1/1",
      estatus: "aprobado"
    },
    {
      id: 2,
      proveedor: "Suministros Industriales del Norte",
      fechaPago: "2024-01-14",
      monto: "$28,500.00",
      pagos: "1/3",
      estatus: "aprobado"
    },
    {
      id: 3,
      proveedor: "Tecnologías Avanzadas México",
      fechaPago: "2024-01-13",
      monto: "$152,300.00",
      pagos: "2/3",
      estatus: "pendiente"
    },
    {
      id: 4,
      proveedor: "Servicios Logísticos Integrales",
      fechaPago: "2024-01-12",
      monto: "$67,450.00",
      pagos: "3/3",
      estatus: "aprobado"
    },
    {
      id: 5,
      proveedor: "Materiales de Construcción Premium",
      fechaPago: "2024-01-11",
      monto: "$89,200.00",
      pagos: "1/2",
      estatus: "rechazado"
    },
    {
      id: 6,
      proveedor: "Equipos Médicos Especializados",
      fechaPago: "2024-01-10",
      monto: "$210,500.00",
      pagos: "1/1",
      estatus: "aprobado"
    },
    {
      id: 7,
      proveedor: "Consultoría Empresarial Total",
      fechaPago: "2024-01-09",
      monto: "$35,000.00",
      pagos: "2/2",
      estatus: "pendiente"
    },
    {
      id: 8,
      proveedor: "Servicios de Limpieza Profesional",
      fechaPago: "2024-01-08",
      monto: "$15,800.00",
      pagos: "1/1",
      estatus: "aprobado"
    },
    {
      id: 9,
      proveedor: "Transportes Rápidos S.A.",
      fechaPago: "2024-01-07",
      monto: "$42,300.00",
      pagos: "1/4",
      estatus: "pendiente"
    },
    {
      id: 10,
      proveedor: "Alimentos Nutritivos México",
      fechaPago: "2024-01-06",
      monto: "$78,900.00",
      pagos: "2/2",
      estatus: "rechazado"
    }
  ]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState("todos");
  const [filtroFecha, setFiltroFecha] = useState("");

  const estatusOpciones = ["todos", "aprobado", "pendiente", "rechazado"];

  const pagosFiltrados = pagos.filter(pago => {
    const coincideBusqueda = 
      pago.proveedor.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideEstatus = filtroEstatus === "todos" || pago.estatus === filtroEstatus;
    
    const coincideFecha = !filtroFecha || pago.fechaPago === filtroFecha;
    
    return coincideBusqueda && coincideEstatus && coincideFecha;
  });

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstatus("todos");
    setFiltroFecha("");
    
    showAlert('info', 'Filtros limpiados', 
      'Todos los filtros han sido restablecidos.');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-800">Historial de Pagos</h1>
          </div>

          {/* Filtros */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="space-y-3">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por proveedor..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Filtros en fila */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Filtro por estatus */}
                <div className="relative">
                  <select
                    value={filtroEstatus}
                    onChange={(e) => setFiltroEstatus(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {estatusOpciones.map((estatus, index) => (
                      <option key={index} value={estatus}>
                        {estatus === "todos" ? "Todos los estatus" : 
                         estatus === "aprobado" ? "Aprobado" :
                         estatus === "pendiente" ? "Pendiente" : "Rechazado"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por fecha */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Botón limpiar filtros */}
              <div className="flex gap-2">
                <button
                  onClick={limpiarFiltros}
                  className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Fecha de Pago
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Pagos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Estatus
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagosFiltrados.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50">
                    {/* Columna Proveedor */}
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            {pago.proveedor.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{pago.proveedor}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Columna Fecha de Pago */}
                    <td className="px-4 py-3">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                        {pago.fechaPago}
                      </div>
                    </td>
                    
                    {/* Columna Monto */}
                    <td className="px-4 py-3">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <DollarSign className="w-3 h-3 mr-1 text-gray-500" />
                        {pago.monto}
                      </div>
                    </td>
                    
                    {/* Columna Pagos */}
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          pago.pagos === "1/1" ? "bg-green-50 text-green-700 border border-green-200" :
                          pago.pagos.includes("/") ? "bg-blue-50 text-blue-700 border border-blue-200" :
                          "bg-gray-50 text-gray-700 border border-gray-200"
                        }`}>
                          {pago.pagos}
                        </div>
                        <div className="ml-2 text-xs text-gray-500">
                          {pago.pagos === "1/1" ? "Pago único" : "Parcialidad"}
                        </div>
                      </div>
                    </td>
                    
                    {/* Columna Estatus */}
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {pago.estatus === "aprobado" ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1.5 text-green-500" />
                            <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200">
                              Aprobado
                            </span>
                          </>
                        ) : pago.estatus === "pendiente" ? (
                          <>
                            <Clock className="w-3 h-3 mr-1.5 text-yellow-500" />
                            <span className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 rounded border border-yellow-200">
                              Pendiente
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1.5 text-red-500" />
                            <span className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded border border-red-200">
                              Rechazado
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sin resultados */}
          {pagosFiltrados.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-gray-500 text-sm">No se encontraron pagos</p>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {pagosFiltrados.length} de {pagos.length} pagos
              </p>
              <div className="text-xs text-gray-500">
                Última actualización: Hoy, 10:30 AM
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistorialPagos;