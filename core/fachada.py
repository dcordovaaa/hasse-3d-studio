"""Fachada de dominio: orquesta divisores → grafo de divisibilidad → reducción Hasse."""

from __future__ import annotations
from typing import List, Dict, Any, Tuple


from core.algoritmos import ReductorTransitivo
from core.divisores import GeneradorDivisores
from core.grafos import GrafoDivisibilidad


class MotorHasse:
    """
    Punto de entrada único del núcleo para obtener el diagrama lógico.

    Encadena responsabilidades ya definidas en otras clases (SRP):
    ``GeneradorDivisores`` solo calcula divisores; ``GrafoDivisibilidad`` solo
    construye la relación por divisibilidad; ``ReductorTransitivo`` solo reduce
    reflexividad y transitividad. Esta fachada no introduce lógica matemática
    nueva: solo compone el flujo y adapta la salida a un diccionario estable.
    """

    @staticmethod
    def generar_diagrama(n: int) -> dict[str, Any]:
        """
        Flujo completo para un entero positivo ``n``:

        1. Divisores positivos de ``n`` (nodos del poset inducido).
        2. Grafo dirigido de divisibilidad entre esos nodos (todas las aristas).
        3. Reducción reflexiva y transitiva (aristas de cubrimiento / Hasse).

        Retorna un diccionario con nodos, aristas como pares ordenados y conteos.
        """
        nodos = GeneradorDivisores(n).obtener_divisores()
        adyacencia_completa = GrafoDivisibilidad(nodos).construir_adyacencia()
        adyacencia_hasse = ReductorTransitivo(adyacencia_completa).reducir()

        aristas: list[tuple[int, int]] = []
        for origen, destinos in adyacencia_hasse.items():
            for destino in destinos:
                aristas.append((origen, destino))

        return {
            "numero_origen": n,
            "nodos": nodos,
            "aristas": aristas,
            "cantidad_nodos": len(nodos),
            "cantidad_aristas": len(aristas),
        }
    

    @staticmethod
    def generar_desde_conjunto(nodos_personalizados: List[int]) -> Dict[str, Any]:
        """
        Genera el diagrama a partir de un conjunto específico de números.
        Ordena y elimina duplicados antes de procesar.
        """
        if not nodos_personalizados:
            raise ValueError("El conjunto no puede estar vacío.")
            
        if any(n <= 0 for n in nodos_personalizados):
            raise ValueError("Todos los números del conjunto deben ser enteros positivos.")
            
        nodos = sorted(list(set(nodos_personalizados)))
        
        # 2. Construir el grafo completo de relaciones (usando tu API real)
        adyacencia_completa = GrafoDivisibilidad(nodos).construir_adyacencia()
        
        # 3. Reducir el grafo (usando tu API real)
        adyacencia_hasse = ReductorTransitivo(adyacencia_completa).reducir()
        
        # 4. Estructurar la salida
        aristas: List[Tuple[int, int]] = []
        for origen, destinos in adyacencia_hasse.items():
            for destino in destinos:
                aristas.append((origen, destino))
                
        return {
            "numero_origen": f"Conjunto {nodos}",
            "nodos": nodos,
            "aristas": aristas,
            "cantidad_nodos": len(nodos),
            "cantidad_aristas": len(aristas)
        }
