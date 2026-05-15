"""Dominio: estructuras de grafo por divisibilidad."""

from __future__ import annotations

from core.divisores import ErrorNumeroNoPositivo


class GrafoDivisibilidad:
    """
    Construye una lista de adyacencia basada en divisibilidad pura.

    Para cada par (a, b) de enteros del conjunto de entrada, existe una arista
    dirigida a -> b si y solo si:
    - a != b
    - b % a == 0

    No aplica reducción transitiva: incluye todas las relaciones de divisibilidad.
    """

    def __init__(self, numeros: list[int]) -> None:
        if not numeros:
            raise ValueError("La lista de números no puede estar vacía.")

        self._numeros: tuple[int, ...] = self._normalizar_y_validar(numeros)

    @property
    def numeros(self) -> tuple[int, ...]:
        """Colección inmutable de nodos válidos del grafo."""
        return self._numeros

    def construir_adyacencia(self) -> dict[int, list[int]]:
        """
        Retorna un nuevo diccionario de adyacencia.

        Cada clave representa un nodo origen y su valor es la lista ordenada de
        nodos destino divisibles por el origen.
        """
        adyacencia: dict[int, list[int]] = {n: [] for n in self._numeros}
        for origen in self._numeros:
            for destino in self._numeros:
                if origen != destino and destino % origen == 0:
                    adyacencia[origen].append(destino)
        return adyacencia

    @staticmethod
    def _normalizar_y_validar(numeros: list[int]) -> tuple[int, ...]:
        """
        Elimina duplicados y valida dominio: solo enteros positivos.

        Mantiene orden ascendente para resultados deterministas.
        """
        normalizados = sorted(set(numeros))
        for n in normalizados:
            if n <= 0:
                raise ErrorNumeroNoPositivo(n)
        return tuple(normalizados)
