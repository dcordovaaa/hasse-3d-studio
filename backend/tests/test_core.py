"""Pruebas del núcleo matemático: generador de divisores."""

import pytest

from core.algoritmos import ReductorTransitivo
from core.divisores import ErrorNumeroNoPositivo, GeneradorDivisores
from core.fachada import MotorHasse
from core.grafos import GrafoDivisibilidad


def test_uno_solo_divisor_es_uno() -> None:
    assert GeneradorDivisores(1).obtener_divisores() == [1]


def test_primo_tiene_dos_divisores() -> None:
    assert GeneradorDivisores(17).obtener_divisores() == [1, 17]


def test_compuesto_cuadrado_perfecto() -> None:
    assert GeneradorDivisores(36).obtener_divisores() == [1, 2, 3, 4, 6, 9, 12, 18, 36]


def test_trescientos_sesenta_muchos_divisores() -> None:
    esperados = [
        1,
        2,
        3,
        4,
        5,
        6,
        8,
        9,
        10,
        12,
        15,
        18,
        20,
        24,
        30,
        36,
        40,
        45,
        60,
        72,
        90,
        120,
        180,
        360,
    ]
    assert GeneradorDivisores(360).obtener_divisores() == esperados


def test_cero_lanza_excepcion() -> None:
    with pytest.raises(ErrorNumeroNoPositivo) as exc:
        GeneradorDivisores(0)
    assert exc.value.valor_recibido == 0


def test_negativo_lanza_excepcion() -> None:
    with pytest.raises(ErrorNumeroNoPositivo) as exc:
        GeneradorDivisores(-42)
    assert exc.value.valor_recibido == -42


def test_propiedad_n() -> None:
    g = GeneradorDivisores(12)
    assert g.n == 12


def test_grafo_divisibilidad_construye_adyacencia_pura() -> None:
    grafo = GrafoDivisibilidad([1, 2, 3, 6])
    assert grafo.construir_adyacencia() == {
        1: [2, 3, 6],
        2: [6],
        3: [6],
        6: [],
    }


def test_grafo_divisibilidad_elimina_duplicados_y_ordena() -> None:
    grafo = GrafoDivisibilidad([6, 3, 3, 1, 2])
    assert grafo.numeros == (1, 2, 3, 6)


def test_grafo_divisibilidad_rechaza_lista_vacia() -> None:
    with pytest.raises(ValueError):
        GrafoDivisibilidad([])


def test_grafo_divisibilidad_rechaza_no_positivos() -> None:
    with pytest.raises(ErrorNumeroNoPositivo):
        GrafoDivisibilidad([1, -2, 4])


def test_reductor_transitivo_elimina_arista_redundante() -> None:
    adyacencia = {
        1: [2, 3, 6],
        2: [6],
        3: [6],
        6: [],
    }
    reducido = ReductorTransitivo(adyacencia).reducir()
    assert reducido == {
        1: [2, 3],
        2: [6],
        3: [6],
        6: [],
    }


def test_reductor_transitivo_elimina_reflexivas() -> None:
    adyacencia = {
        1: [1, 2, 4],
        2: [2, 4],
        4: [4],
    }
    reducido = ReductorTransitivo(adyacencia).reducir()
    assert reducido == {
        1: [2],
        2: [4],
        4: [],
    }


def test_reductor_transitivo_no_muta_entrada() -> None:
    adyacencia = {1: [2, 4], 2: [4], 4: []}
    copia = {k: v[:] for k, v in adyacencia.items()}
    _ = ReductorTransitivo(adyacencia).reducir()
    assert adyacencia == copia


def test_motor_hasse_flujo_completo_coherente_con_modulos() -> None:
    """La fachada debe instanciar cada clase; no llamar métodos como estáticos."""
    resultado = MotorHasse.generar_diagrama(12)
    assert resultado["numero_origen"] == 12
    assert resultado["nodos"] == [1, 2, 3, 4, 6, 12]
    assert set(resultado["aristas"]) == {(1, 2), (1, 3), (2, 4), (2, 6), (3, 6), (4, 12), (6, 12)}
    assert resultado["cantidad_nodos"] == 6
    assert resultado["cantidad_aristas"] == 7


def test_motor_hasse_n_es_uno() -> None:
    resultado = MotorHasse.generar_diagrama(1)
    assert resultado["nodos"] == [1]
    assert resultado["aristas"] == []
    assert resultado["cantidad_aristas"] == 0
