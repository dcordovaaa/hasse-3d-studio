"""Punto de entrada de la API RESTful (Backend V2)."""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.fachada import MotorHasse
from layout.motor_layout import MotorLayout
from discrete_math.analisis_reticulas import AnalizadorReticulas

app = FastAPI(
    title="Hasse 3D Studio API",
    description="Motor matemático para análisis de divisibilidad y retículas algebraicas.",
    version="2.0.0"
)

# --- CONFIGURACIÓN DE SEGURIDAD (CORS) PARA PRODUCCIÓN ---
# Capturamos la URL del frontend desde las variables de entorno de nuestro servidor.
# Si no existe, permitimos localhost por defecto para que puedas seguir testeando en tu PC.
origenes_permitidos = [
    "http://localhost:5173",  # Puerto por defecto de Vite (React)
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", "") # Aquí entrará tu futura URL de Vercel
]

# Filtramos strings vacíos por si la variable de entorno no está configurada aún
origenes_permitidos = [origen for origen in origenes_permitidos if origen]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origenes_permitidos, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ENDPOINT 1: Generación del Diagrama Completo ---
@app.get("/api/diagrama", response_model=Dict[str, Any])
def obtener_diagrama(entrada: str = Query(..., description="Número entero o conjunto")):
    try:
        texto_limpio = entrada.strip()
        
        if "," in texto_limpio:
            lista_str = texto_limpio.split(",")
            nodos = [int(n.strip()) for n in lista_str if n.strip().isdigit()]
            datos_topologicos = MotorHasse.generar_desde_conjunto(nodos)
        else:
            numero = int(texto_limpio)
            datos_topologicos = MotorHasse.generar_diagrama(numero)
            
        datos_completos = MotorLayout.generar_layout(datos_topologicos)
        return datos_completos

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor procesando la estructura.")

# --- ENDPOINT 2: Análisis de Subretículas (NUEVO) ---
class PeticionSubconjunto(BaseModel):
    nodos_padre: List[int]
    subconjunto: List[int]

@app.post("/api/analizar-subconjunto")
def analizar_subconjunto(peticion: PeticionSubconjunto):
    if not peticion.subconjunto:
        raise HTTPException(status_code=400, detail="El subconjunto está vacío.")
        
    # Usamos el nuevo método matemático estricto
    es_subreticula, pares_fallidos = AnalizadorReticulas.es_subreticula(
        peticion.subconjunto, 
        peticion.nodos_padre
    )
    minimo, maximo = AnalizadorReticulas.obtener_cotas_globales(peticion.subconjunto)
    
    return {
        "es_reticula_valida": es_subreticula,
        "pares_fallidos": pares_fallidos,
        "elemento_minimo_0": minimo,
        "elemento_maximo_I": maximo
    }