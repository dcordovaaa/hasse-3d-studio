"""Dominio: generación de divisores positivos de un entero."""

from __future__ import annotations

import math


class ErrorNumeroNoPositivo(ValueError):
    """El conjunto de divisores naturales solo está definido para enteros estrictamente positivos."""

    def __init__(self, n: int, mensaje: str | None = None) -> None:
        self.valor_recibido: int = n
        texto = mensaje or (
            f"Se esperaba un entero n > 0; se recibió {n}. "
            "El cero no tiene divisores en N y los negativos no se consideran aquí."
        )
        super().__init__(texto)


class GeneradorDivisores:
    """
    Calcula todos los divisores positivos de un entero N.

    Complejidad temporal: O(√N) — se prueba cada i desde 1 hasta ⌊√N⌋ y se añade
    el par (i, N/i) cuando i divide a N. Complejidad espacial: O(d(N)), donde d(N)
    es el número de divisores.
    """

    def __init__(self, n: int) -> None:
        if n <= 0:
            raise ErrorNumeroNoPositivo(n)
        self._n: int = n

    @property
    def n(self) -> int:
        """Entero cuyos divisores se generan (inmutable tras construir la instancia)."""
        return self._n

    def obtener_divisores(self) -> list[int]:
        """
        Devuelve una nueva lista ordenada con todos los d ∈ N tales que d | N.

        No muta estado interno más allá de construir la lista de salida.
        """
        candidatos: list[int] = []
        limite = math.isqrt(self._n)
        for i in range(1, limite + 1):
            if self._n % i == 0:
                candidatos.append(i)
                complemento = self._n // i
                if complemento != i:
                    candidatos.append(complemento)
        return sorted(candidatos)
