import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Edit2, Trash2, Eye, Loader, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const GestionPagos = ({ showAlert }) => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [ordenesDisponibles, setOrdenesDisponibles] = useState([]);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(false);
  const [enviandoFormulario, setEnviandoFormulario] = useState(false);
  // Vista admin: no restringimos por rol aquí

  const [formData, setFormData] = useState({
    purchaseOrderId: '',
    amount: '',
    paidAt: new Date().toISOString().split('T')[0],
    method: 'TRANSFER',
    reference: ''
  });

  const metodos = [
    { value: 'TRANSFER', label: 'Transferencia Bancaria' },
    { value: 'CASH', label: 'Efectivo' },
    { value: 'CARD', label: 'Tarjeta' },
    { value: 'OTHER', label: 'Otro' }
  ];

  // No comprobamos rol: este módulo es para administradores

  // Cargar pagos
  const cargarPagos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/payments`, {
        withCredentials: true
      });
      setPagos(response.data.payments || []);
    } catch (error) {
      console.error('Error cargando pagos:', error);
      showAlert('error', 'Error', 'No se pudieron cargar los pagos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar órdenes aprobadas de todos los proveedores (vista admin)
  const cargarOrdenesDisponibles = async () => {
    try {
      setCargandoOrdenes(true);
      const response = await axios.get(`${API_BASE}/api/purchase-orders/approved-unpaid`, { withCredentials: true });
      const ordenes = response.data.purchaseOrders || response.data || [];
      setOrdenesDisponibles(ordenes);
    } catch (error) {
      console.error('❌ Error cargando órdenes aprobadas del proveedor:', error.response?.data || error.message);
      setOrdenesDisponibles([]);
    } finally {
      setCargandoOrdenes(false);
    }
  };

  useEffect(() => {
    cargarPagos();
    cargarOrdenesDisponibles();
  }, []);

  const handleAbrirModal = (pago = null) => {
    if (pago) {
      setEditando(pago);
      setFormData({
        purchaseOrderId: pago.purchaseOrderId,
        amount: pago.amount,
        paidAt: pago.paidAt.split('T')[0],
        method: pago.method,
        reference: pago.reference || ''
      });
    } else {
      setEditando(null);
      setFormData({
        purchaseOrderId: '',
        amount: '',
        paidAt: new Date().toISOString().split('T')[0],
        method: 'TRANSFER',
        reference: ''
      });
      // Recargar órdenes cuando se abre modal para crear nuevo pago
      cargarOrdenesDisponibles();
    }
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setEnviandoFormulario(false);
    setTimeout(() => {
      setFormData({
        purchaseOrderId: '',
        amount: '',
        paidAt: new Date().toISOString().split('T')[0],
        method: 'TRANSFER',
        reference: ''
      });
    }, 100);
  };

  const handleChange = (e) => {
    if (!e || !e.target) return;
    const { name, value } = e.target;
    
    // Si cambia la orden de compra, cargar el monto automáticamente
    if (name === 'purchaseOrderId' && value) {
      const ordenSeleccionada = ordenesDisponibles.find(o => o.id === parseInt(value));
      if (ordenSeleccionada) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          amount: ordenSeleccionada.total || ''
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.purchaseOrderId || !formData.amount || !formData.paidAt) {
      console.warn('⚠️ Campos faltantes');
      showAlert('error', 'Validación', 'Todos los campos son requeridos');
      return;
    }

    setEnviandoFormulario(true);
    try {
      const payload = {
        ...formData,
        purchaseOrderId: parseInt(formData.purchaseOrderId),
        amount: parseFloat(formData.amount)
      };
      console.log('📤 Enviando payload:', payload);
      
      if (editando) {
        // Actualizar pago
        console.log(`🔄 Actualizando pago ${editando.id}...`);
        await axios.put(
          `${API_BASE}/api/payments/${editando.id}`,
          payload,
          { withCredentials: true }
        );
        console.log('✅ Pago actualizado');
        showAlert('success', 'Éxito', 'Pago actualizado correctamente');
      } else {
        // Crear nuevo pago
        console.log('➕ Creando nuevo pago...');
        await axios.post(
          `${API_BASE}/api/payments`,
          payload,
          { withCredentials: true }
        );
        console.log('✅ Pago creado');
        showAlert('success', 'Éxito', 'Pago registrado correctamente');
      }
      console.log('🔄 Recargando pagos...');
      await cargarPagos();
      handleCerrarModal();
    } catch (error) {
      console.error('❌ Error al guardar pago:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || error.message || 'Error al guardar el pago';
      showAlert('error', 'Error', errorMessage);
    } finally {
      setEnviandoFormulario(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este pago?')) return;

    try {
      await axios.delete(`${API_BASE}/api/payments/${id}`, {
        withCredentials: true
      });
      showAlert('success', 'Éxito', 'Pago eliminado correctamente');
      cargarPagos();
    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Error', 'Error al eliminar el pago');
    }
  };

  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const formatoFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX');
  };

  return (
    <div className="bg-white rounded-xl border border-lightBlue shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-midBlue to-darkBlue p-6 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Gestión de Pagos</h2>
          </div>
          <button
            onClick={() => handleAbrirModal()}
            className="bg-white text-midBlue px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-beige transition"
          >
            <Plus className="w-5 h-5" />
            Nuevo Pago
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Vista de admin: sin restricciones por rol */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader className="w-12 h-12 text-midBlue animate-spin mx-auto mb-3" />
              <p className="text-midBlue font-medium">Cargando pagos...</p>
            </div>
          </div>
        ) : pagos.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay pagos registrados</p>
            <p className="text-gray-400 text-sm">Crea un nuevo pago para comenzar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-beige border-b-2 border-lightBlue">
                  <th className="text-left p-4 font-semibold text-darkBlue">OC Número</th>
                  <th className="text-left p-4 font-semibold text-darkBlue">Proveedor</th>
                  <th className="text-right p-4 font-semibold text-darkBlue">Monto</th>
                  <th className="text-center p-4 font-semibold text-darkBlue">Fecha Pago</th>
                  <th className="text-center p-4 font-semibold text-darkBlue">Método</th>
                  <th className="text-center p-4 font-semibold text-darkBlue">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago, index) => (
                  <tr
                    key={pago.id}
                    className={`border-b border-lightBlue hover:bg-beige transition ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="p-4">
                      <span className="font-semibold text-darkBlue">
                        OC-{pago.purchaseOrder?.number}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-midBlue">{pago.purchaseOrder?.provider?.businessName}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-green-600">
                        {formatoMoneda(pago.amount)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-gray-600">{formatoFecha(pago.paidAt)}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {pago.method}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleAbrirModal(pago)}
                          title="Editar"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(pago.id)}
                          title="Eliminar"
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
        )}
      </div>

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full my-auto">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-midBlue to-darkBlue text-white p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editando ? 'Editar Pago' : 'Registrar Nuevo Pago'}
              </h3>
              <button
                onClick={handleCerrarModal}
                className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Formulario con scroll */}
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Orden de Compra */}
              <div>
                <label className="block text-sm font-semibold text-darkBlue mb-2">
                  Orden de Compra * {cargandoOrdenes && <span className="text-xs text-gray-500">(cargando...)</span>}
                </label>
                {editando ? (
                  <input
                    type="text"
                    disabled
                    value={`OC-${formData.purchaseOrderId}`}
                    className="w-full p-3 border-2 border-lightBlue rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                ) : cargandoOrdenes ? (
                  <div className="w-full p-3 border-2 border-lightBlue rounded-lg bg-gray-50 text-gray-500 text-center text-sm">
                    Cargando órdenes disponibles...
                  </div>
                ) : ordenesDisponibles.length === 0 ? (
                  <div className="w-full p-3 border-2 border-orange-300 rounded-lg bg-orange-50 text-orange-700 text-sm text-center">
                    No hay órdenes aprobadas disponibles para registrar pago
                  </div>
                ) : (
                  <select
                    name="purchaseOrderId"
                    value={formData.purchaseOrderId}
                    onChange={handleChange}
                    className="w-full p-3 border-2 border-lightBlue rounded-lg focus:ring-2 focus:ring-midBlue focus:border-transparent bg-white"
                    required
                  >
                    <option value="">-- Selecciona una orden --</option>
                    {ordenesDisponibles.map(orden => (
                      <option key={orden.id} value={orden.id}>
                        OC-{orden.number} - {orden.provider?.businessName} (${orden.total || '0'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm font-semibold text-darkBlue mb-2">
                  Monto * {formData.amount && <span className="text-xs text-green-600">{formatoMoneda(formData.amount)}</span>}
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full p-3 border-2 border-lightBlue rounded-lg focus:ring-2 focus:ring-midBlue focus:border-transparent font-semibold text-lg"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Fecha de Pago */}
              <div>
                <label className="block text-sm font-semibold text-darkBlue mb-2">
                  Fecha de Pago *
                </label>
                <input
                  type="date"
                  name="paidAt"
                  value={formData.paidAt}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-lightBlue rounded-lg focus:ring-2 focus:ring-midBlue focus:border-transparent"
                  required
                />
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-semibold text-darkBlue mb-2">
                  Método de Pago
                </label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-lightBlue rounded-lg focus:ring-2 focus:ring-midBlue focus:border-transparent bg-white"
                >
                  {metodos.map(metodo => (
                    <option key={metodo.value} value={metodo.value}>
                      {metodo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Referencia */}
              <div>
                <label className="block text-sm font-semibold text-darkBlue mb-2">
                  Referencia (opcional)
                </label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-lightBlue rounded-lg focus:ring-2 focus:ring-midBlue focus:border-transparent"
                  placeholder="Ej: Folio de transferencia"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t border-lightBlue">
                <button
                  type="button"
                  onClick={handleCerrarModal}
                  disabled={enviandoFormulario}
                  className="flex-1 px-4 py-2 border-2 border-lightBlue text-darkBlue rounded-lg hover:bg-beige transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviandoFormulario || !formData.purchaseOrderId || !formData.amount}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-midBlue to-darkBlue text-white rounded-lg hover:shadow-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {enviandoFormulario && <Loader className="w-4 h-4 animate-spin" />}
                  {enviandoFormulario ? 'Procesando...' : (editando ? 'Actualizar' : 'Registrar')}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPagos;
