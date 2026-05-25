import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib?version=2.0"
import Gdk from "gi://Gdk?version=4.0"
import Notifd from "gi://AstalNotifd"

const notifd = Notifd.get_default()

// Función auxiliar para obtener la ubicación exacta del botón del reloj en la pantalla
function getWidgetExactCoords(widget: Gtk.Widget) {
    const root = widget.get_root()
    if (!root) return { x: 0, y: 0, width: 0, height: 0 }

    const [success, x, y] = widget.translate_coordinates(root, 0, 0)

    return {
        x: success ? x : 0,
        y: success ? y : 0,
        width: widget.get_width(),
        height: widget.get_height()
    }
}

export default function Clock() {
    const barLabel = <label cssClasses={["clock"]} /> as Gtk.Label

    const updateBarClock = () => {
        const time = GLib.DateTime.new_now_local()
        barLabel.label = time.format("%H:%M  •  %a %d %b") || ""
    }

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
        updateBarClock()
        return GLib.SOURCE_CONTINUE
    })
    updateBarClock()

    const calendar = new Gtk.Calendar({
        cssClasses: ["popover-calendar"]
    })

    const popoverTimeLabel = <label cssClasses={["popover-digital-time"]} /> as Gtk.Label
    const popoverDateLabel = <label cssClasses={["popover-digital-date"]} /> as Gtk.Label

    const updatePopoverClock = () => {
        const time = GLib.DateTime.new_now_local()
        popoverTimeLabel.label = time.format("%H:%M:%S") || ""
        popoverDateLabel.label = time.format("%A, %d de %B de %Y") || ""
    }

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
        updatePopoverClock()
        return GLib.SOURCE_CONTINUE
    })
    updatePopoverClock()

    const notifList = <box orientation={Gtk.Orientation.VERTICAL} spacing={4} /> as Gtk.Box
    const scrolledNotifs = new Gtk.ScrolledWindow({
        vexpand: true,
        heightRequest: 180,
        widthRequest: 300,
        cssClasses: ["popover-notifs-scrolled"]
    })
    scrolledNotifs.set_child(notifList)

    const updateNotifications = () => {
        const ns = notifd.get_notifications()

        while (notifList.get_first_child()) {
            notifList.remove(notifList.get_first_child()!)
        }

        if (ns.length === 0) {
            notifList.append(
                <label
                    cssClasses={["popover-notif-empty"]}
                    label="No hay notificaciones recientes"
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                    vexpand={true}
                />
            )
            return
        }

        ns.forEach((n: any) => {
            notifList.append(
                <box spacing={8} cssClasses={["popover-notif-item"]}>
                    <image iconName={n.app_icon || "dialog-information-symbolic"} valign={Gtk.Align.CENTER} />
                    <box orientation={Gtk.Orientation.VERTICAL} hexpand={true}>
                        <label label={n.summary} truncate halign={Gtk.Align.START} cssClasses={["popover-notif-summary"]} />
                        <label label={n.body} truncate halign={Gtk.Align.START} cssClasses={["popover-notif-body"]} />
                    </box>
                    <button
                        cssClasses={["popover-notif-dismiss"]}
                        onClicked={() => n.dismiss()}
                        valign={Gtk.Align.CENTER}
                    >
                        <image iconName="window-close-symbolic" />
                    </button>
                </box>
            )
        })
    }

    notifd.connect("notified", updateNotifications)
    notifd.connect("resolved", updateNotifications)
    updateNotifications()

    const clearBtn = <button
        cssClasses={["popover-notifs-clear"]}
        label="Limpiar todo"
        onClicked={() => notifd.get_notifications().forEach((n: any) => n.dismiss())}
    /> as Gtk.Button

    const notifHeader = (
        <box spacing={8} cssClasses={["popover-notifs-header"]}>
            <label label="Notificaciones" cssClasses={["popover-notifs-title"]} hexpand halign={Gtk.Align.START} />
            {clearBtn}
        </box>
    )

    const rightBox = (
        <box orientation={Gtk.Orientation.VERTICAL} spacing={12} cssClasses={["popover-clock-right"]}>
            <box orientation={Gtk.Orientation.VERTICAL} cssClasses={["popover-clock-zone"]}>
                {popoverTimeLabel}
                {popoverDateLabel}
            </box>
            <box orientation={Gtk.Orientation.VERTICAL} spacing={6} cssClasses={["popover-notifs-zone"]} vexpand={true}>
                {notifHeader}
                {scrolledNotifs}
            </box>
        </box>
    )

    const popoverContent = (
        <box spacing={16} cssClasses={["clock-popover-content"]}>
            {calendar}
            <box cssClasses={["popover-vertical-separator"]} />
            {rightBox}
        </box>
    )

    // Agregamos ambas clases para sincronizar con los estilos compartidos
    const popover = new Gtk.Popover({
        cssClasses: ["clock-popover", "shared-popover"],
        hasArrow: false,
    })
    popover.set_child(popoverContent)

    // Creamos el MenuButton que contendrá el Popover
    const menuButton = new Gtk.MenuButton({
        cssClasses: ["clock-button"]
    })
    menuButton.set_child(barLabel)
    menuButton.set_popover(popover)

    // LÓGICA DE FUSIÓN Y ANCLAJE MATEMÁTICO AL ABRIR
    popover.connect("notify::visible", () => {
        if (!popover.visible) return
        
        // Actualizaciones por defecto del reloj
        calendar.select_day(GLib.DateTime.new_now_local())
        updateNotifications()

        // Reseteamos las clases de bordes dinámicos
        popover.remove_css_class("edge-top")
        popover.remove_css_class("edge-bottom")
        popover.remove_css_class("edge-left")
        popover.remove_css_class("edge-right")

        const coords = getWidgetExactCoords(menuButton)
        const BAR_SIZE = 30
        const THRESHOLD = BAR_SIZE + 15

        // Inicializamos el rectángulo nativo de contacto
        const rect = new Gdk.Rectangle()
        rect.x = 0
        rect.y = 0
        rect.width = menuButton.get_width()
        rect.height = menuButton.get_height()

        // Forzar límite vertical en la barra superior (Y: 30)
        if (coords.y <= THRESHOLD) {
            popover.add_css_class("edge-top")
            const deltaY = BAR_SIZE - coords.y
            if (deltaY > 0) {
                rect.y = deltaY
                rect.height = 1
            }
        }

        // Forzar límite horizontal si el reloj estuviera cerca del borde izquierdo
        if (coords.x <= THRESHOLD) {
            popover.add_css_class("edge-left")
            const deltaX = BAR_SIZE - coords.x
            if (deltaX > 0) {
                rect.x = deltaX
                rect.width = 1
            }
        }

        if (coords.x >= 1500) popover.add_css_class("edge-right")

        // Enviamos el rectángulo corregido a Wayland
        popover.set_pointing_to(rect)
    })

    return menuButton
}