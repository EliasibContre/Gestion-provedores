import React, { useState, useEffect } from 'react';
import { Clock, Eye, CheckCircle, DollarSign, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const EstatusPago = () => {
  const [tiemposEstatus, setTiemposEstatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarTiemposPago();
  }, []);

  const cargarTiemposPago = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE}/api/analytics/payment-timings`, {
        withCredentials: true
      });

      const data = response.data;
      
      // Mapear los datos del backend con configuración visual
      const tiempos = [
        {
          estatus: data.DRAFT?.label || 'Pendiente de validación',
          tiempo: `${data.DRAFT?.days || 0} ${data.DRAFT?.days === 1 ? 'día' : 'días'}`,
          color: 'bg-yellow-50 border-yellow-200',
          icono: Clock,
          iconColor: 'text-yellow-500',
          bgIcon: 'bg-yellow-100',
          count: data.DRAFT?.count || 0
        },
        {
          estatus: data.SENT?.label || 'En revisión',
          tiempo: `${data.SENT?.days || 0} ${data.SENT?.days === 1 ? 'día' : 'días'}`,
          color: 'bg-blue-50 border-blue-200',
          icono: Eye,
          iconColor: 'text-blue-500',
          bgIcon: 'bg-blue-100',
          count: data.SENT?.count || 0
        },
        {
          estatus: data.APPROVED?.label || 'Autorizado',
          tiempo: `${data.APPROVED?.days || 0} ${data.APPROVED?.days === 1 ? 'día' : 'días'}`,
          color: 'bg-green-50 border-green-200',
          icono: CheckCircle,
          iconColor: 'text-green-500',
          bgIcon: 'bg-green-100',
          count: data.APPROVED?.count || 0
        },
        {
          estatus: data.RECEIVED?.label || 'Pagado',
          tiempo: `${data.RECEIVED?.days || 0} ${data.RECEIVED?.days === 1 ? 'día' : 'días'}`,
          color: 'bg-purple-50 border-purple-200',
          icono: DollarSign,
          iconColor: 'text-purple-500',
          bgIcon: 'bg-purple-100',
          count: data.RECEIVED?.count || 0
        }
      ];

      setTiemposEstatus(tiempos);
    } catch (err) {
      console.error('Error cargando tiempos de pago:', err);
      setError('No se pudieron cargar los tiempos de pago. Por favor, intenta nuevamente.');
      
      // Mostrar datos por defecto en caso de error
      setTiemposEstatus([
        {
          estatus: 'Pendiente de validación',
          tiempo: '-- días',
          color: 'bg-yellow-50 border-yellow-200',
          icono: Clock,
          iconColor: 'text-yellow-500',
          bgIcon: 'bg-yellow-100',
          count: 0
        },
        {
          estatus: 'En revisión',
          tiempo: '-- días',
          color: 'bg-blue-50 border-blue-200',
          icono: Eye,
          iconColor: 'text-blue-500',
          bgIcon: 'bg-blue-100',
          count: 0
        },
        {
          estatus: 'Autorizado',
          tiempo: '-- días',
          color: 'bg-green-50 border-green-200',
          icono: CheckCircle,
          iconColor: 'text-green-500',
          bgIcon: 'bg-green-100',
          count: 0
        },
        {
          estatus: 'Pagado',
          tiempo: '-- días',
          color: 'bg-purple-50 border-purple-200',
          icono: DollarSign,
          iconColor: 'text-purple-500',
          bgIcon: 'bg-purple-100',
          count: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-darkBlue mb-4">Tiempos por Estatus de Pago</h2>
          <p className="text-xl text-midBlue">Días promedio en cada etapa del proceso</p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader className="w-12 h-12 text-midBlue animate-spin mx-auto mb-3" />
              <p className="text-midBlue font-medium">Cargando datos de pago...</p>
            </div>
          </div>
        )}

        {/* Cuadritos de Estatus - Más grandes */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiemposEstatus.map((item, index) => {
              const Icono = item.icono;
              
              return (
                <div 
                  key={index} 
                  className={`p-8 rounded-xl border-2 ${item.color} text-center transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer`}
                >
                  {/* Icono Principal - Más grande */}
                  <div className={`p-4 rounded-2xl ${item.bgIcon} inline-flex items-center justify-center mb-6`}>
                    <Icono className={`w-12 h-12 ${item.iconColor}`} />
                  </div>

                  {/* Tiempo - Texto más grande */}
                  <div className="text-4xl font-bold text-gray-800 mb-4">{item.tiempo}</div>

                  {/* Nombre del Estatus - Texto más grande */}
                  <h3 className="text-lg font-semibold text-darkBlue leading-tight mb-2">{item.estatus}</h3>

                  {/* Cantidad de órdenes */}
                  <p className="text-sm text-gray-600 mb-3">
                    {item.count === 0 ? 'Sin órdenes' : `${item.count} ${item.count === 1 ? 'orden' : 'órdenes'}`}
                  </p>

                  {/* Línea decorativa */}
                  <div className={`h-1 w-16 mx-auto rounded-full ${item.bgIcon.replace('bg-', 'bg-').replace('100', '300')}`}></div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pie de página con información */}
        {!loading && !error && (
          <div className="mt-12 p-6 bg-white rounded-lg border border-lightBlue">
            <p className="text-center text-midBlue text-sm">
              Los tiempos mostrados son promedios calculados basados en el historial de órdenes de compra.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstatusPago;