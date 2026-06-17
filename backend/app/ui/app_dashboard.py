"""Capa de Presentación: Dashboard Interactivo Web (Fase 4 - UI Dividida)."""

import sys
import os
import dash
from dash import dcc, html, Input, Output, State
from dash.exceptions import PreventUpdate

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.fachada import MotorHasse
from layout.motor_layout import MotorLayout
from ui.render_grafico import RenderizadorPlotly

# Importamos la nueva estructura visual
from ui.config_tema import (
    ESTILO_APP_ROOT, ESTILO_SIDEBAR, ESTILO_LIENZO, 
    ESTILO_INPUT, ESTILO_BOTON, PALETA
)

app = dash.Dash(__name__, title="Hasse 3D Studio")

# ---------------------------------------------------------
# ESTRUCTURA DE LA INTERFAZ (Layout de dos columnas)
# ---------------------------------------------------------
app.layout = html.Div(style=ESTILO_APP_ROOT, children=[
    
    # 1. PANEL LATERAL (Controles)
    html.Div(style=ESTILO_SIDEBAR, children=[
        html.H1("Hasse 3D", style={"fontSize": "32px", "marginBottom": "5px"}),
        html.P("Generador de Diagramas de Hasse", 
               style={"color": PALETA["texto_secundario"], "marginBottom": "40px", "fontWeight": "500"}),
        
        # Caja de texto
        html.Label("Conjunto o Número:", style={"fontWeight": "600", "marginBottom": "10px", "display": "block", "color": PALETA["texto_principal"]}),
        dcc.Input(
            id="input-datos", 
            type="text", 
            placeholder="Ej: 30 o 2, 3, 5, 30", 
            value="30", 
            style=ESTILO_INPUT
        ),
        
        # Botón
        html.Button("Generar Diagrama", id="btn-generar", n_clicks=0, style=ESTILO_BOTON),
        
        # Mensajes de error debajo del botón
        html.Div(
            id="mensaje-error", 
            style={"color": PALETA["error"], "fontWeight": "500", "marginTop": "15px", "minHeight": "24px"}
        ),

        # Instrucciones de uso ancladas abajo
        html.Div(style={"marginTop": "auto", "fontSize": "13px", "color": PALETA["texto_secundario"]}, children=[
            html.P("-> Desarrollado por estudiantes de la UPC"),
            html.P("-> TIP para ver los divisores y multiples de un nodo."),
            html.P("-> Clic en un nodo para aislar sus relaciones.")
        ])
    ]),
    
    # 2. LIENZO PRINCIPAL (Gráfico 3D)
    html.Div(style=ESTILO_LIENZO, children=[
        dcc.Loading(
            id="loading-grafico", 
            type="dot", 
            color=PALETA["nodo_base"],
            children=[
                dcc.Graph(
                    id="grafico-3d", 
                    # El gráfico ahora toma el 100% de su contenedor padre (el lienzo)
                    style={"width": "100%", "height": "100vh", "margin": "0", "padding": "0"},
                    config={"displayModeBar": False, "scrollZoom": True}
                )
            ]
        )
    ])
])

# ---------------------------------------------------------
# LÓGICA DE INTERACCIÓN (Callbacks intactos)
# ---------------------------------------------------------
@app.callback(
    [Output("grafico-3d", "figure"),
     Output("mensaje-error", "children")],
    [Input("btn-generar", "n_clicks"),
     Input("input-datos", "n_submit"),
     Input("grafico-3d", "clickData")],
    [State("input-datos", "value")]
)
def actualizar_diagrama(n_clicks, n_submit, click_data, valor_ingresado):
    if not valor_ingresado:
        raise PreventUpdate

    ctx = dash.callback_context
    trigger_id = ctx.triggered[0]["prop_id"].split(".")[0] if ctx.triggered else ""

    nodo_seleccionado = None

    if trigger_id == "grafico-3d" and click_data and "points" in click_data:
        texto_punto = click_data["points"][0].get("text")
        if texto_punto and texto_punto.isdigit():
            nodo_seleccionado = int(texto_punto)

    try:
        texto_limpio = str(valor_ingresado).strip()
        
        if "," in texto_limpio:
            lista_str = texto_limpio.split(",")
            nodos = [int(n.strip()) for n in lista_str if n.strip().isdigit()]
            datos_topologicos = MotorHasse.generar_desde_conjunto(nodos)
        else:
            numero = int(texto_limpio)
            datos_topologicos = MotorHasse.generar_diagrama(numero)
        
        datos_completos = MotorLayout.generar_layout(datos_topologicos)
        figura = RenderizadorPlotly.crear_figura(datos_completos, nodo_seleccionado)
        
        return figura, ""
        
    except ValueError as e:
        return dash.no_update, f"⚠️ {str(e)}"
    except Exception as e:
        import traceback
        traceback.print_exc()
        return dash.no_update, f"⚠️ Error técnico: {type(e).__name__} - {str(e)}"

if __name__ == "__main__":
    #app.run(debug=True)
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 8050)))