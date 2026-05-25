# AGS Configuration - Antigravity Edition

Una configuración de AGS (Aylur's GTK Shell) v2 altamente personalizada, minimalista y funcional, diseñada para Hyprland en Nobara Linux.

## ✨ Características Principales

- **Barra Superior (TopBar)**:
    - Indicadores de red, volumen, micrófono, batería y bluetooth.
    - Historial de portapapeles integrado (`cliphist`).
    - Monitor de recursos (CPU/RAM) en tiempo real.
    - **Panel flotante de Fecha/Hora**: Al hacer clic en el reloj central se despliega un popover premium con:
        - Calendario interactivo (izquierda) — se restablece automáticamente al día actual cada vez que se abre.
        - Reloj digital completo `HH:MM:SS` con fecha extendida (derecha superior).
        - Centro de notificaciones reactivo con botón "Limpiar todo" e iconos de descarte individual (derecha inferior).
    - Sistema de popovers modulares con diseño premium unificado (MenuPopover).
- **Barra Lateral (SideBar)**:
    - Lanzador de aplicaciones dinámico que rastrea el workspace actual.
    - **Fijado (Pinning) Persistente:** Opciones de menú contextual para anclar y desanclar aplicaciones favoritas.
    - Visualizador de audio reactivo con escala logarítmica (20Hz-20kHz).
    - Controles de medios integrados.
- **Menú Derecho (RightMenu)**:
    - Configuración rápida (Mute, Bluetooth, WiFi).
    - Centro de notificaciones.
    - Buscador de aplicaciones y **panel de aplicaciones ancladas** con funcionamiento reactivo.
    - Menú de apagado.

## 🎨 Sistema de Diseño

- **Paleta de Colores**: Catppuccin (Mauve/Peach) — variables SCSS en `styles/colors.scss`.
- **Popovers Unificados**: Todos los menús flotantes comparten el mismo estilo:
    - Borde azul sutil `1px solid rgba($blue, 0.6)` en los lados y abajo (sin borde superior).
    - Bordes redondeados solo en la parte inferior `0 0 16px 16px`.
    - Sombra inferior `box-shadow: 0 8px 24px $base`.
    - Fondo semitransparente oscuro.

## 🛠️ Tecnologías

- **AGS (Astal/GTK4)**: Framework principal.
- **TypeScript**: Para una lógica robusta y tipada.
- **SCSS**: Estilos modulares y variables.
- **cliphist**: Para la gestión del portapapeles.
- **AstalNotifd**: Para el centro de notificaciones en tiempo real.
- **nm-connection-editor**: Para la configuración de red.

## 🚀 Instalación y Uso

1.  Asegúrate de tener `ags` (v2) instalado.
2.  Clona el repositorio en `~/.config/ags`.
3.  Ejecuta con:
    ```bash
    ags run app.ts
    ```

## 📂 Estructura del Proyecto

- `lib/`: Servicios de estado persistente (`pins.ts`).
- `widget/`: Todos los componentes de la interfaz.
    - `Shared/`: Componentes reutilizables (ej. `MenuPopover.tsx`).
    - `TopBar/`: Widgets de la barra superior.
        - `Clock.tsx`: Reloj + popover de calendario, reloj digital y notificaciones.
    - `SideBar/`, `RightMenu/`: Widgets específicos de cada sección.
- `styles/`: Archivos SCSS organizados por componentes.
    - `popovers.scss`: Sistema global de estilos para todos los popovers/menús.
    - `topbar.scss`: Estilos de la barra superior y popover de fecha/hora.
- `app.ts`: Definición de las ventanas y configuración principal.
