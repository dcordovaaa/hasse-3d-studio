"""Capa de Presentación: Renderizado 3D interactivo del Diagrama de Hasse."""

import plotly.graph_objects as go
from typing import Any, Optional
from ui.config_tema import PALETA, TIPOGRAFIA, CONFIG_CAMARA

class RenderizadorPlotly:
    """
    Responsable de construir la figura 3D aplicando resaltado dinámico y tooltips minimalistas.
    """

    @staticmethod
    def crear_figura(datos_completos: dict[str, Any], nodo_seleccionado: Optional[int] = None) -> go.Figure:
        coordenadas = datos_completos.get("coordenadas", {})
        aristas = datos_completos.get("aristas", [])
        nodos = datos_completos.get("nodos", [])

        if not coordenadas:
            raise ValueError("No se encontraron coordenadas para renderizar.")

        # 1. Identidad Matemática: Relaciones
        relacionados = set()
        if nodo_seleccionado is not None and nodo_seleccionado in nodos:
            relacionados.add(nodo_seleccionado)
            for n in nodos:
                if n != nodo_seleccionado:
                    if n % nodo_seleccionado == 0 or nodo_seleccionado % n == 0:
                        relacionados.add(n)

        # 2. Aristas (Líneas)
        edge_x_act, edge_y_act, edge_z_act = [], [], []
        edge_x_inact, edge_y_inact, edge_z_inact = [], [], []

        for padre, hijo in aristas:
            if padre in coordenadas and hijo in coordenadas:
                x0, y0, z0 = coordenadas[padre]
                x1, y1, z1 = coordenadas[hijo]
                
                if nodo_seleccionado is not None and padre in relacionados and hijo in relacionados:
                    edge_x_act.extend([x0, x1, None])
                    edge_y_act.extend([y0, y1, None])
                    edge_z_act.extend([z0, z1, None])
                elif nodo_seleccionado is None:
                    edge_x_act.extend([x0, x1, None])
                    edge_y_act.extend([y0, y1, None])
                    edge_z_act.extend([z0, z1, None])
                else:
                    edge_x_inact.extend([x0, x1, None])
                    edge_y_inact.extend([y0, y1, None])
                    edge_z_inact.extend([z0, z1, None])

        trazos = []
        
        if edge_x_inact:
            trazos.append(go.Scatter3d(
                x=edge_x_inact, y=edge_y_inact, z=edge_z_inact, mode='lines',
                line=dict(color=PALETA["arista_inactiva"], width=1.5), hoverinfo='none', name='Inactivo'
            ))
            
        trazos.append(go.Scatter3d(
            x=edge_x_act, y=edge_y_act, z=edge_z_act, mode='lines',
            line=dict(color=PALETA["arista_activa"] if nodo_seleccionado else PALETA["texto_secundario"], width=3),
            hoverinfo='none', name='Relación'
        ))

        # 3. Nodos (Esferas)
        node_x, node_y, node_z, node_text, node_colors = [], [], [], [], []
        
        for nodo in nodos:
            if nodo in coordenadas:
                node_x.append(coordenadas[nodo][0])
                node_y.append(coordenadas[nodo][1])
                node_z.append(coordenadas[nodo][2])
                node_text.append(str(nodo))
                
                if nodo_seleccionado is None:
                    node_colors.append(PALETA["nodo_base"])
                elif nodo == nodo_seleccionado:
                    node_colors.append(PALETA["acento"])
                elif nodo in relacionados:
                    node_colors.append(PALETA["relacionado"])
                else:
                    node_colors.append(PALETA["inactivo"])

        trazos.append(go.Scatter3d(
            x=node_x, y=node_y, z=node_z, mode='markers+text', text=node_text,
            textposition="middle center",
            marker=dict(
                size=TIPOGRAFIA["radio_esfera"],
                color=node_colors,
                line=dict(width=1.5, color=PALETA["nodo_borde"]),
                opacity=0.95
            ),
            textfont=dict(family=TIPOGRAFIA["familia"], size=TIPOGRAFIA["tamano_nodo"], color=PALETA["texto_principal"], weight="bold"),
            hoverinfo='text', 
            # Hovertemplate minimalista sin "extras" visuales de Plotly
            hovertemplate="<span style='font-size:14px; font-weight:600;'>NODO %{text}</span><extra></extra>", 
            name='Divisores'
        ))

        # 4. Configuración de Escena y Tooltips (Hoverlabel)
        fig = go.Figure(data=trazos)
        fig.update_layout(
            font=dict(family=TIPOGRAFIA["familia"]),
            paper_bgcolor=PALETA["fondo"], plot_bgcolor=PALETA["fondo"],
            margin=dict(l=0, r=0, b=0, t=0),
            scene=dict(xaxis=dict(visible=False), yaxis=dict(visible=False), zaxis=dict(visible=False), camera=CONFIG_CAMARA, aspectmode='data'),
            showlegend=False, 
            # Estilización del tooltip (caja flotante)
            hoverlabel=dict(
                bgcolor="#FFFFFF", # Fondo blanco limpio
                font_size=14, 
                font_family=TIPOGRAFIA["familia"],
                bordercolor=PALETA["texto_secundario"], # Borde sutil
                font_color=PALETA["texto_principal"]
            )
        )
        return fig