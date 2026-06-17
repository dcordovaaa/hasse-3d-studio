"""Algoritmos de teoría de órdenes para grafos de divisibilidad."""

from __future__ import annotations

from collections import deque


class ReductorTransitivo:
    """
    Aplica reducción reflexiva y transitiva sobre un grafo dirigido.

    Sea G = (V, E) una relación de divisibilidad. Para construir las aristas
    estrictas del Diagrama de Hasse:
    1) Se elimina toda arista reflexiva (v, v).
    2) Se elimina (a, c) si existe al menos un camino a -> b -> ... -> c
       con longitud >= 2.

    El resultado preserva la clausura transitiva de la relación parcial,
    pero conserva solo las cubiertas (cover relation), que son las aristas
    mínimas necesarias para representar el orden.
    """

    def __init__(self, adyacencia: dict[int, list[int]]) -> None:
        if not adyacencia:
            raise ValueError("La adyacencia no puede estar vacía.")
        self._adyacencia_original: dict[int, tuple[int, ...]] = {
            nodo: tuple(vecinos) for nodo, vecinos in adyacencia.items()
        }

    def reducir(self) -> dict[int, list[int]]:
        """
        Retorna un nuevo diccionario sin aristas reflexivas ni transitivas.

        Implementación optimizada:
        - Normaliza el grafo en listas de índices (acceso O(1)).
        - Obtiene un orden topológico.
        - Calcula alcanzabilidad con bitsets (enteros), en recorrido inverso
          topológico, para minimizar costo constante en operaciones de unión.
        """
        nodos, ady_idx = self._normalizar()
        orden_topologico = self._orden_topologico(ady_idx)
        alcanzables = self._calcular_alcanzabilidad_bitset(ady_idx, orden_topologico)

        reducido_idx: list[list[int]] = [[] for _ in nodos]
        for origen in range(len(nodos)):
            vecinos = ady_idx[origen]
            for destino in vecinos:
                if not self._es_arista_transitiva(
                    origen=origen,
                    destino=destino,
                    vecinos=vecinos,
                    alcanzables=alcanzables,
                ):
                    reducido_idx[origen].append(destino)

        return {
            nodos[origen]: [nodos[destino] for destino in destinos]
            for origen, destinos in enumerate(reducido_idx)
        }

    def _normalizar(self) -> tuple[list[int], list[list[int]]]:
        """
        Normaliza nodos y elimina reflexivas/duplicadas sin mutar el input.

        Retorna:
        - Lista de nodos ordenada.
        - Lista de adyacencia por índices enteros.
        """
        nodos_set: set[int] = set(self._adyacencia_original.keys())
        for vecinos in self._adyacencia_original.values():
            nodos_set.update(vecinos)

        nodos = sorted(nodos_set)
        indice: dict[int, int] = {nodo: i for i, nodo in enumerate(nodos)}

        ady_idx: list[list[int]] = [[] for _ in nodos]
        for nodo_origen in nodos:
            origen_idx = indice[nodo_origen]
            vecinos_unicos: set[int] = set(self._adyacencia_original.get(nodo_origen, ()))
            vecinos_idx: list[int] = []
            for vecino in vecinos_unicos:
                if vecino != nodo_origen:
                    vecinos_idx.append(indice[vecino])
            vecinos_idx.sort()
            ady_idx[origen_idx] = vecinos_idx

        return nodos, ady_idx

    def _orden_topologico(self, adyacencia_idx: list[list[int]]) -> list[int]:
        """Calcula orden topológico con Kahn; falla si el grafo tiene ciclos."""
        n = len(adyacencia_idx)
        grado_entrada: list[int] = [0] * n
        for origen in range(n):
            for destino in adyacencia_idx[origen]:
                grado_entrada[destino] += 1

        cola: deque[int] = deque(i for i, grado in enumerate(grado_entrada) if grado == 0)
        orden: list[int] = []
        while cola:
            actual = cola.popleft()
            orden.append(actual)
            for destino in adyacencia_idx[actual]:
                grado_entrada[destino] -= 1
                if grado_entrada[destino] == 0:
                    cola.append(destino)

        if len(orden) != n:
            raise ValueError(
                "La reducción transitiva requiere un DAG; la adyacencia contiene ciclos."
            )
        return orden

    def _calcular_alcanzabilidad_bitset(
        self, adyacencia_idx: list[list[int]], orden_topologico: list[int]
    ) -> list[int]:
        """
        Precalcula alcanzabilidad por nodo usando bitsets.

        Si u -> v, entonces:
            Alc(u) = union((v) U Alc(v)) para cada vecino v de u.
        """
        alcanzables: list[int] = [0] * len(adyacencia_idx)
        for origen in reversed(orden_topologico):
            mascara = 0
            for destino in adyacencia_idx[origen]:
                mascara |= (1 << destino)
                mascara |= alcanzables[destino]
            alcanzables[origen] = mascara
        return alcanzables

    def _es_arista_transitiva(
        self, origen: int, destino: int, vecinos: list[int], alcanzables: list[int]
    ) -> bool:
        """
        Determina si origen -> destino es redundante.

        Es redundante si existe un vecino intermedio m != destino tal que
        destino pertenece a Alc(m).
        """
        mascara_destino = 1 << destino
        for intermedio in vecinos:
            if intermedio != destino and (alcanzables[intermedio] & mascara_destino):
                return True
        return False
