import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CambioPass() {
  const navigate = useNavigate();
  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '') ;

  const [formData, setFormData] = useState({
    currentPassword: "",
    nuevaPassword: "",
    confirmarPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return {
      isValid: hasMinLength && hasLetters && hasNumbers && hasSpecialChar,
      requirements: {
        minLength: hasMinLength,
        hasLetters,
        hasNumbers,
        hasSpecialChar
      }
    };
  };

  const validateForm = () => {
    const newErrors = {};
    const passwordValidation = validatePassword(formData.nuevaPassword);

    if (!formData.nuevaPassword.trim()) {
      newErrors.nuevaPassword = "La nueva contraseña es requerida";
    } else if (!passwordValidation.isValid) {
      newErrors.nuevaPassword = "La contraseña no cumple los requisitos";
    }

    if (!formData.confirmarPassword.trim()) {
      newErrors.confirmarPassword = "Confirma tu contraseña";
    } else if (formData.nuevaPassword !== formData.confirmarPassword) {
      newErrors.confirmarPassword = "Las contraseñas no coinciden";
    }

    return { newErrors, passwordValidation };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { newErrors} = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(
        `${API_BASE}/api/auth/change-password`,
        { newPassword: formData.nuevaPassword },
        { withCredentials: true }
      );

      // Obtener roles del usuario para redirigir correctamente
      // Si no podemos obtener roles (sesión renovada/inválida tras cambio), mandamos a login.
      let target = "/login"; // fallback seguro si no hay sesión válida
      try {
        const me = await axios.get(`${API_BASE}/api/users/me`, { withCredentials: true });
        const roles = Array.isArray(me?.data?.roles) ? me.data.roles.map(r => String(r).toUpperCase()) : [];

        if (roles.length > 0) {
          if (roles.includes('ADMIN')) target = '/dashboarda';
          else if (roles.includes('APPROVER')) target = '/dashboardapro';
          else if (roles.includes('PROVIDER')) target = '/dashboardprovider';
          else target = '/dashboarda';
        }
      } catch (e) {
        // Si falla obtener roles, redirigimos a login para reautenticación
        console.warn('No se pudo obtener roles para redirección:', e?.message || e);
        target = '/login';
      }

      // Redirigir inmediatamente para evitar "flash" del admin por rutas por defecto
      setShowSuccess(true);
      navigate(target, { replace: true });
    } catch (err) {
    setErrorMsg(err?.response?.data?.message || "Error al cambiar la contraseña");
    setShowError(true);
    } finally {
    setIsLoading(false);
    }
};

  const passwordValidation = validatePassword(formData.nuevaPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-lightBlue">
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-darkBlue mb-3">Cambiar Contraseña</h1>
            <p className="text-midBlue text-sm">
              Crea una nueva contraseña segura
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-darkBlue font-semibold text-sm">
                Nueva contraseña
              </label>
              <input
                type="password"
                name="nuevaPassword"
                value={formData.nuevaPassword}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres con letras, números y símbolos"
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-midBlue transition ${
                  errors.nuevaPassword ? "border-red-500 bg-red-50" : "border-lightBlue"
                }`}
              />
              
              {/* Indicadores de requisitos */}
              {formData.nuevaPassword && (
                <div className="space-y-1 mt-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      passwordValidation.requirements.minLength ? "bg-green-500" : "bg-red-500"
                    }`}></div>
                    <span className={`text-xs ${
                      passwordValidation.requirements.minLength ? "text-green-600" : "text-red-600"
                    }`}>
                      Mínimo 8 caracteres
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      passwordValidation.requirements.hasLetters ? "bg-green-500" : "bg-red-500"
                    }`}></div>
                    <span className={`text-xs ${
                      passwordValidation.requirements.hasLetters ? "text-green-600" : "text-red-600"
                    }`}>
                      Incluir letras
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      passwordValidation.requirements.hasNumbers ? "bg-green-500" : "bg-red-500"
                    }`}></div>
                    <span className={`text-xs ${
                      passwordValidation.requirements.hasNumbers ? "text-green-600" : "text-red-600"
                    }`}>
                      Incluir números
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      passwordValidation.requirements.hasSpecialChar ? "bg-green-500" : "bg-red-500"
                    }`}></div>
                    <span className={`text-xs ${
                      passwordValidation.requirements.hasSpecialChar ? "text-green-600" : "text-red-600"
                    }`}>
                      Incluir carácter especial (!@#$% etc.)
                    </span>
                  </div>
                </div>
              )}
              
              {errors.nuevaPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.nuevaPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-darkBlue font-semibold text-sm">
                Confirmar contraseña
              </label>
              <input
                type="password"
                name="confirmarPassword"
                value={formData.confirmarPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-midBlue transition ${
                  errors.confirmarPassword ? "border-red-500 bg-red-50" : "border-lightBlue"
                }`}
              />
              {errors.confirmarPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmarPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-semibold transition-colors duration-200 ${
                isLoading 
                  ? "bg-midBlue opacity-70 cursor-not-allowed" 
                  : "bg-midBlue hover:bg-darkBlue text-white"
              }`}
            >
              {isLoading ? "Cambiando contraseña..." : "Cambiar contraseña"}
            </button>
          </form>
        </div>
      </div>

      {/* Modal de éxito */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
          <div 
            className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-lightBlue animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              
              <h3 className="text-xl font-bold text-darkBlue mb-4">
                ¡Contraseña Cambiada!
              </h3>
              <p className="text-midBlue text-sm mb-6">
                Tu contraseña ha sido actualizada exitosamente.
              </p>
              
              <div className="text-center text-midBlue text-xs">
                Redirigiendo al dashboard...
              </div>
            </div>
          </div>
        </div>
      )}

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

export default CambioPass;