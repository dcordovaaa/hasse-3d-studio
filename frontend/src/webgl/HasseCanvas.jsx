// frontend/src/webgl/HasseCanvas.jsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Line, Billboard } from '@react-three/drei';
import { useMemo, useState, useEffect } from 'react';

// --- NODO INDIVIDUAL ---
function NodoHasse({ nodo, pos, colorBase, opacidad, alHacerClic }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group 
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        alHacerClic(nodo);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      scale={hovered ? 1.15 : 1} 
    >
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial 
          color={colorBase} 
          roughness={0.4} 
          metalness={0.1} 
          transparent
          opacity={opacidad}
        />
      </mesh>
      
      <Billboard>
        <Text
          position={[0, 0, 1.8]}
          fontSize={hovered ? 1.6 : 1.4}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          outlineWidth={0.05}
          outlineColor="#FFFFFF"
          fillOpacity={opacidad}
        >
          {nodo}
        </Text>
      </Billboard>
    </group>
  );
}

// --- LIENZO PRINCIPAL ---
export default function HasseCanvas({ datosGrafico, modoInteraccion, nodosAnalisis, toggleNodoAnalisis }) {
  const { nodos, aristas, coordenadas } = datosGrafico;
  const [nodoExploracion, setNodoExploracion] = useState(null);

  // Resetear la selección si cambian los datos principales
  useEffect(() => {
    setNodoExploracion(null);
  }, [datosGrafico]);

  const centroY = useMemo(() => {
    if (!nodos || nodos.length === 0) return 0;
    let maxY = 0;
    for (const nodo of nodos) {
      if (coordenadas[nodo] && coordenadas[nodo][1] > maxY) maxY = coordenadas[nodo][1];
    }
    return maxY / 2;
  }, [nodos, coordenadas]);

  // Lógica para MODO EXPLORACIÓN (Familia Topológica)
  const relacionados = useMemo(() => {
    const setRelacionados = new Set();
    if (modoInteraccion === 'exploracion' && nodoExploracion !== null) {
      setRelacionados.add(nodoExploracion);
      for (const n of nodos) {
        if (n % nodoExploracion === 0 || nodoExploracion % n === 0) {
          setRelacionados.add(n);
        }
      }
    }
    return setRelacionados;
  }, [nodoExploracion, nodos, modoInteraccion]);

  // DIBUJAR ARISTAS (Cambian de estilo según el modo)
  const lineasConectoras = useMemo(() => {
    return aristas.map((arista, index) => {
      const [padre, hijo] = arista;
      const origen = coordenadas[padre];
      const destino = coordenadas[hijo];
      if (!origen || !destino) return null;

      let esActiva = true;
      let colorLinea = "#1A1A1A";

      if (modoInteraccion === 'exploracion' && nodoExploracion !== null) {
        esActiva = relacionados.has(padre) && relacionados.has(hijo);
        colorLinea = esActiva ? "#2C2C2C" : "#EAE5DF";
      } else if (modoInteraccion === 'analisis') {
        esActiva = nodosAnalisis.includes(padre) && nodosAnalisis.includes(hijo);
        colorLinea = esActiva ? "#4F46E5" : "#EAE5DF"; // Azul Índigo para aristas seleccionadas
      }

      return (
        <Line
          key={`arista-${index}`}
          points={[origen, destino]}
          color={colorLinea}
          lineWidth={esActiva ? 3 : 1}
          transparent
          opacity={esActiva ? 0.8 : 0.2}
        />
      );
    });
  }, [aristas, coordenadas, nodoExploracion, relacionados, modoInteraccion, nodosAnalisis]);

  const manejarClicNodo = (nodo) => {
    if (modoInteraccion === 'exploracion') {
      setNodoExploracion(nodo);
    } else {
      toggleNodoAnalisis(nodo);
    }
  };

  const manejarClicFondo = () => {
    if (modoInteraccion === 'exploracion' && nodoExploracion !== null) {
      setNodoExploracion(null);
    }
  };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-sm border border-hasse-border bg-hasse-bg">
      <Canvas
        gl={{ preserveDrawingBuffer: true }}
        camera={{ position: [30, centroY + 15, 40], fov: 45 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerMissed={manejarClicFondo}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[15, centroY + 20, 15]} intensity={0.7} />

        <OrbitControls 
          makeDefault
          enableDamping={true}
          dampingFactor={0.05}
          autoRotate={modoInteraccion === 'exploracion' && nodoExploracion === null}
          autoRotateSpeed={0.8}
          maxPolarAngle={Math.PI / 2} 
          minPolarAngle={0}
          target={[0, centroY, 0]} 
          enablePan={true}
          panSpeed={1}
        />

        {lineasConectoras}

        {nodos.map((nodo) => {
          const pos = coordenadas[nodo];
          if (!pos) return null;

          let color = "#D9C5B2";
          let opacidad = 1;

          // Asignación de colores basada en la herramienta actual
          if (modoInteraccion === 'exploracion' && nodoExploracion !== null) {
            if (nodo === nodoExploracion) {
              color = "#E07A5F"; 
            } else if (relacionados.has(nodo)) {
              color = "#F2CC8F"; 
            } else {
              color = "#EAE5DF"; 
              opacidad = 0.25;
            }
          } else if (modoInteraccion === 'analisis') {
            if (nodosAnalisis.includes(nodo)) {
              color = "#4F46E5"; // Azul índigo para nodos seleccionados para análisis
            } else {
              color = "#EAE5DF";
              opacidad = 0.4;
            }
          }

          return (
            <NodoHasse 
              key={`nodo-${nodo}`} 
              nodo={nodo} 
              pos={pos} 
              colorBase={color}
              opacidad={opacidad}
              alHacerClic={manejarClicNodo}
            />
          );
        })}
      </Canvas>
    </div>
  );
}