# AGS Configuration - Antigravity Edition

Una configuración de AGS (Aylur's GTK Shell) v2 altamente personalizada, minimalista y funcional, diseñada para Hyprland en Nobara Linux.

## ✨ Características Principales

- **Barra Superior (TopBar)**:
    - Indicadores de red, volumen, micrófono, batería y bluetooth.
    - Historial de portapapeles integrado (`cliphist`).
    - Monitor de recursos (CPU/RAM) en tiempo real.
    - Sistema de popovers modulares con diseño premium.
- **Barra Lateral (SideBar)**:
    - Lanzador de aplicaciones dinámico que rastrea el workspace actual.
    - Visualizador de audio reactivo con escala logarítmica (20Hz-20kHz).
    - Controles de medios integrados.
- **Menú Derecho (RightMenu)**:
    - Configuración rápida (Mute, Bluetooth, WiFi).
    - Centro de notificaciones.
    - Buscador de aplicaciones y menú de apagado.

## 🛠️ Tecnologías

- **AGS (Astal/GTK4)**: Framework principal.
- **TypeScript**: Para una lógica robusta y tipada.
- **SCSS**: Estilos modulares y variables.
- **cliphist**: Para la gestión del portapapeles.
- **nm-connection-editor**: Para la configuración de red.

## 🚀 Instalación y Uso

1.  Asegúrate de tener `ags` (v2) instalado.
2.  Clona el repositorio en `~/.config/ags`.
3.  Ejecuta con:
    ```bash
    ags run app.ts
    ```

## 📂 Estructura del Proyecto

- `widget/`: Todos los componentes de la interfaz.
    - `Shared/`: Componentes reutilizables (ej. `MenuPopover`).
    - `TopBar/`, `SideBar/`, `RightMenu/`: Widgets específicos de cada sección.
- `styles/`: Archivos SCSS organizados por componentes.
- `app.ts`: Definición de las ventanas y configuración principal.

---
*Desarrollado con ❤️ para un escritorio Linux moderno y eficiente.*
