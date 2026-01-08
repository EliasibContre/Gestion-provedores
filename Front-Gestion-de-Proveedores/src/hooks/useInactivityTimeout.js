import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../api';

/**
 * Hook para detectar inactividad y cerrar sesión automáticamente
 * @param {number} timeoutMinutes - Minutos de inactividad antes de cerrar sesión (default: 30)
 * @param {number} warningMinutes - Minutos antes del timeout para mostrar advertencia (default: 2)
 */
export function useInactivityTimeout(timeoutMinutes = 30, warningMinutes = 2) {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const TIMEOUT_MS = timeoutMinutes * 60 * 1000;
  const WARNING_MS = (timeoutMinutes - warningMinutes) * 60 * 1000;

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setShowWarning(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      clearAllTimers();
      navigate('/login', { replace: true });
    }
  }, [navigate, clearAllTimers]);

  const startCountdown = useCallback(() => {
    setRemainingSeconds(warningMinutes * 60);
    
    countdownIntervalRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [warningMinutes]);

  const resetTimer = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);

    // Timer para mostrar advertencia
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, WARNING_MS);

    // Timer para cerrar sesión
    timeoutRef.current = setTimeout(() => {
      logout();
    }, TIMEOUT_MS);
  }, [TIMEOUT_MS, WARNING_MS, clearAllTimers, startCountdown, logout]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    // Eventos que detectan actividad del usuario
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Reiniciar timer en cada evento de actividad
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Iniciar el primer timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      clearAllTimers();
    };
  }, [resetTimer, clearAllTimers]);

  return {
    showWarning,
    remainingSeconds,
    extendSession,
    logout
  };
}
