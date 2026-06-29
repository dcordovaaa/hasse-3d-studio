// frontend/src/components/CreditosModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Datos de los nodos del equipo basados en el diagrama de Hasse
const nodosEquipo = [
  { id: 'Top', label: '', name: '', role: 'Studio Hasse', x: 200, y: 40, isLogo: true },
  { id: 'D', label: 'D', name: 'Diego Emerson Huayta Cordova', role: 'Ing. Software', x: 120, y: 130 },
  { id: 'B', label: 'B', name: 'Brenda Ivana Tolentino Cardoza', role: 'Ing. Software', x: 280, y: 130 },
  { id: 'JL', label: 'JL', name: 'Jose Luis Melendez Geldres', role: 'Ing. Software', x: 200, y: 235 },
  { id: 'M', label: 'M', name: 'Mauricio Leonardo Muñoz Campos', role: 'Ing. Sistemas', x: 70, y: 235 },
  { id: 'JF', label: 'JF', name: 'Jefferson Steve Bastante Giraldo', role: 'Ciberseguridad', x: 330, y: 235 },
  { id: 'Bot', label: '2026', name: '', role: 'Lanzamiento', x: 200, y: 335, isDark: true },
];

const aristas = [
  ['Top', 'D'], ['Top', 'B'],
  ['D', 'M'], ['D', 'JL'],
  ['B', 'JL'], ['B', 'JF'],
  ['M', 'Bot'], ['JL', 'Bot'], ['JF', 'Bot'],
];

const TEXTOS = {
  ES: {
    titulo: 'Créditos',
    subtitulo: 'El equipo detrás de Studio-Hasse',
    footer: 'Integrantes del grupo 07 · Matemáticas Discretas',
  },
  EN: {
    titulo: 'Credits',
    subtitulo: 'The team behind Studio-Hasse',
    footer: 'Group 07 members · Discrete Mathematics',
  },
};

// DICCIONARIO DE COLORES DINÁMICOS PARA EL SVG Y CANVAS
const paletasCreditos = {
  claro: {
    ascii: '26, 26, 26', // Oscuro para fondo claro
    aristaBase: '#D9D2C7', aristaHover: '#E07A5F',
    nodoBase: '#EAE5DF', nodoHover: '#F2CC8F', nodoLogo: '#E07A5F', nodoDark: '#1A1A1A',
    textoBase: '#1A1A1A', textoDark: '#FFFFFF',
    tooltipBg: '#1A1A1A', tooltipText: '#FFFFFF',
    textHover: '#E07A5F'
  },
  oscuro: {
    ascii: '244, 244, 245', // Claro para fondo oscuro
    aristaBase: '#3f3f46', aristaHover: '#38bdf8',
    nodoBase: '#3f3f46', nodoHover: '#818cf8', nodoLogo: '#38bdf8', nodoDark: '#18181b',
    textoBase: '#f4f4f5', textoDark: '#f4f4f5',
    tooltipBg: '#f4f4f5', tooltipText: '#18181b',
    textHover: '#38bdf8'
  },
  contraste: {
    ascii: '255, 255, 255', // Blanco puro
    aristaBase: '#333333', aristaHover: '#facc15',
    nodoBase: '#ffffff', nodoHover: '#facc15', nodoLogo: '#facc15', nodoDark: '#000000',
    textoBase: '#000000', textoDark: '#ffffff',
    tooltipBg: '#ffffff', tooltipText: '#000000',
    textHover: '#facc15'
  }
};

function partirNombreEnLineas(nombre) {
    const palabras = nombre.trim().split(/\s+/);
    if (palabras.length <= 1) return [nombre];
    if (palabras.length === 2) return [palabras[0], palabras[1]];
  
    const mitad = Math.ceil(palabras.length / 2);
    const linea1 = palabras.slice(0, mitad).join(' ');
    const linea2 = palabras.slice(mitad).join(' ');
    return [linea1, linea2];
  }

// --- Fondo ASCII animado adaptativo ---
function AsciiWaveBackground({ rgbColor }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const GLYPHS = ['.', '·', '+', 'x', '#'];
    const CELL = 16;
    let cols = 0;
    let rows = 0;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent.clientWidth;
      height = parent.clientHeight;
      cols = Math.ceil(width / CELL) + 1;
      rows = Math.ceil(height / CELL) + 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = '11px "JetBrains Mono", "Fira Code", monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * CELL;
          const y = row * CELL;

          const nx = x / width - 0.5;
          const ny = y / height - 0.5;
          const v = Math.sin(nx * 6 + t * 0.6) * Math.cos(ny * 5 - t * 0.4) + Math.cos((nx + ny) * 4 - t * 0.5) * 0.6;
          const norm = (v + 1.6) / 3.2; 
          const glyphIndex = Math.min(GLYPHS.length - 1, Math.max(0, Math.floor(norm * GLYPHS.length)));
          const opacity = 0.05 + Math.max(0, norm) * 0.16;

          // USA EL COLOR INYECTADO POR EL TEMA
          ctx.fillStyle = `rgba(${rgbColor}, ${opacity.toFixed(3)})`;
          ctx.fillText(GLYPHS[glyphIndex], x, y);
        }
      }

      if (!prefersReducedMotion) {
        t += 0.012;
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [rgbColor]); // Reacciona al cambio de tema

  return (
    <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none select-none" />
  );
}

