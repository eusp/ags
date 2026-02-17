import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"

export default function PowerActions() {
    const logout = () => {
        execAsync("gnome-session-quit --logout").catch(() => {
            execAsync("pkill -u $USER").catch(() => {})
        })
    }

    const suspend = () => {
        execAsync("systemctl suspend").catch(() => {})
    }

    const reboot = () => {
        execAsync("systemctl reboot").catch(() => {})
    }

    const shutdown = () => {
        execAsync("systemctl poweroff").catch(() => {})
    }

    return (
        <box
            orientation={Gtk.Orientation.VERTICAL}
            cssClasses={["power-actions"]}
            spacing={8}
        >
            <label
                cssClasses={["section-title"]}
                label="Acciones del Sistema"
                halign={Gtk.Align.START}
            />

            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                cssClasses={["power-buttons-grid"]}
                spacing={8}
                homogeneous={true}
            >
                <button
                    cssClasses={["power-button", "logout-button"]}
                    onClicked={logout}
                    hexpand={true}
                    vexpand={true}
                >
                    <box
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={4}
                        halign={Gtk.Align.CENTER}
                    >
                        <label
                            cssClasses={["power-icon"]}
                            label="🚪"
                        />
                        <label
                            cssClasses={["power-label"]}
                            label="Cerrar Sesión"
                        />
                    </box>
                </button>

                <button
                    cssClasses={["power-button", "suspend-button"]}
                    onClicked={suspend}
                    hexpand={true}
                    vexpand={true}
                >
                    <box
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={4}
                        halign={Gtk.Align.CENTER}
                    >
                        <label
                            cssClasses={["power-icon"]}
                            label="💤"
                        />
                        <label
                            cssClasses={["power-label"]}
                            label="Suspender"
                        />
                    </box>
                </button>

                <button
                    cssClasses={["power-button", "reboot-button"]}
                    onClicked={reboot}
                    hexpand={true}
                    vexpand={true}
                >
                    <box
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={4}
                        halign={Gtk.Align.CENTER}
                    >
                        <label
                            cssClasses={["power-icon"]}
                            label="🔄"
                        />
                        <label
                            cssClasses={["power-label"]}
                            label="Reiniciar"
                        />
                    </box>
                </button>

                <button
                    cssClasses={["power-button", "shutdown-button"]}
                    onClicked={shutdown}
                    hexpand={true}
                    vexpand={true}
                >
                    <box
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={4}
                        halign={Gtk.Align.CENTER}
                    >
                        <label
                            cssClasses={["power-icon"]}
                            label="⏻"
                        />
                        <label
                            cssClasses={["power-label"]}
                            label="Apagar"
                        />
                    </box>
                </button>
            </box>
        </box>
    )
}
