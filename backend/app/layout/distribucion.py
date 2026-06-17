"""Capa de Geometría: Distribución radial vectorial (Ejes X, Z) para el Diagrama de Hasse."""

import math
from typing import Dict, Tuple

class DistribuidorRadial:
    """
    Responsable de asignar coordenadas espaciales a los nodos.
    Utiliza un enfoque de Suma Vectorial (Proyección de Hipercubo) basado en la 
    factorización prima para garantizar que las aristas de divisibilidad 
    sean paralelas y formen geometrías limpias (ej. cubos o retículos perfectos).
    """

    @staticmethod
    def calcular_coordenadas(
        niveles: Dict[int, int], 
        radio_base: float = 10.0, 
        escala_y: float = 10.0
    ) -> Dict[int, Tuple[float, float, float]]:
        """
        Calcula la posición 3D final (X, Y, Z) para cada nodo sumando 
        los vectores de sus factores primos.
        """
        if not niveles:
            raise ValueError("El mapa de niveles no puede estar vacío.")

        nodos = list(niveles.keys())
        primos_unicos = set()
        factores_por_nodo = {}

        # 1. Descomponer cada nodo y recolectar los átomos (factores primos únicos)
        for nodo in nodos:
            factores = DistribuidorRadial._descomponer_en_primos(nodo)
            factores_por_nodo[nodo] = factores
            primos_unicos.update(factores.keys())

        # Ordenar asegura determinismo visual (el mismo grafo siempre se dibuja igual)
        primos_ordenados = sorted(list(primos_unicos))
        cantidad_primos = len(primos_ordenados)

        # 2. Asignar un vector base (X, Z) a cada primo atómico
        vectores_base: Dict[int, Tuple[float, float]] = {}
        for i, primo in enumerate(primos_ordenados):
            if cantidad_primos == 0:
                break
            
            # Dividimos los 360 grados (2*pi) entre la cantidad de factores primos base
            angulo = i * (2 * math.pi) / cantidad_primos
            vx = radio_base * math.cos(angulo)
            vz = radio_base * math.sin(angulo)
            vectores_base[primo] = (vx, vz)

        # 3. Calcular coordenadas sumando vectores según la multiplicidad de los primos
        coordenadas_3d: Dict[int, Tuple[float, float, float]] = {}
        for nodo in nodos:
            # La altura Y sigue siendo puramente el nivel matemático
            y = float(niveles[nodo] * escala_y)
            x, z = 0.0, 0.0
            
            # Suma vectorial (Proyección isomórfica)
            for primo, exponente in factores_por_nodo[nodo].items():
                vx, vz = vectores_base[primo]
                x += vx * exponente
                z += vz * exponente
            
            coordenadas_3d[nodo] = (round(x, 4), y, round(z, 4))

        return coordenadas_3d

    @staticmethod
    def _descomponer_en_primos(n: int) -> Dict[int, int]:
        """
        Descompone un número en sus factores primos.
        Retorna un diccionario mapeando {primo: exponente}.
        """
        if n <= 0:
            raise ValueError("Solo se pueden evaluar enteros positivos.")
        if n == 1:
            return {}
            
        factores = {}
        divisor = 2
        numero_actual = n
        
        while divisor * divisor <= numero_actual:
            while (numero_actual % divisor) == 0:
                factores[divisor] = factores.get(divisor, 0) + 1
                numero_actual //= divisor
            divisor += 1
            
        if numero_actual > 1:
            factores[numero_actual] = factores.get(numero_actual, 0) + 1
            
        return factores