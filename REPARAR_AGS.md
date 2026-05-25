# Guía de Reparación y Réplica de AGS (Astal) en Nobara/Fedora

Esta guía detalla el problema ocurrido con las librerías de AGS (Aylur's Gtk Shell v2 / Astal) tras una actualización del sistema o limpieza de paquetes, y explica paso a paso cómo repararlo o replicarlo desde cero en cualquier otra PC con Fedora o Nobara.

---

## 1. El Problema: ¿Por qué se rompió AGS?

Al realizar actualizaciones de paquetes (`dnf upgrade`) o limpiezas finas del sistema:
1. El repositorio COPR de desarrollo original (`fbeigbeder/astal`) **fue dado de baja o modificado por su autor** (retornando un error *404 Not Found*).
2. Durante el proceso de actualización o autoremove, Fedora/Nobara detectó que las librerías instaladas (`aylurs-gtk-shell`, `libastal-hyprland`, `libastal-battery`, etc.) eran **paquetes huérfanos** (sin un repositorio de origen activo) y **las desinstaló automáticamente**.
3. Esto dejó al binario de AGS sin sus dependencias principales de GObject Introspection, arrojando el siguiente error al intentar ejecutarse:
   ```log
   JS ERROR: Error: Requiring Astal, version 4.0: Typelib file for namespace 'Astal', version '4.0' not found
   ```

---

## 2. La Solución Moderna (Fedora 43 / Nobara 43)

Para solucionar esto de manera robusta, se utiliza el repositorio COPR oficial y mantenido de la comunidad de Hyprland: **`solopasha/hyprland`**.

### Ventaja de la nueva versión:
En esta versión empaquetada, ya no es necesario instalar 8 paquetes individuales para cada plugin (batería, bluetooth, red, etc.). **Todos los plugins y librerías de Astal se han consolidado en un único paquete llamado `astal-libs`**.

---

## 3. Instrucciones de Instalación / Réplica (Paso a Paso)

Ejecuta estos comandos en cualquier terminal de la PC donde desees instalar o reparar AGS:

### Paso 1: Habilitar el nuevo repositorio Copr
Este repositorio proporciona las compilaciones actualizadas de Astal y AGS para tu versión de Fedora/Nobara.
```bash
sudo dnf copr enable solopasha/hyprland -y
```

### Paso 2: Instalar todo el ecosistema de Astal sin conflictos
> [!IMPORTANT]
> El repositorio del sistema (`terra`) a veces incluye paquetes base de `astal` que entran en conflicto de archivos con la versión extendida de Copr. 
> Para evitar colisiones y asegurar una compatibilidad del 100%, **debemos desactivar temporalmente el repositorio `terra` usando el flag `--disablerepo=terra` durante esta instalación**:

```bash
sudo dnf install astal astal-gjs astal-gtk4 astal-io astal-libs --disablerepo=terra -y
```

* **`astal`**: El motor base de Astal.
* **`astal-gjs`**: Las conexiones de GJS (Gnome Javascript) para ejecutar el código.
* **`astal-gtk4`**: Proporciona el namespace `Astal-4.0` (¡resuelve el error principal!).
* **`astal-io`**: Control de entrada/salida y llamadas de sistema.
* **`astal-libs`**: Contiene todos los plugins unificados (Batería, Red, Bluetooth, MPRIS/Audio, Tray, Wireplumber y Hyprland).

---

## 4. Verificación y Puesta en Marcha

Una vez completada la instalación, puedes verificar que tu sistema reconozca correctamente todas las librerías ejecutando esta prueba rápida en la terminal:

```bash
gjs -c "imports.gi.versions.Astal = '4.0'; imports.gi.versions.AstalBattery = '0.1'; imports.gi.versions.AstalHyprland = '0.1'; const Astal = imports.gi.Astal; const Battery = imports.gi.AstalBattery; const Hyprland = imports.gi.AstalHyprland; log('¡Sistema Astal verificado y listo!');"
```

Si el comando responde con `JS LOG: ¡Sistema Astal verificado y listo!`, ¡estás listo para lanzar tu barra!

### Ejecutar AGS:
Entra a la carpeta de tu configuración y lánzala en segundo plano:
```bash
cd ~/.config/ags
npm run dev &
```

O directamente de forma global:
```bash
ags run ~/.config/ags &
```

---
