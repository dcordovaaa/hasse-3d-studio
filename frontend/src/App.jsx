// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import { 
  Play, AlertCircle, Box, Activity, ShieldCheck, ShieldAlert, 
  Download, Clock, MousePointer2, CheckSquare, SearchCode, 
  PanelLeftClose, Menu, Sun, Moon, Contrast, 
  Eye, ChevronDown, ChevronUp // NUEVOS ÍCONOS DIDÁCTICOS
} from 'lucide-react';
import { generarDiagrama, analizarSubconjunto } from './api/hasseService';
import HasseCanvas from './webgl/HasseCanvas';

function App() {
  const [inputData, setInputData] = useState('30');
  const [datosGrafico, setDatosGrafico] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [historial, setHistorial] = useState([]);
  const [panelAbierto, setPanelAbierto] = useState(true);
  const [tema, setTema] = useState('claro');

  const [modoInteraccion, setModoInteraccion] = useState('exploracion');
  const [nodosAnalisis, setNodosAnalisis] = useState([]);
  const [inputSubconjunto, setInputSubconjunto] = useState('');
  const [resultadoSubreticula, setResultadoSubreticula] = useState(null);
  const [analizandoSub, setAnalizandoSub] = useState(false);
  const [errorSub, setErrorSub] = useState('');

  // NUEVOS ESTADOS DIDÁCTICOS
  const [revelarGlobal, setRevelarGlobal] = useState(false);
  const [mostrarExplicacion, setMostrarExplicacion] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
  }, [tema]);

  useEffect(() => {
    const historialGuardado = localStorage.getItem('hasseHistorial');
    if (historialGuardado) setHistorial(JSON.parse(historialGuardado));
  }, []);

  const manejarGeneracion = async (valor = inputData) => {
    if (!valor.trim()) return;
    setInputData(valor);
    setCargando(true);
    setError('');
    
    try {
      const datos = await generarDiagrama(valor);
      setDatosGrafico(datos);
      setModoInteraccion('exploracion');
      setNodosAnalisis([]);
      setResultadoSubreticula(null);
      
      // Reiniciar los spoilers al generar un nuevo diagrama
      setRevelarGlobal(false);
      setMostrarExplicacion(false);

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

  const toggleNodoAnalisis = (nodo) => {
    setNodosAnalisis(prev => {
      const nuevosNodos = prev.includes(nodo) ? prev.filter(n => n !== nodo) : [...prev, nodo];
      setInputSubconjunto(nuevosNodos.sort((a, b) => a - b).join(', '));
      return nuevosNodos;
    });
    setResultadoSubreticula(null);
    setMostrarExplicacion(false); // Ocultar explicación si se cambia la selección
  };

  const manejarInputSubconjunto = (e) => {
    const valor = e.target.value;
    setInputSubconjunto(valor);
    if (!datosGrafico || !datosGrafico.nodos) return;
    const nodosValidos = new Set(datosGrafico.nodos);
    const parseado = valor.split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && nodosValidos.has(n));
    setNodosAnalisis(parseado);
    setResultadoSubreticula(null);
    setMostrarExplicacion(false); // Ocultar explicación si se cambia la selección
  };

  const ejecutarAnalisisSubconjunto = async () => {
    if (nodosAnalisis.length === 0 || !datosGrafico) return;
    setAnalizandoSub(true);
    setErrorSub('');
    setMostrarExplicacion(false);
    try {
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
    <div className="relative h-screen w-screen overflow-hidden bg-hasse-bg font-sans transition-colors duration-300">
      
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        {cargando ? (
          <div className="animate-pulse flex flex-col items-center bg-hasse-bg/80 p-8 rounded-3xl backdrop-blur-sm shadow-xl border border-hasse-border">
            <div className="w-12 h-12 rounded-full border-4 border-hasse-node border-t-hasse-accent animate-spin mb-4"></div>
            <p className="text-hasse-text font-medium text-lg">Procesando matemáticas...</p>
          </div>
        ) : datosGrafico ? (
          <HasseCanvas 
            datosGrafico={datosGrafico} 
            modoInteraccion={modoInteraccion}
            nodosAnalisis={nodosAnalisis}
            toggleNodoAnalisis={toggleNodoAnalisis}
            temaActual={tema}
          />
        ) : (
          <div className="text-center bg-hasse-bg/80 p-12 rounded-3xl backdrop-blur-sm border border-hasse-border shadow-sm">
            <Box className="w-20 h-20 text-hasse-node mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold text-hasse-text mb-2">Lienzo Vacío</h2>
            <p className="text-hasse-text-muted font-medium">Ingresa un número en el panel para simular el espacio.</p>
          </div>
        )}
      </div>

      <button 
        onClick={() => setPanelAbierto(!panelAbierto)}
        className={`absolute top-8 z-20 p-2.5 bg-hasse-bg/90 backdrop-blur-md rounded-xl shadow-sm border border-hasse-border text-hasse-text hover:bg-hasse-border/30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          panelAbierto ? 'left-[26.5rem]' : 'left-6'
        }`}
        title={panelAbierto ? "Ocultar panel" : "Mostrar panel"}
      >
        {panelAbierto ? <PanelLeftClose className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <div 
        className={`absolute top-6 bottom-6 w-96 flex flex-col z-10 pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          panelAbierto ? 'translate-x-6' : '-translate-x-[110%]'
        }`}
      >
        <div className="bg-hasse-bg/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] border border-hasse-border flex flex-col p-7 rounded-3xl overflow-y-auto hide-scrollbar pointer-events-auto h-full">
          
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-hasse-text flex items-center gap-2">
              <Box className="w-8 h-8 text-hasse-accent" /> Studio-Hasse
            </h1>
            <div className="flex gap-1 bg-hasse-border/30 p-1 rounded-lg">
              <button onClick={() => setTema('claro')} title="Modo Claro" className={`p-1.5 rounded-md transition-colors ${tema === 'claro' ? 'bg-hasse-bg text-hasse-accent shadow-sm' : 'text-hasse-text-muted hover:text-hasse-text'}`}><Sun className="w-4 h-4" /></button>
              <button onClick={() => setTema('oscuro')} title="Modo Oscuro" className={`p-1.5 rounded-md transition-colors ${tema === 'oscuro' ? 'bg-hasse-bg text-hasse-accent shadow-sm' : 'text-hasse-text-muted hover:text-hasse-text'}`}><Moon className="w-4 h-4" /></button>
              <button onClick={() => setTema('contraste')} title="Alto Contraste" className={`p-1.5 rounded-md transition-colors ${tema === 'contraste' ? 'bg-hasse-bg text-hasse-accent shadow-sm' : 'text-hasse-text-muted hover:text-hasse-text'}`}><Contrast className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <input 
              type="text" 
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && manejarGeneracion()}
              placeholder="Ej: 30 o 2, 3, 5, 30"
              className="w-full px-4 py-3 text-[15px] rounded-xl border-2 border-hasse-border bg-hasse-bg/70 focus:bg-hasse-bg focus:border-hasse-node text-hasse-text outline-none transition-all shadow-inner"
            />
            <button 
              onClick={() => manejarGeneracion()}
              disabled={cargando}
              className="w-full flex items-center justify-center gap-2 bg-hasse-text text-hasse-bg py-3 rounded-xl font-semibold hover:opacity-80 transition-opacity shadow-md border border-hasse-border"
            >
              {cargando ? 'Calculando...' : 'Generar Diagrama'}
              {!cargando && <Play className="w-4 h-4" />}
            </button>
            {error && <p className="text-hasse-accent text-sm font-medium mt-1">⚠️ {error}</p>}
          </div>

          {datosGrafico && (
            <div className="flex bg-hasse-border/30 p-1.5 rounded-xl mb-6 backdrop-blur-sm">
              <button 
                onClick={() => setModoInteraccion('exploracion')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${modoInteraccion === 'exploracion' ? 'bg-hasse-bg shadow-sm text-hasse-accent' : 'text-hasse-text-muted hover:text-hasse-text'}`}
              >
                <MousePointer2 className="w-4 h-4" /> Retícula
              </button>
              <button 
                onClick={() => setModoInteraccion('analisis')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${modoInteraccion === 'analisis' ? 'bg-hasse-bg shadow-sm text-hasse-accent' : 'text-hasse-text-muted hover:text-hasse-text'}`}
              >
                <CheckSquare className="w-4 h-4" /> Subretículas
              </button>
            </div>
          )}

          {datosGrafico && modoInteraccion === 'exploracion' && (
            <div className="bg-hasse-bg/60 rounded-2xl p-5 border border-hasse-border shadow-sm mb-6">
              <h3 className="text-sm font-bold text-hasse-text mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-hasse-accent" /> Análisis
              </h3>
              
              {/* SISTEMA DE SPOILER PARA ENSEÑANZA */}
              {!revelarGlobal ? (
                <div 
                  onClick={() => setRevelarGlobal(true)}
                  className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-hasse-border/80 rounded-xl bg-hasse-bg/40 cursor-pointer hover:bg-hasse-bg hover:border-hasse-accent transition-all group"
                >
                  <Eye className="w-6 h-6 text-hasse-text-muted mb-2 group-hover:text-hasse-accent transition-colors" />
                  <span className="text-sm font-semibold text-hasse-text-muted group-hover:text-hasse-accent">Clic para revelar resultado</span>
                </div>
              ) : (
                <div className="space-y-3 text-sm animate-fade-in">
                  <div className="flex justify-between">
                    <span className="text-hasse-text-muted">Estado:</span>
                    {datosGrafico.analisis_reticula.es_reticula_valida ? (
                      <span className="text-green-500 font-bold flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Es retícula</span>
                    ) : (
                      <span className="text-hasse-accent font-bold flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> No es retícula</span>
                    )}
                  </div>
                  <div className="flex justify-between border-t border-hasse-border/50 pt-2">
                    <span className="text-hasse-text-muted">Elemento 0 (Ínfimo):</span>
                    <span className="font-bold text-hasse-text">{datosGrafico.analisis_reticula.elemento_minimo_0 ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-t border-hasse-border/50 pt-2">
                    <span className="text-hasse-text-muted">Elemento I (Supremo):</span>
                    <span className="font-bold text-hasse-text">{datosGrafico.analisis_reticula.elemento_maximo_I ?? 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {datosGrafico && modoInteraccion === 'analisis' && (
            <div className="bg-hasse-accent/5 backdrop-blur-sm rounded-2xl p-5 border border-hasse-accent/30 shadow-sm mb-6">
              <h3 className="text-sm font-bold text-hasse-accent mb-3 flex items-center gap-2">
                <SearchCode className="w-4 h-4" /> Evaluar Subconjunto
              </h3>
              <p className="text-xs text-hasse-text-muted mb-3">Haz clic en los nodos o ingrésalos aquí:</p>
              <input 
                type="text" 
                value={inputSubconjunto}
                onChange={manejarInputSubconjunto}
                placeholder="Ej: 2, 3, 6"
                className="w-full px-3 py-2 text-sm rounded-lg border border-hasse-accent/30 bg-hasse-bg/80 focus:bg-hasse-bg focus:border-hasse-accent text-hasse-text outline-none mb-3 transition-colors"
              />
              <button 
                onClick={ejecutarAnalisisSubconjunto}
                disabled={analizandoSub || nodosAnalisis.length === 0}
                className="w-full bg-hasse-accent text-hasse-bg py-2.5 rounded-lg font-semibold hover:opacity-80 transition-opacity disabled:opacity-50 text-sm shadow-sm"
              >
                {analizandoSub ? 'Evaluando...' : 'Evaluar Selección'}
              </button>
              {errorSub && <p className="text-red-500 text-xs font-medium mt-2">{errorSub}</p>}

              {resultadoSubreticula && (
                <div className="mt-4 pt-4 border-t border-hasse-accent/30 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-hasse-text-muted font-medium">Subretícula:</span>
                    {resultadoSubreticula.es_reticula_valida ? (
                      <span className="text-green-500 font-bold">Es Subretícula</span>
                    ) : (
                      <span className="text-red-500 font-bold">No es Subretícula</span>
                    )}
                  </div>
                  
                  {/* ACORDEÓN DIDÁCTICO DE RETROALIMENTACIÓN */}
                  <div className="pt-2">
                    <button 
                      onClick={() => setMostrarExplicacion(!mostrarExplicacion)}
                      className="text-xs font-semibold text-hasse-accent flex items-center gap-1 hover:underline outline-none"
                    >
                      {mostrarExplicacion ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {mostrarExplicacion ? 'Ocultar explicación' : 'Ver explicación didáctica'}
                    </button>
                    
                    {mostrarExplicacion && (
                      <div className="mt-2 p-3 bg-hasse-bg/80 rounded-lg text-xs text-hasse-text animate-fade-in border border-hasse-border">
                        {resultadoSubreticula.es_reticula_valida ? (
                          <p>
                            Correcto. Cumple la propiedad porque para cada par de nodos seleccionados, 
                            su <strong>Supremo (MCM)</strong> y su <strong>Ínfimo (MCD)</strong> están incluidos en tu selección.
                          </p>
                        ) : (
                          <div>
                            <p className="font-semibold text-hasse-accent mb-1">Pares que no cumplen:</p>
                            <p className="mb-2 text-hasse-text-muted">La selección no tiene supremo o ínfimo.</p>
                            <ul className="list-disc pl-4 space-y-1">
                              {resultadoSubreticula.pares_fallidos?.map((par, i) => (
                                <li key={i}>
                                  El par <span className="font-bold">({par[0]}, {par[1]})</span> no tiene Supremo o Ínfimo en tu selección actual.
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between border-t border-hasse-accent/20 pt-2">
                    <span className="text-hasse-text-muted">Ínfimo (MCD):</span>
                    <span className="font-bold text-hasse-text">{resultadoSubreticula.elemento_minimo_0 ?? 'No existe'}</span>
                  </div>
                  <div className="flex justify-between border-t border-hasse-accent/20 pt-2">
                    <span className="text-hasse-text-muted">Supremo (MCM):</span>
                    <span className="font-bold text-hasse-text">{resultadoSubreticula.elemento_maximo_I ?? 'No existe'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

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
                    className="px-3 py-1.5 bg-hasse-bg/50 text-hasse-text text-xs font-medium rounded-lg border border-hasse-border hover:border-hasse-accent hover:bg-hasse-bg transition-all shadow-sm"
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
              className="w-full flex items-center justify-center gap-2 bg-hasse-bg text-hasse-text border-2 border-hasse-border py-3 rounded-xl font-semibold hover:border-hasse-accent transition-all mt-auto shadow-sm"
            >
              <Download className="w-4 h-4" /> Exportar a PNG
            </button>
          )}
        </div>
      </div>
      
    </div>
  );
}

export default App;