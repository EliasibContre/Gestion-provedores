import React, { useState } from "react";
import { Search, Filter, Calendar, Clock, User, FileUp, CheckCircle } from "lucide-react";

function HistorialActividad({ showAlert }) {
  const [historial, setHistorial] = useState([
    {
      id: 1,
      usuario: "Juan Pérez",
      tipo: "proveedor",
      fecha: "2024-01-15",
      hora: "10:30:25",
      actividad: "Inicio sesión"
    },
    {
      id: 2,
      usuario: "María González",
      tipo: "aprobador",
      fecha: "2024-01-15",
      hora: "11:15:42",
      actividad: "Aprobó documentos"
    },
    {
      id: 3,
      usuario: "Carlos Rodríguez",
      tipo: "proveedor",
      fecha: "2024-01-15",
      hora: "14:20:18",
      actividad: "Subió documentos"
    },
    {
      id: 4,
      usuario: "Ana Martínez",
      tipo: "aprobador",
      fecha: "2024-01-14",
      hora: "09:45:33",
      actividad: "Inicio sesión"
    },
    {
      id: 5,
      usuario: "Pedro Sánchez",
      tipo: "proveedor",
      fecha: "2024-01-14",
      hora: "16:10:05",
      actividad: "Subió documentos"
    },
    {
      id: 6,
      usuario: "Laura Ramírez",
      tipo: "aprobador",
      fecha: "2024-01-13",
      hora: "08:30:12",
      actividad: "Aprobó documentos"
    },
    {
      id: 7,
      usuario: "Roberto Díaz",
      tipo: "proveedor",
      fecha: "2024-01-13",
      hora: "13:45:28",
      actividad: "Inicio sesión"
    },
    {
      id: 8,
      usuario: "Sofía López",
      tipo: "aprobador",
      fecha: "2024-01-12",
      hora: "11:20:47",
      actividad: "Aprobó documentos"
    },
    {
      id: 9,
      usuario: "Miguel Torres",
      tipo: "proveedor",
      fecha: "2024-01-12",
      hora: "15:35:19",
      actividad: "Subió documentos"
    },
    {
      id: 10,
      usuario: "Elena Castro",
      tipo: "aprobador",
      fecha: "2024-01-11",
      hora: "10:05:56",
      actividad: "Inicio sesión"
    }
  ]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroActividad, setFiltroActividad] = useState("todos");
  const [filtroFecha, setFiltroFecha] = useState("");

  const tipos = ["todos", "proveedor", "aprobador"];
  const actividades = ["todos", "Inicio sesión", "Subió documentos", "Aprobó documentos"];

  const historialFiltrado = historial.filter(item => {
    const coincideBusqueda = 
      item.usuario.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideTipo = filtroTipo === "todos" || item.tipo === filtroTipo;
    
    const coincideActividad = filtroActividad === "todos" || item.actividad === filtroActividad;
    
    const coincideFecha = !filtroFecha || item.fecha === filtroFecha;
    
    return coincideBusqueda && coincideTipo && coincideActividad && coincideFecha;
  });

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroTipo("todos");
    setFiltroActividad("todos");
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
            <h1 className="text-lg font-semibold text-gray-800">Historial de Actividad</h1>
          </div>

          {/* Filtros */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="space-y-3">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nombre de usuario..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Filtros en fila */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Filtro por tipo */}
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {tipos.map((tipo, index) => (
                      <option key={index} value={tipo}>
                        {tipo === "todos" ? "Todos los tipos" : tipo === "proveedor" ? "Proveedor" : "Aprobador"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por actividad */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={filtroActividad}
                    onChange={(e) => setFiltroActividad(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {actividades.map((actividad, index) => (
                      <option key={index} value={actividad}>
                        {actividad === "todos" ? "Todas las actividades" : actividad}
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
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Hora
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actividad
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historialFiltrado.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {/* Columna Usuario */}
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.tipo === "proveedor" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                          }`}>
                            {item.usuario.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{item.usuario}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Columna Tipo */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        item.tipo === "proveedor" 
                          ? "bg-blue-50 text-blue-700 border border-blue-200" 
                          : "bg-green-50 text-green-700 border border-green-200"
                      }`}>
                        {item.tipo === "proveedor" ? "Proveedor" : "Aprobador"}
                      </span>
                    </td>
                    
                    {/* Columna Fecha */}
                    <td className="px-4 py-3">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                        {item.fecha}
                      </div>
                    </td>
                    
                    {/* Columna Hora */}
                    <td className="px-4 py-3">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="w-3 h-3 mr-1 text-gray-400" />
                        {item.hora}
                      </div>
                    </td>
                    
                    {/* Columna Actividad */}
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {item.actividad === "Inicio sesión" ? (
                          <User className="w-3 h-3 mr-1.5 text-gray-500" />
                        ) : item.actividad === "Subió documentos" ? (
                          <FileUp className="w-3 h-3 mr-1.5 text-blue-500" />
                        ) : (
                          <CheckCircle className="w-3 h-3 mr-1.5 text-green-500" />
                        )}
                        <span className="text-sm text-gray-700">{item.actividad}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sin resultados */}
          {historialFiltrado.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-gray-500 text-sm">No se encontraron actividades</p>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {historialFiltrado.length} de {historial.length} actividades
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

export default HistorialActividad;