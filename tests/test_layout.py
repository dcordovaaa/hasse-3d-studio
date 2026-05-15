import pytest
from layout.niveles import CalculadorNiveles
from layout.distribucion import DistribuidorRadial
from layout.motor_layout import MotorLayout

def test_calculo_factores_primos():
    """Valida que la función matemática Ω(n) cuente correctamente los niveles."""
    assert CalculadorNiveles._contar_factores_primos(1) == 0
    assert CalculadorNiveles._contar_factores_primos(2) == 1
    assert CalculadorNiveles._contar_factores_primos(6) == 2   # 2 * 3
    assert CalculadorNiveles._contar_factores_primos(8) == 3   # 2 * 2 * 2
    assert CalculadorNiveles._contar_factores_primos(30) == 3  # 2 * 3 * 5

def test_distribucion_nodo_unico():
    """Valida que los nodos solitarios (base y cima) se coloquen en el centro del eje X/Z."""
    niveles_base = {1: 0} # El nodo 1 está en el nivel 0
    coords_base = DistribuidorRadial.calcular_coordenadas(niveles_base, radio_base=10.0, escala_y=10.0)
    assert coords_base[1] == (0.0, 0.0, 0.0)
    
    niveles_cima = {30: 3} # El nodo 30 está en el nivel 3
    coords_cima = DistribuidorRadial.calcular_coordenadas(niveles_cima, radio_base=10.0, escala_y=10.0)
    assert coords_cima[30] == (0.0, 30.0, 0.0)

def test_distribucion_multiple():
    """Valida la distribución circular en coordenadas cartesianas."""
    niveles = {2: 1, 3: 1, 5: 1} # 3 nodos en el nivel 1
    coords = DistribuidorRadial.calcular_coordenadas(niveles, radio_base=10.0, escala_y=10.0)
    
    # El primer nodo (2) debe estar en 0 grados: X=10, Y=10 (nivel 1 * 10), Z=0
    assert coords[2][0] == 10.0
    assert coords[2][1] == 10.0
    assert coords[2][2] == 0.0
    
    # Todos deben tener exactamente la misma altura (Y = 10.0)
    assert coords[3][1] == 10.0
    assert coords[5][1] == 10.0

def test_motor_layout_integracion():
    """Valida el pipeline completo de la Fase 2 (Patrón Facade)."""
    # Simulamos la salida de la Fase 1 para N=6
    datos_fase1 = {
        "numero_origen": 6,
        "nodos": [1, 2, 3, 6],
        "aristas": [(1, 2), (1, 3), (2, 6), (3, 6)],
        "cantidad_nodos": 4,
        "cantidad_aristas": 4
    }
    
    resultado = MotorLayout.generar_layout(datos_fase1)
    
    # Verificamos que se inyectaron las nuevas propiedades geométricas
    assert "niveles" in resultado
    assert "coordenadas" in resultado
    
    # Validamos las coordenadas base y cima
    assert resultado["coordenadas"][1] == (0.0, 0.0, 0.0)   # Base
    assert resultado["coordenadas"][6] == (0.0, 20.0, 0.0)  # Cima (Nivel 2 * escala 10.0)