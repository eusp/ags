import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"

export default function NotificationPanel() {
    const openNotificationCenter = () => {
        execAsync("gnome-control-center notifications").catch(() => {})
    }

    const clearNotifications = () => {
        execAsync("notify-send 'Notificaciones' 'Todas las notificaciones han sido limpiadas'").catch(() => {})
    }

    return (
        <box
            orientation={Gtk.Orientation.VERTICAL}
            cssClasses={["notification-panel"]}
            spacing={8}
        >
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                cssClasses={["notification-header"]}
                spacing={8}
            >
                <label
                    cssClasses={["section-title"]}
                    label="Notificaciones"
                    halign={Gtk.Align.START}
                    hexpand={true}
                />
                <button
                    cssClasses={["clear-button"]}
                    label="Limpiar"
                    onClicked={clearNotifications}
                />
            </box>

            <box
                orientation={Gtk.Orientation.VERTICAL}
                cssClasses={["notification-list"]}
                spacing={4}
                heightRequest={120}
            >
                <label
                    cssClasses={["empty-state"]}
                    label="No hay notificaciones recientes"
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                    vexpand={true}
                />
            </box>
        </box>
    )
}
