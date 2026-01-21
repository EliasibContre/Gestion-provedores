import React, { useState } from "react";
import {
    DollarSign,
    Calendar,
    CreditCard,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    MessageSquare,
    Receipt,
    User,
    Eye,
    AlertCircle,
    UserCheck,
    UserX
} from "lucide-react";

function AprobaciondePagos({ showAlert, onClose }) {
    // Simulando usuario actual (esto vendría del sistema de autenticación)
    const usuarioActual = {
        id: 1,
        nombre: "admin",
        nombreCompleto: "Administrador del Sistema"
    };

    // Estado inicial de pagos pendientes de aprobación
    const [pagos, setPagos] = useState([
        {
            id: 1,
            ocNumero: "OC-2024-00123",
            proveedor: "Construcciones Modernas S.A.",
            monto: "$45,800.00",
            montoNumerico: 45800.00,
            fechaPago: "2024-01-15",
            metodo: "Transferencia",
            parcialidad: "1/1",
            estado: "pendiente",
            comentario: "",
            estatus: "Pendiente",
            aprobador: "",
            fechaAprobacion: ""
        },
        {
            id: 2,
            ocNumero: "OC-2024-00145",
            proveedor: "Suministros Industriales del Norte",
            monto: "$28,500.00",
            montoNumerico: 28500.00,
            fechaPago: "2024-01-16",
            metodo: "Cheque",
            parcialidad: "1/3",
            estado: "pendiente",
            comentario: "",
            estatus: "Pendiente",
            aprobador: "",
            fechaAprobacion: ""
        },
        {
            id: 3,
            ocNumero: "OC-2024-00167",
            proveedor: "Tecnologías Avanzadas México",
            monto: "$152,300.00",
            montoNumerico: 152300.00,
            fechaPago: "2024-01-17",
            metodo: "Transferencia",
            parcialidad: "2/3",
            estado: "pendiente",
            comentario: "",
            estatus: "Pendiente",
            aprobador: "",
            fechaAprobacion: ""
        },
        {
            id: 4,
            ocNumero: "OC-2024-00189",
            proveedor: "Servicios Logísticos Integrales",
            monto: "$67,450.00",
            montoNumerico: 67450.00,
            fechaPago: "2024-01-18",
            metodo: "Efectivo",
            parcialidad: "1/2",
            estado: "pendiente",
            comentario: "",
            estatus: "Pendiente",
            aprobador: "",
            fechaAprobacion: ""
        },
        {
            id: 5,
            ocNumero: "OC-2024-00201",
            proveedor: "Materiales de Construcción Premium",
            monto: "$89,200.00",
            montoNumerico: 89200.00,
            fechaPago: "2024-01-19",
            metodo: "Tarjeta de Crédito",
            parcialidad: "2/2",
            estado: "pendiente",
            comentario: "",
            estatus: "Pendiente",
            aprobador: "",
            fechaAprobacion: ""
        },
        {
            id: 6,
            ocNumero: "OC-2024-00234",
            proveedor: "Equipos Médicos Especializados",
            monto: "$210,500.00",
            montoNumerico: 210500.00,
            fechaPago: "2024-01-20",
            metodo: "Transferencia",
            parcialidad: "3/4",
            estado: "pendiente",
            comentario: "",
            estatus: "Pendiente",
            aprobador: "",
            fechaAprobacion: ""
        }
    ]);

    const [busqueda, setBusqueda] = useState("");
    const [filtroMetodo, setFiltroMetodo] = useState("todos");
    const [modalAprobar, setModalAprobar] = useState(false);
    const [modalRechazar, setModalRechazar] = useState(false);
    const [modalVerComentario, setModalVerComentario] = useState(false);
    const [modalVerDetalles, setModalVerDetalles] = useState(false);
    const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
    const [comentarioRechazo, setComentarioRechazo] = useState("");
    const [errorComentario, setErrorComentario] = useState("");

    const metodosPago = ["todos", "Transferencia", "Cheque", "Efectivo", "Tarjeta de Crédito"];

    // Filtrar todos los pagos (pendientes, aprobados y rechazados)
    const pagosFiltrados = pagos.filter(pago => {
        const coincideBusqueda =
            pago.proveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
            pago.ocNumero.toLowerCase().includes(busqueda.toLowerCase()) ||
            pago.estatus.toLowerCase().includes(busqueda.toLowerCase()) ||
            pago.aprobador.toLowerCase().includes(busqueda.toLowerCase());

        const coincideMetodo = filtroMetodo === "todos" || pago.metodo === filtroMetodo;

        return coincideBusqueda && coincideMetodo;
    });

    const abrirModalAprobar = (pago) => {
        setPagoSeleccionado(pago);
        setModalAprobar(true);
    };

    const abrirModalRechazar = (pago) => {
        setPagoSeleccionado(pago);
        setComentarioRechazo("");
        setErrorComentario("");
        setModalRechazar(true);
    };

    const abrirModalVerComentario = (pago) => {
        setPagoSeleccionado(pago);
        setModalVerComentario(true);
    };

    const abrirModalVerDetalles = (pago) => {
        setPagoSeleccionado(pago);
        setModalVerDetalles(true);
    };

    const cerrarModalAprobar = () => {
        setModalAprobar(false);
        setPagoSeleccionado(null);
    };

    const cerrarModalRechazar = () => {
        setModalRechazar(false);
        setPagoSeleccionado(null);
        setComentarioRechazo("");
        setErrorComentario("");
    };

    const cerrarModalVerComentario = () => {
        setModalVerComentario(false);
        setPagoSeleccionado(null);
    };

    const cerrarModalVerDetalles = () => {
        setModalVerDetalles(false);
        setPagoSeleccionado(null);
    };

    const validarComentario = () => {
        if (!comentarioRechazo.trim()) {
            setErrorComentario("El comentario es obligatorio para rechazar el pago.");
            return false;
        }
        if (comentarioRechazo.trim().length < 10) {
            setErrorComentario("El comentario debe tener al menos 10 caracteres.");
            return false;
        }
        setErrorComentario("");
        return true;
    };

    const aprobarPago = () => {
        if (!pagoSeleccionado) return;

        // Primero cerrar el modal
        cerrarModalAprobar();

        // Luego actualizar el estado con un pequeño retraso para que se cierre primero
        setTimeout(() => {
            const fechaActual = new Date().toLocaleDateString('es-MX', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });

            setPagos(prev => prev.map(pago =>
                pago.id === pagoSeleccionado.id
                    ? {
                        ...pago,
                        estado: "aprobado",
                        estatus: "Aprobada",
                        aprobador: usuarioActual.nombreCompleto,
                        fechaAprobacion: fechaActual
                    }
                    : pago
            ));

            showAlert('success', 'Pago Aprobado', `El pago ${pagoSeleccionado.ocNumero} ha sido aprobado exitosamente.`);
        }, 10);
    };

    const rechazarPago = () => {
        if (!pagoSeleccionado) return;

        // Validar comentario
        if (!validarComentario()) {
            return;
        }

        // Primero cerrar el modal
        cerrarModalRechazar();

        // Luego actualizar el estado con un pequeño retraso para que se cierre primero
        setTimeout(() => {
            const fechaActual = new Date().toLocaleDateString('es-MX', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });

            setPagos(prev => prev.map(pago =>
                pago.id === pagoSeleccionado.id
                    ? {
                        ...pago,
                        estado: "rechazado",
                        estatus: "Rechazada",
                        comentario: comentarioRechazo.trim(),
                        aprobador: usuarioActual.nombreCompleto,
                        fechaAprobacion: fechaActual
                    }
                    : pago
            ));

            showAlert('warning', 'Pago Rechazado', `El pago ${pagoSeleccionado.ocNumero} ha sido rechazado. Razón: ${comentarioRechazo}`);
        }, 10);
    };

    const limpiarFiltros = () => {
        setBusqueda("");
        setFiltroMetodo("todos");
    };

    const handleComentarioChange = (e) => {
        setComentarioRechazo(e.target.value);
        // Limpiar error cuando el usuario empieza a escribir
        if (errorComentario && e.target.value.trim().length >= 10) {
            setErrorComentario("");
        }
    };

    const getParcialidadColor = (parcialidad) => {
        if (parcialidad === "1/1") return "bg-green-100 text-green-800 border-green-200";
        if (parcialidad.includes("1/")) return "bg-blue-100 text-blue-800 border-blue-200";
        if (parcialidad.includes("/" + parcialidad.split("/")[1]) &&
            parcialidad.split("/")[0] === parcialidad.split("/")[1]) {
            return "bg-green-100 text-green-800 border-green-200";
        }
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    };

    const getMetodoColor = (metodo) => {
        switch (metodo) {
            case "Transferencia": return "bg-blue-50 text-blue-700 border-blue-200";
            case "Cheque": return "bg-purple-50 text-purple-700 border-purple-200";
            case "Efectivo": return "bg-green-50 text-green-700 border-green-200";
            case "Tarjeta de Crédito": return "bg-yellow-50 text-yellow-700 border-yellow-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const getEstatusColor = (estatus) => {
        switch (estatus) {
            case "Aprobada": return "bg-green-100 text-green-800 border-green-200";
            case "Rechazada": return "bg-red-100 text-red-800 border-red-200";
            case "Pendiente": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Aprobación de Pagos</h1>
                <p className="text-gray-600">Revisa, aprueba o rechaza los pagos pendientes de autorización</p>
            </div>

            {/* Filtros */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Búsqueda */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por OC, proveedor, estatus o aprobador..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Filtro por método */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={filtroMetodo}
                            onChange={(e) => setFiltroMetodo(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {metodosPago.map((metodo, index) => (
                                <option key={index} value={metodo}>
                                    {metodo === "todos" ? "Todos los métodos" : metodo}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Botón limpiar */}
                    <button
                        onClick={limpiarFiltros}
                        className="px-4 py-3 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Limpiar filtros
                    </button>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    OC Número
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    Proveedor
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    Monto
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    Fecha Pago
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    Método
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    Pago
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    Estatus
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    Aprobador
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    Comentarios
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    Acción
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pagosFiltrados.map((pago) => (
                                <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                                    {/* Columna OC Número */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <Receipt className="w-4 h-4 mr-2 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-900">{pago.ocNumero}</span>
                                        </div>
                                    </td>

                                    {/* Columna Proveedor */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-2 text-gray-500" />
                                            <span className="text-sm text-gray-900">{pago.proveedor}</span>
                                        </div>
                                    </td>

                                    {/* Columna Monto */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-sm font-medium text-gray-900">
                                            <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                                            {pago.monto}
                                        </div>
                                    </td>

                                    {/* Columna Fecha Pago */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                            {pago.fechaPago}
                                        </div>
                                    </td>

                                    {/* Columna Método */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded text-xs font-medium border ${getMetodoColor(pago.metodo)}`}>
                                            {pago.metodo}
                                        </span>
                                    </td>

                                    {/* Columna Pago (Parcialidad) */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded text-xs font-medium border ${getParcialidadColor(pago.parcialidad)}`}>
                                            {pago.parcialidad}
                                        </span>
                                    </td>

                                    {/* Columna Estatus */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded text-xs font-medium border ${getEstatusColor(pago.estatus)}`}>
                                            {pago.estatus}
                                        </span>
                                    </td>

                                    {/* Columna Aprobador */}
                                    <td className="px-6 py-4">
                                        {pago.aprobador ? (
                                            <div className="flex items-center">
                                                {pago.estatus === "Aprobada" ? (
                                                    <UserCheck className="w-4 h-4 mr-1 text-green-600" />
                                                ) : (
                                                    <UserX className="w-4 h-4 mr-1 text-red-600" />
                                                )}
                                                <div>
                                                    <p className="text-xs font-medium text-gray-900">{pago.aprobador}</p>
                                                    <p className="text-xs text-gray-500">{pago.fechaAprobacion}</p>
                                                    {pago.estatus !== "Pendiente" && (
                                                        <button
                                                            onClick={() => abrirModalVerDetalles(pago)}
                                                            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                                                        >
                                                            Ver detalles
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-500">Pendiente</span>
                                        )}
                                    </td>

                                    {/* Columna Comentarios */}
                                    <td className="px-6 py-4">
                                        {pago.estado === "rechazado" && pago.comentario ? (
                                            <button
                                                onClick={() => abrirModalVerComentario(pago)}
                                                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                                title="Ver comentario"
                                            >
                                                <MessageSquare className="w-3 h-3" />
                                                Ver comentario
                                            </button>
                                        ) : pago.estado === "aprobado" ? (
                                            <span className="text-xs text-gray-500">-</span>
                                        ) : (
                                            <span className="text-xs text-gray-500">Pendiente</span>
                                        )}
                                    </td>

                                    {/* Columna Acción */}
                                    <td className="px-6 py-4">
                                        {pago.estado === "pendiente" ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => abrirModalAprobar(pago)}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    title="Aprobar pago"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Aprobar
                                                </button>
                                                <button
                                                    onClick={() => abrirModalRechazar(pago)}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                    title="Rechazar pago"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Rechazar
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500">
                                                {pago.estado === "aprobado" ? "Aprobado" : "Rechazado"}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Sin resultados */}
                {pagosFiltrados.length === 0 && (
                    <div className="py-12 text-center">
                        <div className="text-gray-400 mb-2">
                            <Search className="w-12 h-12 mx-auto" />
                        </div>
                        <p className="text-gray-500 text-sm">
                            No se encontraron pagos con los filtros aplicados
                        </p>
                        {busqueda || filtroMetodo !== "todos" ? (
                            <button
                                onClick={limpiarFiltros}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                                Limpiar filtros
                            </button>
                        ) : null}
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">
                            Mostrando {pagosFiltrados.length} de {pagos.length} pagos
                        </p>
                        <p className="text-xs text-gray-500">
                            {pagos.filter(p => p.estatus === "Aprobada").length} aprobados • {pagos.filter(p => p.estatus === "Rechazada").length} rechazados • {pagos.filter(p => p.estatus === "Pendiente").length} pendientes
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal Aprobar Pago */}
            {modalAprobar && pagoSeleccionado && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto">
                        <div className="p-6">
                            <div className="text-center mb-4">
                                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirmar Aprobación</h3>
                                <p className="text-sm text-gray-600">
                                    ¿Está seguro de aprobar este pago?
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">OC Número:</span>
                                    <span className="text-sm text-gray-900">{pagoSeleccionado.ocNumero}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Proveedor:</span>
                                    <span className="text-sm text-gray-900">{pagoSeleccionado.proveedor}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Monto:</span>
                                    <span className="text-sm text-gray-900">{pagoSeleccionado.monto}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-700">Parcialidad:</span>
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${getParcialidadColor(pagoSeleccionado.parcialidad)}`}>
                                        {pagoSeleccionado.parcialidad}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <UserCheck className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-700">Aprobador:</span>
                                </div>
                                <p className="text-sm text-gray-700">{usuarioActual.nombreCompleto}</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={cerrarModalAprobar}
                                    className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={aprobarPago}
                                    className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Confirmar Aprobación
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Rechazar Pago */}
            {modalRechazar && pagoSeleccionado && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Rechazar Pago</h3>
                                <button
                                    onClick={cerrarModalRechazar}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">OC Número:</span>
                                    <span className="text-sm text-gray-900">{pagoSeleccionado.ocNumero}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Proveedor:</span>
                                    <span className="text-sm text-gray-900">{pagoSeleccionado.proveedor}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-700">Monto:</span>
                                    <span className="text-sm text-gray-900">{pagoSeleccionado.monto}</span>
                                </div>
                            </div>

                            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <UserX className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium text-red-700">Rechazado por:</span>
                                </div>
                                <p className="text-sm text-gray-700">{usuarioActual.nombreCompleto}</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Comentario de rechazo <span className="text-red-500">*</span>
                                    </div>
                                </label>
                                <textarea
                                    value={comentarioRechazo}
                                    onChange={handleComentarioChange}
                                    placeholder="Ingrese el motivo del rechazo del pago (mínimo 10 caracteres)..."
                                    rows="3"
                                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errorComentario ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errorComentario && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        <p className="text-xs text-red-500">{errorComentario}</p>
                                    </div>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Este comentario será registrado junto con el rechazo del pago.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={cerrarModalRechazar}
                                    className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={rechazarPago}
                                    className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Confirmar Rechazo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ver Comentario */}
            {modalVerComentario && pagoSeleccionado && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Comentario de Rechazo</h3>
                                <button
                                    onClick={cerrarModalVerComentario}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">OC Número:</span>
                                    <span className="text-sm text-gray-900">{pagoSeleccionado.ocNumero}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Proveedor:</span>
                                    <span className="text-sm text-gray-900">{pagoSeleccionado.proveedor}</span>
                                </div>
                                <div className="flex justify-between mb-4">
                                    <span className="text-sm font-medium text-gray-700">Estatus:</span>
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${getEstatusColor(pagoSeleccionado.estatus)}`}>
                                        {pagoSeleccionado.estatus}
                                    </span>
                                </div>

                                <div className="border-t pt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            Comentario
                                        </div>
                                    </label>
                                    <div className="bg-white p-3 rounded border border-gray-200 min-h-[100px]">
                                        <p className="text-sm text-gray-700 whitespace-pre-line">
                                            {pagoSeleccionado.comentario || "Sin comentario"}
                                        </p>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Comentario registrado el {pagoSeleccionado.fechaAprobacion || new Date().toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={cerrarModalVerComentario}
                                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ver Detalles del Aprobador */}
            {modalVerDetalles && pagoSeleccionado && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Detalles de Aprobación</h3>
                                <button
                                    onClick={cerrarModalVerDetalles}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">OC Número:</span>
                                    <span className="text-sm text-gray-900">{pagoSeleccionado.ocNumero}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Proveedor:</span>
                                    <span className="text-sm text-gray-900">{pagoSeleccionado.proveedor}</span>
                                </div>
                                <div className="flex justify-between mb-4">
                                    <span className="text-sm font-medium text-gray-700">Estatus:</span>
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${getEstatusColor(pagoSeleccionado.estatus)}`}>
                                        {pagoSeleccionado.estatus}
                                    </span>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        {pagoSeleccionado.estatus === "Aprobada" ? (
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <UserCheck className="w-6 h-6 text-green-600" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                <UserX className="w-6 h-6 text-red-600" />
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-medium text-gray-900">Aprobador</h4>
                                            <p className="text-sm text-gray-700">{pagoSeleccionado.aprobador}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-700">Acción:</span>
                                            <span className={`text-sm font-medium ${pagoSeleccionado.estatus === "Aprobada" ? "text-green-600" : "text-red-600"
                                                }`}>
                                                {pagoSeleccionado.estatus}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-700">Fecha y hora:</span>
                                            <span className="text-sm text-gray-900">{pagoSeleccionado.fechaAprobacion}</span>
                                        </div>
                                        {pagoSeleccionado.estatus === "Rechazada" && pagoSeleccionado.comentario && (
                                            <div className="pt-2">
                                                <span className="text-sm font-medium text-gray-700 block mb-1">Comentario:</span>
                                                <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                                                    {pagoSeleccionado.comentario}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={cerrarModalVerDetalles}
                                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AprobaciondePagos;