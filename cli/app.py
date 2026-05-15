import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.fachada import MotorHasse
from layout.motor_layout import MotorLayout

def imprimir_resultados(resultado: dict):
    """
    Formatea y muestra en consola los resultados topológicos y geométricos.
    """
    # Lanza el visualizador 3D en el navegador
    from ui.render_grafico import RenderizadorPlotly
    figura = RenderizadorPlotly.crear_figura(resultado)
    figura.show()
    
    print("\n" + "═"*60)
    print(f"📊 DIAGRAMA DE HASSE PARA N = {resultado['numero_origen']}")
    print("═"*60)
    
    print(f"\n🔹 Topología - Aristas directas ({resultado['cantidad_aristas']}):")
    for padre, hijo in resultado['aristas']:
        print(f"   {padre} ── divide a ──> {hijo}")
        
    print(f"\n🔹 Geometría - Coordenadas Espaciales (X, Y, Z):")
    # Extraemos las coordenadas y las ordenamos por nivel para una lectura limpia
    coordenadas = resultado['coordenadas']
    niveles = resultado['niveles']
    
    # Ordenar los nodos primero por nivel y luego por valor
    nodos_ordenados = sorted(resultado['nodos'], key=lambda n: (niveles[n], n))
    
    for nodo in nodos_ordenados:
        x, y, z = coordenadas[nodo]
        nivel = niveles[nodo]
        print(f"   Nivel {nivel} | Nodo [{nodo:^3}]  ->  X: {x:>7.4f}  |  Y: {y:>5.1f}  |  Z: {z:>7.4f}")
        
    print("\n" + "═"*60 + "\n")

def ejecutar_cli():
    print("\n🖥️  Motor de Layout Espacial Hasse 3D (Fase 1 y 2)")
    print("Escribe 'salir' para terminar el programa.\n")
    
    while True:
        entrada = input("👉 Ingresa un número entero (ej. 30): ").strip().lower()
        
        if entrada in ['salir', 'exit', 'q']:
            print("Apagando motor... ¡Hasta pronto!")
            break
            
        try:
            numero = int(entrada)
            
            # 1. Pipeline Lógico (Fase 1)
            datos_topologicos = MotorHasse.generar_diagrama(numero)
            
            # 2. Pipeline Geométrico (Fase 2)
            datos_completos = MotorLayout.generar_layout(datos_topologicos)
            
            # 3. Presentación
            imprimir_resultados(datos_completos)
            
        except ValueError as e:
            if "invalid literal" in str(e).lower():
                print("⚠️ Error: Entrada no válida. Ingresa solo números enteros positivos.")
            else:
                print(f"⚠️ Error: {e}")
        except Exception as e:
            print(f"⚠️ Error inesperado del sistema: {e}")

if __name__ == "__main__":
    ejecutar_cli()