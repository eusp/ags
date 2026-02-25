import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"

export default function PowerActions() {
    const logout = () => {
        execAsync("gnome-session-quit --logout").catch(() => {
            execAsync("pkill -u $USER").catch(() => { })
        })
    }

    const suspend = () => {
        execAsync("systemctl suspend").catch(() => { })
    }

    const reboot = () => {
        execAsync("systemctl reboot").catch(() => { })
    }

    const shutdown = () => {
        execAsync("systemctl poweroff").catch(() => { })
    }

    return (
        <box
            orientation={Gtk.Orientation.HORIZONTAL}
            cssClasses={["power-actions"]}
            homogeneous={true}
            spacing={4}
        >
            <button
                cssClasses={["power-button", "logout-button"]}
                onClicked={logout}
                hexpand={true}
                tooltipText="Cerrar Sesión"
            >
                <image iconName="system-log-out-symbolic" />
            </button>

            <button
                cssClasses={["power-button", "suspend-button"]}
                onClicked={suspend}
                hexpand={true}
                tooltipText="Suspender"
            >
                <image iconName="system-suspend-symbolic" />
            </button>

            <button
                cssClasses={["power-button", "reboot-button"]}
                onClicked={reboot}
                hexpand={true}
                tooltipText="Reiniciar"
            >
                <image iconName="system-reboot-symbolic" />
            </button>

            <button
                cssClasses={["power-button", "shutdown-button"]}
                onClicked={shutdown}
                hexpand={true}
                tooltipText="Apagar"
            >
                <image iconName="system-shutdown-symbolic" />
            </button>
        </box>
    )
}
