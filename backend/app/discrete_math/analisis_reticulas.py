"""Módulo de Análisis Lógico para Retículas (Lattices)."""

import math
from typing import List, Optional, Set, Tuple

class AnalizadorReticulas:
    """
    Analiza conjuntos parcialmente ordenados por divisibilidad para determinar
    si cumplen las propiedades matemáticas de una retícula.
    """

    @staticmethod
    def obtener_infimo(a: int, b: int, nodos: Set[int]) -> Optional[int]:
        """
        Calcula la Máxima Cota Inferior (MCI) o Ínfimo (a ∧ b).
        """
        # 1. Encontrar todas las cotas inferiores (divisores comunes presentes en el conjunto)
        cotas_inferiores = {x for x in nodos if a % x == 0 and b % x == 0}
        
        if not cotas_inferiores:
            return None
            
        # 2. La MCI debe ser múltiplo de TODAS las demás cotas inferiores.
        # En orden numérico, el candidato natural a MCI será el número más grande.
        candidato_mci = max(cotas_inferiores)
        
        for cota in cotas_inferiores:
            if candidato_mci % cota != 0:
                return None # Existe más de una cota inferior no comparable
                
        return candidato_mci

    @staticmethod
    def obtener_supremo(a: int, b: int, nodos: Set[int]) -> Optional[int]:
        """
        Calcula la Mínima Cota Superior (MCS) o Supremo (a ∨ b).
        """
        # 1. Encontrar todas las cotas superiores (múltiplos comunes presentes en el conjunto)
        cotas_superiores = {x for x in nodos if x % a == 0 and x % b == 0}
        
        if not cotas_superiores:
            return None
            
        # 2. La MCS debe dividir a TODAS las demás cotas superiores.
        # En orden numérico, el candidato natural a MCS será el número más pequeño.
        candidato_mcs = min(cotas_superiores)
        
        for cota in cotas_superiores:
            if cota % candidato_mcs != 0:
                return None # Existe más de una cota superior no comparable
                
        return candidato_mcs

    @staticmethod
    def es_reticula(nodos: List[int]) -> Tuple[bool, List[Tuple[int, int]]]:
        """
        Verifica si el conjunto completo forma una retícula.
        Retorna una tupla: (Es válida, Lista de pares de nodos que no cumplen la regla).
        """
        nodos_set = set(nodos)
        pares_fallidos = []
        es_valida = True
        
        # Evaluar matemáticamente todo par posible (a, b)
        for i in range(len(nodos)):
            for j in range(i + 1, len(nodos)):
                a = nodos[i]
                b = nodos[j]
                
                infimo = AnalizadorReticulas.obtener_infimo(a, b, nodos_set)
                supremo = AnalizadorReticulas.obtener_supremo(a, b, nodos_set)
                
                if infimo is None or supremo is None:
                    es_valida = False
                    pares_fallidos.append((a, b))
                    
        return es_valida, pares_fallidos

    @staticmethod
    def obtener_cotas_globales(nodos: List[int]) -> Tuple[Optional[int], Optional[int]]:
        """
        Identifica si la retícula es acotada (tiene elemento mínimo 0 y máximo I).
        """
        if not nodos:
            return None, None
            
        minimo_global = min(nodos)
        maximo_global = max(nodos)
        
        # Verificar si el mínimo numérico divide a TODOS (Elemento 0)
        es_minimo_valido = all(n % minimo_global == 0 for n in nodos)
        # Verificar si el máximo numérico es múltiplo de TODOS (Elemento I)
        es_maximo_valido = all(maximo_global % n == 0 for n in nodos)
        
        return (
            minimo_global if es_minimo_valido else None,
            maximo_global if es_maximo_valido else None
        )

    @staticmethod
    def es_subreticula(subconjunto: List[int], nodos_padre: List[int]) -> Tuple[bool, List[Tuple[int, int]]]:
        """
        Evalúa si S es subretícula de L verificando que a ∨ b ∈ S y a ∧ b ∈ S.
        En divisibilidad: a ∨ b = MCM y a ∧ b = MCD.
        """
        set_padre = set(nodos_padre)
        set_sub = set(subconjunto)
        
        # 1. Condición fundamental: S ⊆ L
        if not set_sub.issubset(set_padre):
            return False, []
            
        pares_fallidos = []
        es_valida = True
        
        for i in range(len(subconjunto)):
            for j in range(i + 1, len(subconjunto)):
                a = subconjunto[i]
                b = subconjunto[j]
                
                # Calcular el MCD (Ínfimo) y MCM (Supremo)
                infimo = math.gcd(a, b)
                supremo = (a * b) // infimo
                
                # Ambos deben pertenecer al subconjunto seleccionado
                if infimo not in set_sub or supremo not in set_sub:
                    es_valida = False
                    pares_fallidos.append((a, b))
                    
        return es_valida, pares_fallidos