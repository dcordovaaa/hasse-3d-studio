"""Capa de Presentación: Configuración visual y de experiencia de usuario (UI/UX)."""

# Paleta de colores profesional y escalable
PALETA = {
   "fondo": "#F0F4FF",              # Azul muy pálido — más luminoso que el crema anterior
    "texto_principal": "#1A1A2E",    # Azul-negro profundo — más rico que el gris puro
    "texto_secundario": "#8A8FAA",   # Azul-gris suave para texto auxiliar
    "nodo_base": "#FFFFFF",          # Blanco puro — máximo contraste sobre el fondo
    "nodo_borde": "#5C6BC0",         # Índigo medio — borde visible y elegante
    "error": "#E07A5F",
    
    # (HOVERS Y CLICS)
    "acento": "#FF6B35",             # Naranja vivo — más luminoso que la terracota anterior
    "relacionado": "#FFD166",        # Amarillo sol — brillante y legible
    "inactivo": "#E8ECF8",           # Azul muy desaturado — apaga sin ser gris genérico
    "arista_activa": "#1A1A2E",      # Mismo azul-negro del texto — grosor manda aquí
    "arista_inactiva": "#C5CCEB"     # Azul claro difuminado — se distingue del fondo
}

# Configuración de Tipografía y Tamaños
TIPOGRAFIA = {
    "familia": "'Poppins', sans-serif",
    "tamano_nodo": 18,          # Aumentaremos esto luego para mejor legibilidad
    "radio_esfera": 22
}

# Configuración de Interacción y Cámara 3D (Preparado para afinar el zoom)
CONFIG_CAMARA = {
    "up": dict(x=0, y=1, z=0),
    "center": dict(x=0, y=0, z=0),
    "eye": dict(x=1.5, y=1.2, z=1.5),
    "projection": dict(type="perspective")
}

# ---------------------------------------------------------
# ESTILOS CSS ESTRUCTURALES (Fase 4 y 5)
# ---------------------------------------------------------

# Contenedor global de la aplicación (ocupa toda la pantalla sin scroll)
ESTILO_APP_ROOT = {
    "fontFamily": TIPOGRAFIA["familia"],
    "backgroundColor": PALETA["fondo"],
    "height": "100vh",
    "width": "100vw",
    "display": "flex",
    "flexDirection": "row", # Divide la pantalla horizontalmente (Izquierda/Derecha)
    "overflow": "hidden",   # Evita barras de scroll externas
    "margin": "0",
    "padding": "0"
}

# Panel Lateral Izquierdo (Controles)
ESTILO_SIDEBAR = {
    "width": "320px",
    "backgroundColor": "#FFFFFF", # Blanco puro para contrastar con el fondo crema
    "boxShadow": "4px 0px 15px rgba(0, 0, 0, 0.03)", # Sombra muy sutil
    "display": "flex",
    "flexDirection": "column",
    "padding": "40px 30px",
    "zIndex": "10"
}

# Lienzo Principal Derecho (Donde vive el gráfico 3D)
ESTILO_LIENZO = {
    "flex": "1",            # Toma todo el espacio restante
    "position": "relative",
    "display": "flex",
    "justifyContent": "center",
    "alignItems": "center",
    "backgroundColor": PALETA["fondo"]
}

ESTILO_INPUT = {
    "padding": "10px 15px",
    "height": "42px",
    "fontSize": "15px",
    "borderRadius": "8px",
    "border": f"2px solid {PALETA['inactivo']}",
    "marginBottom": "20px",
    "fontFamily": TIPOGRAFIA["familia"],
    "outline": "none",
    "width": "100%",        # Se adapta al ancho del panel lateral
    "boxSizing": "border-box",
    "transition": "border 0.3s ease"
}

ESTILO_BOTON = {
    "padding": "14px",
    "fontSize": "16px",
    "borderRadius": "8px",
    "border": "none",
    "backgroundColor": PALETA["texto_principal"],
    "color": "#FFFFFF",
    "cursor": "pointer",
    "fontWeight": "600",
    "fontFamily": TIPOGRAFIA["familia"],
    "width": "100%",        # Se adapta al ancho del panel lateral
    "transition": "transform 0.1s ease, background 0.3s ease"
}