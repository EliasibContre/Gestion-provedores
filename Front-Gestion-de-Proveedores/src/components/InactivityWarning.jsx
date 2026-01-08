import { useEffect } from 'react';

/**
 * Modal de advertencia de inactividad
 */
export default function InactivityWarning({ show, remainingSeconds, onExtend, onLogout }) {
  useEffect(() => {
    // Prevenir scroll del body cuando el modal está abierto
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.3s ease-in'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Icono de advertencia */}
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 20px',
          backgroundColor: '#FEF3C7',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#F59E0B" 
            strokeWidth="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        {/* Título */}
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '12px',
          color: '#1F2937'
        }}>
          Sesión por expirar
        </h2>

        {/* Mensaje */}
        <p style={{
          textAlign: 'center',
          color: '#6B7280',
          marginBottom: '24px',
          fontSize: '15px',
          lineHeight: '1.6'
        }}>
          Tu sesión está a punto de cerrarse por inactividad.
        </p>

        {/* Contador */}
        <div style={{
          backgroundColor: '#F3F4F6',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#6B7280',
            marginBottom: '8px'
          }}>
            Tiempo restante
          </div>
          <div style={{
            fontSize: '48px',
            fontWeight: '700',
            color: remainingSeconds <= 30 ? '#EF4444' : '#F59E0B',
            fontFamily: 'monospace',
            letterSpacing: '2px'
          }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        {/* Botones */}
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onLogout}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={e => e.target.style.backgroundColor = '#F3F4F6'}
          >
            Cerrar sesión
          </button>
          <button
            onClick={onExtend}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#2563EB'}
            onMouseLeave={e => e.target.style.backgroundColor = '#3B82F6'}
          >
            Continuar activo
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
