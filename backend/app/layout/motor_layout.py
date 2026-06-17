"""Motor de Layout: Proyección Vectorial por Factores Primos con Anti-Colisiones."""

import math
from typing import Dict, Any

class MotorLayout:
    @staticmethod
    def generar_layout(datos_topologicos: Dict[str, Any]) -> Dict[str, Any]:
        nodos = datos_topologicos.get("nodos", [])
        aristas = datos_topologicos.get("aristas", [])
        
        if not nodos:
            return datos_topologicos

        # 1. Calcular Niveles (Eje Y)
        niveles = {n: 0 for n in nodos}
        nodos_ordenados = sorted(nodos)
        for nodo in nodos_ordenados:
            padres = [p for p, h in aristas if h == nodo]
            if padres:
                niveles[nodo] = max(niveles[p] for p in padres) + 1

        # 2. Extraer todos los factores primos presentes
        def obtener_factores_primos(n):
            factores = set()
            d = 2
            while d * d <= n:
                while (n % d) == 0:
                    factores.add(d)
                    n //= d
                d += 1
            if n > 1:
                factores.add(n)
            return factores

        primos_globales = set()
        for n in nodos:
            primos_globales.update(obtener_factores_primos(n))
        primos_lista = sorted(list(primos_globales))

        # 3. Asignar un ángulo único a cada número primo
        vectores_primos = {}
        for i, p in enumerate(primos_lista):
            # Distribución radial perfecta según la cantidad de primos
            angulo = (2 * math.pi * i) / len(primos_lista) if primos_lista else 0
            vectores_primos[p] = (math.cos(angulo) * 6.0, math.sin(angulo) * 6.0)

        # 4. Proyectar Coordenadas Sumando Vectores
        coordenadas = {}
        SEPARACION_Y = 8.0 # Altura entre niveles
        
        for nodo in nodos:
            x, z = 0.0, 0.0
            n_temp = nodo
            for p in primos_lista:
                while n_temp % p == 0:
                    x += vectores_primos[p][0]
                    z += vectores_primos[p][1]
                    n_temp //= p
            
            coordenadas[nodo] = [round(x, 3), round(niveles[nodo] * SEPARACION_Y, 3), round(z, 3)]

        # 5. PASO CRÍTICO: Sistema Anti-Colisión (Fuerza de repulsión)
        posiciones_ocupadas = {}
        for nodo, pos in coordenadas.items():
            # Usamos una tupla de la posición exacta como llave
            clave_pos = (pos[0], pos[1], pos[2])
            
            if clave_pos in posiciones_ocupadas:
                # Colisión detectada: Desplazamos el nodo iterativamente en un pequeño círculo
                offset = len(posiciones_ocupadas[clave_pos])
                angulo_empuje = offset * (math.pi / 3)
                
                # Empujamos 2.5 unidades para separarlos visualmente
                pos[0] = round(pos[0] + (math.cos(angulo_empuje) * 2.5), 3)
                pos[2] = round(pos[2] + (math.sin(angulo_empuje) * 2.5), 3)
                
                posiciones_ocupadas[clave_pos].append(nodo)
            else:
                posiciones_ocupadas[clave_pos] = [nodo]

        # 6. Empaquetar
        datos_completos = datos_topologicos.copy()
        datos_completos["coordenadas"] = coordenadas
        return datos_completos