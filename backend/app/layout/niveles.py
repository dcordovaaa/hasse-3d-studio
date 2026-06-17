"""Capa de Geometría: Cálculo de niveles (Eje Y) para el Diagrama de Hasse."""

from __future__ import annotations


class CalculadorNiveles:
    """
    Responsable de determinar la coordenada Y (nivel) de cada nodo en el diagrama.
    Respeta el principio de Responsabilidad Única (SRP): no calcula distribución X/Z.
    """

    @staticmethod
    def calcular(nodos: list[int]) -> dict[int, int]:
        """
        Recibe una lista de nodos (divisores) y retorna un diccionario mapeando
        cada nodo a su nivel correspondiente en el eje Y.
        
        El nivel se calcula basándose en la cantidad total de factores primos
        (con multiplicidad) que componen al número.
        """
        if not nodos:
            raise ValueError("La lista de nodos no puede estar vacía para calcular niveles.")

        niveles: dict[int, int] = {}
        for nodo in nodos:
            niveles[nodo] = CalculadorNiveles._contar_factores_primos(nodo)
            
        return niveles

    @staticmethod
    def _contar_factores_primos(n: int) -> int:
        """
        Calcula la función Ω(n): el número total de factores primos de n,
        contados con su multiplicidad.
        
        Ejemplos:
        - Ω(1) = 0
        - Ω(8) = Ω(2^3) = 3
        - Ω(30) = Ω(2 * 3 * 5) = 3
        
        Complejidad temporal: O(√n) en el peor de los casos.
        """
        if n <= 0:
            raise ValueError("Solo se pueden calcular factores primos de enteros positivos.")
        if n == 1:
            return 0

        conteo = 0
        divisor = 2
        numero_actual = n

        # Optimización: solo iteramos hasta la raíz cuadrada del número actual
        while divisor * divisor <= numero_actual:
            while (numero_actual % divisor) == 0:
                conteo += 1
                numero_actual //= divisor
            divisor += 1

        # Si el número resultante es mayor que 1, es un factor primo en sí mismo
        if numero_actual > 1:
            conteo += 1

        return conteo