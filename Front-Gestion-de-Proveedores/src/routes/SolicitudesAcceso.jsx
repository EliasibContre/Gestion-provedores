import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Mail, Calendar, Building2, User, X, CheckCircle2, XCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const DEPT_LABELS = {
  SIN_ASIGNAR: 'Sin asignar',
  RH: 'Recursos Humanos',
  FINANZAS: 'Finanzas',
  COMPRAS: 'Compras',
  TI: 'TI',
  VENTAS: 'Ventas',
  MARKETING: 'Marketing',
  OPERACIONES: 'Operaciones',
  LOGISTICA: 'Logística',
  CALIDAD: 'Calidad',
  DIRECCION_GENERAL: 'Dirección General'
};

const DEPT_OPTIONS = Object.keys(DEPT_LABELS).map(k => ({ value: k, label: DEPT_LABELS[k] }));

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'APPROVER', label: 'Aprobador' },
  { value: 'PROVIDER', label: 'Proveedor' }
];

function SolicitudesAcceso({ showAlert }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [decision, setDecision] = useState({
    decision: '',
    roles: [],
    department: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/access-requests?status=${statusFilter}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Error cargando solicitudes');
      const data = await res.json();
      setRequests(data.data || []);
    } catch (err) {
      showAlert?.('error', 'Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDecisionModal = async (req) => {
    try {
      const res = await fetch(`${API_BASE}/api/access-requests/${req.id}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Error cargando detalles');
      const detail = await res.json();
      setSelectedRequest(detail);
      setDecision({
        decision: '',
        roles: detail.kind === 'PROVIDER' ? ['PROVIDER'] : [],
        department: detail.department || '',
        notes: ''
      });
    } catch (err) {
      showAlert?.('error', 'Error', err.message);
    }
  };

  const handleDecision = async () => {
    if (!decision.decision) {
      showAlert?.('warning', 'Advertencia', 'Selecciona aprobar o rechazar');
      return;
    }
    if (decision.decision === 'REJECTED' && !decision.notes.trim()) {
      showAlert?.('warning', 'Advertencia', 'El motivo del rechazo es obligatorio');
      return;
    }
    if (decision.decision === 'APPROVED' && selectedRequest.kind === 'INTERNAL') {
      if (!decision.department) {
        showAlert?.('warning', 'Advertencia', 'Selecciona un departamento');
        return;
      }
      if (decision.roles.length === 0) {
        showAlert?.('warning', 'Advertencia', 'Asigna al menos un rol');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/access-requests/${selectedRequest.id}/decision`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: decision.decision,
          roles: decision.roles,
          department: decision.department || undefined,
          notes: decision.notes || undefined
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al procesar decisión');
      }
      const result = await res.json();
      showAlert?.('success', 'Éxito', result.message || 'Solicitud procesada');
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      showAlert?.('error', 'Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const toggleRole = (role) => {
    if (decision.roles.includes(role)) {
      setDecision(prev => ({ ...prev, roles: prev.roles.filter(r => r !== role) }));
    } else {
      setDecision(prev => ({ ...prev, roles: [...prev.roles, role] }));
    }
  };

  const getKindBadge = (kind) => {
    if (kind === 'INTERNAL') return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">Interno</span>;
    if (kind === 'PROVIDER') return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Proveedor</span>;
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{kind}</span>;
  };

  const getStatusBadge = (status) => {
    if (status === 'PENDING') return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Pendiente</span>;
    if (status === 'APPROVED') return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Aprobada</span>;
    if (status === 'REJECTED') return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Rechazada</span>;
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{status}</span>;
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-darkBlue">Solicitudes de Acceso</h2>
          <p className="text-sm text-gray-600 mt-1">Gestiona las solicitudes de nuevos usuarios</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === 'PENDING' ? 'bg-midBlue text-white' : 'bg-white text-darkBlue border border-lightBlue hover:bg-lightBlue'}`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === 'APPROVED' ? 'bg-midBlue text-white' : 'bg-white text-darkBlue border border-lightBlue hover:bg-lightBlue'}`}
          >
            Aprobadas
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === 'REJECTED' ? 'bg-midBlue text-white' : 'bg-white text-darkBlue border border-lightBlue hover:bg-lightBlue'}`}
          >
            Rechazadas
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-midBlue"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay solicitudes {statusFilter.toLowerCase()}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-lightBlue">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-darkBlue uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-darkBlue uppercase">Solicitante</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-darkBlue uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-darkBlue uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-darkBlue uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-darkBlue uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{getKindBadge(req.kind)}</td>
                  <td className="px-4 py-3 font-medium text-darkBlue">{req.fullName || req.companyName || 'Sin nombre'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{req.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(req.createdAt)}</td>
                  <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openDecisionModal(req)}
                      className="px-3 py-1 text-sm font-medium text-midBlue hover:bg-lightBlue rounded-lg transition"
                    >
                      {req.status === 'PENDING' ? 'Decidir' : 'Ver'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de decisión */}
      {selectedRequest && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={() => setSelectedRequest(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-midBlue to-darkBlue px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Solicitud de Acceso</h3>
                <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Detalles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Tipo</label>
                    <p className="mt-1">{getKindBadge(selectedRequest.kind)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Estado</label>
                    <p className="mt-1">{getStatusBadge(selectedRequest.status)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                    <p className="mt-1 text-sm text-darkBlue font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-midBlue" />
                      {selectedRequest.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Fecha de solicitud</label>
                    <p className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(selectedRequest.createdAt)}
                    </p>
                  </div>
                  {selectedRequest.fullName && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Nombre completo</label>
                      <p className="mt-1 text-sm text-darkBlue flex items-center gap-2">
                        <User className="w-4 h-4 text-midBlue" />
                        {selectedRequest.fullName}
                      </p>
                    </div>
                  )}
                  {selectedRequest.companyName && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Empresa</label>
                      <p className="mt-1 text-sm text-darkBlue flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-midBlue" />
                        {selectedRequest.companyName}
                      </p>
                    </div>
                  )}
                  {selectedRequest.rfc && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">RFC</label>
                      <p className="mt-1 text-sm text-gray-600">{selectedRequest.rfc}</p>
                    </div>
                  )}
                  {selectedRequest.department && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Departamento solicitado</label>
                      <p className="mt-1 text-sm text-gray-600">{DEPT_LABELS[selectedRequest.department] || selectedRequest.department}</p>
                    </div>
                  )}
                </div>

                {selectedRequest.status === 'PENDING' && (
                  <>
                    <hr className="border-gray-200" />
                    <div className="space-y-4">
                      <h4 className="font-semibold text-darkBlue">Decisión</h4>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setDecision(prev => ({ ...prev, decision: 'APPROVED' }))}
                          className={`flex-1 py-3 rounded-lg font-medium border-2 transition ${decision.decision === 'APPROVED' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-300 text-gray-700 hover:border-green-300'}`}
                        >
                          <CheckCircle2 className="w-5 h-5 inline mr-2" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => setDecision(prev => ({ ...prev, decision: 'REJECTED' }))}
                          className={`flex-1 py-3 rounded-lg font-medium border-2 transition ${decision.decision === 'REJECTED' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-300 text-gray-700 hover:border-red-300'}`}
                        >
                          <XCircle className="w-5 h-5 inline mr-2" />
                          Rechazar
                        </button>
                      </div>

                      {decision.decision === 'APPROVED' && selectedRequest.kind === 'INTERNAL' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Departamento *</label>
                            <select
                              value={decision.department}
                              onChange={(e) => setDecision(prev => ({ ...prev, department: e.target.value }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-midBlue focus:border-transparent"
                            >
                              <option value="">Seleccionar departamento</option>
                              {DEPT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Roles *</label>
                            <div className="space-y-2">
                              {ROLE_OPTIONS.filter(r => r.value !== 'PROVIDER').map(role => (
                                <label key={role.value} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={decision.roles.includes(role.value)}
                                    onChange={() => toggleRole(role.value)}
                                    className="w-4 h-4 text-midBlue border-gray-300 rounded focus:ring-midBlue"
                                  />
                                  <span className="text-sm text-gray-700">{role.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {decision.decision === 'REJECTED' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Motivo del rechazo *</label>
                          <textarea
                            value={decision.notes}
                            onChange={(e) => setDecision(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                            placeholder="Explica brevemente por qué se rechaza..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-midBlue focus:border-transparent"
                          />
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleDecision}
                          disabled={submitting}
                          className="flex-1 py-3 bg-midBlue text-white rounded-lg font-semibold hover:bg-darkBlue transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Procesando...' : 'Confirmar decisión'}
                        </button>
                        <button
                          onClick={() => setSelectedRequest(null)}
                          disabled={submitting}
                          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {selectedRequest.status !== 'PENDING' && selectedRequest.notes && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Notas</label>
                    <p className="mt-1 text-sm text-gray-700">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SolicitudesAcceso;
