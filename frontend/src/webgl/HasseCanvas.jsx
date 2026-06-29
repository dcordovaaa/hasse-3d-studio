// frontend/src/webgl/HasseCanvas.jsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Line, Billboard } from '@react-three/drei';
import { useMemo, useState, useEffect, useRef } from 'react';
import { LocateFixed, Pause, Play } from 'lucide-react'; // NUEVOS ÍCONOS

const paletas3D = {
  claro: {
    lineaInactiva: '#EAE5DF', lineaActiva: '#2C2C2C', lineaAnalisis: '#4F46E5',
    nodoBase: '#D9C5B2', nodoSeleccionado: '#E07A5F', nodoFamiliar: '#F2CC8F', nodoAnalisis: '#4F46E5',
    texto: '#1A1A1A', textoOutline: '#FAF9F6', sombra: '#1A1A1A'
  },
  oscuro: {
    lineaInactiva: '#3f3f46', lineaActiva: '#f4f4f5', lineaAnalisis: '#38bdf8',
    nodoBase: '#3f3f46', nodoSeleccionado: '#38bdf8', nodoFamiliar: '#818cf8', nodoAnalisis: '#38bdf8',
    texto: '#ffffff', textoOutline: '#18181b', sombra: '#000000'
  },
  contraste: {
    lineaInactiva: '#333333', lineaActiva: '#ffffff', lineaAnalisis: '#facc15',
    nodoBase: '#ffffff', nodoSeleccionado: '#facc15', nodoFamiliar: '#ffffff', nodoAnalisis: '#facc15',
    texto: '#000000', textoOutline: '#ffffff', sombra: '#ffffff'
  }
};

