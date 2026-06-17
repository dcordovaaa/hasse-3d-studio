"""Paquete core de dominio matemático."""

from core.algoritmos import ReductorTransitivo
from core.divisores import ErrorNumeroNoPositivo, GeneradorDivisores
from core.fachada import MotorHasse
from core.grafos import GrafoDivisibilidad

__all__ = [
    "ErrorNumeroNoPositivo",
    "GeneradorDivisores",
    "GrafoDivisibilidad",
    "MotorHasse",
    "ReductorTransitivo",
]
