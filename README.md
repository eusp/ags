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
    - **Selector de temas integrado** con previsualización del wallpaper: cambia el tema de todo el escritorio en caliente (colores AGS, bordes Hyprland y fondo de pantalla) sin reiniciar nada.
    - Menú de apagado.

## 🎨 Sistema de Diseño

- **Paleta de Colores**: Definida por [shiro-theme](https://github.com/emerson/.config/shiro-theme) — variables CSS nativas en `styles/colors.scss`.  
  Los estilos usan `var(--primary)`, `var(--base)`, etc. en lugar de variables Sass, lo que permite **hot-reload de colores en runtime** sin recompilar ni reiniciar AGS.
- **Hot-reload de tema**: Al seleccionar un tema en el widget, se inyecta un `Gtk.CssProvider` con prioridad 900 (mayor que la prioridad de carga de AGS) que sobreescribe todas las variables de color al instante.
- **Popovers Unificados**: Todos los menús flotantes comparten el mismo estilo:
    - Borde sutil en los lados y abajo (sin borde superior).
    - Bordes redondeados solo en la parte inferior.
    - Sombra inferior y fondo semitransparente oscuro.

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
    - `colors.scss`: Variables CSS del tema activo (auto-generado por shiro-theme, no editar).
    - `popovers.scss`: Sistema global de estilos para todos los popovers/menús.
    - `topbar.scss`: Estilos de la barra superior y popover de fecha/hora.
- `app.ts`: Definición de las ventanas, configuración principal e inyección inicial de variables CSS del tema.
- `widget/RightMenu/ThemeSelector.tsx`: Selector de temas con hot-reload — carga temas desde `~/.config/shiro-theme/themes/`, previsualiza el wallpaper y aplica colores + fondo en caliente.
