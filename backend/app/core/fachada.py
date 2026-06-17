"""Fachada de dominio: orquesta divisores → grafo de divisibilidad → reducción Hasse → análisis de retículas."""

from typing import List, Dict, Any, Tuple
from core.algoritmos import ReductorTransitivo
from core.divisores import GeneradorDivisores
from core.grafos import GrafoDivisibilidad
from discrete_math.analisis_reticulas import AnalizadorReticulas

class MotorHasse:
    """
    Punto de entrada único del núcleo para obtener el diagrama lógico y su análisis matemático.
    """

    @staticmethod
    def generar_diagrama(n: int) -> dict[str, Any]:
        nodos = GeneradorDivisores(n).obtener_divisores()
        adyacencia_completa = GrafoDivisibilidad(nodos).construir_adyacencia()
        adyacencia_hasse = ReductorTransitivo(adyacencia_completa).reducir()

        aristas: list[tuple[int, int]] = []
        for origen, destinos in adyacencia_hasse.items():
            for destino in destinos:
                aristas.append((origen, destino))

        # NUEVO: Análisis Lógico de Retículas
        es_reticula, pares_fallidos = AnalizadorReticulas.es_reticula(nodos)
        minimo, maximo = AnalizadorReticulas.obtener_cotas_globales(nodos)

        return {
            "numero_origen": n,
            "nodos": nodos,
            "aristas": aristas,
            "cantidad_nodos": len(nodos),
            "cantidad_aristas": len(aristas),
            "analisis_reticula": {
                "es_reticula_valida": es_reticula,
                "pares_fallidos": pares_fallidos,
                "elemento_minimo_0": minimo,
                "elemento_maximo_I": maximo
            }
        }
    
    @staticmethod
    def generar_desde_conjunto(nodos_personalizados: List[int]) -> Dict[str, Any]:
        if not nodos_personalizados:
            raise ValueError("El conjunto no puede estar vacío.")
            
        if any(n <= 0 for n in nodos_personalizados):
            raise ValueError("Todos los números del conjunto deben ser enteros positivos.")
            
        nodos = sorted(list(set(nodos_personalizados)))
        
        adyacencia_completa = GrafoDivisibilidad(nodos).construir_adyacencia()
        adyacencia_hasse = ReductorTransitivo(adyacencia_completa).reducir()
        
        aristas: List[Tuple[int, int]] = []
        for origen, destinos in adyacencia_hasse.items():
            for destino in destinos:
                aristas.append((origen, destino))
                
        # NUEVO: Análisis Lógico de Retículas
        es_reticula, pares_fallidos = AnalizadorReticulas.es_reticula(nodos)
        minimo, maximo = AnalizadorReticulas.obtener_cotas_globales(nodos)
                
        return {
            "numero_origen": f"Conjunto {nodos}",
            "nodos": nodos,
            "aristas": aristas,
            "cantidad_nodos": len(nodos),
            "cantidad_aristas": len(aristas),
            "analisis_reticula": {
                "es_reticula_valida": es_reticula,
                "pares_fallidos": pares_fallidos,
                "elemento_minimo_0": minimo,
                "elemento_maximo_I": maximo
            }
        }