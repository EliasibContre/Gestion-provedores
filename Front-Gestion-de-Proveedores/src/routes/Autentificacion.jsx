import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function Autentificacion() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/api\/?$/, "");

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) navigate("/login");
  }, [email, navigate]);

  const showAlert = (type, title, message) => {
    setAlertConfig({ type, title, message });
    setAlertOpen(true);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!code.trim() || code.length !== 6) {
      showAlert('error', 'Código Inválido', 'Ingresa el código de 6 dígitos');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert('error', 'Error', data?.message || 'Código inválido o expirado');
        return;
      }

      // Verificar si debe cambiar contraseña
      if (data.user?.mustChangePassword) {
        navigate('/cambio-pass');
      } else {
        // Redirigir según el rol
        const roles = data.user?.roles || [];
        if (roles.includes('ADMIN')) {
          navigate('/dashboarda');
        } else if (roles.includes('APPROVER')) {
          navigate('/dashboardapro');
        } else if (roles.includes('PROVIDER')) {
          navigate('/dashboardprovider');
        } else {
          navigate('/dashboarda');
        }
      }
    } catch (error) {
      console.error('Error en verificación:', error);
      showAlert('error', 'Error de Conexión', 'No se pudo conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value !== "" && index < 5) {
        inputRefs.current[index + 1].focus();
      }

      const verificationCode = newCode.join("");
      if (verificationCode.length === 6) {
        handleAutoSubmit(verificationCode);
      }
    }
  };

  const detectRole = (data) => {
    const user = data?.user ?? {};
    const session = data?.session ?? {};
    const roleId =
      user.roleId ?? session.roleId ??
      user.role?.id ?? session.role?.id ??
      user.roles?.[0]?.id ?? session.roles?.[0]?.id;
    if (typeof roleId === "number") return roleId;

    const roleName =
      user.role?.name || session.role?.name || user.roles?.[0] || session.roles?.[0] || "";
    const n = String(roleName).toLowerCase();
    if (n.includes("admin")) return 3;
    if (n.includes("approver") || n.includes("apro")) return 2;
    if (n.includes("provider") || n.includes("proveedor")) return 1;
    return null;
  };

  const handleAutoSubmit = async (verificationCode) => {
    setIsLoading(true);
    setShowError(false);
    try {
      const res = await axios.post(
        `${API_BASE}/api/auth/login/verify`,
        { email, code: verificationCode },
        { withCredentials: true }
      );

      const data = res.data || {};
      // Si debe cambiar contraseña primero
      if (data?.user?.mustChangePassword || data?.mustChangePassword) {
        navigate("/cambio-pass");
        return;
      }

      const role = detectRole(data);
      if (role === 3) navigate("/dashboarda");
      else if (role === 2) navigate("/dashboardapro");
      else if (role === 1) navigate("/dashboardprovider");
      else navigate("/dashboarda"); // fallback
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Código inválido o expirado. Intenta nuevamente.");
      setShowError(true);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (code[index] === "" && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const numbers = pastedData.replace(/\D/g, "").slice(0, 6);
    
    if (numbers.length === 6) {
      const newCode = numbers.split("");
      setCode(newCode);
      handleAutoSubmit(numbers);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await axios.post(
      `${API_BASE}/api/auth/login/resend`,     // usar API_BASE
      { email },
      { withCredentials: true }
    );
      setShowSuccess(true);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error('Error al reenviar el código:', error);
      setErrorMsg(error?.response?.data?.message || "No se pudo reenviar el código");
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Cerrar modales con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowSuccess(false);
        setShowError(false);
      }
    };
    
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-lightBlue mx-auto">
        
        {/* Contenido principal */}
        <div className="p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-darkBlue mb-3 sm:mb-4">Verificación de Código</h1>
            <p className="text-base sm:text-lg lg:text-xl text-midBlue">
              Ingresa el código de 6 dígitos que te enviamos
            </p>
          </div>

          <div className="space-y-8 sm:space-y-10 lg:space-y-12">
            {/* Inputs del código - MARCOS SUTILES */}
            <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 text-center text-xl sm:text-2xl lg:text-3xl font-bold border-2 border-gray-400 rounded-lg sm:rounded-xl focus:outline-none focus:border-midBlue focus:ring-2 focus:ring-midBlue focus:ring-opacity-30 transition-all bg-white"
                />
              ))}
            </div>

            {/* Estado de carga */}
            {isLoading && (
              <div className="text-center">
                <div className="inline-flex items-center gap-3 sm:gap-4 text-midBlue text-base sm:text-lg">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-midBlue"></div>
                  <span>Verificando código...</span>
                </div>
              </div>
            )}

            {/* Botón reenviar */}
            <div className="text-center pt-6 sm:pt-8 border-t border-lightBlue">
              <button 
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-midBlue hover:text-darkBlue font-semibold text-base sm:text-lg transition-colors disabled:opacity-50 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-lightBlue hover:bg-opacity-30 w-full sm:w-auto"
              >
                Reenviar código de verificación
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de alerta centrado */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6 backdrop-blur-sm">
          <div 
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-lightBlue animate-scale-in mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
             
              
              {/* Texto */}
              <h3 className="text-xl sm:text-2xl font-bold text-darkBlue mb-3 sm:mb-4">
                Código Enviado
              </h3>
              <p className="text-midBlue text-base sm:text-lg mb-6 sm:mb-8">
                Se ha enviado un nuevo código de verificación a tu correo electrónico.
              </p>
              
              {/* Botón */}
              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full py-3 sm:py-4 bg-midBlue text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-darkBlue transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de ERROR (código incorrecto) */}
      {showError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6 backdrop-blur-sm" onClick={() => setShowError(false)}>
          <div 
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-red-300 animate-scale-in mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-red-700 mb-3 sm:mb-4">
                Código inválido
              </h3>
              <p className="text-gray-700 text-base sm:text-lg mb-6 sm:mb-8">
                {errorMsg}
              </p>
              <button 
                onClick={() => setShowError(false)}
                className="w-full py-3 sm:py-4 bg-red-600 text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-red-700 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Autentificacion;