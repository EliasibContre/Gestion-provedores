import React, { useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";

function ActualizacionListaSAT({ showAlert }) {
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [archivoAntiguo, setArchivoAntiguo] = useState("base_datos_original.xlsx");
  const [subiendo, setSubiendo] = useState(false);

  const manejarSeleccionArchivo = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      // Validar que sea un archivo Excel
      const extensionesValidas = ['.xlsx', '.xls'];
      const extension = archivo.name.substring(archivo.name.lastIndexOf('.')).toLowerCase();
      
      if (!extensionesValidas.includes(extension)) {
        showAlert('error', 'Formato no válido', 'Solo se aceptan archivos Excel (.xlsx, .xls)');
        setArchivoSeleccionado(null);
        e.target.value = ""; // Limpiar input
        return;
      }
      
      setArchivoSeleccionado(archivo);
    }
  };

  const subirArchivo = () => {
    if (!archivoSeleccionado) {
      showAlert('warning', 'Sin archivo', 'Por favor, selecciona un archivo Excel primero');
      return;
    }
    
    setSubiendo(true);
    
    setTimeout(() => {
      setSubiendo(false);
      
      // Mostrar notificación exitosa
      showAlert('success', 'Archivo subido exitosamente', 
        `Archivo "${archivoSeleccionado.name}" procesado correctamente.\nBase de datos actualizada.`);
      
      setArchivoAntiguo(archivoSeleccionado.name);
      setArchivoSeleccionado(null);
      
      // Limpiar input
      const fileInput = document.getElementById('excel-file');
      if (fileInput) fileInput.value = "";
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-lightBlue p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-darkBlue mb-2">Actualizar Base de Datos</h1>
            <p className="text-midBlue">
              Sube un archivo Excel para actualizar la base de datos
            </p>
          </div>

          {/* Sección de carga de archivos */}
          <div className="mb-8 bg-lightBlue border border-midBlue rounded-xl p-6">
            <h2 className="text-xl font-bold text-darkBlue mb-4">Cargar Archivo Excel</h2>
            
            <div className="mb-4">
              <p className="text-darkBlue mb-2">
                <strong>Archivo actual:</strong> {archivoAntiguo}
              </p>
            </div>

            <div className="border border-midBlue rounded-lg p-8 bg-white">
              <div className="flex flex-col items-center gap-6">
                <FileSpreadsheet className="w-20 h-20 text-midBlue" />
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-midBlue text-white rounded-lg hover:bg-darkBlue transition font-medium">
                    <Upload className="w-5 h-5" />
                    Seleccionar Archivo Excel
                    <input
                      id="excel-file"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={manejarSeleccionArchivo}
                      className="hidden"
                    />
                  </label>
                  
                  <button
                    onClick={subirArchivo}
                    disabled={!archivoSeleccionado || subiendo}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg transition font-medium ${
                      !archivoSeleccionado || subiendo
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {subiendo ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Subir Archivo
                      </>
                    )}
                  </button>
                </div>
                
                {archivoSeleccionado && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium">
                      <FileSpreadsheet className="w-4 h-4 inline mr-2" />
                      Archivo seleccionado: {archivoSeleccionado.name}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Formato aceptado: Excel (.xlsx, .xls)
                </p>
              </div>
            </div>
          </div>

          {/* Información básica */}
          <div className="bg-lightBlue border border-midBlue rounded-xl p-6">
            <h3 className="text-lg font-semibold text-darkBlue mb-2">Instrucciones</h3>
            <ul className="text-darkBlue space-y-1">
              <li>1. Selecciona un archivo Excel</li>
              <li>2. Haz clic en "Subir Archivo"</li>
              <li>3. El archivo anterior se reemplazará</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActualizacionListaSAT;