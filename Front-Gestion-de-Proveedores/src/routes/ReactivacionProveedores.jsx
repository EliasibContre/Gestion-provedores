import React, { useState } from "react";
import { RotateCcw, Trash2, Search } from "lucide-react";

function ReactivacionProveedores({ showAlert }) {
  const [proveedores, setProveedores] = useState([
    {
      id: 1,
      nombre: "Construcciones Modernas S.A.",
      rfc: "COM120304ABC",
      fechaBaja: "2024-01-15",
      motivoBaja: "Incumplimiento de contrato",
      comentarios: "No entregó materiales en fecha acordada"
    },
    {
      id: 2,
      nombre: "Suministros Industriales del Norte",
      rfc: "SIN450678XYZ",
      fechaBaja: "2024-01-10",
      motivoBaja: "Problemas de Calidad",
      comentarios: "Materiales no cumplen especificaciones"
    },
    {
      id: 3,
      nombre: "Tecnologías Avanzadas México",
      rfc: "TAM891234DEF",
      fechaBaja: "2024-01-05",
      motivoBaja: "Problemas Financieros",
      comentarios: "Reporte de Buró de Crédito negativo"
    },
    {
      id: 4,
      nombre: "Servicios Logísticos Integrales",
      rfc: "SLI567890GHI",
      fechaBaja: "2023-12-20",
      motivoBaja: "Mutuo Acuerdo",
      comentarios: "Acuerdo mutuo por cambio de proveedor"
    }
  ]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroMotivo, setFiltroMotivo] = useState("todos");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [accionModal, setAccionModal] = useState("");

  const motivos = [
    "todos",
    "Incumplimiento de contrato",
    "Problemas de Calidad", 
    "Problemas Financieros",
    "Mutuo Acuerdo",
    "Otros"
  ];

  const proveedoresFiltrados = proveedores.filter(proveedor => {
    const coincideBusqueda = 
      proveedor.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.rfc.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideMotivo = filtroMotivo === "todos" || proveedor.motivoBaja === filtroMotivo;
    
    return coincideBusqueda && coincideMotivo;
  });

  const abrirModal = (proveedor, accion) => {
    setProveedorSeleccionado(proveedor);
    setAccionModal(accion);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProveedorSeleccionado(null);
    setAccionModal("");
  };

  const reactivarProveedor = (id) => {
    const proveedor = proveedores.find(p => p.id === id);
    setProveedores(prev => prev.filter(p => p.id !== id));
    
    showAlert('success', 'Proveedor reactivado', 
      `Proveedor "${proveedor.nombre}" ha sido reactivado exitosamente.\nYa está disponible en el sistema.`);
    
    cerrarModal();
  };

  const eliminarDefinitivamente = (id) => {
    const proveedor = proveedores.find(p => p.id === id);
    setProveedores(prev => prev.filter(p => p.id !== id));
    
    showAlert('warning', 'Proveedor eliminado', 
      `Proveedor "${proveedor.nombre}" ha sido eliminado definitivamente.\nEsta acción no se puede deshacer.`);
    
    cerrarModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-800">Reactivación de Proveedores</h1>
          </div>

          {/* Filtros */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filtroMotivo}
                  onChange={(e) => setFiltroMotivo(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {motivos.map((motivo, index) => (
                    <option key={index} value={motivo}>
                      {motivo === "todos" ? "Todos" : motivo}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setBusqueda("");
                    setFiltroMotivo("todos");
                  }}
                  className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                >
                  Limpiar
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
                    Fecha Baja
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Comentarios
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proveedoresFiltrados.map((proveedor) => (
                  <tr key={proveedor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{proveedor.nombre}</p>
                        <p className="text-xs text-gray-500">{proveedor.rfc}</p>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{proveedor.fechaBaja}</div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        proveedor.motivoBaja === "Incumplimiento de contrato" ? "bg-red-50 text-red-700 border border-red-200" :
                        proveedor.motivoBaja === "Problemas de Calidad" ? "bg-yellow-50 text-yellow-700 border border-yellow-200" :
                        proveedor.motivoBaja === "Problemas Financieros" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                        proveedor.motivoBaja === "Mutuo Acuerdo" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        "bg-gray-50 text-gray-700 border border-gray-200"
                      }`}>
                        {proveedor.motivoBaja}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600">{proveedor.comentarios}</p>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => abrirModal(proveedor, "reactivar")}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                          title="Reactivar proveedor"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => abrirModal(proveedor, "eliminar")}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                          title="Eliminar definitivamente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sin resultados */}
          {proveedoresFiltrados.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-gray-500 text-sm">No se encontraron proveedores</p>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              {proveedoresFiltrados.length} de {proveedores.length} proveedores
            </p>
          </div>
        </div>
      </div>

      {/* Modal de confirmación - AMBOS CON LA MISMA ESTRUCTURA */}
      {modalAbierto && proveedorSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-sm w-full max-w-sm mx-auto">
            <div className="p-4">
              {/* Título del modal */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  {accionModal === "reactivar" ? "Reactivar proveedor" : "Eliminar proveedor"}
                </h3>
                <p className="text-sm text-gray-600">{proveedorSeleccionado.nombre}</p>
              </div>

              {/* Mensaje de confirmación */}
              <p className="text-sm text-gray-700 mb-4">
                {accionModal === "reactivar" 
                  ? "¿Reactivar este proveedor en el sistema?"
                  : "¿Eliminar definitivamente este proveedor?"
                }
              </p>

              {/* Botones - MISMO TEXTO EN AMBOS */}
              <div className="flex gap-2">
                <button
                  onClick={cerrarModal}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (accionModal === "reactivar") {
                      reactivarProveedor(proveedorSeleccionado.id);
                    } else {
                      eliminarDefinitivamente(proveedorSeleccionado.id);
                    }
                  }}
                  className={`flex-1 px-3 py-2 text-sm text-white rounded ${
                    accionModal === "reactivar" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReactivacionProveedores;