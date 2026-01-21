import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function Autentificacion() {
  const navigate = useNavigate();
  const location = useLocation();
  // Si no hay email en el state, intenta leerlo del localStorage (opcional) o redirige
  const email = location.state?.email;

  // Asegura HTTPS y quita slash final
// Lógica corregida: Solo fuerza HTTPS si NO es localhost
  let rawUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  
  // Si NO estamos en localhost, aseguramos https. Si es local, dejamos http.
  if (!rawUrl.includes("localhost")) {
    rawUrl = rawUrl.replace(/^http:/, 'https:');
  }

  const API_BASE = rawUrl
    .replace(/\/api\/?$/, "")
    .replace(/\/+$/, "");

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      console.warn("No email found in location.state, redirecting to login...");
      navigate("/login");
    }
  }, [email, navigate]);

  // --- LÓGICA DE ROLES SIMPLIFICADA PARA TU BACKEND ---
  const detectRoleAndNavigate = (user) => {
    console.log("🔍 Detectando rol para usuario:", user);
    
    // Tu backend envía: roles: ["ADMIN"] o ["PROVIDER"]
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    
    // Normalizamos a mayúsculas para comparar
    const rolesUpper = roles.map(r => String(r).toUpperCase());

    console.log("📋 Roles encontrados:", rolesUpper);

    if (rolesUpper.includes("ADMIN")) {
      console.log("➡️ Redirigiendo a Dashboard ADMIN");
      navigate("/dashboarda");
    } else if (rolesUpper.includes("APPROVER")) {
      console.log("➡️ Redirigiendo a Dashboard APROBADOR");
      navigate("/dashboardapro");
    } else if (rolesUpper.includes("PROVIDER") || rolesUpper.includes("PROVEEDOR")) {
      console.log("➡️ Redirigiendo a Dashboard PROVEEDOR");
      navigate("/dashboardprovider");
    } else {
      console.warn("⚠️ No se detectó rol conocido, redirigiendo a fallback (Admin)");
      navigate("/dashboarda");
    }
  };

  const verifyCode = async (verificationCode) => {
    setIsLoading(true);
    setShowError(false);
    console.log("🚀 Enviando código:", verificationCode, "Email:", email);

    try {
      const res = await axios.post(
        `${API_BASE}/api/auth/login/verify`,
        { email, code: verificationCode },
        { withCredentials: true }
      );

      console.log("✅ Respuesta Backend:", res.data);
      const data = res.data || {};
      const user = data.user || {};

      // 1. Verificar si debe cambiar contraseña
      if (user.mustChangePassword) {
        console.log("🔒 Debe cambiar contraseña. Redirigiendo...");
        navigate("/cambio-pass");
        return;
      }

      // 2. Redirigir según rol
      detectRoleAndNavigate(user);

    } catch (err) {
      console.error("❌ Error en verificación:", err);
      setErrorMsg(err?.response?.data?.message || "Código inválido o expirado.");
      setShowError(true);
      // Limpiar código en error
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Se ejecuta al escribir
  const handleChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus siguiente input
      if (value !== "" && index < 5) {
        inputRefs.current[index + 1].focus();
      }

      // Auto-submit al completar 6 dígitos
      const verificationCode = newCode.join("");
      if (verificationCode.length === 6) {
        verifyCode(verificationCode);
      }
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
        setErrorMsg("Por favor ingresa los 6 dígitos");
        setShowError(true);
        return;
    }
    verifyCode(verificationCode);
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
      verifyCode(numbers);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/auth/login/resend`,
        { email },
        { withCredentials: true }
      );
      setShowSuccess(true);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error('Error al reenviar:', error);
      setErrorMsg(error?.response?.data?.message || "No se pudo reenviar el código");
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-lightBlue mx-auto">
        
        <div className="p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-darkBlue mb-3">Verificación</h1>
            <p className="text-base sm:text-lg text-midBlue">
              Ingresa el código enviado a: <strong>{email}</strong>
            </p>
          </div>

          <div className="space-y-8">
            {/* Inputs del código */}
            <div className="flex justify-center gap-2 sm:gap-4">
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
                  className="w-12 h-12 sm:w-16 sm:h-16 text-center text-xl sm:text-2xl font-bold border-2 border-gray-400 rounded-lg focus:outline-none focus:border-midBlue focus:ring-2 focus:ring-midBlue focus:ring-opacity-30 transition-all bg-white"
                />
              ))}
            </div>

            {/* Loading Spinner */}
            {isLoading && (
              <div className="text-center">
                <div className="inline-flex items-center gap-3 text-midBlue">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-midBlue"></div>
                  <span>Verificando...</span>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex flex-col gap-4 pt-6 border-t border-lightBlue">
                {/* Botón Manual de Verificar (Por si el automático falla) */}
                <button 
                    onClick={handleManualSubmit}
                    disabled={isLoading || code.join('').length !== 6}
                    className="w-full py-3 bg-midBlue text-white rounded-lg font-semibold hover:bg-darkBlue transition disabled:opacity-50"
                >
                    Verificar Código
                </button>

                <button 
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-midBlue hover:text-darkBlue font-medium text-sm transition-colors hover:underline"
                >
                    ¿No recibiste el código? Reenviar
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Éxito Reenvío */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowSuccess(false)}>
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm animate-scale-in text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">✓</span>
            </div>
            <h3 className="text-xl font-bold text-darkBlue mb-2">Código Enviado</h3>
            <p className="text-gray-600 mb-6">Revisa tu bandeja de entrada.</p>
            <button onClick={() => setShowSuccess(false)} className="w-full py-3 bg-midBlue text-white rounded-xl font-semibold">Aceptar</button>
          </div>
        </div>
      )}

      {/* Modal Error */}
      {showError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowError(false)}>
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm animate-scale-in text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">!</span>
            </div>
            <h3 className="text-xl font-bold text-red-600 mb-2">Error</h3>
            <p className="text-gray-600 mb-6">{errorMsg}</p>
            <button onClick={() => setShowError(false)} className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold">Intentar de nuevo</button>
          </div>
        </div>
      )}

      {/* Estilos CSS estándar (sin JSX) */}
      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Autentificacion;