"""Capa de Geometría: Fachada principal del Motor de Layout (Fase 2)."""

from typing import Any
from layout.niveles import CalculadorNiveles
from layout.distribucion import DistribuidorRadial


class MotorLayout:
    """
    Fachada que orquesta la Fase 2 (Geometría).
    Toma la topología pura generada por el MotorHasse (Fase 1)
    y le asigna coordenadas tridimensionales (X, Y, Z) a cada nodo.
    """

    @staticmethod
    def generar_layout(
        datos_topologicos: dict[str, Any], 
        radio_base: float = 10.0, 
        escala_y: float = 10.0
    ) -> dict[str, Any]:
        """
        Ejecuta el pipeline de posicionamiento geométrico.
        
        Args:
            datos_topologicos: El diccionario devuelto por core.fachada.MotorHasse.
            radio_base: El radio para la distribución circular en X/Z.
            escala_y: La separación vertical entre niveles.
            
        Retorna:
            Un nuevo diccionario con la información topológica original más 
            las coordenadas espaciales calculadas.
        """
        # 1. Extraer los nodos de la topología (Fase 1)
        nodos: list[int] = datos_topologicos.get("nodos", [])
        if not nodos:
            raise ValueError("Los datos topológicos no contienen nodos válidos.")

        # 2. Calcular los niveles (Eje Y)
        niveles = CalculadorNiveles.calcular(nodos)

        # 3. Calcular la distribución radial (Ejes X, Z combinados con Y)
        coordenadas_3d = DistribuidorRadial.calcular_coordenadas(
            niveles=niveles,
            radio_base=radio_base,
            escala_y=escala_y
        )

        # 4. Construir el paquete final (Topología + Geometría)
        # Creamos una copia del diccionario original para respetar la inmutabilidad
        resultado_final = dict(datos_topologicos)
        
        # Inyectamos los nuevos datos geométricos
        resultado_final["niveles"] = niveles
        resultado_final["coordenadas"] = coordenadas_3d

        return resultado_final