function NodoHasse({ nodo, pos, colorBase, opacidad, alHacerClic, coloresTema }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group 
      position={pos}
      onClick={(e) => { e.stopPropagation(); alHacerClic(nodo); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
      scale={hovered ? 1.15 : 1} 
    >
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color={colorBase} transparent opacity={opacidad} />
      </mesh>
      <Billboard>
        <Text
          position={[0, 0, 1.8]}
          fontSize={hovered ? 1.6 : 1.4}
          color={coloresTema.texto}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          outlineWidth={0.05}
          outlineColor={coloresTema.textoOutline}
          fillOpacity={opacidad}
        >
          {nodo}
        </Text>
      </Billboard>
    </group>
  );
}

export default function HasseCanvas({ datosGrafico, modoInteraccion, nodosAnalisis, toggleNodoAnalisis, temaActual }) {
  const { nodos, aristas, coordenadas } = datosGrafico;
  const [nodoExploracion, setNodoExploracion] = useState(null);
  
  // NUEVO: Estado para el RNF-12 (Rotación automática)
  const [autoRotar, setAutoRotar] = useState(true);

  const controlesRef = useRef(null);
  const colores = paletas3D[temaActual] || paletas3D.claro;

  useEffect(() => { setNodoExploracion(null); }, [datosGrafico]);

  const centro3D = useMemo(() => {
    if (!nodos || nodos.length === 0) return [0, 0, 0];
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (const nodo of nodos) {
      const pos = coordenadas[nodo];
      if (pos) {
        if (pos[0] < minX) minX = pos[0];
        if (pos[0] > maxX) maxX = pos[0];
        if (pos[1] < minY) minY = pos[1];
        if (pos[1] > maxY) maxY = pos[1];
        if (pos[2] < minZ) minZ = pos[2];
        if (pos[2] > maxZ) maxZ = pos[2];
      }
    }
    return [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2];
  }, [nodos, coordenadas]);

  const posicionCamaraInicial = [centro3D[0] + 35, centro3D[1] + 15, centro3D[2] + 45];

  const relacionados = useMemo(() => {
    const setRelacionados = new Set();
    if (modoInteraccion === 'exploracion' && nodoExploracion !== null) {
      setRelacionados.add(nodoExploracion);
      for (const n of nodos) {
        if (n % nodoExploracion === 0 || nodoExploracion % n === 0) setRelacionados.add(n);
      }
    }
    return setRelacionados;
  }, [nodoExploracion, nodos, modoInteraccion]);

  const lineasConectoras = useMemo(() => {
    return aristas.map((arista, index) => {
      const [padre, hijo] = arista;
      const origen = coordenadas[padre];
      const destino = coordenadas[hijo];
      if (!origen || !destino) return null;

      let esActiva = true;
      let colorLinea = colores.lineaActiva;

      if (modoInteraccion === 'exploracion' && nodoExploracion !== null) {
        esActiva = relacionados.has(padre) && relacionados.has(hijo);
        colorLinea = esActiva ? colores.lineaActiva : colores.lineaInactiva;
      } else if (modoInteraccion === 'analisis') {
        esActiva = nodosAnalisis.includes(padre) && nodosAnalisis.includes(hijo);
        colorLinea = esActiva ? colores.lineaAnalisis : colores.lineaInactiva; 
      }

      return (
        <Line
          key={`arista-${index}`}
          points={[origen, destino]}
          color={colorLinea}
          lineWidth={esActiva ? 3.5 : 1}
          transparent
          opacity={esActiva ? 0.9 : 0.2}
        />
      );
    });
  }, [aristas, coordenadas, nodoExploracion, relacionados, modoInteraccion, nodosAnalisis, colores]);

  const recentrarCamara = () => {
    if (controlesRef.current) {
      controlesRef.current.object.position.set(...posicionCamaraInicial);
      controlesRef.current.target.set(...centro3D);
      controlesRef.current.update();
    }
  };

  return (
    <div className="w-full h-full relative">
      
      {/* TOOLBAR FLOTANTE DE LA CÁMARA */}
      <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-3">
        <button 
          onClick={() => setAutoRotar(!autoRotar)}
          title={autoRotar ? "Pausar rotación" : "Reanudar rotación"}
          className="p-3 bg-hasse-bg/80 backdrop-blur-md border border-hasse-border rounded-full shadow-lg text-hasse-text-muted hover:text-hasse-text hover:bg-hasse-bg transition-all"
        >
          {autoRotar ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <button 
          onClick={recentrarCamara}
          title="Restaurar vista inicial"
          className="p-3 bg-hasse-bg/80 backdrop-blur-md border border-hasse-border rounded-full shadow-lg text-hasse-text-muted hover:text-hasse-text hover:bg-hasse-bg transition-all"
        >
          <LocateFixed className="w-5 h-5" />
        </button>
      </div>

      <Canvas
        gl={{ preserveDrawingBuffer: true }} 
        camera={{ position: posicionCamaraInicial, fov: 45 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerMissed={() => {
          if (modoInteraccion === 'exploracion' && nodoExploracion !== null) setNodoExploracion(null);
        }}
      >
        <ambientLight intensity={temaActual === 'contraste' ? 1.2 : 0.9} />
        <directionalLight position={[centro3D[0] + 20, centro3D[1] + 30, centro3D[2] + 20]} intensity={0.8} />

        <OrbitControls 
          ref={controlesRef}
          makeDefault
          enableDamping={true}
          dampingFactor={0.05}
          autoRotate={modoInteraccion === 'exploracion' && nodoExploracion === null && autoRotar}
          autoRotateSpeed={0.5} 
          
          // LA SOLUCIÓN: Libertad esférica sin inversión de ejes
          maxPolarAngle={Math.PI} // 180°: Permite ir por debajo del diagrama y mirar hacia arriba
          minPolarAngle={0}       // 0°: Permite ir por encima del diagrama y mirar hacia abajo
          
          target={centro3D} 
          enablePan={false} 
          enableZoom={true} 
        />

        {lineasConectoras}

        {nodos.map((nodo) => {
          const pos = coordenadas[nodo];
          if (!pos) return null;

          let colorNodo = colores.nodoBase;
          let opacidad = 1;

          if (modoInteraccion === 'exploracion' && nodoExploracion !== null) {
            if (nodo === nodoExploracion) colorNodo = colores.nodoSeleccionado; 
            else if (relacionados.has(nodo)) colorNodo = colores.nodoFamiliar; 
            else { colorNodo = colores.lineaInactiva; opacidad = 0.25; }
          } else if (modoInteraccion === 'analisis') {
            if (nodosAnalisis.includes(nodo)) colorNodo = colores.nodoAnalisis; 
            else { colorNodo = colores.lineaInactiva; opacidad = 0.4; }
          }

          return (
            <NodoHasse 
              key={`nodo-${nodo}`} 
              nodo={nodo} 
              pos={pos} 
              colorBase={colorNodo}
              opacidad={opacidad}
              alHacerClic={(n) => modoInteraccion === 'exploracion' ? setNodoExploracion(n) : toggleNodoAnalisis(n)}
              coloresTema={colores}
            />
          );
        })}
      </Canvas>
    </div>
  );
}