export default function CreditosModal({ onClose, tema = 'claro' }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [idioma, setIdioma] = useState('ES');
  const t = TEXTOS[idioma];
  
  const colores = paletasCreditos[tema] || paletasCreditos.claro;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-hasse-text/40 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-hasse-bg w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-hasse-border animate-in zoom-in-95 duration-300">

        {/* FONDO ASCII ANIMADO ADAPTATIVO */}
        <AsciiWaveBackground rgbColor={colores.ascii} />

        <div className="relative z-10">

          {/* HEADER */}
          <div className="flex items-center justify-between px-7 pt-6 pb-2">
            <div>
              <h2 className="text-2xl font-bold text-hasse-text leading-tight tracking-tight">
                {t.titulo}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-hasse-bg/80 backdrop-blur-sm border border-hasse-border rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setIdioma('ES')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                    idioma === 'ES' ? 'bg-hasse-text text-hasse-bg' : 'text-hasse-text-muted hover:text-hasse-text'
                  }`}
                >
                  ES
                </button>
                <button
                  onClick={() => setIdioma('EN')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                    idioma === 'EN' ? 'bg-hasse-text text-hasse-bg' : 'text-hasse-text-muted hover:text-hasse-text'
                  }`}
                >
                  EN
                </button>
              </div>

              <button
                onClick={onClose}
                aria-label={idioma === 'ES' ? 'Cerrar' : 'Close'}
                className="p-2 text-hasse-text-muted hover:text-hasse-text hover:bg-hasse-border/30 rounded-xl border border-transparent hover:border-hasse-border transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* SEPARADOR */}
          <div className="px-8 mt-1">
            <div className="flex items-center gap-4">
              <div className="h-px bg-hasse-border flex-1" />
              <span className="text-[10px] font-bold text-hasse-text-muted tracking-widest uppercase whitespace-nowrap">
                {t.subtitulo}
              </span>
              <div className="h-px bg-hasse-border flex-1" />
            </div>
          </div>

          {/* LIENZO SVG */}
          <div className="w-full flex justify-center py-7">
             <svg width="380" height="400" viewBox="0 0 400 400" className="overflow-visible">
              
              {/* Aristas */}
              {aristas.map(([origen, destino], index) => {
                const s = nodosEquipo.find((n) => n.id === origen);
                const t2 = nodosEquipo.find((n) => n.id === destino);
                const isHovered = hoveredNode === origen || hoveredNode === destino;

                return (
                  <line
                    key={index}
                    x1={s.x} y1={s.y} x2={t2.x} y2={t2.y}
                    stroke={isHovered ? colores.aristaHover : colores.aristaBase}
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Nodos */}
              {nodosEquipo.map((nodo) => {
                const isHovered = hoveredNode === nodo.id;
                
                // Lógica Dinámica de Color
                let fillStr = colores.nodoBase;
                let strokeStr = colores.textoBase;
                let textFill = colores.textoBase;

                if (nodo.isLogo) {
                  fillStr = colores.nodoLogo;
                  strokeStr = tema === 'contraste' ? '#000' : colores.textoBase;
                } else if (nodo.isDark) {
                  fillStr = colores.nodoDark;
                  strokeStr = colores.nodoDark;
                  textFill = colores.textoDark;
                } else if (isHovered) {
                  fillStr = colores.nodoHover;
                  strokeStr = colores.aristaHover;
                }

                return (
                  <g
                    key={nodo.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredNode(nodo.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{ transition: 'all 0.3s ease' }}
                  >
                    {/* Tooltip */}
                    <g style={{ opacity: isHovered && !nodo.isDark && !nodo.isLogo ? 1 : 0, transition: 'opacity 0.2s' }}>
                      <rect x={nodo.x - 44} y={nodo.y - 46} width="88" height="24" rx="12" fill={colores.tooltipBg} />
                      <text x={nodo.x} y={nodo.y - 30} textAnchor="middle" fill={colores.tooltipText} fontSize="10" fontWeight="bold">
                        {nodo.role}
                      </text>
                    </g>

                    <circle
                      cx={nodo.x} cy={nodo.y}
                      r={isHovered ? 24 : 22}
                      fill={fillStr}
                      stroke={strokeStr}
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all duration-300"
                    />

                    {nodo.isLogo ? (
                      <polygon
                        points={`${nodo.x},${nodo.y - 8} ${nodo.x + 8},${nodo.y} ${nodo.x},${nodo.y + 8} ${nodo.x - 8},${nodo.y}`}
                        fill={tema === 'contraste' ? '#000' : '#FFFFFF'}
                      />
                    ) : (
                      <text
                        x={nodo.x} y={nodo.y + (nodo.isDark ? 4 : 5)}
                        textAnchor="middle"
                        fill={textFill}
                        fontSize={nodo.isDark ? '12' : '14'}
                        fontWeight="bold"
                      >
                        {nodo.label}
                      </text>
                    )}

                    {nodo.name && (
                      <text
                        x={nodo.x}
                        y={nodo.y + 40}
                        textAnchor="middle"
                        fill={isHovered ? colores.textHover : '#A8A096'}
                        fontSize="11.5"
                        fontWeight="bold"
                        className="transition-colors duration-300"
                      >
                        {partirNombreEnLineas(nodo.name).map((linea, i) => (
                            <tspan key={i} x={nodo.x} dy={i === 0 ? 0 : 13}>
                                {linea}
                            </tspan>
                        ))}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* FOOTER */}
          <div className="bg-hasse-bg/90 backdrop-blur-sm border-t border-hasse-border py-3.5 px-8 flex justify-between items-center text-xs font-bold text-hasse-text-muted">
            <span>{t.footer}</span>
            <span className="text-hasse-text-muted/70">v2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}