// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import { Play, AlertCircle, Box, Activity, ShieldCheck, ShieldAlert, Download, Clock, MousePointer2, CheckSquare, SearchCode } from 'lucide-react';
import { generarDiagrama, analizarSubconjunto } from './api/hasseService';
import HasseCanvas from './webgl/HasseCanvas';

function App() {
  // --- ESTADOS GLOBALES ---
  const [inputData, setInputData] = useState('30');
  const [datosGrafico, setDatosGrafico] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [historial, setHistorial] = useState([]);

  // --- ESTADOS DEL MODO ANÁLISIS ---
  const [modoInteraccion, setModoInteraccion] = useState('exploracion'); // 'exploracion' | 'analisis'
  const [nodosAnalisis, setNodosAnalisis] = useState([]);
  const [inputSubconjunto, setInputSubconjunto] = useState('');
  const [resultadoSubreticula, setResultadoSubreticula] = useState(null);
  const [analizandoSub, setAnalizandoSub] = useState(false);
  const [errorSub, setErrorSub] = useState('');

  useEffect(() => {
    const historialGuardado = localStorage.getItem('hasseHistorial');
    if (historialGuardado) setHistorial(JSON.parse(historialGuardado));
  }, []);

  // Sincronizar el texto del input cuando se seleccionan nodos en 3D
  

  const manejarGeneracion = async (valor = inputData) => {
    if (!valor.trim()) return;
    setInputData(valor);
    setCargando(true);
    setError('');
    
    try {
      const datos = await generarDiagrama(valor);
      setDatosGrafico(datos);
      
      // Resetear estados de análisis
      setModoInteraccion('exploracion');
      setNodosAnalisis([]);
      setResultadoSubreticula(null);

      setHistorial(prev => {
        const nuevoHistorial = [valor, ...prev.filter(item => item !== valor)].slice(0, 5);
        localStorage.setItem('hasseHistorial', JSON.stringify(nuevoHistorial));
        return nuevoHistorial;
      });
    } catch (err) {
      setError(err.message);
      setDatosGrafico(null);
    } finally {
      setCargando(false);
    }
  };

  // RF-15: Selección visual y manual
  const toggleNodoAnalisis = (nodo) => {
    setNodosAnalisis(prev => {
      const nuevosNodos = prev.includes(nodo) ? prev.filter(n => n !== nodo) : [...prev, nodo];
      // Actualizamos la caja de texto manualmente AQUÍ, solo cuando haces clic en el 3D
      setInputSubconjunto(nuevosNodos.sort((a, b) => a - b).join(', '));
      return nuevosNodos;
    });
    setResultadoSubreticula(null);
  };

  const manejarInputSubconjunto = (e) => {
    const valor = e.target.value;
    setInputSubconjunto(valor); // Libera la caja de texto para que escribas libremente las comas
    
    if (!datosGrafico || !datosGrafico.nodos) return;
    const nodosValidos = new Set(datosGrafico.nodos);

    // Filtra en segundo plano para iluminar el modelo 3D
    const parseado = valor.split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && nodosValidos.has(n));
      
    setNodosAnalisis(parseado);
    setResultadoSubreticula(null);
  };

  const ejecutarAnalisisSubconjunto = async () => {
    if (nodosAnalisis.length === 0 || !datosGrafico) return;
    setAnalizandoSub(true);
    setErrorSub('');
    try {
      // Enviamos el diagrama padre (L) y el subconjunto (S)
      const resultado = await analizarSubconjunto(datosGrafico.nodos, nodosAnalisis);
      setResultadoSubreticula(resultado);
    } catch (err) {
      setErrorSub(err.message);
    } finally {
      setAnalizandoSub(false);
    }
  };

  const descargarPNG = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `diagrama-hasse-${inputData.replace(/ /g, '')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-hasse-bg font-sans">
      
      {/* PANEL LATERAL */}
      <div className="w-96 bg-white shadow-[4px_0_15px_rgba(0,0,0,0.03)] flex flex-col p-8 z-10 relative overflow-y-auto">
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-hasse-text mb-1 flex items-center gap-2">
            <Box className="w-8 h-8 text-hasse-accent" /> Studio Hasse
          </h1>
        </div>

        {/* MODO EXPLORACIÓN BASE */}
        <div className="flex flex-col gap-3 mb-6">
          <input 
            type="text" 
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && manejarGeneracion()}
            placeholder="Ej: 30 o 2, 3, 5, 30"
            className="w-full px-4 py-3 text-[15px] rounded-lg border-2 border-hasse-border focus:border-hasse-node outline-none transition-colors"
          />
          <button 
            onClick={() => manejarGeneracion()}
            disabled={cargando}
            className="w-full flex items-center justify-center gap-2 bg-hasse-text text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            {cargando ? 'Calculando...' : 'Generar Diagrama'}
            {!cargando && <Play className="w-4 h-4" />}
          </button>
          {error && <p className="text-hasse-accent text-sm font-medium mt-1">⚠️ {error}</p>}
        </div>

        {/* SELECTOR DE HERRAMIENTAS (Solo visible si hay un gráfico renderizado) */}
        {datosGrafico && (
          <div className="flex bg-hasse-bg p-1 rounded-lg mb-6 border border-hasse-border">
            <button 
              onClick={() => setModoInteraccion('exploracion')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all ${modoInteraccion === 'exploracion' ? 'bg-white shadow-sm text-hasse-accent' : 'text-hasse-text-muted hover:text-hasse-text'}`}
            >
              <MousePointer2 className="w-4 h-4" /> Diagrama
            </button>
            <button 
              onClick={() => setModoInteraccion('analisis')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all ${modoInteraccion === 'analisis' ? 'bg-white shadow-sm text-[#4F46E5]' : 'text-hasse-text-muted hover:text-hasse-text'}`}
            >
              <CheckSquare className="w-4 h-4" /> Subretículas
            </button>
          </div>
        )}

        {/* PANELES DINÁMICOS SEGÚN EL MODO */}
        {datosGrafico && modoInteraccion === 'exploracion' && (
          <div className="bg-hasse-bg rounded-xl p-5 border border-hasse-border animate-fade-in mb-6">
            <h3 className="text-sm font-bold text-hasse-text mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-hasse-accent" /> Análisis
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-hasse-text-muted">Estado:</span>
                {datosGrafico.analisis_reticula.es_reticula_valida ? (
                  <span className="text-green-600 font-bold flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Es retícula</span>
                ) : (
                  <span className="text-hasse-accent font-bold flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> No es retícula</span>
                )}
              </div>
              <div className="flex justify-between border-t border-hasse-border pt-2">
                <span className="text-hasse-text-muted">Elemento 0:</span>
                <span className="font-bold">{datosGrafico.analisis_reticula.elemento_minimo_0 ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between border-t border-hasse-border pt-2">
                <span className="text-hasse-text-muted">Elemento I:</span>
                <span className="font-bold">{datosGrafico.analisis_reticula.elemento_maximo_I ?? 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {datosGrafico && modoInteraccion === 'analisis' && (
          <div className="bg-[#EEF2FF] rounded-xl p-5 border border-[#C7D2FE] animate-fade-in mb-6">
            <h3 className="text-sm font-bold text-[#4F46E5] mb-3 flex items-center gap-2">
              <SearchCode className="w-4 h-4" /> Evaluar Subconjunto
            </h3>
            <p className="text-xs text-gray-600 mb-3">Haz clic en los nodos o ingrésalos aquí:</p>
            <input 
              type="text" 
              value={inputSubconjunto}
              onChange={manejarInputSubconjunto}
              placeholder="Ej: 2, 3, 6"
              className="w-full px-3 py-2 text-sm rounded border border-[#C7D2FE] focus:border-[#4F46E5] outline-none mb-3"
            />
            <button 
              onClick={ejecutarAnalisisSubconjunto}
              disabled={analizandoSub || nodosAnalisis.length === 0}
              className="w-full bg-[#4F46E5] text-white py-2 rounded font-semibold hover:bg-[#4338CA] transition-colors disabled:opacity-50 text-sm"
            >
              {analizandoSub ? 'Evaluando...' : 'Evaluar Selección'}
            </button>
            {errorSub && <p className="text-red-500 text-xs font-medium mt-2">{errorSub}</p>}

            {/* RF-17: Resultado específico de la Subretícula */}
            {resultadoSubreticula && (
              <div className="mt-4 pt-4 border-t border-[#C7D2FE] space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subretícula:</span>
                  {resultadoSubreticula.es_reticula_valida ? (
                    <span className="text-green-600 font-bold">Es Subretícula</span>
                  ) : (
                    <span className="text-red-500 font-bold">No es Subretícula</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ínfimo de la selección:</span>
                  <span className="font-bold text-gray-800">{resultadoSubreticula.elemento_minimo_0 ?? 'No existe'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Supremo de la selección:</span>
                  <span className="font-bold text-gray-800">{resultadoSubreticula.elemento_maximo_I ?? 'No existe'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTORIAL Y EXPORTACIÓN */}
        {historial.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-hasse-text-muted uppercase tracking-wider mb-3 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Recientes
            </h3>
            <div className="flex flex-wrap gap-2">
              {historial.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => manejarGeneracion(item)}
                  className="px-3 py-1 bg-hasse-bg text-hasse-text text-xs font-medium rounded border border-hasse-border hover:border-hasse-accent transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {datosGrafico && (
          <button
            onClick={descargarPNG}
            className="w-full flex items-center justify-center gap-2 bg-white text-hasse-text border-2 border-hasse-border py-2.5 rounded-lg font-semibold hover:bg-hasse-bg transition-colors mt-auto text-sm"
          >
            <Download className="w-4 h-4" /> Exportar a PNG
          </button>
        )}
      </div>

      {/* LIENZO PRINCIPAL */}
      <div className="flex-1 relative flex items-center justify-center bg-hasse-bg">
        {cargando ? (
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-4 border-hasse-node border-t-hasse-accent animate-spin mb-4"></div>
            <p className="text-hasse-text font-medium text-lg">Procesando matemáticas...</p>
          </div>
        ) : datosGrafico ? (
          <HasseCanvas 
            datosGrafico={datosGrafico} 
            modoInteraccion={modoInteraccion}
            nodosAnalisis={nodosAnalisis}
            toggleNodoAnalisis={toggleNodoAnalisis}
          />
        ) : (
          <div className="text-center">
            <Box className="w-16 h-16 text-hasse-border mx-auto mb-4" />
            <p className="text-hasse-text-muted font-medium text-lg">Ingresa un número para simular.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;